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
import { api } from './api';

interface StoreContextType {
  currentUser: User | null;
  users: User[];
  vehicles: Vehicle[];
  drivers: Driver[];
  trips: TripRequest[];
  auditLogs: OverrideAuditEntry[];
  language: Language;
  backendConnected: boolean;
  refreshState: () => Promise<void>;
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
  driverCollectKeys: (tripId: string) => void;
  driverEnRoute: (
    tripId: string,
    gpsUrl?: string,
    coordinates?: { lat: number; lng: number }
  ) => void;
  driverArrivedAtPickup: (tripId: string) => void;
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
  USERS: 'vehicle_desk_users_v2',
  VEHICLES: 'vehicle_desk_vehicles_v2',
  DRIVERS: 'vehicle_desk_drivers_v2',
  TRIPS: 'vehicle_desk_trips_v2',
  AUDIT: 'vehicle_desk_audit_v2',
  CURRENT_USER: 'vehicle_desk_current_user_v2',
  LANG: 'vehicle_desk_lang_v2',
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
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
    return null; // Default to unauthenticated for proper login flow
  });

  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LANG);
    return saved === 'kn' ? 'kn' : 'en';
  });

  const [backendConnected, setBackendConnected] = useState(false);

  // Sync state with backend
  const refreshState = async () => {
    try {
      const state = await api.getState();
      setUsers(state.users);
      setVehicles(state.vehicles);
      setDrivers(state.drivers);
      setTrips(state.trips);
      setAuditLogs(state.auditLogs);
      setBackendConnected(true);
    } catch (err) {
      setBackendConnected(false);
    }
  };

  useEffect(() => {
    refreshState();
    const interval = setInterval(refreshState, 3000);
    return () => clearInterval(interval);
  }, []);

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
    const userObj = users.find((u) => u.id === params.vipId) || currentUser;
    const resolvedClass: VehicleClass = params.preferredClass || getClassForSeniority(userObj);

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

      setDrivers((prev) =>
        prev.map((d) => (d.id === driver.id ? { ...d, status: 'BUSY' } : d))
      );
    } else {
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

  const updateDriverStatus = (driverId: string, status: DriverStatus) => {
    setDrivers((prev) =>
      prev.map((d) => (d.id === driverId ? { ...d, status, lastActive: 'Just now' } : d))
    );
    api.updateDriverStatus(driverId, status).catch(() => {});
  };

  const updateDriverCleanliness = (driverId: string, cleanliness: CleanlinessStatus) => {
    setDrivers((prev) =>
      prev.map((d) => (d.id === driverId ? { ...d, cleanliness, lastActive: 'Just now' } : d))
    );
    api.updateDriverCleanliness(driverId, cleanliness).catch(() => {});
  };

  const driverAcceptTrip = (tripId: string) => {
    const nowIso = new Date().toISOString();
    setTrips((prev) =>
      prev.map((t) => (t.id === tripId ? { ...t, status: 'ACCEPTED', updatedAt: nowIso } : t))
    );
    api.driverAcceptTrip(tripId).catch(() => {});
  };

  const driverCollectKeys = (tripId: string) => {
    const nowIso = new Date().toISOString();
    setTrips((prev) =>
      prev.map((t) => (t.id === tripId ? { ...t, status: 'KEY_COLLECTED', updatedAt: nowIso } : t))
    );
    api.driverCollectKeys(tripId).catch(() => {});
  };

  const driverEnRoute = (
    tripId: string,
    gpsUrl: string = 'https://maps.google.com/?q=12.9796,77.5908',
    coordinates: { lat: number; lng: number } = { lat: 12.9796, lng: 77.5908 }
  ) => {
    const nowIso = new Date().toISOString();
    setTrips((prev) =>
      prev.map((t) =>
        t.id === tripId
          ? {
              ...t,
              status: 'EN_ROUTE_TO_PICKUP',
              gpsShareUrl: gpsUrl,
              gpsCoordinates: coordinates,
              updatedAt: nowIso,
            }
          : t
      )
    );
    api.driverEnRoute(tripId, gpsUrl, coordinates).catch(() => {});
  };

  const driverArrivedAtPickup = (tripId: string) => {
    const nowIso = new Date().toISOString();
    setTrips((prev) =>
      prev.map((t) =>
        t.id === tripId ? { ...t, status: 'ARRIVED_AT_PICKUP', updatedAt: nowIso } : t
      )
    );
    api.driverArrivedAtPickup(tripId).catch(() => {});
  };

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
    api.driverShareGps(tripId, gpsUrl, coordinates).catch(() => {});
  };

  const driverStartTrip = (tripId: string) => {
    const nowIso = new Date().toISOString();
    setTrips((prev) =>
      prev.map((t) => (t.id === tripId ? { ...t, status: 'IN_PROGRESS', updatedAt: nowIso } : t))
    );
    api.driverStartTrip(tripId).catch(() => {});
  };

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

    api.driverCompleteTrip(tripId, postTripCleanliness).catch(() => {});
  };

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

    if (prevDriverId && prevDriverId !== driver.id) {
      setDrivers((prev) =>
        prev.map((d) => (d.id === prevDriverId ? { ...d, status: 'AVAILABLE' } : d))
      );
    }

    setDrivers((prev) =>
      prev.map((d) => (d.id === driver.id ? { ...d, status: 'BUSY' } : d))
    );

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

    api.adminOverride({ tripId, driverId, reason, adminName }).catch(() => {});
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

    api.cancelTrip(tripId).catch(() => {});
  };

  const resetToDefaultData = () => {
    setVehicles(INITIAL_VEHICLES);
    setDrivers(INITIAL_DRIVERS);
    setTrips(INITIAL_TRIPS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setCurrentUser(null);
    localStorage.clear();
    api.reset().catch(() => {});
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
        backendConnected,
        refreshState,
        setLanguage,
        login,
        logout,
        switchRole,
        createTripRequest,
        updateDriverStatus,
        updateDriverCleanliness,
        driverAcceptTrip,
        driverCollectKeys,
        driverEnRoute,
        driverArrivedAtPickup,
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
