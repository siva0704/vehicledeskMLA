import { TripRequest } from './types';

export interface WhatsAppButton {
  id: string;
  title: string;
}

export interface WhatsAppListRow {
  id: string;
  title: string;
  description?: string;
}

export interface WhatsAppListSection {
  title: string;
  rows: WhatsAppListRow[];
}

export class WhatsAppService {
  private baseUrl: string;
  private apiKey: string;
  private phoneNumberId: string;

  constructor(
    baseUrl = process.env.WA_SIM_URL || 'http://localhost:3005',
    apiKey = process.env.WA_SIM_API_KEY || 'wa-sim-local-dev-token',
    phoneNumberId = process.env.WA_SIM_PHONE_ID || 'wa-sim-phone-001'
  ) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.apiKey = apiKey;
    this.phoneNumberId = phoneNumberId;
  }

  private cleanPhone(phone: string): string {
    let p = phone.replace(/[^\d+]/g, '');
    if (!p.startsWith('+')) {
      p = `+${p}`;
    }
    return p;
  }

  public async sendTextMessage(to: string, text: string): Promise<boolean> {
    const cleanTo = this.cleanPhone(to);
    const url = `${this.baseUrl}/v19.0/${this.phoneNumberId}/messages`;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: cleanTo,
          type: 'text',
          text: { body: text },
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.warn(`[WhatsAppService] Failed to send text to ${cleanTo}: HTTP ${res.status} - ${errText}`);
        return false;
      }
      return true;
    } catch (err) {
      console.error(`[WhatsAppService] Error sending message to ${cleanTo}:`, err);
      return false;
    }
  }

  public async sendInteractiveButtons(
    to: string,
    bodyText: string,
    buttons: WhatsAppButton[]
  ): Promise<boolean> {
    const cleanTo = this.cleanPhone(to);
    const url = `${this.baseUrl}/v19.0/${this.phoneNumberId}/messages`;

    const formattedButtons = buttons.slice(0, 3).map((b) => ({
      type: 'reply',
      reply: {
        id: b.id,
        title: b.title.slice(0, 20),
      },
    }));

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: cleanTo,
          type: 'interactive',
          interactive: {
            type: 'button',
            body: { text: bodyText },
            action: {
              buttons: formattedButtons,
            },
          },
        }),
      });

      if (!res.ok) {
        // Fallback to text message if interactive fails
        console.warn(`[WhatsAppService] Interactive send failed (${res.status}), falling back to text.`);
        const buttonMenuText = `${bodyText}\n\n` + buttons.map((b, i) => `${i + 1}. ${b.title}`).join('\n');
        return this.sendTextMessage(to, buttonMenuText);
      }
      return true;
    } catch (err) {
      console.error(`[WhatsAppService] Error sending interactive buttons to ${cleanTo}:`, err);
      return false;
    }
  }

  public async sendInteractiveList(
    to: string,
    bodyText: string,
    buttonText: string,
    sections: WhatsAppListSection[],
    headerText?: string
  ): Promise<boolean> {
    const cleanTo = this.cleanPhone(to);
    const url = `${this.baseUrl}/v19.0/${this.phoneNumberId}/messages`;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: cleanTo,
          type: 'interactive',
          interactive: {
            type: 'list',
            header: headerText ? { type: 'text', text: headerText } : undefined,
            body: { text: bodyText },
            footer: { text: 'Karnataka State Protocol Fleet Desk' },
            action: {
              button: buttonText.slice(0, 20),
              sections,
            },
          },
        }),
      });

      if (!res.ok) {
        console.warn(`[WhatsAppService] Interactive list failed (${res.status}), falling back to text.`);
        let fallbackText = `${headerText ? `*${headerText}*\n\n` : ''}${bodyText}\n`;
        sections.forEach((sec) => {
          fallbackText += `\n*${sec.title}*:\n`;
          sec.rows.forEach((r) => {
            fallbackText += `• ${r.title}${r.description ? ` — _${r.description}_` : ''}\n`;
          });
        });
        return this.sendTextMessage(to, fallbackText);
      }
      return true;
    } catch (err) {
      console.error(`[WhatsAppService] Error sending interactive list to ${cleanTo}:`, err);
      return false;
    }
  }

  // Lifecycle notifications to MLAs
  public async notifyBookingConfirmed(trip: TripRequest): Promise<boolean> {
    const isImmediate = trip.timingType === 'IMMEDIATE';
    const dispatchTimingLabel = isImmediate
      ? '⚡ Immediate VIP Dispatch (On-Demand)'
      : `📅 Scheduled for ${trip.date} at ${trip.time}`;

    const priorityBadge = trip.assignedPriority
      ? `⭐ *Assigned Priority*: Priority ${trip.assignedPriority} Vehicle`
      : `⭐ *Class*: ${trip.preferredClass}`;

    const msg =
      `🚗 *VIP Vehicle Request Confirmed* [${trip.id}]\n\n` +
      `🏛 *VIP*: ${trip.vipName} (${trip.vipDesignation})\n` +
      `🕒 *Timing*: ${dispatchTimingLabel}\n` +
      `📍 *Pickup*: ${trip.pickupLocation}\n` +
      `🏁 *Drop*: ${trip.dropLocation}\n` +
      `${priorityBadge}\n\n` +
      (trip.assignedDriverName
        ? `👤 *Assigned Chauffeur*: ${trip.assignedDriverName}\n` +
          `📞 *Chauffeur Contact*: ${trip.assignedDriverPhone}\n` +
          `🚘 *Vehicle Model*: ${trip.assignedVehicleModel}\n` +
          `🔢 *Registration Plate*: [${trip.assignedVehiclePlate}]\n\n` +
          `_Driver has received this dispatch in their cockpit and is collecting vehicle keys._`
        : `⏳ *Status*: Placed on Priority Allocation Queue. Fleet Officer will assign shortly.`);

    return this.sendInteractiveButtons(trip.vipPhone, msg, [
      { id: 'btn_status', title: 'Check Status' },
      { id: 'btn_cancel', title: 'Cancel Trip' },
    ]);
  }

  public async notifyDriverArrived(trip: TripRequest): Promise<boolean> {
    const msg =
      `🔔 *Chauffeur Arrived at Pickup Location* [${trip.id}]\n\n` +
      `Namaskara Hon. *${trip.vipName}*,\n\n` +
      `Your assigned chauffeur *${trip.assignedDriverName}* has arrived and is waiting at:\n` +
      `📍 *Pickup Point*: *${trip.pickupLocation}*\n\n` +
      `🚘 *Vehicle*: *${trip.assignedVehicleModel}* [${trip.assignedVehiclePlate}]\n` +
      `📞 *Chauffeur Contact*: ${trip.assignedDriverPhone}\n\n` +
      `_The vehicle is stationed at the porch/portico ready for boarding._`;

    return this.sendInteractiveButtons(trip.vipPhone, msg, [
      { id: 'btn_status', title: 'Trip Status' },
    ]);
  }

  public async notifyTripAccepted(trip: TripRequest): Promise<boolean> {
    const msg =
      `✅ *Chauffeur Accepted Trip* [${trip.id}]\n\n` +
      `Chauffeur *${trip.assignedDriverName}* (${trip.assignedDriverPhone}) has accepted your trip request for ${trip.date} at ${trip.time}.\n\n` +
      `Vehicle: *${trip.assignedVehicleModel}* (${trip.assignedVehiclePlate})`;

    return this.sendInteractiveButtons(trip.vipPhone, msg, [
      { id: 'btn_status', title: 'Check Status' },
      { id: 'btn_cancel', title: 'Cancel Trip' },
    ]);
  }

  public async notifyGpsShared(trip: TripRequest): Promise<boolean> {
    const gpsUrl = trip.gpsShareUrl || 'https://maps.google.com/?q=12.9796,77.5908';
    const msg =
      `📍 *Live Chauffeur GPS Shared* [${trip.id}]\n\n` +
      `Chauffeur *${trip.assignedDriverName}* is en route or at the pickup bay.\n\n` +
      `🚘 Vehicle: ${trip.assignedVehiclePlate}\n` +
      `🗺 *Live Location*: ${gpsUrl}\n\n` +
      `Click link above to view real-time location.`;

    return this.sendInteractiveButtons(trip.vipPhone, msg, [
      { id: 'btn_status', title: 'Check Status' },
    ]);
  }

  public async notifyTripStarted(trip: TripRequest): Promise<boolean> {
    const msg =
      `🚀 *Trip In Progress* [${trip.id}]\n\n` +
      `Your trip to *${trip.dropLocation}* has commenced with Chauffeur *${trip.assignedDriverName}*.\n\n` +
      `Have a safe journey!`;

    return this.sendInteractiveButtons(trip.vipPhone, msg, [
      { id: 'btn_status', title: 'Check Status' },
    ]);
  }

  public async notifyTripCompleted(trip: TripRequest): Promise<boolean> {
    const msg =
      `🏁 *Trip Completed* [${trip.id}]\n\n` +
      `Your trip to *${trip.dropLocation}* has concluded.\n\n` +
      `Thank you for using the Karnataka State Protocol Fleet Desk.`;

    return this.sendInteractiveButtons(trip.vipPhone, msg, [
      { id: 'btn_book', title: 'Book Another Car' },
    ]);
  }

  public async notifyTripCancelled(trip: TripRequest, reason?: string): Promise<boolean> {
    const msg =
      `❌ *Trip Cancelled* [${trip.id}]\n\n` +
      `Your booking for ${trip.date} at ${trip.time} has been cancelled.` +
      (reason ? `\nReason: ${reason}` : '');

    return this.sendInteractiveButtons(trip.vipPhone, msg, [
      { id: 'btn_book', title: 'Book a Car' },
    ]);
  }

  public async notifyAdminOverride(trip: TripRequest): Promise<boolean> {
    const msg =
      `🔄 *Protocol Assignment Update* [${trip.id}]\n\n` +
      `Fleet Superintendent has assigned a new vehicle for your booking:\n` +
      `👤 *Chauffeur*: ${trip.assignedDriverName} (${trip.assignedDriverPhone})\n` +
      `🚘 *Vehicle*: ${trip.assignedVehicleModel} [${trip.assignedVehiclePlate}]\n` +
      `Reason: ${trip.overrideReason || 'Protocol administrative reassignment'}`;

    return this.sendInteractiveButtons(trip.vipPhone, msg, [
      { id: 'btn_status', title: 'Check Status' },
    ]);
  }
}

export const whatsappService = new WhatsAppService();
