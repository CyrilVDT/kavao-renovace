import { computeEconomy } from "./economy";
import type { Economy, Params } from "./types";

export const COMPARE_VOLUMES = [14, 20, 25, 30, 35, 50];

export function compareAtVolume(params: Params, weeklyKg = params.weeklyKg, price = params.price): Economy[] {
  return params.melangerCatalog.map((m) => computeEconomy({ ...params, weeklyKg, price, melangerId: m.id }));
}

export function payback(from: Economy, to: Economy) {
  const extraCzk = to.equipmentCzk - from.equipmentCzk;
  const weeklySaving = to.profit + to.costs.equipment - (from.profit + from.costs.equipment);
  const years = extraCzk > 0 && weeklySaving > 0.5 ? extraCzk / (weeklySaving * 52) : null;
  return { extraCzk, weeklySaving, years };
}

const PAYBACK_PAIRS = [
  ["m7", "m25"],
  ["m7", "m35"],
  ["m25", "m35"],
] as const;

export function paybackPairs(runs: Economy[]) {
  const byId = (id: string) => runs.find((r) => r.melanger.id === id);
  return PAYBACK_PAIRS.flatMap(([a, b]) => {
    const from = byId(a);
    const to = byId(b);
    if (!from || !to || !from.fits) return [];
    const pb = payback(from, to);
    return pb.extraCzk > 0 ? [{ from, to, ...pb }] : [];
  });
}

export function recommend(runs: Economy[]) {
  const fitting = runs.filter((r) => r.fits);
  const cheapestFit = [...fitting].sort((a, b) => a.equipmentCzk - b.equipmentCzk)[0] ?? null;
  const bestFit = [...fitting].sort((a, b) => b.profit - a.profit)[0] ?? null;
  return { fitting, cheapestFit, bestFit };
}

export function volumeGrid(params: Params) {
  const vols = [...COMPARE_VOLUMES];
  if (!vols.includes(params.weeklyKg)) vols.push(params.weeklyKg);
  vols.sort((a, b) => a - b);
  return vols.map((kg) => ({ kg, runs: compareAtVolume(params, kg) }));
}
