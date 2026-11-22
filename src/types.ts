export type Role = 'VIP' | 'DRIVER' | 'ADMIN';

export type VehicleClass = 'CLASS_A' | 'CLASS_B' | 'CLASS_C';

export type DriverStatus = 'AVAILABLE' | 'BUSY' | 'OFF' | 'MAINTENANCE';

export type CleanlinessStatus = 'CLEAN' | 'NEEDS_CLEANING';

export type TripStatus =
  | 'PENDING'
  | 'ASSIGNED'
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
  seniorityTier?: 'TIER_1' | 'TIER_2' | 'TIER_3'; // Tier 1 -> Class A, Tier 2 -> Class B, Tier 3 -> Class C
  driverId?: string; // If role is DRIVER
}

export interface Vehicle {
  id: string;
  plate: string;
  model: string;
  vehicleClass: VehicleClass;
  year: number;
  assignedDriverId: string;
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

export type Language = 'en' | 'kn';
