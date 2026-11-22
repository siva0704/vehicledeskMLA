import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import http from 'http';
import { VehicleDeskStore } from './store';
import { WhatsAppService } from './whatsappService';
import { BotEngine } from './botEngine';
import { CleanlinessStatus, DriverStatus } from './types';

const PORT = process.env.PORT || 4000;
const app = express();
app.use(express.json({ limit: '10mb' }));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

const store = new VehicleDeskStore();
const waService = new WhatsAppService();
const botEngine = new BotEngine(store, waService);

// Health check
app.get(['/health', '/api/health'], (_req, res) => {
  res.json({
    status: 'ok',
    service: 'vehicledesk-mla-backend',
    port: PORT,
    trips: store.getTrips().length,
    drivers: store.getDrivers().length,
  });
});

// WhatsApp connectivity check
app.get('/api/whatsapp/status', async (_req, res) => {
  try {
    const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NOW_REGION);
    const waUrl = process.env.WA_SIM_URL || (isServerless ? 'https://whatsapp-zeta-puce.vercel.app' : 'http://localhost:3005');
    const waRes = await fetch(`${waUrl}/health`);
    const data = await waRes.json();
    res.json({ connected: true, emulator: data });
  } catch (err) {
    res.json({ connected: false, error: 'Could not connect to WhatsApp emulator' });
  }
});

// Meta Cloud API Webhook endpoint (receives inbound events from WA-Sim)
app.post('/api/whatsapp/webhook', async (req, res) => {
  try {
    const body = req.body;

    // Check direct simplified payload (for manual testing)
    if (body.fromPhone && (body.text || body.body)) {
      await botEngine.handleInboundMessage(body.fromPhone, body.text || body.body, body.actionId || body.buttonId);
      res.json({ ok: true, direct: true });
      return;
    }

    // Standard Meta Cloud API Envelope:
    // entry[0].changes[0].value.messages[0]
    const entry = body?.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const messages = value?.messages;

    if (Array.isArray(messages) && messages.length > 0) {
      for (const msg of messages) {
        const fromPhone = msg.from;
        let textBody = '';
        let buttonId: string | undefined = undefined;

        if (msg.type === 'text') {
          textBody = msg.text?.body || '';
        } else if (msg.type === 'interactive') {
          if (msg.interactive?.type === 'button_reply') {
            buttonId = msg.interactive.button_reply?.id;
            textBody = msg.interactive.button_reply?.title || '';
          } else if (msg.interactive?.type === 'list_reply') {
            buttonId = msg.interactive.list_reply?.id;
            textBody = msg.interactive.list_reply?.title || '';
          }
        }

        console.log(`[Webhook] Processing incoming from: ${fromPhone}, text: "${textBody}", buttonId: "${buttonId || ''}"`);
        await botEngine.handleInboundMessage(fromPhone, textBody, buttonId);
      }
    }

    res.status(200).json({ status: 'delivered' });
  } catch (err) {
    console.error('[Webhook] Error handling inbound WhatsApp message:', err);
    res.status(500).json({ error: 'Internal webhook handler error' });
  }
});

// Auth endpoint
app.post('/api/auth/login', (req, res) => {
  const { phone, role } = req.body;
  if (!phone) {
    res.status(400).json({ error: 'Phone number is required' });
    return;
  }

  const user = store.findUserByPhone(phone);
  if (!user) {
    res.status(401).json({ error: 'User not registered in protocol directory' });
    return;
  }

  if (user.role === 'VIP') {
    res.status(403).json({
      error: 'VIP / MLA self-service portal is exclusively on WhatsApp. Please message the WhatsApp desk at +91 80 2203 3500.',
      isVipRedirect: true,
    });
    return;
  }

  if (role && user.role !== role) {
    res.status(403).json({ error: `User is not authorized for the ${role} portal.` });
    return;
  }

  res.json({ user });
});

// Full state snapshot
app.get('/api/state', (_req, res) => {
  res.json({
    users: store.getUsers(),
    vehicles: store.getVehicles(),
    drivers: store.getDrivers(),
    trips: store.getTrips(),
    auditLogs: store.getAuditLogs(),
  });
});

app.get('/api/trips', (_req, res) => {
  res.json(store.getTrips());
});

app.get('/api/drivers', (_req, res) => {
  res.json(store.getDrivers());
});

app.get('/api/vehicles', (_req, res) => {
  res.json(store.getVehicles());
});

app.get('/api/audit', (_req, res) => {
  res.json(store.getAuditLogs());
});

// Driver actions
app.post('/api/driver/:driverId/status', (req, res) => {
  const { status } = req.body as { status: DriverStatus };
  const updated = store.updateDriver(req.params.driverId, { status });
  if (!updated) {
    res.status(404).json({ error: 'Driver not found' });
    return;
  }
  res.json({ driver: updated });
});

app.post('/api/driver/:driverId/cleanliness', (req, res) => {
  const { cleanliness } = req.body as { cleanliness: CleanlinessStatus };
  const updated = store.updateDriver(req.params.driverId, { cleanliness });
  if (!updated) {
    res.status(404).json({ error: 'Driver not found' });
    return;
  }
  res.json({ driver: updated });
});

app.post('/api/driver/trip/:tripId/accept', async (req, res) => {
  const trip = store.updateTrip(req.params.tripId, { status: 'ACCEPTED' });
  if (!trip) {
    res.status(404).json({ error: 'Trip not found' });
    return;
  }

  // Notify MLA via WhatsApp
  await waService.notifyTripAccepted(trip);
  res.json({ trip });
});

// Driver State Machine: 1. Collect Keys
app.post('/api/driver/trip/:tripId/collect-keys', async (req, res) => {
  const trip = store.updateTrip(req.params.tripId, { status: 'KEY_COLLECTED' });
  if (!trip) {
    res.status(404).json({ error: 'Trip not found' });
    return;
  }
  res.json({ trip });
});

// Driver State Machine: 2. En Route to Pickup Point
app.post('/api/driver/trip/:tripId/en-route', async (req, res) => {
  const { gpsUrl, coordinates } = req.body;
  const trip = store.updateTrip(req.params.tripId, {
    status: 'EN_ROUTE_TO_PICKUP',
    gpsShareUrl: gpsUrl || 'https://maps.google.com/?q=12.9796,77.5908',
    gpsCoordinates: coordinates || { lat: 12.9796, lng: 77.5908 },
  });

  if (!trip) {
    res.status(404).json({ error: 'Trip not found' });
    return;
  }

  if (trip.assignedDriverId) {
    store.updateDriver(trip.assignedDriverId, {
      currentGpsShareUrl: trip.gpsShareUrl,
      lastActive: 'En Route (Live GPS)',
    });
  }

  await waService.notifyGpsShared(trip);
  res.json({ trip });
});

// Driver State Machine: 3. Arrived at Pickup Point (Triggers automated WhatsApp arrival alert to MLA)
app.post('/api/driver/trip/:tripId/arrived', async (req, res) => {
  const trip = store.updateTrip(req.params.tripId, { status: 'ARRIVED_AT_PICKUP' });
  if (!trip) {
    res.status(404).json({ error: 'Trip not found' });
    return;
  }

  // Automated notification dispatched to MLA's WhatsApp
  console.log(`[DriverWorkflow] Trip ${trip.id}: Chauffeur arrived at ${trip.pickupLocation}. Alerting MLA via WhatsApp.`);
  await waService.notifyDriverArrived(trip);
  res.json({ trip, alertSent: true });
});

app.post('/api/driver/trip/:tripId/gps', async (req, res) => {
  const { gpsUrl, coordinates } = req.body;
  const trip = store.updateTrip(req.params.tripId, {
    status: 'GPS_SHARED',
    gpsShareUrl: gpsUrl || 'https://maps.google.com/?q=12.9796,77.5908',
    gpsCoordinates: coordinates || { lat: 12.9796, lng: 77.5908 },
  });

  if (!trip) {
    res.status(404).json({ error: 'Trip not found' });
    return;
  }

  // Update driver's last known location
  if (trip.assignedDriverId) {
    store.updateDriver(trip.assignedDriverId, {
      currentGpsShareUrl: trip.gpsShareUrl,
      lastActive: 'Just now (GPS Live)',
    });
  }

  // Notify MLA via WhatsApp
  await waService.notifyGpsShared(trip);
  res.json({ trip });
});

// Driver State Machine: 4. Start Trip
app.post('/api/driver/trip/:tripId/start', async (req, res) => {
  const trip = store.updateTrip(req.params.tripId, { status: 'TRIP_STARTED' });
  if (!trip) {
    res.status(404).json({ error: 'Trip not found' });
    return;
  }

  await waService.notifyTripStarted(trip);
  res.json({ trip });
});

// Driver State Machine: 5. Complete Trip
app.post('/api/driver/trip/:tripId/complete', async (req, res) => {
  const { postTripCleanliness } = req.body as { postTripCleanliness?: CleanlinessStatus };
  const trip = store.updateTrip(req.params.tripId, {
    status: 'COMPLETED',
    completedAt: new Date().toISOString(),
  });

  if (!trip) {
    res.status(404).json({ error: 'Trip not found' });
    return;
  }

  if (trip.assignedDriverId) {
    store.updateDriver(trip.assignedDriverId, {
      status: 'AVAILABLE',
      cleanliness: postTripCleanliness || 'CLEAN',
    });
  }

  await waService.notifyTripCompleted(trip);
  res.json({ trip });
});

// Admin Force Assign / Override
app.post('/api/admin/override', async (req, res) => {
  const { tripId, driverId, reason, adminName } = req.body;
  const trip = store.findTripById(tripId);
  const driver = store.findDriverById(driverId);
  const vehicle = driver ? store.findVehicleById(driver.vehicleId) : undefined;

  if (!trip || !driver || !vehicle) {
    res.status(400).json({ error: 'Invalid trip or driver selection' });
    return;
  }

  const previousDriverId = trip.assignedDriverId;

  // Free previous driver if different
  if (previousDriverId && previousDriverId !== driver.id) {
    const prevDriver = store.findDriverById(previousDriverId);
    if (prevDriver && prevDriver.status === 'BUSY') {
      store.updateDriver(prevDriver.id, { status: 'AVAILABLE' });
    }
  }

  // Assign new driver
  store.updateDriver(driver.id, { status: 'BUSY' });

  const updatedTrip = store.updateTrip(trip.id, {
    assignedDriverId: driver.id,
    assignedDriverName: driver.name,
    assignedDriverPhone: driver.phone,
    assignedVehicleId: vehicle.id,
    assignedVehicleModel: vehicle.model,
    assignedVehiclePlate: vehicle.plate,
    assignedVehicleClass: vehicle.vehicleClass,
    gpsShareUrl: driver.currentGpsShareUrl,
    status: 'ASSIGNED',
    isOverridden: true,
    allocationMethod: 'ADMIN_OVERRIDE',
    overrideReason: reason,
    overriddenByAdmin: adminName || 'Fleet Superintendent',
    overriddenAt: new Date().toISOString(),
  });

  // Audit log
  store.addAuditLog({
    id: `AUDIT-${Date.now().toString().slice(-4)}`,
    tripId: trip.id,
    vipName: trip.vipName,
    driverName: `${driver.name} (${vehicle.model} / ${vehicle.plate})`,
    vehiclePlate: vehicle.plate,
    previousDriverId,
    adminName: adminName || 'Fleet Superintendent',
    reason,
    timestamp: new Date().toISOString(),
  });

  if (updatedTrip) {
    await waService.notifyAdminOverride(updatedTrip);
  }

  res.json({ trip: updatedTrip });
});

// Cancel trip
app.post('/api/trips/:id/cancel', async (req, res) => {
  const trip = store.findTripById(req.params.id);
  if (!trip) {
    res.status(404).json({ error: 'Trip not found' });
    return;
  }

  store.updateTrip(trip.id, { status: 'CANCELLED' });

  if (trip.assignedDriverId) {
    const driver = store.findDriverById(trip.assignedDriverId);
    if (driver && driver.status === 'BUSY') {
      store.updateDriver(driver.id, { status: 'AVAILABLE' });
    }
  }

  await waService.notifyTripCancelled(trip, 'Cancelled by Administrative Action');
  res.json({ ok: true });
});

// Reset database
app.post('/api/reset', (_req, res) => {
  const state = store.reset();
  res.json({ ok: true, state });
});

export { app, store, waService, botEngine };
export default app;

const isMainModule = Boolean(
  process.argv[1] && (
    process.argv[1].endsWith('server/index.ts') || 
    process.argv[1].endsWith('server\\index.ts') ||
    process.argv[1].endsWith('server/index.js') || 
    process.argv[1].endsWith('server\\index.js')
  )
);

if (isMainModule && !process.env.VERCEL && !process.env.SERVERLESS && process.env.NODE_ENV !== 'test') {
  const server = http.createServer(app);
  server.listen(PORT, () => {
    console.log(`[VehicleDesk Server] Running on http://localhost:${PORT}`);
  });
}
