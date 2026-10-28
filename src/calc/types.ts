export type MelangerSpec = {
  id: string;
  label: string;
  batchKg: number;
  priceEur: number;
  assumed: boolean;
  source: string;
};

export type Params = {
  weeklyKg: number;
  barWeightG: number;
  price: number;
  cocoaShare: number;
  sugarShare: number;
  milkShare: number;
  beanLoss: number;
  beanEurPerKg: number;
  fx: number;
  sugarCzkKg: number;
  milkCzkKg: number;
  packCzk: number;
  kwhPerKg: number;
  kwhRate: number;
  laborRate: number;
  batchFixedHours: number;
  perKgHours: number;
  melangerId: string;
  melangerCatalog: MelangerSpec[];
  restOfLineEur: number;
  machineLifeYears: number;
  maxWorkDays: number;
  otherMonthly: number;
  targetMonthlyProfit: number;
  prices: number[];
  volumes: number[];
};

export type CostLine = {
  beans: number;
  sugar: number;
  milk: number;
  packaging: number;
  energy: number;
  labor: number;
  equipment: number;
  other: number;
};

export type Economy = {
  weeklyKg: number;
  price: number;
  bars: number;
  revenue: number;
  cocoaKg: number;
  beansKg: number;
  beanCzkKg: number;
  sugarKg: number;
  milkKg: number;
  energyKwh: number;
  melanger: MelangerSpec;
  batches: number;
  maxDays: number;
  fits: boolean;
  fill: number;
  laborHours: number;
  equipmentCzk: number;
  costs: CostLine;
  totalCost: number;
  profit: number;
  profitMonth: number;
  profitYear: number;
  costPerBar: number;
  profitPerBar: number;
  margin: number;
  recipeSum: number;
  warnings: string[];
};
