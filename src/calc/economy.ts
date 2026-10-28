import { clamp01, clampNonNeg, defaultMelangerCatalog, defaultParams, weeksPerMonth } from "./defaults";
import type { Economy, MelangerSpec, Params } from "./types";

const n = (v: number, fallback = 0) => (Number.isFinite(v) ? v : fallback);

export const withVolumePrice = (params: Params, weeklyKg: number, price: number): Params => ({
  ...params,
  weeklyKg,
  price,
});

export function selectedMelanger(params: Params): MelangerSpec {
  const list = params.melangerCatalog?.length ? params.melangerCatalog : defaultMelangerCatalog;
  return list.find((m) => m.id === params.melangerId) ?? list[list.length - 1];
}

export function computeEconomy(raw: Params): Economy {
  const warnings: string[] = [];
  const weeklyKg = clampNonNeg(n(raw.weeklyKg));
  const barKg = Math.max(1, n(raw.barWeightG, 100)) / 1000;
  const price = clampNonNeg(n(raw.price));
  const cocoaShare = clampNonNeg(n(raw.cocoaShare));
  const sugarShare = clampNonNeg(n(raw.sugarShare));
  const milkShare = clampNonNeg(n(raw.milkShare));
  const recipeSum = cocoaShare + sugarShare + milkShare;
  if (Math.abs(recipeSum - 1) > 0.005) {
    warnings.push(`Рецепт в сумме ${(recipeSum * 100).toFixed(0)} %, а должен быть 100 %.`);
  }

  const bars = Math.floor(weeklyKg / barKg + 1e-9);
  const revenue = bars * price;

  const fx = clampNonNeg(n(raw.fx, 25));
  const cocoaKg = weeklyKg * cocoaShare;
  const beansKg = cocoaKg / (1 - clamp01(n(raw.beanLoss, 0.15)));
  const beanCzkKg = clampNonNeg(n(raw.beanEurPerKg)) * fx;
  const sugarKg = weeklyKg * sugarShare;
  const milkKg = weeklyKg * milkShare;
  const energyKwh = weeklyKg * clampNonNeg(n(raw.kwhPerKg));

  const melanger = selectedMelanger(raw);
  const batchKg = Math.max(0.1, n(melanger.batchKg, 35));
  const batches = weeklyKg > 0 ? Math.ceil(weeklyKg / batchKg - 1e-9) : 0;
  const maxDays = Math.max(1, n(raw.maxWorkDays, 2));
  const fits = batches <= maxDays;
  const fill = batches > 0 ? weeklyKg / (batches * batchKg) : 0;
  if (!fits) {
    warnings.push(
      `Меланжёр ${melanger.label}: ${batches} партий = ${batches} дней в неделю, а вы готовы на ${maxDays}.`
    );
  }

  const laborHours =
    batches * clampNonNeg(n(raw.batchFixedHours)) + weeklyKg * clampNonNeg(n(raw.perKgHours));
  const years = Math.max(1, n(raw.machineLifeYears, 7));
  const equipmentCzk = (clampNonNeg(n(melanger.priceEur)) + clampNonNeg(n(raw.restOfLineEur))) * fx;

  const costs = {
    beans: beansKg * beanCzkKg,
    sugar: sugarKg * clampNonNeg(n(raw.sugarCzkKg)),
    milk: milkKg * clampNonNeg(n(raw.milkCzkKg)),
    packaging: bars * clampNonNeg(n(raw.packCzk)),
    energy: energyKwh * clampNonNeg(n(raw.kwhRate)),
    labor: laborHours * clampNonNeg(n(raw.laborRate)),
    equipment: equipmentCzk / (years * 52),
    other: clampNonNeg(n(raw.otherMonthly)) / weeksPerMonth,
  };
  const totalCost = Object.values(costs).reduce((a, b) => a + b, 0);
  const profit = revenue - totalCost;

  return {
    weeklyKg,
    price,
    bars,
    revenue,
    cocoaKg,
    beansKg,
    beanCzkKg,
    sugarKg,
    milkKg,
    energyKwh,
    melanger,
    batches,
    maxDays,
    fits,
    fill,
    laborHours,
    equipmentCzk,
    costs,
    totalCost,
    profit,
    profitMonth: profit * weeksPerMonth,
    profitYear: profit * 52,
    costPerBar: bars > 0 ? totalCost / bars : 0,
    profitPerBar: bars > 0 ? profit / bars : 0,
    margin: revenue > 0 ? profit / revenue : 0,
    recipeSum,
    warnings,
  };
}

export function matrix(params: Params): Economy[][] {
  return params.volumes.map((kg) =>
    params.prices.map((price) => computeEconomy(withVolumePrice(params, kg, price)))
  );
}

export function bestCell(params: Params): { kg: number; price: number; profit: number } | null {
  let best: { kg: number; price: number; profit: number } | null = null;
  for (const kg of params.volumes) {
    for (const price of params.prices) {
      const e = computeEconomy(withVolumePrice(params, kg, price));
      if (!e.fits) continue;
      if (!best || e.profit > best.profit) best = { kg, price, profit: e.profit };
    }
  }
  return best;
}

export const formatCzk = (v: number) =>
  new Intl.NumberFormat("cs-CZ", { maximumFractionDigits: 0 }).format(v) + " Kč";

export const formatNum = (v: number, d = 2) =>
  new Intl.NumberFormat("cs-CZ", {
    minimumFractionDigits: 0,
    maximumFractionDigits: d,
  }).format(v);

export { defaultParams, weeksPerMonth };
