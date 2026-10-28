import { create } from "zustand";
import { persist } from "zustand/middleware";
import { defaultMelangerCatalog, defaultParams } from "./calc/defaults";
import type { Params } from "./calc/types";

type StoredParams = Partial<Params> & { maxBatchKg?: number };

const hydrateParams = (p?: StoredParams | null): Params => {
  const known = Object.fromEntries(
    Object.entries(p ?? {}).filter(([k]) => k in defaultParams)
  ) as Partial<Params>;
  const melangerCatalog = known.melangerCatalog?.length
    ? known.melangerCatalog.map((m) => ({ ...m }))
    : defaultMelangerCatalog.map((m) => ({ ...m }));
  const melangerId =
    known.melangerId ??
    melangerCatalog.find((m) => m.batchKg === p?.maxBatchKg)?.id ??
    defaultParams.melangerId;
  return {
    ...defaultParams,
    ...known,
    prices: known.prices?.length ? [...known.prices] : [...defaultParams.prices],
    volumes: known.volumes?.length ? [...known.volumes] : [...defaultParams.volumes],
    melangerCatalog,
    melangerId,
  };
};

export type SavedSet = { name: string; params: Params; savedAt: string };

type State = {
  params: Params;
  selectedKg: number | null;
  selectedPrice: number | null;
  saved: SavedSet[];
  setParams: (p: Partial<Params>) => void;
  replace: (p: Params) => void;
  reset: () => void;
  selectCell: (kg: number, price: number) => void;
  saveNamed: (name: string) => void;
  loadNamed: (name: string) => void;
  removeNamed: (name: string) => void;
};

export const useCalc = create<State>()(
  persist(
    (set, get) => ({
      params: hydrateParams(),
      selectedKg: null,
      selectedPrice: null,
      saved: [
        { name: "Базовый", params: hydrateParams(), savedAt: new Date().toISOString() },
      ],
      setParams: (p) => set({ params: hydrateParams({ ...get().params, ...p }) }),
      replace: (p) => set({ params: hydrateParams(p) }),
      reset: () =>
        set({
          params: hydrateParams(),
          selectedKg: null,
          selectedPrice: null,
        }),
      selectCell: (kg, price) => set({ selectedKg: kg, selectedPrice: price }),
      saveNamed: (name) => {
        const trimmed = name.trim() || "Сценарий";
        const next: SavedSet = {
          name: trimmed,
          params: JSON.parse(JSON.stringify(get().params)) as Params,
          savedAt: new Date().toISOString(),
        };
        set({
          saved: [...get().saved.filter((s) => s.name !== trimmed), next],
        });
      },
      loadNamed: (name) => {
        const found = get().saved.find((s) => s.name === name);
        if (found) set({ params: hydrateParams(found.params) });
      },
      removeNamed: (name) => set({ saved: get().saved.filter((s) => s.name !== name) }),
    }),
    {
      name: "kavao-ekonomika",
      merge: (persisted, current) => {
        const p = persisted as Partial<State> | undefined;
        return {
          ...current,
          ...p,
          params: hydrateParams(p?.params),
          saved: p?.saved ?? current.saved,
        };
      },
    }
  )
);
