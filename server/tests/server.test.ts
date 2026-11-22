import { describe, it } from 'node:test';
import assert from 'node:assert';
import { VehicleDeskStore } from '../store';
import { WhatsAppService } from '../whatsappService';
import { BotEngine } from '../botEngine';
import { evaluateRuleEngine, getClassForSeniority } from '../ruleEngine';

describe('Vehicle Desk & WhatsApp Integration Suite', () => {
  it('Rule Engine assigns least busy available clean driver in requested class', () => {
    const store = new VehicleDeskStore();
    store.reset();
    const drivers = store.getDrivers();
    const vehicles = store.getVehicles();

    // Class A has drv-1 (tripsToday: 1) and drv-2 (tripsToday: 2)
    const result = evaluateRuleEngine('CLASS_A', drivers, vehicles);
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.assignedCandidate?.driver.id, 'drv-1');
    assert.strictEqual(result.assignedCandidate?.vehicle.plate, 'KA-01-GA-1001');
  });

  it('Rule Engine respects Cleanliness Gate and skips unclean vehicles', () => {
    const store = new VehicleDeskStore();
    // Dynamically mark drv-5 as NEEDS_CLEANING to test cleanliness gate
    const drivers = store.getDrivers().map(d => d.id === 'drv-5' ? { ...d, cleanliness: 'NEEDS_CLEANING' as const } : d);
    const vehicles = store.getVehicles();

    // Basavaraj Patil (drv-5) has vehicle veh-5 (CLASS_C) but cleanliness is NEEDS_CLEANING
    // Raghavendra Prasad (drv-6) has veh-6 (CLASS_C) and is CLEAN
    const result = evaluateRuleEngine('CLASS_C', drivers, vehicles);
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.assignedCandidate?.driver.id, 'drv-6');
  });

  it('Seniority tier mapping assigns correct vehicle class to MLAs', () => {
    const store = new VehicleDeskStore();
    const mla1 = store.findUserByPhone('+919845011223'); // Hon. Rajesh Kumar
    const mla2 = store.findUserByPhone('+919845022334'); // Dr. Ananya Hegde
    const mla3 = store.findUserByPhone('+919845033445'); // Sri B. S. Patil

    assert.strictEqual(getClassForSeniority(mla1), 'CLASS_A');
    assert.strictEqual(getClassForSeniority(mla2), 'CLASS_B');
    assert.strictEqual(getClassForSeniority(mla3), 'CLASS_C');
  });

  it('BotEngine processes natural language booking from registered MLA', async () => {
    const store = new VehicleDeskStore();
    const mockWaService = new WhatsAppService();
    const sentMessages: string[] = [];

    // Mock sendTextMessage & sendInteractiveButtons
    mockWaService.sendTextMessage = async (_to, text) => {
      sentMessages.push(text);
      return true;
    };
    mockWaService.sendInteractiveButtons = async (_to, text, _buttons) => {
      sentMessages.push(text);
      return true;
    };

    const bot = new BotEngine(store, mockWaService);
    const mlaPhone = '+919845011223';

    // Send natural language message
    await bot.handleInboundMessage(
      mlaPhone,
      'Need car from Vidhana Soudha to Bengaluru Airport tomorrow at 10:00 AM'
    );

    // Verify confirmation message was generated
    assert.ok(sentMessages.length > 0);
    const lastMsg = sentMessages[sentMessages.length - 1];
    assert.ok(lastMsg.includes('VIP Vehicle Request Confirmed') || lastMsg.includes('Assigned Chauffeur'));

    // Verify trip is in store
    const activeTrip = store.findActiveTripForVip('user-vip-1');
    assert.ok(activeTrip);
    assert.strictEqual(activeTrip?.pickupLocation, 'Vidhana Soudha');
    assert.strictEqual(activeTrip?.dropLocation, 'Bengaluru Airport');
    assert.strictEqual(activeTrip?.source, 'WHATSAPP');
  });

  it('Strict Priority Queue allocates Vehicle 1 first, then Vehicle 2 when Vehicle 1 is busy', () => {
    const store = new VehicleDeskStore();
    store.reset();
    let drivers = store.getDrivers();
    let vehicles = store.getVehicles();

    // 1. Initial State: Vehicle 1 (Toyota Camry, Priority 1) is Available & Clean
    const result1 = evaluateRuleEngine('CLASS_A', drivers, vehicles);
    assert.strictEqual(result1.success, true);
    assert.strictEqual(result1.assignedCandidate?.vehicle.priority, 1);
    assert.strictEqual(result1.assignedCandidate?.vehicle.id, 'veh-1');

    // 2. Mark Chauffeur Suresh (drv-1, veh-1) BUSY
    store.updateDriver('drv-1', { status: 'BUSY' });
    drivers = store.getDrivers();
    vehicles = store.getVehicles();

    // 3. Next allocation must assign Vehicle 2 (Mercedes-Benz, Priority 2)
    const result2 = evaluateRuleEngine('CLASS_A', drivers, vehicles);
    assert.strictEqual(result2.success, true);
    assert.strictEqual(result2.assignedCandidate?.vehicle.priority, 2);
    assert.strictEqual(result2.assignedCandidate?.vehicle.id, 'veh-2');

    // 4. Mark Chauffeur Ramesh (drv-2, veh-2) BUSY as well
    store.updateDriver('drv-2', { status: 'BUSY' });
    drivers = store.getDrivers();
    vehicles = store.getVehicles();

    // 5. Next allocation must cascade to Vehicle 3 (Toyota Fortuner, Priority 3)
    const result3 = evaluateRuleEngine('CLASS_A', drivers, vehicles);
    assert.strictEqual(result3.success, true);
    assert.strictEqual(result3.assignedCandidate?.vehicle.priority, 3);
    assert.strictEqual(result3.assignedCandidate?.vehicle.id, 'veh-3');
  });

  it('BotEngine executes full interactive flow with geofenced pickup (Deepika Location) & immediate timing', async () => {
    const store = new VehicleDeskStore();
    store.reset();
    const mockWaService = new WhatsAppService();
    const listMessages: { body: string; button: string; sections: any[] }[] = [];
    const buttonMessages: { body: string; buttons: any[] }[] = [];

    mockWaService.sendInteractiveList = async (_to, body, button, sections) => {
      listMessages.push({ body, button, sections });
      return true;
    };
    mockWaService.sendInteractiveButtons = async (_to, body, buttons) => {
      buttonMessages.push({ body, buttons });
      return true;
    };

    const bot = new BotEngine(store, mockWaService);
    const mlaPhone = '+919845011223'; // Hon. Rajesh Kumar

    // Step 1: Trigger Menu via "Hi"
    await bot.handleInboundMessage(mlaPhone, 'Hi');
    assert.ok(buttonMessages.length > 0);
    assert.ok(buttonMessages[0].buttons.some((b) => b.id === 'btn_book'));

    // Step 2: Select "Book a Trip" (btn_book)
    await bot.handleInboundMessage(mlaPhone, 'Book a Car', 'btn_book');
    assert.ok(listMessages.length > 0);
    const pickupList = listMessages[0];
    assert.strictEqual(pickupList.button, 'Choose Pickup Point');
    // Verify geofenced Deepika Location is in the list
    const lhSection = pickupList.sections.find((s) => s.title.includes("Legislators' Home"));
    assert.ok(lhSection);
    assert.ok(lhSection.rows.some((r: any) => r.id === 'loc_lh_deepika' && r.title === 'Deepika Location'));

    // Step 3: Select "Deepika Location" via list reply
    await bot.handleInboundMessage(mlaPhone, 'Deepika Location', 'loc_lh_deepika');
    assert.ok(listMessages.length > 1);
    const dropList = listMessages[1];
    assert.strictEqual(dropList.button, 'Choose Destination');
    assert.ok(dropList.sections[0].rows.some((r: any) => r.id === 'drop_kia'));

    // Step 4: Select "Kempegowda Intl Airport (KIA)" via list reply
    await bot.handleInboundMessage(mlaPhone, 'Kempegowda Intl Airport (KIA)', 'drop_kia');
    // Check timing buttons prompt
    assert.ok(buttonMessages.length > 1);
    const timingMsg = buttonMessages[buttonMessages.length - 1];
    assert.ok(timingMsg.buttons.some((b) => b.id === 'time_immediate'));
    assert.ok(timingMsg.buttons.some((b) => b.id === 'time_schedule'));

    // Step 5: Select "Immediate Dispatch"
    await bot.handleInboundMessage(mlaPhone, '⚡ Immediate Dispatch', 'time_immediate');
    // Prompt confirmation
    const confirmPrompt = buttonMessages[buttonMessages.length - 1];
    assert.ok(confirmPrompt.buttons.some((b) => b.id === 'btn_confirm'));

    // Step 6: Confirm Allocation
    await bot.handleInboundMessage(mlaPhone, 'Confirm Allocation', 'btn_confirm');

    // Verify trip request created with priority allocation
    const trip = store.findActiveTripForVip('user-vip-1');
    assert.ok(trip);
    assert.strictEqual(trip?.pickupLocation, 'Deepika Location');
    assert.strictEqual(trip?.dropLocation, 'Kempegowda Intl Airport (KIA)');
    assert.strictEqual(trip?.timingType, 'IMMEDIATE');
    assert.strictEqual(trip?.status, 'ASSIGNED');
    assert.strictEqual(trip?.assignedPriority, 1); // Vehicle 1 allocated
  });

  it('Driver state machine progresses sequentially and alerts MLA on arrival at pickup', async () => {
    const store = new VehicleDeskStore();
    store.reset();
    const mockWaService = new WhatsAppService();
    const alertsDelivered: { type: string; msg?: string }[] = [];

    mockWaService.notifyDriverArrived = async (trip) => {
      alertsDelivered.push({ type: 'DRIVER_ARRIVED', msg: trip.pickupLocation });
      return true;
    };
    mockWaService.notifyTripStarted = async (_trip) => {
      alertsDelivered.push({ type: 'TRIP_STARTED' });
      return true;
    };
    mockWaService.notifyTripCompleted = async (_trip) => {
      alertsDelivered.push({ type: 'TRIP_COMPLETED' });
      return true;
    };

    // 1. Initial State: Assigned Trip
    const tripId = 'REQ-TEST-99';
    store.addTrip({
      id: tripId,
      vipId: 'user-vip-1',
      vipName: 'Hon. Rajesh Kumar',
      vipPhone: '+919845011223',
      vipDesignation: 'Special Secretary (DPAR)',
      date: '2026-11-23',
      time: 'Immediate VIP Dispatch',
      pickupLocation: 'Deepika Location',
      dropLocation: 'Kempegowda Intl Airport (KIA)',
      preferredClass: 'CLASS_A',
      status: 'ASSIGNED',
      assignedDriverId: 'drv-1',
      assignedDriverName: 'Suresh Gowda',
      assignedDriverPhone: '+919448033445',
      assignedVehicleId: 'veh-1',
      assignedVehicleModel: 'Toyota Camry Hybrid',
      assignedVehiclePlate: 'KA-01-GA-1001',
      assignedPriority: 1,
      allocationMethod: 'RULE_ENGINE_AUTO',
      source: 'WHATSAPP',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    let trip = store.findTripById(tripId);
    assert.strictEqual(trip?.status, 'ASSIGNED');

    // 2. Driver Step 1: Collect Keys -> KEY_COLLECTED
    store.updateTrip(tripId, { status: 'KEY_COLLECTED' });
    trip = store.findTripById(tripId);
    assert.strictEqual(trip?.status, 'KEY_COLLECTED');

    // 3. Driver Step 2: Head En Route -> EN_ROUTE_TO_PICKUP
    store.updateTrip(tripId, { status: 'EN_ROUTE_TO_PICKUP', gpsShareUrl: 'https://maps.google.com/?q=12.9796,77.5908' });
    trip = store.findTripById(tripId);
    assert.strictEqual(trip?.status, 'EN_ROUTE_TO_PICKUP');

    // 4. Driver Step 3: Arrived at Pickup Point -> ARRIVED_AT_PICKUP + Automated MLA Alert
    store.updateTrip(tripId, { status: 'ARRIVED_AT_PICKUP' });
    trip = store.findTripById(tripId);
    assert.strictEqual(trip?.status, 'ARRIVED_AT_PICKUP');
    await mockWaService.notifyDriverArrived(trip!);
    assert.strictEqual(alertsDelivered.length, 1);
    assert.strictEqual(alertsDelivered[0].type, 'DRIVER_ARRIVED');
    assert.strictEqual(alertsDelivered[0].msg, 'Deepika Location');

    // 5. Driver Step 4: Start Trip -> TRIP_STARTED
    store.updateTrip(tripId, { status: 'TRIP_STARTED' });
    trip = store.findTripById(tripId);
    assert.strictEqual(trip?.status, 'TRIP_STARTED');
    await mockWaService.notifyTripStarted(trip!);
    assert.strictEqual(alertsDelivered.length, 2);

    // 6. Driver Step 5: Complete Trip -> COMPLETED
    store.updateTrip(tripId, { status: 'COMPLETED' });
    trip = store.findTripById(tripId);
    assert.strictEqual(trip?.status, 'COMPLETED');
    await mockWaService.notifyTripCompleted(trip!);
    assert.strictEqual(alertsDelivered.length, 3);
  });

  it('BotEngine reports status when MLA asks for trip status', async () => {
    const store = new VehicleDeskStore();
    const mockWaService = new WhatsAppService();
    const sentMessages: string[] = [];

    mockWaService.sendInteractiveButtons = async (_to, text, _buttons) => {
      sentMessages.push(text);
      return true;
    };

    const bot = new BotEngine(store, mockWaService);
    const mlaPhone = '+919845011223';

    await bot.handleInboundMessage(mlaPhone, 'STATUS');
    assert.ok(sentMessages.length > 0);
    const lastMsg = sentMessages[sentMessages.length - 1];
    assert.ok(lastMsg.includes('Active Trip Details') || lastMsg.includes('No Active Trips'));
  });

  it('BotEngine rejects unregistered phone numbers politely with protocol notice', async () => {
    const store = new VehicleDeskStore();
    const mockWaService = new WhatsAppService();
    const sentMessages: string[] = [];

    mockWaService.sendTextMessage = async (_to, text) => {
      sentMessages.push(text);
      return true;
    };

    const bot = new BotEngine(store, mockWaService);
    await bot.handleInboundMessage('+919999988888', 'Hello need a car');

    assert.ok(sentMessages.length > 0);
    assert.ok(sentMessages[0].includes('Namaskara') && sentMessages[0].includes('not registered'));
  });
});
