export type Role = 'VIP' | 'DRIVER' | 'ADMIN';

export type VehicleClass = 'CLASS_A' | 'CLASS_B' | 'CLASS_C';

export type DriverStatus = 'AVAILABLE' | 'BUSY' | 'OFF' | 'MAINTENANCE';

export type CleanlinessStatus = 'CLEAN' | 'NEEDS_CLEANING';

export type TripStatus =
  | 'PENDING'
  | 'ASSIGNED'
  | 'KEY_COLLECTED'
  | 'EN_ROUTE_TO_PICKUP'
  | 'ARRIVED_AT_PICKUP'
  | 'TRIP_STARTED'
  | 'ACCEPTED'
  | 'GPS_SHARED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export interface User {
  id: string;
  phone: string;
  name: string;
  role: Role;
  designation?: string;
  seniorityTier?: 'TIER_1' | 'TIER_2' | 'TIER_3';
  driverId?: string;
}

export interface Vehicle {
  id: string;
  plate: string;
  model: string;
  vehicleClass: VehicleClass;
  year: number;
  assignedDriverId: string;
  priority: number;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicleId: string;
  status: DriverStatus;
  cleanliness: CleanlinessStatus;
  tripsToday: number;
  tripsThisWeek: number;
  totalHoursThisWeek: number;
  lastActive: string;
  currentLocation: string;
  currentGpsShareUrl?: string;
}

export interface TripRequest {
  id: string;
  vipId: string;
  vipName: string;
  vipPhone: string;
  vipDesignation: string;
  date: string;
  time: string;
  pickupLocation: string;
  dropLocation: string;
  isRoundTrip?: boolean;
  preferredClass: VehicleClass;
  status: TripStatus;
  notes?: string;

  // Assignment details
  assignedDriverId?: string;
  assignedVehicleId?: string;
  assignedDriverName?: string;
  assignedDriverPhone?: string;
  assignedVehicleModel?: string;
  assignedVehiclePlate?: string;
  assignedVehicleClass?: VehicleClass;
  assignedPriority?: number;
  timingType?: 'IMMEDIATE' | 'SCHEDULED';

  // GPS Link
  gpsShareUrl?: string;
  gpsCoordinates?: { lat: number; lng: number };

  // Rule Engine & Audit trace
  allocationMethod: 'RULE_ENGINE_AUTO' | 'ADMIN_OVERRIDE' | 'QUEUED';
  ruleTraceReason?: string;
  isOverridden?: boolean;
  overrideReason?: string;
  overriddenByAdmin?: string;
  overriddenAt?: string;

  source?: 'WHATSAPP' | 'WEB';
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface OverrideAuditEntry {
  id: string;
  tripId: string;
  vipName: string;
  driverName: string;
  vehiclePlate: string;
  previousDriverId?: string;
  adminName: string;
  reason: string;
  timestamp: string;
}

export type ConversationStep =
  | 'IDLE'
  | 'AWAITING_PICKUP'
  | 'AWAITING_DROP'
  | 'AWAITING_TIMING'
  | 'AWAITING_DATETIME_CUSTOM'
  | 'AWAITING_CONFIRMATION';

export interface BookingSession {
  vipId: string;
  phone: string;
  step: ConversationStep;
  pickupLocation?: string;
  dropLocation?: string;
  isRoundTrip?: boolean;
  timingType?: 'IMMEDIATE' | 'SCHEDULED';
  date?: string;
  time?: string;
  notes?: string;
  updatedAt: number;
}
