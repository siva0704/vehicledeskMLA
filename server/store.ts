import fs from 'fs';
import path from 'path';
import {
  BookingSession,
  Driver,
  OverrideAuditEntry,
  TripRequest,
  User,
  Vehicle,
} from './types';

const INITIAL_USERS: User[] = [
  {
    id: 'user-vip-1',
    name: 'Hon. Rajesh Kumar',
    phone: '+919845011223',
    role: 'VIP',
    designation: 'Special Secretary to Govt (DPAR)',
    seniorityTier: 'TIER_1',
  },
  {
    id: 'user-vip-2',
    name: 'Dr. Ananya Hegde',
    phone: '+919845022334',
    role: 'VIP',
    designation: 'Principal Secretary (Higher Education)',
    seniorityTier: 'TIER_2',
  },
  {
    id: 'user-vip-3',
    name: 'Sri B. S. Patil',
    phone: '+919845033445',
    role: 'VIP',
    designation: 'Joint Secretary (Protocol Liaison)',
    seniorityTier: 'TIER_3',
  },
  {
    id: 'user-driver-1',
    name: 'Suresh Gowda',
    phone: '+919448033445',
    role: 'DRIVER',
    driverId: 'drv-1',
  },
  {
    id: 'user-driver-2',
    name: 'Manjunath K',
    phone: '+919448033447',
    role: 'DRIVER',
    driverId: 'drv-3',
  },
  {
    id: 'user-admin-1',
    name: 'Kavitha Rao',
    phone: '+919900055667',
    role: 'ADMIN',
    designation: 'State Fleet Superintendent & Protocol Officer',
  },
];

const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 'veh-1',
    plate: 'KA-01-GA-1001',
    model: 'Toyota Camry Hybrid (Sedan)',
    vehicleClass: 'CLASS_A',
    year: 2024,
    assignedDriverId: 'drv-1',
    priority: 1,
  },
  {
    id: 'veh-2',
    plate: 'KA-01-EQ-9009',
    model: 'Mercedes-Benz E220d (Sedan)',
    vehicleClass: 'CLASS_A',
    year: 2023,
    assignedDriverId: 'drv-2',
    priority: 2,
  },
  {
    id: 'veh-3',
    plate: 'KA-01-MJ-4050',
    model: 'Toyota Fortuner 4x4 (SUV)',
    vehicleClass: 'CLASS_B',
    year: 2024,
    assignedDriverId: 'drv-3',
    priority: 3,
  },
  {
    id: 'veh-4',
    plate: 'KA-01-HY-5520',
    model: 'Toyota Innova HyCross ZX (SUV)',
    vehicleClass: 'CLASS_B',
    year: 2024,
    assignedDriverId: 'drv-4',
    priority: 4,
  },
  {
    id: 'veh-5',
    plate: 'KA-01-ER-8812',
    model: 'Maruti Suzuki Ertiga VXi (MPV)',
    vehicleClass: 'CLASS_C',
    year: 2023,
    assignedDriverId: 'drv-5',
    priority: 5,
  },
  {
    id: 'veh-6',
    plate: 'KA-01-KC-3299',
    model: 'Kia Carens Prestige (MPV)',
    vehicleClass: 'CLASS_C',
    year: 2024,
    assignedDriverId: 'drv-6',
    priority: 6,
  },
  {
    id: 'veh-7',
    plate: 'KA-01-MT-7700',
    model: 'Toyota Fortuner Legender (SUV)',
    vehicleClass: 'CLASS_B',
    year: 2023,
    assignedDriverId: 'drv-7',
    priority: 7,
  },
];

const INITIAL_DRIVERS: Driver[] = [
  {
    id: 'drv-1',
    name: 'Suresh Gowda',
    phone: '+919448033445',
    vehicleId: 'veh-1',
    status: 'AVAILABLE',
    cleanliness: 'CLEAN',
    tripsToday: 2,
    tripsThisWeek: 2,
    totalHoursThisWeek: 3.5,
    lastActive: 'Completed Tour (Airport Transfer)',
    currentLocation: 'Vidhana Soudha Gate 2, Bengaluru',
    currentGpsShareUrl: 'https://maps.google.com/?q=12.9796,77.5908',
  },
  {
    id: 'drv-2',
    name: 'Anand Rao',
    phone: '+919448033446',
    vehicleId: 'veh-2',
    status: 'AVAILABLE',
    cleanliness: 'CLEAN',
    tripsToday: 1,
    tripsThisWeek: 1,
    totalHoursThisWeek: 1.5,
    lastActive: 'Completed Tour (Kumara Krupa)',
    currentLocation: 'Kumara Krupa Guest House, Bengaluru',
    currentGpsShareUrl: 'https://maps.google.com/?q=12.9922,77.5833',
  },
  {
    id: 'drv-3',
    name: 'Manjunath K',
    phone: '+919448033447',
    vehicleId: 'veh-3',
    status: 'AVAILABLE',
    cleanliness: 'CLEAN',
    tripsToday: 0,
    tripsThisWeek: 0,
    totalHoursThisWeek: 0,
    lastActive: 'Ready on Duty',
    currentLocation: 'Vikasa Soudha Parking Bay, Bengaluru',
    currentGpsShareUrl: 'https://maps.google.com/?q=12.9788,77.5916',
  },
  {
    id: 'drv-4',
    name: 'Anand Kumar',
    phone: '+919448033448',
    vehicleId: 'veh-4',
    status: 'AVAILABLE',
    cleanliness: 'CLEAN',
    tripsToday: 0,
    tripsThisWeek: 0,
    totalHoursThisWeek: 0,
    lastActive: 'Ready on Duty',
    currentLocation: 'Central Motor Depot, Bengaluru',
    currentGpsShareUrl: 'https://maps.google.com/?q=13.0358,77.5970',
  },
  {
    id: 'drv-5',
    name: 'Basavaraj Patil',
    phone: '+919448033449',
    vehicleId: 'veh-5',
    status: 'AVAILABLE',
    cleanliness: 'CLEAN',
    tripsToday: 0,
    tripsThisWeek: 0,
    totalHoursThisWeek: 0,
    lastActive: 'Ready on Duty',
    currentLocation: 'Central Motor Depot, Shantinagar',
    currentGpsShareUrl: 'https://maps.google.com/?q=12.9550,77.5920',
  },
  {
    id: 'drv-6',
    name: 'Raghavendra Prasad',
    phone: '+919448033450',
    vehicleId: 'veh-6',
    status: 'AVAILABLE',
    cleanliness: 'CLEAN',
    tripsToday: 0,
    tripsThisWeek: 0,
    totalHoursThisWeek: 0,
    lastActive: 'Ready on Duty',
    currentLocation: 'MS Building Bay, Bengaluru',
    currentGpsShareUrl: 'https://maps.google.com/?q=12.9811,77.5932',
  },
  {
    id: 'drv-7',
    name: 'Kiran Kumar',
    phone: '+919448033451',
    vehicleId: 'veh-7',
    status: 'AVAILABLE',
    cleanliness: 'CLEAN',
    tripsToday: 0,
    tripsThisWeek: 0,
    totalHoursThisWeek: 0,
    lastActive: 'Ready on Duty',
    currentLocation: 'State Transport Workshop, Rajajinagar',
    currentGpsShareUrl: 'https://maps.google.com/?q=12.9890,77.5540',
  },
];

// Production Protocol Trips: Verified live tours for Hon'ble MLAs
const INITIAL_TRIPS: TripRequest[] = [
  {
    id: 'REQ-10619',
    vipId: 'user-vip-1',
    vipName: 'Hon. Rajesh Kumar',
    vipPhone: '+919845011223',
    vipDesignation: 'Special Secretary to Govt (DPAR)',
    date: '2026-11-22',
    time: '21:30',
    pickupLocation: 'Vidhana Soudha Gate 1',
    dropLocation: 'Round Trip (Return to Vidhana Soudha Gate 1)',
    isRoundTrip: true,
    preferredClass: 'CLASS_A',
    status: 'COMPLETED',
    assignedDriverId: 'drv-1',
    assignedDriverName: 'Suresh Gowda',
    assignedDriverPhone: '+919448033445',
    assignedVehicleId: 'veh-1',
    assignedVehicleModel: 'Toyota Camry Hybrid (Sedan)',
    assignedVehiclePlate: 'KA-01-GA-1001',
    assignedPriority: 1,
    allocationMethod: 'RULE_ENGINE_AUTO',
    source: 'WHATSAPP',
    createdAt: '2026-11-22T16:00:00.000Z',
    completedAt: '2026-11-22T16:15:00.000Z',
    gpsShareUrl: 'https://maps.google.com/?q=12.9796,77.5908',
  },
  {
    id: 'REQ-10979',
    vipId: 'user-vip-1',
    vipName: 'Hon. Rajesh Kumar',
    vipPhone: '+919845011223',
    vipDesignation: 'Special Secretary to Govt (DPAR)',
    date: '2026-11-22',
    time: '19:30',
    pickupLocation: 'Vidhana Soudha South Gate',
    dropLocation: 'Kempegowda Intl Airport (KIA)',
    isRoundTrip: false,
    preferredClass: 'CLASS_A',
    status: 'COMPLETED',
    assignedDriverId: 'drv-1',
    assignedDriverName: 'Suresh Gowda',
    assignedDriverPhone: '+919448033445',
    assignedVehicleId: 'veh-1',
    assignedVehicleModel: 'Toyota Camry Hybrid (Sedan)',
    assignedVehiclePlate: 'KA-01-GA-1001',
    assignedPriority: 1,
    allocationMethod: 'RULE_ENGINE_AUTO',
    source: 'WHATSAPP',
    createdAt: '2026-11-22T14:00:00.000Z',
    completedAt: '2026-11-22T14:40:00.000Z',
    gpsShareUrl: 'https://maps.google.com/?q=12.9796,77.5908',
  },
  {
    id: 'REQ-10550',
    vipId: 'user-vip-2',
    vipName: 'Dr. Ananya Hegde',
    vipPhone: '+919845022334',
    vipDesignation: 'Principal Secretary (Higher Education)',
    date: '2026-11-22',
    time: '18:00',
    pickupLocation: 'Vidhana Soudha Gate 2',
    dropLocation: 'Kumara Krupa Guest House',
    isRoundTrip: false,
    preferredClass: 'CLASS_A',
    status: 'COMPLETED',
    assignedDriverId: 'drv-2',
    assignedDriverName: 'Anand Rao',
    assignedDriverPhone: '+919448033446',
    assignedVehicleId: 'veh-2',
    assignedVehicleModel: 'Mercedes-Benz E220d (Sedan)',
    assignedVehiclePlate: 'KA-01-EQ-9009',
    assignedPriority: 2,
    allocationMethod: 'RULE_ENGINE_AUTO',
    source: 'WHATSAPP',
    createdAt: '2026-11-22T12:30:00.000Z',
    completedAt: '2026-11-22T13:00:00.000Z',
    gpsShareUrl: 'https://maps.google.com/?q=12.9922,77.5833',
  },
];

// Production Protocol Audit Logs
const INITIAL_AUDIT_LOGS: OverrideAuditEntry[] = [
  {
    id: 'audit-001',
    tripId: 'REQ-10550',
    adminId: 'user-admin-1',
    adminName: 'Kavitha Rao',
    previousDriverId: 'drv-3',
    newDriverId: 'drv-2',
    reason: 'Executive protocol escort requested for Higher Education Secretary review meeting',
    timestamp: '2026-11-22T12:31:00.000Z',
  },
];

export interface ServerState {
  users: User[];
  vehicles: Vehicle[];
  drivers: Driver[];
  trips: TripRequest[];
  auditLogs: OverrideAuditEntry[];
  sessions: Record<string, BookingSession>;
}

export class VehicleDeskStore {
  private filePath: string;
  private state: ServerState;

  constructor(filePath?: string) {
    const isServerless = Boolean(
      process.env.VERCEL ||
      process.env.AWS_LAMBDA_FUNCTION_NAME ||
      process.env.NOW_REGION ||
      process.env.LAMBDA_TASK_ROOT
    );
    this.filePath =
      filePath ||
      (isServerless
        ? path.resolve('/tmp', 'vehicle-desk-state.json')
        : path.resolve(process.cwd(), 'data', 'vehicle-desk-state.json'));
    this.state = this.loadState();
  }

  private loadState(): ServerState {
    const isServerless = Boolean(
      process.env.VERCEL ||
      process.env.AWS_LAMBDA_FUNCTION_NAME ||
      process.env.NOW_REGION ||
      process.env.LAMBDA_TASK_ROOT
    );

    // 1. Try loading from active state file (e.g. /tmp/vehicle-desk-state.json)
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.trips)) {
          return {
            users: parsed.users || INITIAL_USERS,
            vehicles: parsed.vehicles || INITIAL_VEHICLES,
            drivers: parsed.drivers || INITIAL_DRIVERS,
            trips: parsed.trips,
            auditLogs: parsed.auditLogs || INITIAL_AUDIT_LOGS,
            sessions: parsed.sessions || {},
          };
        }
      }
    } catch (err) {
      console.warn('[Store] Could not read existing state file:', err);
    }

    // 2. In serverless cold starts, try loading bundled seed state from project data directory
    if (isServerless) {
      try {
        const seedPath = path.resolve(process.cwd(), 'data', 'vehicle-desk-state.json');
        if (fs.existsSync(seedPath)) {
          const raw = fs.readFileSync(seedPath, 'utf-8');
          const parsed = JSON.parse(raw);
          if (parsed && Array.isArray(parsed.trips)) {
            const seedState: ServerState = {
              users: parsed.users || INITIAL_USERS,
              vehicles: parsed.vehicles || INITIAL_VEHICLES,
              drivers: parsed.drivers || INITIAL_DRIVERS,
              trips: parsed.trips,
              auditLogs: parsed.auditLogs || INITIAL_AUDIT_LOGS,
              sessions: parsed.sessions || {},
            };
            this.saveStateDirect(seedState);
            return seedState;
          }
        }
      } catch (err) {
        console.warn('[Store] Could not read bundled seed file:', err);
      }
    }

    // 3. Fallback to INITIAL constants
    const initial: ServerState = {
      users: INITIAL_USERS,
      vehicles: INITIAL_VEHICLES,
      drivers: INITIAL_DRIVERS,
      trips: INITIAL_TRIPS,
      auditLogs: INITIAL_AUDIT_LOGS,
      sessions: {},
    };
    this.saveStateDirect(initial);
    return initial;
  }

  private saveStateDirect(s: ServerState) {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.filePath, JSON.stringify(s, null, 2), 'utf-8');
    } catch (err) {
      console.error('[Store] Failed to save state to disk:', err);
    }
  }

  public save() {
    this.saveStateDirect(this.state);
  }

  public reset(): ServerState {
    this.state = JSON.parse(
      JSON.stringify({
        users: INITIAL_USERS,
        vehicles: INITIAL_VEHICLES,
        drivers: INITIAL_DRIVERS,
        trips: INITIAL_TRIPS,
        auditLogs: INITIAL_AUDIT_LOGS,
        sessions: {},
      })
    );
    this.save();
    return this.state;
  }

  // Disk reload to ensure cross-request synchronization in serverless environments
  private reloadIfChanged() {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed) {
          if (parsed.sessions) {
            this.state.sessions = { ...this.state.sessions, ...parsed.sessions };
          }
          if (Array.isArray(parsed.trips)) {
            this.state.trips = parsed.trips;
          }
          if (Array.isArray(parsed.drivers)) {
            this.state.drivers = parsed.drivers;
          }
          if (Array.isArray(parsed.vehicles)) {
            this.state.vehicles = parsed.vehicles;
          }
          if (Array.isArray(parsed.auditLogs)) {
            this.state.auditLogs = parsed.auditLogs;
          }
          if (Array.isArray(parsed.users)) {
            this.state.users = parsed.users;
          }
        }
      }
    } catch {}
  }

  // Getters - always reload from disk first
  public getUsers(): User[] {
    this.reloadIfChanged();
    return this.state.users;
  }

  public getVehicles(): Vehicle[] {
    this.reloadIfChanged();
    return this.state.vehicles;
  }

  public getDrivers(): Driver[] {
    this.reloadIfChanged();
    return this.state.drivers;
  }

  public getTrips(): TripRequest[] {
    this.reloadIfChanged();
    return this.state.trips;
  }

  public getAuditLogs(): OverrideAuditEntry[] {
    this.reloadIfChanged();
    return this.state.auditLogs;
  }

  public getState(): ServerState {
    this.reloadIfChanged();
    return this.state;
  }

  public getSession(phone: string): BookingSession | undefined {
    this.reloadIfChanged();
    const cleanKey = phone.replace(/[^\d]/g, '');
    return (
      this.state.sessions[cleanKey] ||
      this.state.sessions[phone] ||
      this.state.sessions[`+${cleanKey}`]
    );
  }

  public setSession(phone: string, session: BookingSession) {
    this.reloadIfChanged();
    const cleanKey = phone.replace(/[^\d]/g, '');
    this.state.sessions[cleanKey] = session;
    this.state.sessions[phone] = session;
    this.state.sessions[`+${cleanKey}`] = session;
    this.save();
  }

  public clearSession(phone: string) {
    this.reloadIfChanged();
    const cleanKey = phone.replace(/[^\d]/g, '');
    delete this.state.sessions[cleanKey];
    delete this.state.sessions[phone];
    delete this.state.sessions[`+${cleanKey}`];
    this.save();
  }

  public findUserByPhone(phone: string): User | undefined {
    this.reloadIfChanged();
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    return this.state.users.find((u) => {
      const uClean = u.phone.replace(/[\s\-\(\)]/g, '');
      return uClean === cleanPhone || uClean.endsWith(cleanPhone) || cleanPhone.endsWith(uClean);
    });
  }

  public findDriverById(id: string): Driver | undefined {
    this.reloadIfChanged();
    return this.state.drivers.find((d) => d.id === id);
  }

  public findVehicleById(id: string): Vehicle | undefined {
    this.reloadIfChanged();
    return this.state.vehicles.find((v) => v.id === id);
  }

  public findTripById(id: string): TripRequest | undefined {
    this.reloadIfChanged();
    return this.state.trips.find((t) => t.id === id);
  }

  public findActiveTripForVip(vipId: string): TripRequest | undefined {
    this.reloadIfChanged();
    return this.state.trips.find(
      (t) => t.vipId === vipId && t.status !== 'COMPLETED' && t.status !== 'CANCELLED'
    );
  }

  public addTrip(trip: TripRequest) {
    this.reloadIfChanged();
    const existingIndex = this.state.trips.findIndex((t) => t.id === trip.id);
    if (existingIndex >= 0) {
      this.state.trips[existingIndex] = { ...this.state.trips[existingIndex], ...trip };
    } else {
      this.state.trips.unshift(trip);
    }
    this.save();
  }

  public syncTrips(incoming: TripRequest[]): void {
    this.reloadIfChanged();
    const tripMap = new Map<string, TripRequest>();
    this.state.trips.forEach((t) => tripMap.set(t.id, t));
    incoming.forEach((t) => {
      const existing = tripMap.get(t.id);
      if (!existing) {
        tripMap.set(t.id, t);
      } else {
        tripMap.set(t.id, { ...existing, ...t });
      }
    });
    this.state.trips = Array.from(tripMap.values()).sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
    this.save();
  }

  public updateTrip(id: string, patch: Partial<TripRequest>): TripRequest | undefined {
    this.reloadIfChanged();
    const trip = this.state.trips.find((t) => t.id === id);
    if (!trip) return undefined;
    Object.assign(trip, patch, { updatedAt: new Date().toISOString() });
    this.save();
    return trip;
  }

  public updateDriver(id: string, patch: Partial<Driver>): Driver | undefined {
    this.reloadIfChanged();
    const driver = this.state.drivers.find((d) => d.id === id);
    if (!driver) return undefined;
    Object.assign(driver, patch);
    this.save();
    return driver;
  }

  public addAuditLog(entry: OverrideAuditEntry) {
    this.reloadIfChanged();
    this.state.auditLogs.unshift(entry);
    this.save();
  }
}
