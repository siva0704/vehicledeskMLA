// server/index.ts
import dotenv2 from "dotenv";
import express from "express";
import http from "http";

// server/store.ts
import fs from "fs";
import path from "path";
var INITIAL_USERS = [
  {
    id: "user-vip-1",
    name: "Hon. Rajesh Kumar",
    phone: "+919845011223",
    role: "VIP",
    designation: "Special Secretary to Govt (DPAR)",
    seniorityTier: "TIER_1"
  },
  {
    id: "user-vip-2",
    name: "Dr. Ananya Hegde",
    phone: "+919845022334",
    role: "VIP",
    designation: "Principal Secretary (Higher Education)",
    seniorityTier: "TIER_2"
  },
  {
    id: "user-vip-3",
    name: "Sri B. S. Patil",
    phone: "+919845033445",
    role: "VIP",
    designation: "Joint Secretary (Protocol Liaison)",
    seniorityTier: "TIER_3"
  },
  {
    id: "user-driver-1",
    name: "Suresh Gowda",
    phone: "+919448033445",
    role: "DRIVER",
    driverId: "drv-1"
  },
  {
    id: "user-driver-2",
    name: "Manjunath K",
    phone: "+919448033447",
    role: "DRIVER",
    driverId: "drv-3"
  },
  {
    id: "user-admin-1",
    name: "Kavitha Rao",
    phone: "+919900055667",
    role: "ADMIN",
    designation: "State Fleet Superintendent & Protocol Officer"
  }
];
var INITIAL_VEHICLES = [
  {
    id: "veh-1",
    plate: "KA-01-GA-1001",
    model: "Toyota Camry Hybrid (Sedan)",
    vehicleClass: "CLASS_A",
    year: 2024,
    assignedDriverId: "drv-1",
    priority: 1
  },
  {
    id: "veh-2",
    plate: "KA-01-EQ-9009",
    model: "Mercedes-Benz E220d (Sedan)",
    vehicleClass: "CLASS_A",
    year: 2023,
    assignedDriverId: "drv-2",
    priority: 2
  },
  {
    id: "veh-3",
    plate: "KA-01-MJ-4050",
    model: "Toyota Fortuner 4x4 (SUV)",
    vehicleClass: "CLASS_B",
    year: 2024,
    assignedDriverId: "drv-3",
    priority: 3
  },
  {
    id: "veh-4",
    plate: "KA-01-HY-5520",
    model: "Toyota Innova HyCross ZX (SUV)",
    vehicleClass: "CLASS_B",
    year: 2024,
    assignedDriverId: "drv-4",
    priority: 4
  },
  {
    id: "veh-5",
    plate: "KA-01-ER-8812",
    model: "Maruti Suzuki Ertiga VXi (MPV)",
    vehicleClass: "CLASS_C",
    year: 2023,
    assignedDriverId: "drv-5",
    priority: 5
  },
  {
    id: "veh-6",
    plate: "KA-01-KC-3299",
    model: "Kia Carens Prestige (MPV)",
    vehicleClass: "CLASS_C",
    year: 2024,
    assignedDriverId: "drv-6",
    priority: 6
  },
  {
    id: "veh-7",
    plate: "KA-01-MT-7700",
    model: "Toyota Fortuner Legender (SUV)",
    vehicleClass: "CLASS_B",
    year: 2023,
    assignedDriverId: "drv-7",
    priority: 7
  }
];
var INITIAL_DRIVERS = [
  {
    id: "drv-1",
    name: "Suresh Gowda",
    phone: "+919448033445",
    vehicleId: "veh-1",
    status: "AVAILABLE",
    cleanliness: "CLEAN",
    tripsToday: 0,
    tripsThisWeek: 0,
    totalHoursThisWeek: 0,
    lastActive: "Ready on Duty",
    currentLocation: "Vidhana Soudha Gate 2, Bengaluru",
    currentGpsShareUrl: "https://maps.google.com/?q=12.9796,77.5908"
  },
  {
    id: "drv-2",
    name: "Anand Rao",
    phone: "+919448033446",
    vehicleId: "veh-2",
    status: "AVAILABLE",
    cleanliness: "CLEAN",
    tripsToday: 0,
    tripsThisWeek: 0,
    totalHoursThisWeek: 0,
    lastActive: "Ready on Duty",
    currentLocation: "Kumara Krupa Guest House, Bengaluru",
    currentGpsShareUrl: "https://maps.google.com/?q=12.9922,77.5833"
  },
  {
    id: "drv-3",
    name: "Manjunath K",
    phone: "+919448033447",
    vehicleId: "veh-3",
    status: "AVAILABLE",
    cleanliness: "CLEAN",
    tripsToday: 0,
    tripsThisWeek: 0,
    totalHoursThisWeek: 0,
    lastActive: "Ready on Duty",
    currentLocation: "Vikasa Soudha Parking Bay, Bengaluru",
    currentGpsShareUrl: "https://maps.google.com/?q=12.9788,77.5916"
  },
  {
    id: "drv-4",
    name: "Anand Kumar",
    phone: "+919448033448",
    vehicleId: "veh-4",
    status: "AVAILABLE",
    cleanliness: "CLEAN",
    tripsToday: 0,
    tripsThisWeek: 0,
    totalHoursThisWeek: 0,
    lastActive: "Ready on Duty",
    currentLocation: "Central Motor Depot, Bengaluru",
    currentGpsShareUrl: "https://maps.google.com/?q=13.0358,77.5970"
  },
  {
    id: "drv-5",
    name: "Basavaraj Patil",
    phone: "+919448033449",
    vehicleId: "veh-5",
    status: "AVAILABLE",
    cleanliness: "CLEAN",
    tripsToday: 0,
    tripsThisWeek: 0,
    totalHoursThisWeek: 0,
    lastActive: "Ready on Duty",
    currentLocation: "Central Motor Depot, Shantinagar",
    currentGpsShareUrl: "https://maps.google.com/?q=12.9550,77.5920"
  },
  {
    id: "drv-6",
    name: "Raghavendra Prasad",
    phone: "+919448033450",
    vehicleId: "veh-6",
    status: "AVAILABLE",
    cleanliness: "CLEAN",
    tripsToday: 0,
    tripsThisWeek: 0,
    totalHoursThisWeek: 0,
    lastActive: "Ready on Duty",
    currentLocation: "MS Building Bay, Bengaluru",
    currentGpsShareUrl: "https://maps.google.com/?q=12.9811,77.5932"
  },
  {
    id: "drv-7",
    name: "Kiran Kumar",
    phone: "+919448033451",
    vehicleId: "veh-7",
    status: "AVAILABLE",
    cleanliness: "CLEAN",
    tripsToday: 0,
    tripsThisWeek: 0,
    totalHoursThisWeek: 0,
    lastActive: "Ready on Duty",
    currentLocation: "State Transport Workshop, Rajajinagar",
    currentGpsShareUrl: "https://maps.google.com/?q=12.9890,77.5540"
  }
];
var INITIAL_TRIPS = [];
var INITIAL_AUDIT_LOGS = [];
var VehicleDeskStore = class {
  constructor(filePath) {
    const isServerless = Boolean(
      process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NOW_REGION || process.env.LAMBDA_TASK_ROOT
    );
    this.filePath = filePath || (isServerless ? path.resolve("/tmp", "vehicle-desk-state.json") : path.resolve(process.cwd(), "data", "vehicle-desk-state.json"));
    this.state = this.loadState();
  }
  loadState() {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, "utf-8");
        const parsed = JSON.parse(raw);
        const cleanTrips = (parsed.trips || []).filter(
          (t) => !["REQ-4081", "REQ-4078", "REQ-TEST-99"].includes(t.id)
        );
        return {
          users: parsed.users || INITIAL_USERS,
          vehicles: parsed.vehicles || INITIAL_VEHICLES,
          drivers: parsed.drivers || INITIAL_DRIVERS,
          trips: cleanTrips,
          auditLogs: parsed.auditLogs || INITIAL_AUDIT_LOGS,
          sessions: parsed.sessions || {}
        };
      }
    } catch (err) {
      console.warn("[Store] Could not read existing state file, using initial data:", err);
    }
    const initial = {
      users: INITIAL_USERS,
      vehicles: INITIAL_VEHICLES,
      drivers: INITIAL_DRIVERS,
      trips: INITIAL_TRIPS,
      auditLogs: INITIAL_AUDIT_LOGS,
      sessions: {}
    };
    this.saveStateDirect(initial);
    return initial;
  }
  saveStateDirect(s) {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.filePath, JSON.stringify(s, null, 2), "utf-8");
    } catch (err) {
      console.error("[Store] Failed to save state to disk:", err);
    }
  }
  save() {
    this.saveStateDirect(this.state);
  }
  reset() {
    this.state = JSON.parse(
      JSON.stringify({
        users: INITIAL_USERS,
        vehicles: INITIAL_VEHICLES,
        drivers: INITIAL_DRIVERS,
        trips: INITIAL_TRIPS,
        auditLogs: INITIAL_AUDIT_LOGS,
        sessions: {}
      })
    );
    this.save();
    return this.state;
  }
  // Getters
  getUsers() {
    return this.state.users;
  }
  getVehicles() {
    return this.state.vehicles;
  }
  getDrivers() {
    return this.state.drivers;
  }
  getTrips() {
    return this.state.trips;
  }
  getAuditLogs() {
    return this.state.auditLogs;
  }
  getSession(phone) {
    return this.state.sessions[phone];
  }
  setSession(phone, session) {
    this.state.sessions[phone] = session;
    this.save();
  }
  clearSession(phone) {
    delete this.state.sessions[phone];
    this.save();
  }
  findUserByPhone(phone) {
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
    return this.state.users.find((u) => {
      const uClean = u.phone.replace(/[\s\-\(\)]/g, "");
      return uClean === cleanPhone || uClean.endsWith(cleanPhone) || cleanPhone.endsWith(uClean);
    });
  }
  findDriverById(id) {
    return this.state.drivers.find((d) => d.id === id);
  }
  findVehicleById(id) {
    return this.state.vehicles.find((v) => v.id === id);
  }
  findTripById(id) {
    return this.state.trips.find((t) => t.id === id);
  }
  findActiveTripForVip(vipId) {
    return this.state.trips.find(
      (t) => t.vipId === vipId && t.status !== "COMPLETED" && t.status !== "CANCELLED"
    );
  }
  addTrip(trip) {
    this.state.trips.unshift(trip);
    this.save();
  }
  updateTrip(id, patch) {
    const trip = this.findTripById(id);
    if (!trip) return void 0;
    Object.assign(trip, patch, { updatedAt: (/* @__PURE__ */ new Date()).toISOString() });
    this.save();
    return trip;
  }
  updateDriver(id, patch) {
    const driver = this.findDriverById(id);
    if (!driver) return void 0;
    Object.assign(driver, patch);
    this.save();
    return driver;
  }
  addAuditLog(entry) {
    this.state.auditLogs.unshift(entry);
    this.save();
  }
};

// server/whatsappService.ts
var WhatsAppService = class {
  constructor(baseUrl, apiKey = process.env.WA_SIM_API_KEY || "wa-sim-local-dev-token", phoneNumberId = process.env.WA_SIM_PHONE_ID || "wa-sim-phone-001") {
    const isServerless = Boolean(
      process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NOW_REGION
    );
    const resolvedUrl = baseUrl || process.env.WA_SIM_URL || (isServerless ? "https://whatsapp-zeta-puce.vercel.app" : "http://localhost:3005");
    this.baseUrl = resolvedUrl.replace(/\/+$/, "");
    this.apiKey = apiKey;
    this.phoneNumberId = phoneNumberId;
  }
  cleanPhone(phone) {
    let p = phone.replace(/[^\d+]/g, "");
    if (!p.startsWith("+")) {
      p = `+${p}`;
    }
    return p;
  }
  async sendTextMessage(to, text) {
    const cleanTo = this.cleanPhone(to);
    const url = `${this.baseUrl}/v19.0/${this.phoneNumberId}/messages`;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: cleanTo,
          type: "text",
          text: { body: text }
        })
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
  async sendInteractiveButtons(to, bodyText, buttons) {
    const cleanTo = this.cleanPhone(to);
    const url = `${this.baseUrl}/v19.0/${this.phoneNumberId}/messages`;
    const formattedButtons = buttons.slice(0, 3).map((b) => ({
      type: "reply",
      reply: {
        id: b.id,
        title: b.title.slice(0, 20)
      }
    }));
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: cleanTo,
          type: "interactive",
          interactive: {
            type: "button",
            body: { text: bodyText },
            action: {
              buttons: formattedButtons
            }
          }
        })
      });
      if (!res.ok) {
        console.warn(`[WhatsAppService] Interactive send failed (${res.status}), falling back to text.`);
        const buttonMenuText = `${bodyText}

` + buttons.map((b, i) => `${i + 1}. ${b.title}`).join("\n");
        return this.sendTextMessage(to, buttonMenuText);
      }
      return true;
    } catch (err) {
      console.error(`[WhatsAppService] Error sending interactive buttons to ${cleanTo}:`, err);
      return false;
    }
  }
  async sendInteractiveList(to, bodyText, buttonText, sections, headerText) {
    const cleanTo = this.cleanPhone(to);
    const url = `${this.baseUrl}/v19.0/${this.phoneNumberId}/messages`;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: cleanTo,
          type: "interactive",
          interactive: {
            type: "list",
            header: headerText ? { type: "text", text: headerText } : void 0,
            body: { text: bodyText },
            footer: { text: "Karnataka State Protocol Fleet Desk" },
            action: {
              button: buttonText.slice(0, 20),
              sections
            }
          }
        })
      });
      if (!res.ok) {
        console.warn(`[WhatsAppService] Interactive list failed (${res.status}), falling back to text.`);
        let fallbackText = `${headerText ? `*${headerText}*

` : ""}${bodyText}
`;
        sections.forEach((sec) => {
          fallbackText += `
*${sec.title}*:
`;
          sec.rows.forEach((r) => {
            fallbackText += `\u2022 ${r.title}${r.description ? ` \u2014 _${r.description}_` : ""}
`;
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
  async notifyBookingConfirmed(trip) {
    const isImmediate = trip.timingType === "IMMEDIATE";
    const dispatchTimingLabel = isImmediate ? "\u26A1 Immediate VIP Dispatch (On-Demand)" : `\u{1F4C5} Scheduled for ${trip.date} at ${trip.time}`;
    const priorityBadge = trip.assignedPriority ? `\u2B50 *Assigned Priority*: Priority ${trip.assignedPriority} Vehicle` : `\u2B50 *Class*: ${trip.preferredClass}`;
    const msg = `\u{1F697} *VIP Vehicle Request Confirmed* [${trip.id}]

\u{1F3DB} *VIP*: ${trip.vipName} (${trip.vipDesignation})
\u{1F552} *Timing*: ${dispatchTimingLabel}
\u{1F4CD} *Pickup*: ${trip.pickupLocation}
\u{1F3C1} *Drop*: ${trip.dropLocation}
${priorityBadge}

` + (trip.assignedDriverName ? `\u{1F464} *Assigned Chauffeur*: ${trip.assignedDriverName}
\u{1F4DE} *Chauffeur Contact*: ${trip.assignedDriverPhone}
\u{1F698} *Vehicle Model*: ${trip.assignedVehicleModel}
\u{1F522} *Registration Plate*: [${trip.assignedVehiclePlate}]

_Driver has received this dispatch in their cockpit and is collecting vehicle keys._` : `\u23F3 *Status*: Placed on Priority Allocation Queue. Fleet Officer will assign shortly.`);
    return this.sendInteractiveButtons(trip.vipPhone, msg, [
      { id: "btn_status", title: "Check Status" },
      { id: "btn_cancel", title: "Cancel Trip" }
    ]);
  }
  async notifyDriverArrived(trip) {
    const msg = `\u{1F514} *Chauffeur Arrived at Pickup Location* [${trip.id}]

Namaskara Hon. *${trip.vipName}*,

Your assigned chauffeur *${trip.assignedDriverName}* has arrived and is waiting at:
\u{1F4CD} *Pickup Point*: *${trip.pickupLocation}*

\u{1F698} *Vehicle*: *${trip.assignedVehicleModel}* [${trip.assignedVehiclePlate}]
\u{1F4DE} *Chauffeur Contact*: ${trip.assignedDriverPhone}

_The vehicle is stationed at the porch/portico ready for boarding._`;
    return this.sendInteractiveButtons(trip.vipPhone, msg, [
      { id: "btn_status", title: "Trip Status" }
    ]);
  }
  async notifyTripAccepted(trip) {
    const msg = `\u2705 *Chauffeur Accepted Trip* [${trip.id}]

Chauffeur *${trip.assignedDriverName}* (${trip.assignedDriverPhone}) has accepted your trip request for ${trip.date} at ${trip.time}.

Vehicle: *${trip.assignedVehicleModel}* (${trip.assignedVehiclePlate})`;
    return this.sendInteractiveButtons(trip.vipPhone, msg, [
      { id: "btn_status", title: "Check Status" },
      { id: "btn_cancel", title: "Cancel Trip" }
    ]);
  }
  async notifyGpsShared(trip) {
    const gpsUrl = trip.gpsShareUrl || "https://maps.google.com/?q=12.9796,77.5908";
    const msg = `\u{1F4CD} *Live Chauffeur GPS Shared* [${trip.id}]

Chauffeur *${trip.assignedDriverName}* is en route or at the pickup bay.

\u{1F698} Vehicle: ${trip.assignedVehiclePlate}
\u{1F5FA} *Live Location*: ${gpsUrl}

Click link above to view real-time location.`;
    return this.sendInteractiveButtons(trip.vipPhone, msg, [
      { id: "btn_status", title: "Check Status" }
    ]);
  }
  async notifyTripStarted(trip) {
    const msg = `\u{1F680} *Trip In Progress* [${trip.id}]

Your trip to *${trip.dropLocation}* has commenced with Chauffeur *${trip.assignedDriverName}*.

Have a safe journey!`;
    return this.sendInteractiveButtons(trip.vipPhone, msg, [
      { id: "btn_status", title: "Check Status" }
    ]);
  }
  async notifyTripCompleted(trip) {
    const msg = `\u{1F3C1} *Trip Completed* [${trip.id}]

Your trip to *${trip.dropLocation}* has concluded.

Thank you for using the Karnataka State Protocol Fleet Desk.`;
    return this.sendInteractiveButtons(trip.vipPhone, msg, [
      { id: "btn_book", title: "Book Another Car" }
    ]);
  }
  async notifyTripCancelled(trip, reason) {
    const msg = `\u274C *Trip Cancelled* [${trip.id}]

Your booking for ${trip.date} at ${trip.time} has been cancelled.` + (reason ? `
Reason: ${reason}` : "");
    return this.sendInteractiveButtons(trip.vipPhone, msg, [
      { id: "btn_book", title: "Book a Car" }
    ]);
  }
  async notifyAdminOverride(trip) {
    const msg = `\u{1F504} *Protocol Assignment Update* [${trip.id}]

Fleet Superintendent has assigned a new vehicle for your booking:
\u{1F464} *Chauffeur*: ${trip.assignedDriverName} (${trip.assignedDriverPhone})
\u{1F698} *Vehicle*: ${trip.assignedVehicleModel} [${trip.assignedVehiclePlate}]
Reason: ${trip.overrideReason || "Protocol administrative reassignment"}`;
    return this.sendInteractiveButtons(trip.vipPhone, msg, [
      { id: "btn_status", title: "Check Status" }
    ]);
  }
};
var whatsappService = new WhatsAppService();

// server/ruleEngine.ts
function getClassForSeniority(user) {
  if (!user) return "CLASS_A";
  if (user.seniorityTier === "TIER_1") return "CLASS_A";
  if (user.seniorityTier === "TIER_2") return "CLASS_B";
  if (user.seniorityTier === "TIER_3") return "CLASS_C";
  const des = (user.designation || "").toLowerCase();
  if (des.includes("special secretary") || des.includes("minister") || des.includes("chief") || des.includes("mla") || des.includes("hon")) {
    return "CLASS_A";
  }
  if (des.includes("principal secretary") || des.includes("advisor") || des.includes("director")) {
    return "CLASS_B";
  }
  if (des.includes("joint secretary") || des.includes("liaison") || des.includes("officer")) {
    return "CLASS_C";
  }
  return "CLASS_A";
}
function evaluateRuleEngine(preferredClass, drivers, vehicles) {
  const traceSteps = [];
  traceSteps.push(`Evaluating request for preferred vehicle class: ${preferredClass}`);
  const vehicleMap = /* @__PURE__ */ new Map();
  vehicles.forEach((v) => vehicleMap.set(v.id, v));
  const allPairs = [];
  for (const driver of drivers) {
    const vehicle = vehicleMap.get(driver.vehicleId);
    if (vehicle) {
      allPairs.push({ driver, vehicle });
    }
  }
  const eligiblePairs = allPairs.filter((pair) => {
    const isAvail = pair.driver.status === "AVAILABLE";
    const isClean = pair.driver.cleanliness === "CLEAN";
    if (!isAvail) {
      traceSteps.push(
        `[Skip] Chauffeur ${pair.driver.name} is ${pair.driver.status} (Requires AVAILABLE)`
      );
    } else if (!isClean) {
      traceSteps.push(
        `[Skip] Chauffeur ${pair.driver.name} vehicle ${pair.vehicle.plate} is ${pair.driver.cleanliness} (Requires CLEAN)`
      );
    }
    return isAvail && isClean;
  });
  traceSteps.push(
    `Gate 1 passed: ${eligiblePairs.length} Chauffeurs meet [AVAILABLE + CLEAN] requirements.`
  );
  if (eligiblePairs.length === 0) {
    return {
      success: false,
      allocationMethod: "QUEUED",
      traceSteps,
      traceReason: "All drivers or vehicles are currently BUSY, OFF-DUTY, or in MAINTENANCE. Request placed on High-Priority Admin Queue."
    };
  }
  const sortPriority = (candidates) => {
    return candidates.sort((a, b) => {
      const pA = a.vehicle.priority || 99;
      const pB = b.vehicle.priority || 99;
      if (pA !== pB) {
        return pA - pB;
      }
      if (a.driver.tripsToday !== b.driver.tripsToday) {
        return a.driver.tripsToday - b.driver.tripsToday;
      }
      return a.driver.tripsThisWeek - b.driver.tripsThisWeek;
    });
  };
  const primaryMatches = eligiblePairs.filter((p) => p.vehicle.vehicleClass === preferredClass);
  if (primaryMatches.length > 0) {
    const sorted = sortPriority(primaryMatches);
    const chosen = sorted[0];
    traceSteps.push(
      `Primary Priority Match Found: ${primaryMatches.length} candidates in ${preferredClass}. Priority algorithm selected Priority ${chosen.vehicle.priority || 1} unit [${chosen.vehicle.model}] driven by ${chosen.driver.name}.`
    );
    return {
      success: true,
      assignedCandidate: chosen,
      allocationMethod: "RULE_ENGINE_AUTO",
      traceSteps,
      traceReason: `Assigned Priority ${chosen.vehicle.priority || 1} ${preferredClass} unit [${chosen.vehicle.model} - ${chosen.vehicle.plate}] with Chauffeur ${chosen.driver.name} (Strict Priority Queue: Vehicle ${chosen.vehicle.priority}, Available + Clean).`
    };
  }
  traceSteps.push(`Zero eligible vehicles in preferred class ${preferredClass}. Initiating Fallback Cascade.`);
  const fallbackOrder = [];
  if (preferredClass === "CLASS_A") {
    fallbackOrder.push("CLASS_B", "CLASS_C");
  } else if (preferredClass === "CLASS_B") {
    fallbackOrder.push("CLASS_A", "CLASS_C");
  } else {
    fallbackOrder.push("CLASS_B", "CLASS_A");
  }
  for (const fallbackClass of fallbackOrder) {
    const fallbackMatches = eligiblePairs.filter((p) => p.vehicle.vehicleClass === fallbackClass);
    if (fallbackMatches.length > 0) {
      const sorted = sortPriority(fallbackMatches);
      const chosen = sorted[0];
      traceSteps.push(
        `Fallback Success: Allocated alternate priority ${chosen.vehicle.priority || 1} unit in ${fallbackClass} (${chosen.vehicle.model}).`
      );
      return {
        success: true,
        assignedCandidate: chosen,
        allocationMethod: "RULE_ENGINE_AUTO",
        traceSteps,
        traceReason: `Preferred class ${preferredClass} exhausted. Cascaded fallback to Priority ${chosen.vehicle.priority || 1} [${chosen.vehicle.model} - ${chosen.vehicle.plate}] driven by ${chosen.driver.name}.`
      };
    }
  }
  return {
    success: false,
    allocationMethod: "QUEUED",
    traceSteps,
    traceReason: "All protocol classes exhausted. Trip placed on Admin Override Board for manual dispatch."
  };
}

// server/llmService.ts
import dotenv from "dotenv";
dotenv.config();
var LlmService = class {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || "";
    this.model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  }
  hasApiKey() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 5 && !this.apiKey.includes("YOUR_"));
  }
  async parseMessage(text, vipName = "Hon. Member") {
    const raw = (text || "").trim();
    if (this.hasApiKey()) {
      try {
        const llmResult = await this.callGemini(raw, vipName);
        if (llmResult) {
          return { ...llmResult, source: "GEMINI_LLM" };
        }
      } catch (err) {
        console.warn("[LlmService] Gemini API call failed, falling back to rule parser:", err);
      }
    }
    return this.fallbackRuleParser(raw);
  }
  async callGemini(text, vipName) {
    const today = /* @__PURE__ */ new Date();
    const todayStr = today.toISOString().split("T")[0];
    const systemPrompt = `You are the Karnataka State Protocol Fleet AI Concierge for Hon'ble MLAs.
Today's date is ${todayStr}.
Analyze the user's WhatsApp message sent by VIP ${vipName}.
Extract the travel booking parameters accurately.

Return ONLY a valid JSON object matching this schema:
{
  "intent": "BOOK_RIDE" | "CHECK_STATUS" | "CANCEL_RIDE" | "HELP" | "GENERAL",
  "pickupLocation": string or null,
  "dropLocation": string or null,
  "isRoundTrip": boolean,
  "date": "YYYY-MM-DD" or null,
  "time": "HH:MM AM/PM" or null,
  "notes": string or null,
  "conversationalReply": string
}`;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: `${systemPrompt}

User message: "${text}"` }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.1
        }
      })
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini API HTTP ${res.status}: ${errText}`);
    }
    const data = await res.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) return null;
    const parsed = JSON.parse(candidateText);
    return {
      intent: parsed.intent || "BOOK_RIDE",
      pickupLocation: parsed.pickupLocation || void 0,
      dropLocation: parsed.dropLocation || void 0,
      isRoundTrip: Boolean(parsed.isRoundTrip),
      date: parsed.date || void 0,
      time: parsed.time || void 0,
      notes: parsed.notes || text,
      conversationalReply: parsed.conversationalReply,
      source: "GEMINI_LLM"
    };
  }
  fallbackRuleParser(text) {
    const lower = text.toLowerCase();
    if (lower === "status" || lower === "my trip" || lower === "track") {
      return { intent: "CHECK_STATUS", isRoundTrip: false, source: "RULE_FALLBACK" };
    }
    if (lower === "cancel" || lower === "cancel trip") {
      return { intent: "CANCEL_RIDE", isRoundTrip: false, source: "RULE_FALLBACK" };
    }
    if (lower === "help" || lower === "menu" || lower === "hi" || lower === "hello") {
      return { intent: "HELP", isRoundTrip: false, source: "RULE_FALLBACK" };
    }
    const hasBookingIntent = lower.includes("need") || lower.includes("book") || lower.includes("require") || lower.includes("car") || lower.includes("vehicle") || lower.includes("from") || lower.includes("to");
    const fromToMatch = text.match(/from\s+([^,]+?)\s+to\s+([^,.\n]+)/i);
    let pickup;
    let drop;
    if (fromToMatch) {
      pickup = fromToMatch[1].trim();
      drop = fromToMatch[2].trim();
      const timeCleanMatch = drop.match(/^(.+?)\s+(?:tomorrow|today|at\s+\d|on\s+\d)/i);
      if (timeCleanMatch) {
        drop = timeCleanMatch[1].trim();
      }
    }
    const isRoundTrip = lower.includes("round trip") || lower.includes("return");
    const today = /* @__PURE__ */ new Date();
    let targetDate = /* @__PURE__ */ new Date();
    if (lower.includes("tomorrow")) {
      targetDate.setDate(today.getDate() + 1);
    }
    const yyyy = targetDate.getFullYear();
    const mm = String(targetDate.getMonth() + 1).padStart(2, "0");
    const dd = String(targetDate.getDate()).padStart(2, "0");
    const dateStr = `${yyyy}-${mm}-${dd}`;
    const timeMatch = text.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm|hrs)?)/i);
    let timeStr = "11:00 AM";
    if (timeMatch && timeMatch[1]) {
      timeStr = timeMatch[1].toUpperCase();
      if (!timeStr.includes("AM") && !timeStr.includes("PM") && !timeStr.includes(":")) {
        timeStr += ":00";
      }
    }
    return {
      intent: hasBookingIntent && pickup && drop ? "BOOK_RIDE" : "GENERAL",
      pickupLocation: pickup,
      dropLocation: drop,
      isRoundTrip,
      date: dateStr,
      time: timeStr,
      notes: text,
      source: "RULE_FALLBACK"
    };
  }
};
var llmService = new LlmService();

// server/botEngine.ts
var BotEngine = class {
  constructor(store2, waService2) {
    this.store = store2;
    this.waService = waService2;
  }
  async handleInboundMessage(fromPhone, textBody, buttonId) {
    const rawText = (textBody || "").trim();
    const actionId = buttonId || "";
    const user = this.store.findUserByPhone(fromPhone);
    if (!user || user.role !== "VIP") {
      console.log(`[BotEngine] Unregistered or non-VIP sender: ${fromPhone}`);
      await this.waService.sendTextMessage(
        fromPhone,
        `\u{1F64F} *Namaskara.*

This is the *Karnataka State Protocol Fleet WhatsApp Desk* for Hon'ble MLAs and State Dignitaries.

Your mobile number (${fromPhone}) is not registered in the active protocol roster. For protocol vehicle allotment, please contact the Protocol Officer at Vidhana Soudha:
\u{1F4DE} Protocol Office: +91 80 2203 3500`
      );
      return;
    }
    const command = (actionId || rawText).trim().toUpperCase();
    if (command === "BTN_STATUS" || command === "STATUS" || command === "MY TRIP" || command === "TRACK") {
      await this.handleTripStatus(user, fromPhone);
      return;
    }
    if (command === "BTN_CANCEL" || command === "CANCEL TRIP") {
      await this.handleTripCancellation(user, fromPhone);
      return;
    }
    if (command === "BTN_BOOK" || command === "BOOK" || command === "BOOK CAR" || command === "NEW") {
      await this.startStepByStepBooking(user, fromPhone);
      return;
    }
    if (command === "HELP" || command === "MENU" || command === "HI" || command === "HELLO" || command === "NAMASKARA") {
      await this.sendMainMenu(user, fromPhone);
      return;
    }
    const activeSession = this.store.getSession(fromPhone);
    if (activeSession && activeSession.step !== "IDLE") {
      await this.processSessionStep(user, fromPhone, rawText, actionId);
      return;
    }
    const parsedNl = await llmService.parseMessage(rawText, user.name);
    if (parsedNl.intent === "CHECK_STATUS") {
      await this.handleTripStatus(user, fromPhone);
      return;
    }
    if (parsedNl.intent === "CANCEL_RIDE") {
      await this.handleTripCancellation(user, fromPhone);
      return;
    }
    if (parsedNl.intent === "HELP") {
      await this.sendMainMenu(user, fromPhone);
      return;
    }
    if (parsedNl.intent === "BOOK_RIDE" && parsedNl.pickupLocation && parsedNl.dropLocation) {
      console.log(`[BotEngine] Booking ride via ${parsedNl.source}: ${parsedNl.pickupLocation} -> ${parsedNl.dropLocation}`);
      await this.processOneShotBooking(user, fromPhone, {
        pickup: parsedNl.pickupLocation,
        drop: parsedNl.dropLocation,
        isRoundTrip: parsedNl.isRoundTrip,
        date: parsedNl.date,
        time: parsedNl.time,
        notes: parsedNl.notes
      });
      return;
    }
    await this.sendMainMenu(user, fromPhone);
  }
  async sendMainMenu(user, phone) {
    const msg = `\u{1F3DB} *Karnataka State Protocol Fleet Desk*
Welcome, *${user.name}*
Designation: ${user.designation || "Hon. Member"}

How may the Vehicle Desk assist you today?`;
    await this.waService.sendInteractiveButtons(phone, msg, [
      { id: "btn_book", title: "Book a Car" },
      { id: "btn_status", title: "My Active Trip" },
      { id: "btn_cancel", title: "Cancel Trip" }
    ]);
  }
  async handleTripStatus(user, phone) {
    const activeTrip = this.store.findActiveTripForVip(user.id);
    if (!activeTrip) {
      await this.waService.sendInteractiveButtons(
        phone,
        `\u2139\uFE0F *No Active Trips*

Hon. ${user.name}, you currently do not have any active vehicle requests scheduled.`,
        [{ id: "btn_book", title: "Book a Car" }]
      );
      return;
    }
    const gpsText = activeTrip.gpsShareUrl ? `
\u{1F4CD} *Live GPS Tracking*: ${activeTrip.gpsShareUrl}` : "\n\u{1F4CD} *GPS*: Pending chauffeur sharing";
    const msg = `\u{1F4CB} *Active Trip Details* [${activeTrip.id}]

\u{1F4CC} *Status*: *${activeTrip.status}*
\u{1F4C5} *Date*: ${activeTrip.date} at ${activeTrip.time}
\u{1F4CD} *Pickup*: ${activeTrip.pickupLocation}
\u{1F3C1} *Drop*: ${activeTrip.dropLocation}
\u2B50 *Class*: ${activeTrip.preferredClass}
` + (activeTrip.assignedDriverName ? `
\u{1F464} *Chauffeur*: ${activeTrip.assignedDriverName}
\u{1F4DE} *Chauffeur Phone*: ${activeTrip.assignedDriverPhone}
\u{1F698} *Vehicle*: ${activeTrip.assignedVehicleModel} [${activeTrip.assignedVehiclePlate}]` : `
\u23F3 *Allocation*: In Queue for Dispatch`) + gpsText;
    await this.waService.sendInteractiveButtons(phone, msg, [
      { id: "btn_status", title: "Refresh Status" },
      { id: "btn_cancel", title: "Cancel Trip" }
    ]);
  }
  async handleTripCancellation(user, phone) {
    const activeTrip = this.store.findActiveTripForVip(user.id);
    if (!activeTrip) {
      await this.waService.sendTextMessage(
        phone,
        `\u2139\uFE0F No active vehicle booking found to cancel.`
      );
      return;
    }
    this.store.updateTrip(activeTrip.id, {
      status: "CANCELLED",
      notes: (activeTrip.notes ? activeTrip.notes + " | " : "") + "Cancelled by MLA via WhatsApp"
    });
    if (activeTrip.assignedDriverId) {
      const driver = this.store.findDriverById(activeTrip.assignedDriverId);
      if (driver && driver.status === "BUSY") {
        this.store.updateDriver(driver.id, { status: "AVAILABLE" });
      }
    }
    await this.waService.notifyTripCancelled(activeTrip, "Cancelled on MLA request via WhatsApp");
  }
  async startStepByStepBooking(user, phone) {
    this.store.setSession(phone, {
      vipId: user.id,
      phone,
      step: "AWAITING_PICKUP",
      updatedAt: Date.now()
    });
    await this.waService.sendInteractiveList(
      phone,
      `Hon. *${user.name}*, please select your pickup point from the predefined geofenced locations around Vidhana Soudha & Legislators' Home (LH), or type a custom pickup location:`,
      "Choose Pickup Point",
      [
        {
          title: "Vidhana Soudha Complex",
          rows: [
            {
              id: "loc_vs_gate1",
              title: "Vidhana Soudha Gate 1",
              description: "West Porch VIP Portico Entry"
            },
            {
              id: "loc_vs_kengal",
              title: "Kengal Gate (Gate 2)",
              description: "Ambedkar Veedhi / High Court Junction"
            },
            {
              id: "loc_vs_south",
              title: "Vidhana Soudha South Gate",
              description: "South Wing / Cubbon Park Exit"
            }
          ]
        },
        {
          title: "Legislators' Home (LH)",
          rows: [
            {
              id: "loc_lh_deepika",
              title: "Deepika Location",
              description: "LH Deepika Building Compound"
            },
            {
              id: "loc_lh_reception",
              title: "LH Main Reception",
              description: "Main Portico & Dispatch Porch"
            },
            {
              id: "loc_lh_block_a",
              title: "LH Block A",
              description: "Legislators' Residence Wing A"
            },
            {
              id: "loc_lh_block_b",
              title: "LH Block B",
              description: "Legislators' Guest Suites Wing B"
            }
          ]
        },
        {
          title: "State Protocol Guest Houses",
          rows: [
            {
              id: "loc_kumara_krupa",
              title: "Kumara Krupa Guest House",
              description: "Main Porch, High Grounds"
            },
            {
              id: "loc_balabrooie",
              title: "Balabrooie Guest House",
              description: "Palace Road Entrance Porch"
            }
          ]
        }
      ],
      "\u{1F4CD} Pickup Location Selection"
    );
  }
  async processSessionStep(user, phone, rawText, actionId) {
    const session = this.store.getSession(phone);
    if (!session) return;
    if (actionId === "btn_abort" || rawText.toUpperCase() === "ABORT" || rawText.toUpperCase() === "CANCEL") {
      this.store.clearSession(phone);
      await this.waService.sendTextMessage(phone, `Booking session discarded.`);
      return;
    }
    switch (session.step) {
      case "AWAITING_PICKUP": {
        const pickupChoice = actionId.startsWith("loc_") ? rawText.trim() : rawText.trim();
        session.pickupLocation = pickupChoice || "Vidhana Soudha Gate 1";
        session.step = "AWAITING_DROP";
        session.updatedAt = Date.now();
        this.store.setSession(phone, session);
        await this.waService.sendInteractiveList(
          phone,
          `\u2705 Pickup confirmed: *${session.pickupLocation}*

Please select your destination from frequent official drop points, or reply with a custom destination in text:`,
          "Choose Destination",
          [
            {
              title: "Frequent Official Destinations",
              rows: [
                {
                  id: "drop_kia",
                  title: "Kempegowda Intl Airport (KIA)",
                  description: "Departure Porch, T1 / T2"
                },
                {
                  id: "drop_ksr",
                  title: "Bengaluru City Railway Station",
                  description: "KSR Main VIP Portico, Majestic"
                },
                {
                  id: "drop_raj_bhavan",
                  title: "Raj Bhavan",
                  description: "Governor's Residence, Raj Bhavan Rd"
                },
                {
                  id: "drop_high_court",
                  title: "High Court of Karnataka",
                  description: "Attara Kacheri Gate Porch"
                },
                {
                  id: "drop_vikas_soudha",
                  title: "Vikas Soudha",
                  description: "South Entrance Portico"
                },
                {
                  id: "drop_ms_building",
                  title: "MS Building (Sachivalaya)",
                  description: "State Secretariat Office Porch"
                }
              ]
            },
            {
              title: "Round Trip Option",
              rows: [
                {
                  id: "drop_round_trip",
                  title: `Round Trip (Return to ${session.pickupLocation})`,
                  description: "Chauffeur on standby with VIP for return journey"
                }
              ]
            }
          ],
          "\u{1F3C1} Destination Selection"
        );
        break;
      }
      case "AWAITING_DROP": {
        const dropChoice = actionId.startsWith("drop_") ? rawText.trim() : rawText.trim();
        if (actionId === "drop_round_trip" || dropChoice.toUpperCase().includes("ROUND") || dropChoice.toUpperCase() === "RT") {
          session.isRoundTrip = true;
          session.dropLocation = `Round Trip (Return to ${session.pickupLocation})`;
        } else {
          session.isRoundTrip = false;
          session.dropLocation = dropChoice;
        }
        session.step = "AWAITING_TIMING";
        session.updatedAt = Date.now();
        this.store.setSession(phone, session);
        await this.waService.sendInteractiveButtons(
          phone,
          `\u2705 Pickup: *${session.pickupLocation}*
\u{1F3C1} Drop: *${session.dropLocation}*

Please choose your dispatch timing:`,
          [
            { id: "time_immediate", title: "\u26A1 Immediate Dispatch" },
            { id: "time_schedule", title: "\u{1F4C5} Schedule Ride" },
            { id: "btn_abort", title: "Cancel" }
          ]
        );
        break;
      }
      case "AWAITING_TIMING": {
        const isImmediate = actionId === "time_immediate" || rawText.toUpperCase().includes("IMMEDIATE") || rawText.toUpperCase().includes("NOW");
        if (isImmediate) {
          session.timingType = "IMMEDIATE";
          const today = /* @__PURE__ */ new Date();
          const yyyy = today.getFullYear();
          const mm = String(today.getMonth() + 1).padStart(2, "0");
          const dd = String(today.getDate()).padStart(2, "0");
          session.date = `${yyyy}-${mm}-${dd}`;
          session.time = "Immediate VIP Dispatch (On-Demand)";
          session.step = "AWAITING_CONFIRMATION";
          session.updatedAt = Date.now();
          this.store.setSession(phone, session);
          const vClass = getClassForSeniority(user);
          const confirmationMsg = `\u{1F4CB} *Confirm Vehicle Dispatch Details*:

\u{1F3DB} *VIP*: ${user.name} (${user.designation || "Hon. MLA"})
\u{1F4CD} *Pickup*: ${session.pickupLocation}
\u{1F3C1} *Drop*: ${session.dropLocation}
\u{1F552} *Timing*: \u26A1 *Immediate Dispatch (On-Demand)*
\u2B50 *Entitled Class*: ${vClass}

Dispatch highest-priority available vehicle immediately?`;
          await this.waService.sendInteractiveButtons(phone, confirmationMsg, [
            { id: "btn_confirm", title: "Confirm Allocation" },
            { id: "btn_abort", title: "Discard" }
          ]);
        } else {
          session.timingType = "SCHEDULED";
          session.step = "AWAITING_DATETIME_CUSTOM";
          session.updatedAt = Date.now();
          this.store.setSession(phone, session);
          await this.waService.sendTextMessage(
            phone,
            `\u{1F4C5} *Schedule Future Protocol Ride*

Hon. ${user.name}, please reply with your preferred date and time:
(e.g., 'Today 4:00 PM', 'Tomorrow 10:00 AM', or '2026-11-23 11:30 AM')`
          );
        }
        break;
      }
      case "AWAITING_DATETIME_CUSTOM": {
        const dtParsed = this.normalizeDateTimeInput(rawText);
        session.date = dtParsed.date;
        session.time = dtParsed.time;
        session.step = "AWAITING_CONFIRMATION";
        session.updatedAt = Date.now();
        this.store.setSession(phone, session);
        const vClass = getClassForSeniority(user);
        const confirmationMsg = `\u{1F4CB} *Confirm Scheduled Vehicle Request*:

\u{1F3DB} *VIP*: ${user.name} (${user.designation || "Hon. MLA"})
\u{1F4CD} *Pickup*: ${session.pickupLocation}
\u{1F3C1} *Drop*: ${session.dropLocation}
\u{1F552} *Schedule*: ${session.date} at ${session.time}
\u2B50 *Entitled Class*: ${vClass}

Please confirm allocation dispatch:`;
        await this.waService.sendInteractiveButtons(phone, confirmationMsg, [
          { id: "btn_confirm", title: "Confirm Allocation" },
          { id: "btn_abort", title: "Discard" }
        ]);
        break;
      }
      case "AWAITING_CONFIRMATION": {
        if (actionId === "btn_confirm" || rawText.toUpperCase() === "YES" || rawText.toUpperCase() === "CONFIRM") {
          await this.finalizeBooking(user, phone, {
            pickupLocation: session.pickupLocation || "Vidhana Soudha Gate 1",
            dropLocation: session.dropLocation || "Kempegowda Intl Airport (KIA)",
            isRoundTrip: session.isRoundTrip,
            timingType: session.timingType || "SCHEDULED",
            date: session.date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
            time: session.time || "11:00 AM",
            notes: session.timingType === "IMMEDIATE" ? "On-demand immediate dispatch via WhatsApp" : "Scheduled WhatsApp conversational booking"
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
  async processOneShotBooking(user, phone, parsed) {
    const dt = this.normalizeDateTimeInput(`${parsed.date || ""} ${parsed.time || ""}`);
    await this.finalizeBooking(user, phone, {
      pickupLocation: parsed.pickup,
      dropLocation: parsed.drop,
      isRoundTrip: parsed.isRoundTrip,
      date: dt.date,
      time: dt.time,
      notes: parsed.notes || "One-shot WhatsApp booking"
    });
  }
  async finalizeBooking(user, phone, details) {
    const preferredClass = getClassForSeniority(user);
    const drivers = this.store.getDrivers();
    const vehicles = this.store.getVehicles();
    const engineResult = evaluateRuleEngine(preferredClass, drivers, vehicles);
    const tripId = `REQ-${Math.floor(4100 + Math.random() * 8900)}`;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const newTrip = {
      id: tripId,
      vipId: user.id,
      vipName: user.name,
      vipPhone: user.phone,
      vipDesignation: user.designation || "VIP Protocol Member",
      date: details.date,
      time: details.time,
      pickupLocation: details.pickupLocation,
      dropLocation: details.dropLocation,
      isRoundTrip: details.isRoundTrip,
      timingType: details.timingType || "SCHEDULED",
      preferredClass,
      status: engineResult.success ? "ASSIGNED" : "PENDING",
      notes: details.notes,
      allocationMethod: engineResult.allocationMethod,
      ruleTraceReason: engineResult.traceReason,
      source: "WHATSAPP",
      createdAt: now,
      updatedAt: now
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
      this.store.updateDriver(driver.id, {
        status: "BUSY",
        tripsToday: driver.tripsToday + 1,
        tripsThisWeek: driver.tripsThisWeek + 1
      });
    }
    this.store.addTrip(newTrip);
    await this.waService.notifyBookingConfirmed(newTrip);
  }
  normalizeDateTimeInput(input) {
    const raw = (input || "").trim().toLowerCase();
    const today = /* @__PURE__ */ new Date();
    let targetDate = /* @__PURE__ */ new Date();
    if (raw.includes("tomorrow")) {
      targetDate.setDate(today.getDate() + 1);
    }
    const yyyy = targetDate.getFullYear();
    const mm = String(targetDate.getMonth() + 1).padStart(2, "0");
    const dd = String(targetDate.getDate()).padStart(2, "0");
    const dateStr = `${yyyy}-${mm}-${dd}`;
    const timeMatch = raw.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm|hrs)?)/i);
    let timeStr = "11:00 AM";
    if (timeMatch && timeMatch[1]) {
      timeStr = timeMatch[1].toUpperCase();
      if (!timeStr.includes("AM") && !timeStr.includes("PM") && !timeStr.includes(":")) {
        timeStr += ":00";
      }
    }
    return { date: dateStr, time: timeStr };
  }
  tryParseNaturalLanguageBooking(text) {
    const lower = text.toLowerCase();
    const keywords = ["need car", "book car", "need vehicle", "book vehicle", "from", "pickup", "to"];
    const hasIntent = lower.includes("need") || lower.includes("book") || lower.includes("require") || lower.includes("car") || lower.includes("vehicle");
    if (!hasIntent) {
      return { isBooking: false, isRoundTrip: false };
    }
    const fromToMatch = text.match(/from\s+([^,]+?)\s+to\s+([^,.\n]+)/i);
    if (fromToMatch) {
      const pickup = fromToMatch[1].trim();
      let drop = fromToMatch[2].trim();
      const timeKeywordsMatch = drop.match(/^(.+?)\s+(?:tomorrow|today|at\s+\d|on\s+\d)/i);
      if (timeKeywordsMatch) {
        drop = timeKeywordsMatch[1].trim();
      }
      const isRoundTrip = lower.includes("round trip") || lower.includes("return");
      return {
        isBooking: true,
        pickup,
        drop,
        isRoundTrip,
        notes: text
      };
    }
    return { isBooking: false, isRoundTrip: false };
  }
};

// server/index.ts
dotenv2.config();
var PORT = process.env.PORT || 4e3;
var app = express();
app.use(express.json({ limit: "10mb" }));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-API-Key");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }
  next();
});
var store = new VehicleDeskStore();
var waService = new WhatsAppService();
var botEngine = new BotEngine(store, waService);
app.get(["/health", "/api/health"], (_req, res) => {
  res.json({
    status: "ok",
    service: "vehicledesk-mla-backend",
    port: PORT,
    trips: store.getTrips().length,
    drivers: store.getDrivers().length
  });
});
app.get("/api/whatsapp/status", async (_req, res) => {
  try {
    const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NOW_REGION);
    const waUrl = process.env.WA_SIM_URL || (isServerless ? "https://whatsapp-zeta-puce.vercel.app" : "http://localhost:3005");
    const waRes = await fetch(`${waUrl}/health`);
    const data = await waRes.json();
    res.json({ connected: true, emulator: data });
  } catch (err) {
    res.json({ connected: false, error: "Could not connect to WhatsApp emulator" });
  }
});
app.post("/api/whatsapp/webhook", async (req, res) => {
  try {
    const body = req.body;
    if (body.fromPhone && (body.text || body.body)) {
      await botEngine.handleInboundMessage(body.fromPhone, body.text || body.body, body.actionId || body.buttonId);
      res.json({ ok: true, direct: true });
      return;
    }
    const entry = body?.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const messages = value?.messages;
    if (Array.isArray(messages) && messages.length > 0) {
      for (const msg of messages) {
        const fromPhone = msg.from;
        let textBody = "";
        let buttonId = void 0;
        if (msg.type === "text") {
          textBody = msg.text?.body || "";
        } else if (msg.type === "interactive") {
          if (msg.interactive?.type === "button_reply") {
            buttonId = msg.interactive.button_reply?.id;
            textBody = msg.interactive.button_reply?.title || "";
          } else if (msg.interactive?.type === "list_reply") {
            buttonId = msg.interactive.list_reply?.id;
            textBody = msg.interactive.list_reply?.title || "";
          }
        }
        console.log(`[Webhook] Processing incoming from: ${fromPhone}, text: "${textBody}", buttonId: "${buttonId || ""}"`);
        await botEngine.handleInboundMessage(fromPhone, textBody, buttonId);
      }
    }
    res.status(200).json({ status: "delivered" });
  } catch (err) {
    console.error("[Webhook] Error handling inbound WhatsApp message:", err);
    res.status(500).json({ error: "Internal webhook handler error" });
  }
});
app.post("/api/auth/login", (req, res) => {
  const { phone, role } = req.body;
  if (!phone) {
    res.status(400).json({ error: "Phone number is required" });
    return;
  }
  const user = store.findUserByPhone(phone);
  if (!user) {
    res.status(401).json({ error: "User not registered in protocol directory" });
    return;
  }
  if (user.role === "VIP") {
    res.status(403).json({
      error: "VIP / MLA self-service portal is exclusively on WhatsApp. Please message the WhatsApp desk at +91 80 2203 3500.",
      isVipRedirect: true
    });
    return;
  }
  if (role && user.role !== role) {
    res.status(403).json({ error: `User is not authorized for the ${role} portal.` });
    return;
  }
  res.json({ user });
});
app.get("/api/state", (_req, res) => {
  res.json({
    users: store.getUsers(),
    vehicles: store.getVehicles(),
    drivers: store.getDrivers(),
    trips: store.getTrips(),
    auditLogs: store.getAuditLogs()
  });
});
app.get("/api/trips", (_req, res) => {
  res.json(store.getTrips());
});
app.get("/api/drivers", (_req, res) => {
  res.json(store.getDrivers());
});
app.get("/api/vehicles", (_req, res) => {
  res.json(store.getVehicles());
});
app.get("/api/audit", (_req, res) => {
  res.json(store.getAuditLogs());
});
app.post("/api/driver/:driverId/status", (req, res) => {
  const { status } = req.body;
  const updated = store.updateDriver(req.params.driverId, { status });
  if (!updated) {
    res.status(404).json({ error: "Driver not found" });
    return;
  }
  res.json({ driver: updated });
});
app.post("/api/driver/:driverId/cleanliness", (req, res) => {
  const { cleanliness } = req.body;
  const updated = store.updateDriver(req.params.driverId, { cleanliness });
  if (!updated) {
    res.status(404).json({ error: "Driver not found" });
    return;
  }
  res.json({ driver: updated });
});
app.post("/api/driver/trip/:tripId/accept", async (req, res) => {
  const trip = store.updateTrip(req.params.tripId, { status: "ACCEPTED" });
  if (!trip) {
    res.status(404).json({ error: "Trip not found" });
    return;
  }
  await waService.notifyTripAccepted(trip);
  res.json({ trip });
});
app.post("/api/driver/trip/:tripId/collect-keys", async (req, res) => {
  const trip = store.updateTrip(req.params.tripId, { status: "KEY_COLLECTED" });
  if (!trip) {
    res.status(404).json({ error: "Trip not found" });
    return;
  }
  res.json({ trip });
});
app.post("/api/driver/trip/:tripId/en-route", async (req, res) => {
  const { gpsUrl, coordinates } = req.body;
  const trip = store.updateTrip(req.params.tripId, {
    status: "EN_ROUTE_TO_PICKUP",
    gpsShareUrl: gpsUrl || "https://maps.google.com/?q=12.9796,77.5908",
    gpsCoordinates: coordinates || { lat: 12.9796, lng: 77.5908 }
  });
  if (!trip) {
    res.status(404).json({ error: "Trip not found" });
    return;
  }
  if (trip.assignedDriverId) {
    store.updateDriver(trip.assignedDriverId, {
      currentGpsShareUrl: trip.gpsShareUrl,
      lastActive: "En Route (Live GPS)"
    });
  }
  await waService.notifyGpsShared(trip);
  res.json({ trip });
});
app.post("/api/driver/trip/:tripId/arrived", async (req, res) => {
  const trip = store.updateTrip(req.params.tripId, { status: "ARRIVED_AT_PICKUP" });
  if (!trip) {
    res.status(404).json({ error: "Trip not found" });
    return;
  }
  console.log(`[DriverWorkflow] Trip ${trip.id}: Chauffeur arrived at ${trip.pickupLocation}. Alerting MLA via WhatsApp.`);
  await waService.notifyDriverArrived(trip);
  res.json({ trip, alertSent: true });
});
app.post("/api/driver/trip/:tripId/gps", async (req, res) => {
  const { gpsUrl, coordinates } = req.body;
  const trip = store.updateTrip(req.params.tripId, {
    status: "GPS_SHARED",
    gpsShareUrl: gpsUrl || "https://maps.google.com/?q=12.9796,77.5908",
    gpsCoordinates: coordinates || { lat: 12.9796, lng: 77.5908 }
  });
  if (!trip) {
    res.status(404).json({ error: "Trip not found" });
    return;
  }
  if (trip.assignedDriverId) {
    store.updateDriver(trip.assignedDriverId, {
      currentGpsShareUrl: trip.gpsShareUrl,
      lastActive: "Just now (GPS Live)"
    });
  }
  await waService.notifyGpsShared(trip);
  res.json({ trip });
});
app.post("/api/driver/trip/:tripId/start", async (req, res) => {
  const trip = store.updateTrip(req.params.tripId, { status: "TRIP_STARTED" });
  if (!trip) {
    res.status(404).json({ error: "Trip not found" });
    return;
  }
  await waService.notifyTripStarted(trip);
  res.json({ trip });
});
app.post("/api/driver/trip/:tripId/complete", async (req, res) => {
  const { postTripCleanliness } = req.body;
  const trip = store.updateTrip(req.params.tripId, {
    status: "COMPLETED",
    completedAt: (/* @__PURE__ */ new Date()).toISOString()
  });
  if (!trip) {
    res.status(404).json({ error: "Trip not found" });
    return;
  }
  if (trip.assignedDriverId) {
    store.updateDriver(trip.assignedDriverId, {
      status: "AVAILABLE",
      cleanliness: postTripCleanliness || "CLEAN"
    });
  }
  await waService.notifyTripCompleted(trip);
  res.json({ trip });
});
app.post("/api/admin/override", async (req, res) => {
  const { tripId, driverId, reason, adminName } = req.body;
  const trip = store.findTripById(tripId);
  const driver = store.findDriverById(driverId);
  const vehicle = driver ? store.findVehicleById(driver.vehicleId) : void 0;
  if (!trip || !driver || !vehicle) {
    res.status(400).json({ error: "Invalid trip or driver selection" });
    return;
  }
  const previousDriverId = trip.assignedDriverId;
  if (previousDriverId && previousDriverId !== driver.id) {
    const prevDriver = store.findDriverById(previousDriverId);
    if (prevDriver && prevDriver.status === "BUSY") {
      store.updateDriver(prevDriver.id, { status: "AVAILABLE" });
    }
  }
  store.updateDriver(driver.id, { status: "BUSY" });
  const updatedTrip = store.updateTrip(trip.id, {
    assignedDriverId: driver.id,
    assignedDriverName: driver.name,
    assignedDriverPhone: driver.phone,
    assignedVehicleId: vehicle.id,
    assignedVehicleModel: vehicle.model,
    assignedVehiclePlate: vehicle.plate,
    assignedVehicleClass: vehicle.vehicleClass,
    gpsShareUrl: driver.currentGpsShareUrl,
    status: "ASSIGNED",
    isOverridden: true,
    allocationMethod: "ADMIN_OVERRIDE",
    overrideReason: reason,
    overriddenByAdmin: adminName || "Fleet Superintendent",
    overriddenAt: (/* @__PURE__ */ new Date()).toISOString()
  });
  store.addAuditLog({
    id: `AUDIT-${Date.now().toString().slice(-4)}`,
    tripId: trip.id,
    vipName: trip.vipName,
    driverName: `${driver.name} (${vehicle.model} / ${vehicle.plate})`,
    vehiclePlate: vehicle.plate,
    previousDriverId,
    adminName: adminName || "Fleet Superintendent",
    reason,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
  if (updatedTrip) {
    await waService.notifyAdminOverride(updatedTrip);
  }
  res.json({ trip: updatedTrip });
});
app.post("/api/trips/:id/cancel", async (req, res) => {
  const trip = store.findTripById(req.params.id);
  if (!trip) {
    res.status(404).json({ error: "Trip not found" });
    return;
  }
  store.updateTrip(trip.id, { status: "CANCELLED" });
  if (trip.assignedDriverId) {
    const driver = store.findDriverById(trip.assignedDriverId);
    if (driver && driver.status === "BUSY") {
      store.updateDriver(driver.id, { status: "AVAILABLE" });
    }
  }
  await waService.notifyTripCancelled(trip, "Cancelled by Administrative Action");
  res.json({ ok: true });
});
app.post("/api/reset", (_req, res) => {
  const state = store.reset();
  res.json({ ok: true, state });
});
var index_default = app;
var isMainModule = Boolean(
  process.argv[1] && (process.argv[1].endsWith("server/index.ts") || process.argv[1].endsWith("server\\index.ts") || process.argv[1].endsWith("server/index.js") || process.argv[1].endsWith("server\\index.js"))
);
if (isMainModule && !process.env.VERCEL && !process.env.SERVERLESS && process.env.NODE_ENV !== "test") {
  const server = http.createServer(app);
  server.listen(PORT, () => {
    console.log(`[VehicleDesk Server] Running on http://localhost:${PORT}`);
  });
}

// server/api.ts
function handler(req, res) {
  const originalUrl = req.headers["x-forwarded-uri"] || req.headers["x-matched-path"];
  if (originalUrl && (req.url === "/api" || req.url === "/")) {
    req.url = originalUrl;
  }
  return index_default(req, res);
}
export {
  handler as default
};
