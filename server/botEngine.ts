import { VehicleDeskStore } from './store';
import { WhatsAppService } from './whatsappService';
import { evaluateRuleEngine, getClassForSeniority } from './ruleEngine';
import { TripRequest, User } from './types';
import { llmService } from './llmService';

export class BotEngine {
  constructor(
    private store: VehicleDeskStore,
    private waService: WhatsAppService
  ) {}

  public async handleInboundMessage(fromPhone: string, textBody: string, buttonId?: string) {
    const rawText = (textBody || '').trim();
    const actionId = buttonId || '';
    const user = this.store.findUserByPhone(fromPhone);

    if (!user || user.role !== 'VIP') {
      console.log(`[BotEngine] Unregistered or non-VIP sender: ${fromPhone}`);
      await this.waService.sendTextMessage(
        fromPhone,
        `🙏 *Namaskara.*\n\nThis is the *Karnataka State Protocol Fleet WhatsApp Desk* for Hon'ble MLAs and State Dignitaries.\n\nYour mobile number (${fromPhone}) is not registered in the active protocol roster. For protocol vehicle allotment, please contact the Protocol Officer at Vidhana Soudha:\n📞 Protocol Office: +91 80 2203 3500`
      );
      return;
    }

    const command = (actionId || rawText).trim().toUpperCase();

    // 1. Direct Command / Button Checks
    if (command === 'BTN_STATUS' || command === 'STATUS' || command === 'MY TRIP' || command === 'TRACK') {
      await this.handleTripStatus(user, fromPhone);
      return;
    }

    if (command === 'BTN_CANCEL' || command === 'CANCEL TRIP') {
      await this.handleTripCancellation(user, fromPhone);
      return;
    }

    if (command === 'BTN_BOOK' || command === 'BOOK' || command === 'BOOK CAR' || command === 'NEW') {
      await this.startStepByStepBooking(user, fromPhone);
      return;
    }

    if (command === 'HELP' || command === 'MENU' || command === 'HI' || command === 'HELLO' || command === 'NAMASKARA') {
      await this.sendMainMenu(user, fromPhone);
      return;
    }

    // 2. Active Guided Step-by-Step Session
    const activeSession = this.store.getSession(fromPhone);
    if (activeSession && activeSession.step !== 'IDLE') {
      await this.processSessionStep(user, fromPhone, rawText, actionId);
      return;
    }

    // 3. Natural Language Processing (LLM with deterministic fallback)
    const parsedNl = await llmService.parseMessage(rawText, user.name);

    if (parsedNl.intent === 'CHECK_STATUS') {
      await this.handleTripStatus(user, fromPhone);
      return;
    }

    if (parsedNl.intent === 'CANCEL_RIDE') {
      await this.handleTripCancellation(user, fromPhone);
      return;
    }

    if (parsedNl.intent === 'HELP') {
      await this.sendMainMenu(user, fromPhone);
      return;
    }

    if (parsedNl.intent === 'BOOK_RIDE' && parsedNl.pickupLocation && parsedNl.dropLocation) {
      console.log(`[BotEngine] Booking ride via ${parsedNl.source}: ${parsedNl.pickupLocation} -> ${parsedNl.dropLocation}`);
      await this.processOneShotBooking(user, fromPhone, {
        pickup: parsedNl.pickupLocation,
        drop: parsedNl.dropLocation,
        isRoundTrip: parsedNl.isRoundTrip,
        date: parsedNl.date,
        time: parsedNl.time,
        notes: parsedNl.notes,
      });
      return;
    }

    // 4. Default Fallback -> Main Menu
    await this.sendMainMenu(user, fromPhone);
  }

  private async sendMainMenu(user: User, phone: string) {
    const msg =
      `🏛 *Karnataka State Protocol Fleet Desk*\n` +
      `Welcome, *${user.name}*\n` +
      `Designation: ${user.designation || 'Hon. Member'}\n\n` +
      `How may the Vehicle Desk assist you today?`;

    await this.waService.sendInteractiveButtons(phone, msg, [
      { id: 'btn_book', title: 'Book a Car' },
      { id: 'btn_status', title: 'My Active Trip' },
      { id: 'btn_cancel', title: 'Cancel Trip' },
    ]);
  }

  private async handleTripStatus(user: User, phone: string) {
    const activeTrip = this.store.findActiveTripForVip(user.id);
    if (!activeTrip) {
      await this.waService.sendInteractiveButtons(
        phone,
        `ℹ️ *No Active Trips*\n\nHon. ${user.name}, you currently do not have any active vehicle requests scheduled.`,
        [{ id: 'btn_book', title: 'Book a Car' }]
      );
      return;
    }

    const gpsText = activeTrip.gpsShareUrl
      ? `\n📍 *Live GPS Tracking*: ${activeTrip.gpsShareUrl}`
      : '\n📍 *GPS*: Pending chauffeur sharing';

    const msg =
      `📋 *Active Trip Details* [${activeTrip.id}]\n\n` +
      `📌 *Status*: *${activeTrip.status}*\n` +
      `📅 *Date*: ${activeTrip.date} at ${activeTrip.time}\n` +
      `📍 *Pickup*: ${activeTrip.pickupLocation}\n` +
      `🏁 *Drop*: ${activeTrip.dropLocation}\n` +
      `⭐ *Class*: ${activeTrip.preferredClass}\n` +
      (activeTrip.assignedDriverName
        ? `\n👤 *Chauffeur*: ${activeTrip.assignedDriverName}\n` +
          `📞 *Chauffeur Phone*: ${activeTrip.assignedDriverPhone}\n` +
          `🚘 *Vehicle*: ${activeTrip.assignedVehicleModel} [${activeTrip.assignedVehiclePlate}]`
        : `\n⏳ *Allocation*: In Queue for Dispatch`) +
      gpsText;

    await this.waService.sendInteractiveButtons(phone, msg, [
      { id: 'btn_status', title: 'Refresh Status' },
      { id: 'btn_cancel', title: 'Cancel Trip' },
    ]);
  }

  private async handleTripCancellation(user: User, phone: string) {
    const activeTrip = this.store.findActiveTripForVip(user.id);
    if (!activeTrip) {
      await this.waService.sendTextMessage(
        phone,
        `ℹ️ No active vehicle booking found to cancel.`
      );
      return;
    }

    // Cancel trip
    this.store.updateTrip(activeTrip.id, {
      status: 'CANCELLED',
      notes: (activeTrip.notes ? activeTrip.notes + ' | ' : '') + 'Cancelled by MLA via WhatsApp',
    });

    // Free up driver
    if (activeTrip.assignedDriverId) {
      const driver = this.store.findDriverById(activeTrip.assignedDriverId);
      if (driver && driver.status === 'BUSY') {
        this.store.updateDriver(driver.id, { status: 'AVAILABLE' });
      }
    }

    await this.waService.notifyTripCancelled(activeTrip, 'Cancelled on MLA request via WhatsApp');
  }

  private async startStepByStepBooking(user: User, phone: string) {
    this.store.setSession(phone, {
      vipId: user.id,
      phone,
      step: 'AWAITING_PICKUP',
      updatedAt: Date.now(),
    });

    // Geofenced pickup points: Vidhana Soudha, Legislators' Home (LH), and Protocol Guest Houses
    await this.waService.sendInteractiveList(
      phone,
      `Hon. *${user.name}*, please select your pickup point from the predefined geofenced locations around Vidhana Soudha & Legislators' Home (LH), or type a custom pickup location:`,
      'Choose Pickup Point',
      [
        {
          title: 'Vidhana Soudha Complex',
          rows: [
            {
              id: 'loc_vs_gate1',
              title: 'Vidhana Soudha Gate 1',
              description: 'West Porch VIP Portico Entry',
            },
            {
              id: 'loc_vs_kengal',
              title: 'Kengal Gate (Gate 2)',
              description: 'Ambedkar Veedhi / High Court Junction',
            },
            {
              id: 'loc_vs_south',
              title: 'Vidhana Soudha South Gate',
              description: 'South Wing / Cubbon Park Exit',
            },
          ],
        },
        {
          title: "Legislators' Home (LH)",
          rows: [
            {
              id: 'loc_lh_deepika',
              title: 'Deepika Location',
              description: 'LH Deepika Building Compound',
            },
            {
              id: 'loc_lh_reception',
              title: 'LH Main Reception',
              description: 'Main Portico & Dispatch Porch',
            },
            {
              id: 'loc_lh_block_a',
              title: 'LH Block A',
              description: "Legislators' Residence Wing A",
            },
            {
              id: 'loc_lh_block_b',
              title: 'LH Block B',
              description: "Legislators' Guest Suites Wing B",
            },
          ],
        },
        {
          title: 'State Protocol Guest Houses',
          rows: [
            {
              id: 'loc_kumara_krupa',
              title: 'Kumara Krupa Guest House',
              description: 'Main Porch, High Grounds',
            },
            {
              id: 'loc_balabrooie',
              title: 'Balabrooie Guest House',
              description: 'Palace Road Entrance Porch',
            },
          ],
        },
      ],
      '📍 Pickup Location Selection'
    );
  }

  private async processSessionStep(
    user: User,
    phone: string,
    rawText: string,
    actionId: string
  ) {
    const session = this.store.getSession(phone);
    if (!session) return;

    // Check cancellation mid-flow
    if (actionId === 'btn_abort' || rawText.toUpperCase() === 'ABORT' || rawText.toUpperCase() === 'CANCEL') {
      this.store.clearSession(phone);
      await this.waService.sendTextMessage(phone, `Booking session discarded.`);
      return;
    }

    switch (session.step) {
      case 'AWAITING_PICKUP': {
        const pickupChoice = actionId.startsWith('loc_') ? rawText.trim() : rawText.trim();
        session.pickupLocation = pickupChoice || 'Vidhana Soudha Gate 1';
        session.step = 'AWAITING_DROP';
        session.updatedAt = Date.now();
        this.store.setSession(phone, session);

        // Frequent drop locations with free-text fallback
        await this.waService.sendInteractiveList(
          phone,
          `✅ Pickup confirmed: *${session.pickupLocation}*\n\nPlease select your destination from frequent official drop points, or reply with a custom destination in text:`,
          'Choose Destination',
          [
            {
              title: 'Frequent Official Destinations',
              rows: [
                {
                  id: 'drop_kia',
                  title: 'Kempegowda Intl Airport (KIA)',
                  description: 'Departure Porch, T1 / T2',
                },
                {
                  id: 'drop_ksr',
                  title: 'Bengaluru City Railway Station',
                  description: 'KSR Main VIP Portico, Majestic',
                },
                {
                  id: 'drop_raj_bhavan',
                  title: 'Raj Bhavan',
                  description: "Governor's Residence, Raj Bhavan Rd",
                },
                {
                  id: 'drop_high_court',
                  title: 'High Court of Karnataka',
                  description: 'Attara Kacheri Gate Porch',
                },
                {
                  id: 'drop_vikas_soudha',
                  title: 'Vikas Soudha',
                  description: 'South Entrance Portico',
                },
                {
                  id: 'drop_ms_building',
                  title: 'MS Building (Sachivalaya)',
                  description: 'State Secretariat Office Porch',
                },
              ],
            },
            {
              title: 'Round Trip Option',
              rows: [
                {
                  id: 'drop_round_trip',
                  title: `Round Trip (Return to ${session.pickupLocation})`,
                  description: 'Chauffeur on standby with VIP for return journey',
                },
              ],
            },
          ],
          '🏁 Destination Selection'
        );
        break;
      }

      case 'AWAITING_DROP': {
        const dropChoice = actionId.startsWith('drop_') ? rawText.trim() : rawText.trim();
        if (
          actionId === 'drop_round_trip' ||
          dropChoice.toUpperCase().includes('ROUND') ||
          dropChoice.toUpperCase() === 'RT'
        ) {
          session.isRoundTrip = true;
          session.dropLocation = `Round Trip (Return to ${session.pickupLocation})`;
        } else {
          session.isRoundTrip = false;
          session.dropLocation = dropChoice;
        }

        session.step = 'AWAITING_TIMING';
        session.updatedAt = Date.now();
        this.store.setSession(phone, session);

        // Dispatch Timing Selection: Immediate vs Scheduled
        await this.waService.sendInteractiveButtons(
          phone,
          `✅ Pickup: *${session.pickupLocation}*\n🏁 Drop: *${session.dropLocation}*\n\nPlease choose your dispatch timing:`,
          [
            { id: 'time_immediate', title: '⚡ Immediate Dispatch' },
            { id: 'time_schedule', title: '📅 Schedule Ride' },
            { id: 'btn_abort', title: 'Cancel' },
          ]
        );
        break;
      }

      case 'AWAITING_TIMING': {
        const isImmediate =
          actionId === 'time_immediate' ||
          rawText.toUpperCase().includes('IMMEDIATE') ||
          rawText.toUpperCase().includes('NOW');

        if (isImmediate) {
          session.timingType = 'IMMEDIATE';
          const today = new Date();
          const yyyy = today.getFullYear();
          const mm = String(today.getMonth() + 1).padStart(2, '0');
          const dd = String(today.getDate()).padStart(2, '0');
          session.date = `${yyyy}-${mm}-${dd}`;
          session.time = 'Immediate VIP Dispatch (On-Demand)';
          session.step = 'AWAITING_CONFIRMATION';
          session.updatedAt = Date.now();
          this.store.setSession(phone, session);

          const vClass = getClassForSeniority(user);
          const confirmationMsg =
            `📋 *Confirm Vehicle Dispatch Details*:\n\n` +
            `🏛 *VIP*: ${user.name} (${user.designation || 'Hon. MLA'})\n` +
            `📍 *Pickup*: ${session.pickupLocation}\n` +
            `🏁 *Drop*: ${session.dropLocation}\n` +
            `🕒 *Timing*: ⚡ *Immediate Dispatch (On-Demand)*\n` +
            `⭐ *Entitled Class*: ${vClass}\n\n` +
            `Dispatch highest-priority available vehicle immediately?`;

          await this.waService.sendInteractiveButtons(phone, confirmationMsg, [
            { id: 'btn_confirm', title: 'Confirm Allocation' },
            { id: 'btn_abort', title: 'Discard' },
          ]);
        } else {
          session.timingType = 'SCHEDULED';
          session.step = 'AWAITING_DATETIME_CUSTOM';
          session.updatedAt = Date.now();
          this.store.setSession(phone, session);

          await this.waService.sendTextMessage(
            phone,
            `📅 *Schedule Future Protocol Ride*\n\nHon. ${user.name}, please reply with your preferred date and time:\n(e.g., 'Today 4:00 PM', 'Tomorrow 10:00 AM', or '2026-11-23 11:30 AM')`
          );
        }
        break;
      }

      case 'AWAITING_DATETIME_CUSTOM': {
        const dtParsed = this.normalizeDateTimeInput(rawText);
        session.date = dtParsed.date;
        session.time = dtParsed.time;
        session.step = 'AWAITING_CONFIRMATION';
        session.updatedAt = Date.now();
        this.store.setSession(phone, session);

        const vClass = getClassForSeniority(user);
        const confirmationMsg =
          `📋 *Confirm Scheduled Vehicle Request*:\n\n` +
          `🏛 *VIP*: ${user.name} (${user.designation || 'Hon. MLA'})\n` +
          `📍 *Pickup*: ${session.pickupLocation}\n` +
          `🏁 *Drop*: ${session.dropLocation}\n` +
          `🕒 *Schedule*: ${session.date} at ${session.time}\n` +
          `⭐ *Entitled Class*: ${vClass}\n\n` +
          `Please confirm allocation dispatch:`;

        await this.waService.sendInteractiveButtons(phone, confirmationMsg, [
          { id: 'btn_confirm', title: 'Confirm Allocation' },
          { id: 'btn_abort', title: 'Discard' },
        ]);
        break;
      }

      case 'AWAITING_CONFIRMATION': {
        if (actionId === 'btn_confirm' || rawText.toUpperCase() === 'YES' || rawText.toUpperCase() === 'CONFIRM') {
          await this.finalizeBooking(user, phone, {
            pickupLocation: session.pickupLocation || 'Vidhana Soudha Gate 1',
            dropLocation: session.dropLocation || 'Kempegowda Intl Airport (KIA)',
            isRoundTrip: session.isRoundTrip,
            timingType: session.timingType || 'SCHEDULED',
            date: session.date || new Date().toISOString().split('T')[0],
            time: session.time || '11:00 AM',
            notes: session.timingType === 'IMMEDIATE'
              ? 'On-demand immediate dispatch via WhatsApp'
              : 'Scheduled WhatsApp conversational booking',
          });
          this.store.clearSession(phone);
        } else {
          this.store.clearSession(phone);
          await this.waService.sendTextMessage(phone, `Booking cancelled.`);
        }
        break;
      }
    }
  }

  private async processOneShotBooking(
    user: User,
    phone: string,
    parsed: { pickup: string; drop: string; isRoundTrip: boolean; date?: string; time?: string; notes?: string }
  ) {
    const dt = this.normalizeDateTimeInput(`${parsed.date || ''} ${parsed.time || ''}`);
    await this.finalizeBooking(user, phone, {
      pickupLocation: parsed.pickup,
      dropLocation: parsed.drop,
      isRoundTrip: parsed.isRoundTrip,
      date: dt.date,
      time: dt.time,
      notes: parsed.notes || 'One-shot WhatsApp booking',
    });
  }

  private async finalizeBooking(
    user: User,
    phone: string,
    details: {
      pickupLocation: string;
      dropLocation: string;
      isRoundTrip?: boolean;
      timingType?: 'IMMEDIATE' | 'SCHEDULED';
      date: string;
      time: string;
      notes?: string;
    }
  ) {
    const preferredClass = getClassForSeniority(user);
    const drivers = this.store.getDrivers();
    const vehicles = this.store.getVehicles();

    // Run hardcoded rule engine with strict priority queue
    const engineResult = evaluateRuleEngine(preferredClass, drivers, vehicles);

    const tripId = `REQ-${Math.floor(4100 + Math.random() * 8900)}`;
    const now = new Date().toISOString();

    const newTrip: TripRequest = {
      id: tripId,
      vipId: user.id,
      vipName: user.name,
      vipPhone: user.phone,
      vipDesignation: user.designation || 'VIP Protocol Member',
      date: details.date,
      time: details.time,
      pickupLocation: details.pickupLocation,
      dropLocation: details.dropLocation,
      isRoundTrip: details.isRoundTrip,
      timingType: details.timingType || 'SCHEDULED',
      preferredClass,
      status: engineResult.success ? 'ASSIGNED' : 'PENDING',
      notes: details.notes,
      allocationMethod: engineResult.allocationMethod,
      ruleTraceReason: engineResult.traceReason,
      source: 'WHATSAPP',
      createdAt: now,
      updatedAt: now,
    };

    if (engineResult.success && engineResult.assignedCandidate) {
      const { driver, vehicle } = engineResult.assignedCandidate;
      newTrip.assignedDriverId = driver.id;
      newTrip.assignedVehicleId = vehicle.id;
      newTrip.assignedDriverName = driver.name;
      newTrip.assignedDriverPhone = driver.phone;
      newTrip.assignedVehicleModel = vehicle.model;
      newTrip.assignedVehiclePlate = vehicle.plate;
      newTrip.assignedVehicleClass = vehicle.vehicleClass;
      newTrip.assignedPriority = vehicle.priority;
      newTrip.gpsShareUrl = driver.currentGpsShareUrl;

      // Update driver status in store
      this.store.updateDriver(driver.id, {
        status: 'BUSY',
        tripsToday: driver.tripsToday + 1,
        tripsThisWeek: driver.tripsThisWeek + 1,
      });
    }

    this.store.addTrip(newTrip);

    // Send confirmation to MLA via WhatsApp
    await this.waService.notifyBookingConfirmed(newTrip);
  }

  private normalizeDateTimeInput(input: string): { date: string; time: string } {
    const raw = (input || '').trim().toLowerCase();
    const today = new Date();
    let targetDate = new Date();

    if (raw.includes('tomorrow')) {
      targetDate.setDate(today.getDate() + 1);
    }

    const yyyy = targetDate.getFullYear();
    const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
    const dd = String(targetDate.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    // Extract time like 10:30 am, 3 pm, 15:00
    const timeMatch = raw.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm|hrs)?)/i);
    let timeStr = '11:00 AM';
    if (timeMatch && timeMatch[1]) {
      timeStr = timeMatch[1].toUpperCase();
      if (!timeStr.includes('AM') && !timeStr.includes('PM') && !timeStr.includes(':')) {
        timeStr += ':00';
      }
    }

    return { date: dateStr, time: timeStr };
  }

  private tryParseNaturalLanguageBooking(text: string): {
    isBooking: boolean;
    pickup?: string;
    drop?: string;
    isRoundTrip: boolean;
    date?: string;
    time?: string;
    notes?: string;
  } {
    const lower = text.toLowerCase();
    const keywords = ['need car', 'book car', 'need vehicle', 'book vehicle', 'from', 'pickup', 'to'];
    const hasIntent =
      lower.includes('need') ||
      lower.includes('book') ||
      lower.includes('require') ||
      lower.includes('car') ||
      lower.includes('vehicle');

    if (!hasIntent) {
      return { isBooking: false, isRoundTrip: false };
    }

    // Pattern: from X to Y
    const fromToMatch = text.match(/from\s+([^,]+?)\s+to\s+([^,.\n]+)/i);
    if (fromToMatch) {
      const pickup = fromToMatch[1].trim();
      let drop = fromToMatch[2].trim();

      // Strip trailing date/time keywords from drop location if present
      const timeKeywordsMatch = drop.match(/^(.+?)\s+(?:tomorrow|today|at\s+\d|on\s+\d)/i);
      if (timeKeywordsMatch) {
        drop = timeKeywordsMatch[1].trim();
      }

      const isRoundTrip = lower.includes('round trip') || lower.includes('return');
      return {
        isBooking: true,
        pickup,
        drop,
        isRoundTrip,
        notes: text,
      };
    }

    return { isBooking: false, isRoundTrip: false };
  }
}
