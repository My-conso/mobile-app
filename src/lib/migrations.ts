/**
 * Persisted-store migrations (pure, testable).
 * v1: one vehicle described in settings (vehicleName, tankCapacityLiters), no vehicleId on entries.
 * v2: vehicles[] + activeVehicleId, every entry has a vehicleId.
 * v3: no automatic default vehicle (vehicles may be empty, activeVehicleId may be null).
 * v4: vehicles have brand / model / year / displacementCc instead of a free `name`;
 *     `onboardingDone` flag (first-launch flow).
 */

import {
   DEFAULT_SETTINGS,
   LEGACY_VEHICLE_ID,
   LEGACY_VEHICLE_NAME,
   type FuelEntry,
   type Settings,
   type Vehicle,
} from '@/src/features/fuel/types';

/** Vehicle as stored up to v3. */
export interface LegacyVehicle {
   id: string;
   name: string;
   tankCapacityLiters?: number;
   photoUri?: string;
}

export interface PersistedDataV2 {
   entries: FuelEntry[];
   vehicles: LegacyVehicle[];
   activeVehicleId: string;
   settings: Settings;
}

export interface PersistedDataV3 {
   entries: FuelEntry[];
   vehicles: LegacyVehicle[];
   activeVehicleId: string | null;
   settings: Settings;
}

export interface PersistedDataV4 {
   entries: FuelEntry[];
   vehicles: Vehicle[];
   activeVehicleId: string | null;
   settings: Settings;
   onboardingDone: boolean;
}

export function migrateV1ToV2(persisted: unknown): PersistedDataV2 {
   const old = (persisted ?? {}) as { entries?: Omit<FuelEntry, 'vehicleId'>[]; settings?: Record<string, unknown> };
   const s = old.settings ?? {};
   return {
      entries: (old.entries ?? []).map(e => ({ ...e, vehicleId: LEGACY_VEHICLE_ID })),
      vehicles: [
         {
            id: LEGACY_VEHICLE_ID,
            name: typeof s.vehicleName === 'string' && s.vehicleName ? s.vehicleName : LEGACY_VEHICLE_NAME,
            tankCapacityLiters: typeof s.tankCapacityLiters === 'number' ? s.tankCapacityLiters : undefined,
         },
      ],
      activeVehicleId: LEGACY_VEHICLE_ID,
      settings: {
         currency: typeof s.currency === 'string' && s.currency ? s.currency : DEFAULT_SETTINGS.currency,
         alertThresholdPercent:
            typeof s.alertThresholdPercent === 'number' ? s.alertThresholdPercent : DEFAULT_SETTINGS.alertThresholdPercent,
      },
   };
}

/**
 * v2 always contained the auto-created "Yamaha Cygnus X 2013". If the user never touched it
 * (same name, no tank, no fill-up) it is removed so they start with the first-launch flow.
 */
export function migrateV2ToV3(data: PersistedDataV2): PersistedDataV3 {
   const untouchedDefault = (v: LegacyVehicle) =>
      v.id === LEGACY_VEHICLE_ID && v.name === LEGACY_VEHICLE_NAME && v.tankCapacityLiters == null && !v.photoUri;
   const onlyUntouched = data.vehicles.length === 1 && untouchedDefault(data.vehicles[0]) && data.entries.length === 0;
   if (onlyUntouched) return { ...data, vehicles: [], activeVehicleId: null };
   return data;
}

/** "Yamaha Cygnus X 2013" → brand "Yamaha", model "Cygnus X", year 2013 (when the name ends with a year). */
export function splitLegacyName(name: string): Pick<Vehicle, 'brand' | 'model' | 'year'> {
   const parts = name.trim().split(/\s+/).filter(Boolean);
   let year: number | undefined;
   const last = parts[parts.length - 1];
   if (parts.length > 1 && /^\d{4}$/.test(last) && Number(last) >= 1950) {
      year = Number(last);
      parts.pop();
   }
   return { brand: parts[0] ?? '', model: parts.slice(1).join(' '), year };
}

/** Existing users already went through the app: they skip the first-launch flow. */
export function migrateV3ToV4(data: PersistedDataV3): PersistedDataV4 {
   return {
      ...data,
      vehicles: data.vehicles.map(({ name, ...v }) => ({ ...v, ...splitLegacyName(name) })),
      onboardingDone: data.vehicles.length > 0,
   };
}
