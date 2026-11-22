import { CleanlinessStatus, Driver, DriverStatus, OverrideAuditEntry, TripRequest, User, Vehicle } from './types';

const isBrowser = typeof window !== 'undefined';
export const isProdHost = isBrowser && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

const API_BASE =
  import.meta.env.VITE_API_URL ||
  (isProdHost ? '/api' : 'http://localhost:4000/api');

export const WA_DESK_URL =
  import.meta.env.VITE_WA_DESK_URL ||
  (isProdHost ? 'https://whatsapp-zeta-puce.vercel.app' : 'http://localhost:3005');

export const api = {
  async getState(): Promise<{
    users: User[];
    vehicles: Vehicle[];
    drivers: Driver[];
    trips: TripRequest[];
    auditLogs: OverrideAuditEntry[];
  }> {
    const res = await fetch(`${API_BASE}/state`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  async login(phone: string, role?: string): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, role }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Authentication failed');
    }
    return data;
  },

  async updateDriverStatus(driverId: string, status: DriverStatus): Promise<{ driver: Driver }> {
    const res = await fetch(`${API_BASE}/driver/${driverId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return res.json();
  },

  async updateDriverCleanliness(driverId: string, cleanliness: CleanlinessStatus): Promise<{ driver: Driver }> {
    const res = await fetch(`${API_BASE}/driver/${driverId}/cleanliness`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cleanliness }),
    });
    return res.json();
  },

  async driverAcceptTrip(tripId: string): Promise<{ trip: TripRequest }> {
    const res = await fetch(`${API_BASE}/driver/trip/${tripId}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return res.json();
  },

  async driverCollectKeys(tripId: string): Promise<{ trip: TripRequest }> {
    const res = await fetch(`${API_BASE}/driver/trip/${tripId}/collect-keys`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return res.json();
  },

  async driverEnRoute(
    tripId: string,
    gpsUrl?: string,
    coordinates?: { lat: number; lng: number }
  ): Promise<{ trip: TripRequest }> {
    const res = await fetch(`${API_BASE}/driver/trip/${tripId}/en-route`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gpsUrl, coordinates }),
    });
    return res.json();
  },

  async driverArrivedAtPickup(tripId: string): Promise<{ trip: TripRequest; alertSent: boolean }> {
    const res = await fetch(`${API_BASE}/driver/trip/${tripId}/arrived`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return res.json();
  },

  async driverShareGps(
    tripId: string,
    gpsUrl: string,
    coordinates?: { lat: number; lng: number }
  ): Promise<{ trip: TripRequest }> {
    const res = await fetch(`${API_BASE}/driver/trip/${tripId}/gps`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gpsUrl, coordinates }),
    });
    return res.json();
  },

  async driverStartTrip(tripId: string): Promise<{ trip: TripRequest }> {
    const res = await fetch(`${API_BASE}/driver/trip/${tripId}/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return res.json();
  },

  async driverCompleteTrip(
    tripId: string,
    postTripCleanliness?: CleanlinessStatus
  ): Promise<{ trip: TripRequest }> {
    const res = await fetch(`${API_BASE}/driver/trip/${tripId}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postTripCleanliness }),
    });
    return res.json();
  },

  async adminOverride(params: {
    tripId: string;
    driverId: string;
    reason: string;
    adminName: string;
  }): Promise<{ trip: TripRequest }> {
    const res = await fetch(`${API_BASE}/admin/override`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return res.json();
  },

  async cancelTrip(tripId: string): Promise<void> {
    await fetch(`${API_BASE}/trips/${tripId}/cancel`, {
      method: 'POST',
    });
  },

  async reset(): Promise<void> {
    await fetch(`${API_BASE}/reset`, { method: 'POST' });
  },

  async checkWhatsAppStatus(): Promise<{ connected: boolean }> {
    try {
      const res = await fetch(`${API_BASE}/whatsapp/status`);
      return res.json();
    } catch {
      return { connected: false };
    }
  },
};
