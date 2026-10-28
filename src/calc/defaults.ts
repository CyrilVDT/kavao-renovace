import type { MelangerSpec, Params } from "./types";

export const defaultMelangerCatalog: MelangerSpec[] = [
  {
    id: "m7",
    label: "7 кг",
    batchKg: 7,
    priceEur: 4390,
    assumed: false,
    source: "сайт Kadzama, 4 390 € — в письме-оффере этой машины не было",
  },
  {
    id: "m25",
    label: "25 кг",
    batchKg: 25,
    priceEur: 8900,
    assumed: true,
    source: "в прайсе не было; оценка между 7 и 35 кг — поправьте, когда будет счёт",
  },
  {
    id: "m35",
    label: "35 кг",
    batchKg: 35,
    priceEur: 12190,
    assumed: false,
    source: "оффер Kadzama 12 190 €",
  },
];

export const DEFAULT_PRICES = [40, 50, 60, 70, 80, 90, 100, 120, 150];
export const DEFAULT_VOLUMES = [5, 10, 14, 20, 30, 50, 75, 100];

export const defaultParams: Params = {
  weeklyKg: 14,
  barWeightG: 100,
  price: 80,
  cocoaShare: 0.3,
  sugarShare: 0.5,
  milkShare: 0.2,
  beanLoss: 0.15,
  beanEurPerKg: 6.5,
  fx: 25,
  sugarCzkKg: 20,
  milkCzkKg: 120,
  packCzk: 4,
  kwhPerKg: 1.07,
  kwhRate: 5,
  laborRate: 200,
  batchFixedHours: 1.5,
  perKgHours: 0.25,
  melangerId: "m35",
  melangerCatalog: defaultMelangerCatalog.map((m) => ({ ...m })),
  restOfLineEur: 13970,
  machineLifeYears: 7,
  maxWorkDays: 2,
  otherMonthly: 0,
  targetMonthlyProfit: 50000,
  prices: [...DEFAULT_PRICES],
  volumes: [...DEFAULT_VOLUMES],
};

export const weeksPerMonth = 52 / 12;

export const clamp01 = (n: number) => {
  if (!Number.isFinite(n)) return 0;
  return Math.min(0.99, Math.max(0, n));
};

export const clampNonNeg = (n: number) => {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, n);
};
