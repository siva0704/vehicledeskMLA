import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  INITIAL_AUDIT_LOGS,
  INITIAL_DRIVERS,
  INITIAL_TRIPS,
  INITIAL_USERS,
  INITIAL_VEHICLES,
} from './initialData';
import { evaluateRuleEngine, getClassForSeniority, RuleEngineResult } from './ruleEngine';
import {
  CleanlinessStatus,
  Driver,
  DriverStatus,
  Language,
  OverrideAuditEntry,
  Role,
  TripRequest,
  User,
  Vehicle,
  VehicleClass,
} from './types';

interface StoreContextType {
  currentUser: User | null;
  users: User[];
  vehicles: Vehicle[];
  drivers: Driver[];
  trips: TripRequest[];
  auditLogs: OverrideAuditEntry[];
  language: Language;
  setLanguage: (lang: Language) => void;
  login: (user: User) => void;
  logout: () => void;
  switchRole: (role: Role) => void;
  createTripRequest: (params: {
    vipId: string;
    vipName: string;
    vipPhone: string;
    vipDesignation: string;
    date: string;
    time: string;
    pickupLocation: string;
    dropLocation?: string;
    isRoundTrip?: boolean;
    preferredClass?: VehicleClass;
    notes?: string;
  }) => { trip: TripRequest; engineResult: RuleEngineResult };
  updateDriverStatus: (driverId: string, status: DriverStatus) => void;
  updateDriverCleanliness: (driverId: string, cleanliness: CleanlinessStatus) => void;
  driverAcceptTrip: (tripId: string) => void;
  driverShareGps: (
    tripId: string,
    gpsUrl: string,
    coordinates?: { lat: number; lng: number }
  ) => void;
  driverStartTrip: (tripId: string) => void;
  driverCompleteTrip: (tripId: string, postTripCleanliness?: CleanlinessStatus) => void;
  adminForceAssign: (
    tripId: string,
    driverId: string,
    reason: string,
    adminName: string
  ) => boolean;
  cancelTrip: (tripId: string) => void;
  resetToDefaultData: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USERS: 'vehicle_desk_users_v1',
  VEHICLES: 'vehicle_desk_vehicles_v1',
  DRIVERS: 'vehicle_desk_drivers_v1',
  TRIPS: 'vehicle_desk_trips_v1',
  AUDIT: 'vehicle_desk_audit_v1',
  CURRENT_USER: 'vehicle_desk_current_user_v1',
  LANG: 'vehicle_desk_lang_v1',
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.VEHICLES);
    return saved ? JSON.parse(saved) : INITIAL_VEHICLES;
  });

  const [drivers, setDrivers] = useState<Driver[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DRIVERS);
    return saved ? JSON.parse(saved) : INITIAL_DRIVERS;
  });

  const [trips, setTrips] = useState<TripRequest[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRIPS);
    return saved ? JSON.parse(saved) : INITIAL_TRIPS;
  });

  const [auditLogs, setAuditLogs] = useState<OverrideAuditEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUDIT);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (saved) return JSON.parse(saved);
    // Default to VIP 1 for immediate smooth inspection
    return INITIAL_USERS[0];
  });

  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LANG);
    return saved === 'kn' ? 'kn' : 'en';
  });

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(drivers));
  }, [drivers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(trips));
  }, [trips]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }, [currentUser]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEYS.LANG, lang);
  };

  const login = (user: User) => {
    setCurrentUser(user);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const switchRole = (role: Role) => {
    const matchedUser = users.find((u) => u.role === role);
    if (matchedUser) {
      setCurrentUser(matchedUser);
    }
  };

  // 1. VIP creates Trip Request -> Hardcoded Rule Engine evaluates immediately based on VIP seniority
  const createTripRequest = (params: {
    vipId: string;
    vipName: string;
    vipPhone: string;
    vipDesignation: string;
    date: string;
    time: string;
    pickupLocation: string;
    dropLocation?: string;
    isRoundTrip?: boolean;
    preferredClass?: VehicleClass;
    notes?: string;
  }) => {
    // Auto-assign vehicle class based on seniority if not explicitly provided
    const userObj = users.find((u) => u.id === params.vipId) || currentUser;
    const resolvedClass: VehicleClass = params.preferredClass || getClassForSeniority(userObj);

    // Resolve drop location for round trips
    const resolvedDrop = params.isRoundTrip
      ? `Round Trip (Return to ${params.pickupLocation})`
      : params.dropLocation || params.pickupLocation;

    const engineResult = evaluateRuleEngine(resolvedClass, drivers, vehicles);

    const tripId = `REQ-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowIso = new Date().toISOString();

    let newTrip: TripRequest;

    if (engineResult.success && engineResult.assignedCandidate) {
      const { driver, vehicle } = engineResult.assignedCandidate;

      newTrip = {
        id: tripId,
        vipId: params.vipId,
        vipName: params.vipName,
        vipPhone: params.vipPhone,
        vipDesignation: params.vipDesignation,
        date: params.date,
        time: params.time,
        pickupLocation: params.pickupLocation,
        dropLocation: resolvedDrop,
        isRoundTrip: !!params.isRoundTrip,
        preferredClass: resolvedClass,
        status: 'ASSIGNED',
        notes: params.notes,
        assignedDriverId: driver.id,
        assignedVehicleId: vehicle.id,
        assignedDriverName: driver.name,
        assignedDriverPhone: driver.phone,
        assignedVehicleModel: vehicle.model,
        assignedVehiclePlate: vehicle.plate,
        assignedVehicleClass: vehicle.vehicleClass,
        allocationMethod: 'RULE_ENGINE_AUTO',
        ruleTraceReason: `[Seniority Auto-Allocated: ${resolvedClass}] ${engineResult.traceReason}`,
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      // Mark driver as BUSY on assignment
      setDrivers((prev) =>
        prev.map((d) => (d.id === driver.id ? { ...d, status: 'BUSY' } : d))
      );
    } else {
      // Queued for admin intervention
      newTrip = {
        id: tripId,
        vipId: params.vipId,
        vipName: params.vipName,
        vipPhone: params.vipPhone,
        vipDesignation: params.vipDesignation,
        date: params.date,
        time: params.time,
        pickupLocation: params.pickupLocation,
        dropLocation: resolvedDrop,
        isRoundTrip: !!params.isRoundTrip,
        preferredClass: resolvedClass,
        status: 'PENDING',
        notes: params.notes,
        allocationMethod: 'QUEUED',
        ruleTraceReason: `[Seniority Auto-Allocated: ${resolvedClass}] ${engineResult.traceReason}`,
        createdAt: nowIso,
        updatedAt: nowIso,
      };
    }

    setTrips((prev) => [newTrip, ...prev]);
    return { trip: newTrip, engineResult };
  };

  // 2. Driver Updates Status (Available / Busy / Off / Maintenance)
  const updateDriverStatus = (driverId: string, status: DriverStatus) => {
    setDrivers((prev) =>
      prev.map((d) => (d.id === driverId ? { ...d, status, lastActive: 'Just now' } : d))
    );
  };

  // 3. Driver Updates Cleanliness (Clean / Needs Cleaning)
  const updateDriverCleanliness = (driverId: string, cleanliness: CleanlinessStatus) => {
    setDrivers((prev) =>
      prev.map((d) => (d.id === driverId ? { ...d, cleanliness, lastActive: 'Just now' } : d))
    );
  };

  // 4. Driver Flow: Step 1 - Accept Trip
  const driverAcceptTrip = (tripId: string) => {
    const nowIso = new Date().toISOString();
    setTrips((prev) =>
      prev.map((t) => (t.id === tripId ? { ...t, status: 'ACCEPTED', updatedAt: nowIso } : t))
    );
  };

  // 5. Driver Flow: Step 2 - Share GPS Link
  const driverShareGps = (
    tripId: string,
    gpsUrl: string,
    coordinates?: { lat: number; lng: number }
  ) => {
    const nowIso = new Date().toISOString();
    setTrips((prev) =>
      prev.map((t) =>
        t.id === tripId
          ? {
              ...t,
              status: 'GPS_SHARED',
              gpsShareUrl: gpsUrl,
              gpsCoordinates: coordinates,
              updatedAt: nowIso,
            }
          : t
      )
    );
  };

  // 6. Driver Flow: Step 3 - Start Trip
  const driverStartTrip = (tripId: string) => {
    const nowIso = new Date().toISOString();
    setTrips((prev) =>
      prev.map((t) => (t.id === tripId ? { ...t, status: 'IN_PROGRESS', updatedAt: nowIso } : t))
    );
  };

  // 7. Driver Flow: Step 4 - Complete Trip
  const driverCompleteTrip = (
    tripId: string,
    postTripCleanliness: CleanlinessStatus = 'CLEAN'
  ) => {
    const nowIso = new Date().toISOString();
    const trip = trips.find((t) => t.id === tripId);

    setTrips((prev) =>
      prev.map((t) =>
        t.id === tripId
          ? {
              ...t,
              status: 'COMPLETED',
              completedAt: nowIso,
              updatedAt: nowIso,
            }
          : t
      )
    );

    // Free up driver and increment fairness counters
    if (trip?.assignedDriverId) {
      setDrivers((prev) =>
        prev.map((d) => {
          if (d.id === trip.assignedDriverId) {
            return {
              ...d,
              status: 'AVAILABLE',
              cleanliness: postTripCleanliness,
              tripsToday: d.tripsToday + 1,
              tripsThisWeek: d.tripsThisWeek + 1,
              totalHoursThisWeek: parseFloat((d.totalHoursThisWeek + 1.5).toFixed(1)),
              lastActive: 'Just completed trip',
            };
          }
          return d;
        })
      );
    }
  };

  // 8. Admin Override: Force Assign with Mandatory Reason
  const adminForceAssign = (
    tripId: string,
    driverId: string,
    reason: string,
    adminName: string
  ): boolean => {
    if (!reason || reason.trim().length < 5) {
      return false;
    }

    const driver = drivers.find((d) => d.id === driverId);
    if (!driver) return false;

    const vehicle = vehicles.find((v) => v.id === driver.vehicleId);
    if (!vehicle) return false;

    const trip = trips.find((t) => t.id === tripId);
    if (!trip) return false;

    const nowIso = new Date().toISOString();
    const prevDriverId = trip.assignedDriverId;

    // Update trip
    setTrips((prev) =>
      prev.map((t) => {
        if (t.id === tripId) {
          return {
            ...t,
            status: 'ASSIGNED',
            assignedDriverId: driver.id,
            assignedVehicleId: vehicle.id,
            assignedDriverName: driver.name,
            assignedDriverPhone: driver.phone,
            assignedVehicleModel: vehicle.model,
            assignedVehiclePlate: vehicle.plate,
            assignedVehicleClass: vehicle.vehicleClass,
            allocationMethod: 'ADMIN_OVERRIDE',
            isOverridden: true,
            overrideReason: reason.trim(),
            overriddenByAdmin: adminName,
            overriddenAt: nowIso,
            updatedAt: nowIso,
          };
        }
        return t;
      })
    );

    // Free old driver if there was one
    if (prevDriverId && prevDriverId !== driver.id) {
      setDrivers((prev) =>
        prev.map((d) => (d.id === prevDriverId ? { ...d, status: 'AVAILABLE' } : d))
      );
    }

    // Set new driver to BUSY
    setDrivers((prev) =>
      prev.map((d) => (d.id === driver.id ? { ...d, status: 'BUSY' } : d))
    );

    // Immutable Audit Entry
    const auditEntry: OverrideAuditEntry = {
      id: `AUDIT-${Math.floor(100 + Math.random() * 900)}`,
      tripId: trip.id,
      vipName: trip.vipName,
      driverName: `${driver.name} (${vehicle.model} / ${vehicle.plate})`,
      vehiclePlate: vehicle.plate,
      previousDriverId: prevDriverId,
      adminName,
      reason: reason.trim(),
      timestamp: nowIso,
    };

    setAuditLogs((prev) => [auditEntry, ...prev]);
    return true;
  };

  const cancelTrip = (tripId: string) => {
    const trip = trips.find((t) => t.id === tripId);
    const nowIso = new Date().toISOString();

    setTrips((prev) =>
      prev.map((t) => (t.id === tripId ? { ...t, status: 'CANCELLED', updatedAt: nowIso } : t))
    );

    if (trip?.assignedDriverId) {
      setDrivers((prev) =>
        prev.map((d) => (d.id === trip.assignedDriverId ? { ...d, status: 'AVAILABLE' } : d))
      );
    }
  };

  const resetToDefaultData = () => {
    setVehicles(INITIAL_VEHICLES);
    setDrivers(INITIAL_DRIVERS);
    setTrips(INITIAL_TRIPS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setCurrentUser(INITIAL_USERS[0]);
    localStorage.clear();
  };

  return (
    <StoreContext.Provider
      value={{
        currentUser,
        users,
        vehicles,
        drivers,
        trips,
        auditLogs,
        language,
        setLanguage,
        login,
        logout,
        switchRole,
        createTripRequest,
        updateDriverStatus,
        updateDriverCleanliness,
        driverAcceptTrip,
        driverShareGps,
        driverStartTrip,
        driverCompleteTrip,
        adminForceAssign,
        cancelTrip,
        resetToDefaultData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
