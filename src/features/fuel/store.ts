import { useMemo } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import { randomUUID } from 'expo-crypto';
import { cacheStorage } from '@/src/providers/cache-provider';
import { computeConsumption } from '@/src/lib/consumption';
import { deleteVehiclePhoto } from '@/src/lib/vehicle-photo';
import { migrateV1ToV2, migrateV2ToV3, migrateV3ToV4, type PersistedDataV3, type PersistedDataV4 } from '@/src/lib/migrations';
import {
   DEFAULT_SETTINGS,
   type FuelEntry,
   type Settings,
   type Vehicle,
} from './types';

const mmkvStorage: StateStorage = {
   getItem: name => cacheStorage.getString(name) ?? null,
   setItem: (name, value) => cacheStorage.set(name, value),
   removeItem: name => {
      cacheStorage.remove(name);
   },
};

export type FuelEntryInput = Omit<FuelEntry, 'id' | 'createdAt' | 'updatedAt'>;
export type VehicleInput = Omit<Vehicle, 'id'>;

type PersistedData = PersistedDataV4;

interface FuelState extends PersistedData {
   addEntry: (input: FuelEntryInput) => FuelEntry;
   updateEntry: (id: string, input: FuelEntryInput) => void;
   deleteEntry: (id: string) => void;
   addVehicle: (input: VehicleInput) => Vehicle;
   /** End of the first-launch flow: creates the first vehicle and never shows the flow again. */
   completeOnboarding: (input: VehicleInput) => Vehicle;
   updateVehicle: (id: string, patch: Partial<VehicleInput>) => void;
   /** Deletes the vehicle AND its fill-ups (and its photo file). */
   deleteVehicle: (id: string) => void;
   setActiveVehicle: (id: string) => void;
   updateSettings: (patch: Partial<Settings>) => void;
   /** Replace everything (import) */
   replaceAll: (data: PersistedData) => void;
   clearAll: () => void;
}

export const useFuelStore = create<FuelState>()(
   persist(
      (set, get) => ({
         entries: [],
         vehicles: [],
         activeVehicleId: null,
         settings: DEFAULT_SETTINGS,
         onboardingDone: false,

         addEntry: input => {
            const now = new Date().toISOString();
            const entry: FuelEntry = { ...input, id: randomUUID(), createdAt: now, updatedAt: now };
            set(s => ({ entries: [...s.entries, entry] }));
            return entry;
         },

         updateEntry: (id, input) =>
            set(s => ({
               entries: s.entries.map(e =>
                  e.id === id ? { ...e, ...input, id, createdAt: e.createdAt, updatedAt: new Date().toISOString() } : e,
               ),
            })),

         deleteEntry: id => set(s => ({ entries: s.entries.filter(e => e.id !== id) })),

         addVehicle: input => {
            const vehicle: Vehicle = { ...input, id: randomUUID() };
            // A new vehicle becomes the active one
            set(s => ({ vehicles: [...s.vehicles, vehicle], activeVehicleId: vehicle.id }));
            return vehicle;
         },

         completeOnboarding: input => {
            const vehicle: Vehicle = { ...input, id: randomUUID() };
            set({ vehicles: [vehicle], activeVehicleId: vehicle.id, onboardingDone: true });
            return vehicle;
         },

         updateVehicle: (id, patch) =>
            set(s => ({ vehicles: s.vehicles.map(v => (v.id === id ? { ...v, ...patch, id } : v)) })),

         deleteVehicle: id => {
            const doomed = get().vehicles.find(v => v.id === id);
            if (!doomed) return;
            set(s => {
               const remaining = s.vehicles.filter(v => v.id !== id);
               return {
                  vehicles: remaining,
                  entries: s.entries.filter(e => e.vehicleId !== id),
                  activeVehicleId: s.activeVehicleId === id ? (remaining[0]?.id ?? null) : s.activeVehicleId,
               };
            });
            deleteVehiclePhoto(doomed.photoUri);
         },

         setActiveVehicle: id => {
            if (get().vehicles.some(v => v.id === id)) set({ activeVehicleId: id });
         },

         updateSettings: patch => set(s => ({ settings: { ...s.settings, ...patch } })),

         replaceAll: data => set({ ...data }),

         clearAll: () =>
            set({
               entries: [],
               vehicles: [],
               activeVehicleId: null,
               settings: DEFAULT_SETTINGS,
               // erasing everything starts from scratch: the first-launch flow comes back
               onboardingDone: false,
            }),
      }),
      {
         name: 'my-conso-fuel',
         version: 4,
         storage: createJSONStorage(() => mmkvStorage),
         // Only persist data, never derived values or functions
         partialize: s => ({
            entries: s.entries,
            vehicles: s.vehicles,
            activeVehicleId: s.activeVehicleId,
            settings: s.settings,
            onboardingDone: s.onboardingDone,
         }),
         // v1 had a single vehicle stored in settings and no vehicleId on entries
         migrate: (persisted: unknown, version) => {
            if (version >= 4) return persisted as PersistedData;
            const v3: PersistedDataV3 =
               version >= 3 ? (persisted as PersistedDataV3) : migrateV2ToV3(version >= 2 ? (persisted as never) : migrateV1ToV2(persisted));
            return migrateV3ToV4(v3);
         },
      },
   ),
);

/** The active vehicle, or null when the user has not added any yet. */
export function useActiveVehicle(): Vehicle | null {
   const vehicles = useFuelStore(s => s.vehicles);
   const activeId = useFuelStore(s => s.activeVehicleId);
   return vehicles.find(v => v.id === activeId) ?? vehicles[0] ?? null;
}

const NO_ENTRIES: FuelEntry[] = [];

/** Fill-ups of the active vehicle only. */
export function useVehicleEntries(): FuelEntry[] {
   const entries = useFuelStore(s => s.entries);
   const vehicle = useActiveVehicle();
   const id = vehicle?.id;
   return useMemo(() => (id ? entries.filter(e => e.vehicleId === id) : NO_ENTRIES), [entries, id]);
}

/** Derived values for the active vehicle, recomputed from its entries every time they change. */
export function useConsumption() {
   const entries = useVehicleEntries();
   return useMemo(() => computeConsumption(entries), [entries]);
}
