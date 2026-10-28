import { weeksPerMonth } from "./defaults";
import { computeEconomy, withVolumePrice } from "./economy";
import type { Params } from "./types";

const MAX_KG = 300;
const STEP_KG = 0.5;

export function priceForWeeklyProfit(params: Params, weeklyProfit = 0): number | null {
  const e = computeEconomy(params);
  return e.bars > 0 ? (e.totalCost + weeklyProfit) / e.bars : null;
}

export function kgForWeeklyProfit(params: Params, weeklyProfit = 0): number | null {
  for (let kg = STEP_KG; kg <= MAX_KG + 1e-9; kg += STEP_KG) {
    if (computeEconomy(withVolumePrice(params, kg, params.price)).profit >= weeklyProfit) return kg;
  }
  return null;
}

export const weeklyTarget = (params: Params) => params.targetMonthlyProfit / weeksPerMonth;
