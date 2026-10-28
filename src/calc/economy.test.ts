import { describe, expect, it } from "vitest";
import { defaultParams } from "./defaults";
import { bestCell, computeEconomy, withVolumePrice } from "./economy";
import { kgForWeeklyProfit, priceForWeeklyProfit } from "./optimize";

const near = (a: number, b: number, eps = 1) => {
  expect(Math.abs(a - b)).toBeLessThan(eps);
};

describe("baseline 14 kg × 80 Kč, melanger 35 kg", () => {
  const e = computeEconomy(defaultParams);

  it("140 bars and 11 200 revenue", () => {
    expect(e.bars).toBe(140);
    near(e.revenue, 11200, 0.01);
  });

  it("sugar 7 kg / 140 Kč, milk 2.8 kg / 336 Kč", () => {
    near(e.sugarKg, 7, 0.001);
    near(e.costs.sugar, 140, 0.01);
    near(e.milkKg, 2.8, 0.001);
    near(e.costs.milk, 336, 0.01);
  });

  it("beans only for the 30 % cocoa part: 4.2 kg clean, ~4.94 kg bought, ~803 Kč", () => {
    near(e.cocoaKg, 4.2, 0.001);
    near(e.beansKg, 4.2 / 0.85, 0.001);
    near(e.costs.beans, 803, 1);
  });

  it("packaging 560, energy ~75, labor 5 h = 1000", () => {
    near(e.costs.packaging, 560, 0.01);
    near(e.costs.energy, 75, 0.5);
    expect(e.batches).toBe(1);
    near(e.laborHours, 5, 0.001);
    near(e.costs.labor, 1000, 0.01);
  });

  it("without equipment it matches the original spec (~3184 − 270 dep)", () => {
    near(e.totalCost - e.costs.equipment, 3184 - 270, 1);
  });

  it("equipment = (35 kg melanger + rest of line) × fx / (7 years × 52)", () => {
    near(e.equipmentCzk, (12190 + 13970) * 25, 0.01);
    near(e.costs.equipment, 654000 / 364, 0.01);
  });

  it("profit = revenue − costs, month = × 52/12, year = × 52", () => {
    near(e.profit, e.revenue - e.totalCost, 0.001);
    near(e.profitMonth, (e.profit * 52) / 12, 0.001);
    near(e.profitYear, e.profit * 52, 0.001);
    near(e.costPerBar * e.bars, e.totalCost, 0.001);
  });
});

describe("parameter changes", () => {
  it("price 100 raises revenue to 14 000", () => {
    const e = computeEconomy({ ...defaultParams, price: 100 });
    near(e.revenue, 14000, 0.01);
    expect(e.profit).toBeGreaterThan(computeEconomy(defaultParams).profit);
  });

  it("28 kg on 35 kg bowl is still one batch: 1.5 + 28 × 0.25 = 8.5 h", () => {
    const e = computeEconomy(withVolumePrice(defaultParams, 28, 80));
    expect(e.bars).toBe(280);
    expect(e.batches).toBe(1);
    near(e.laborHours, 8.5, 0.001);
  });

  it("7 kg bowl needs two batches for 14 kg: 6.5 h", () => {
    const e = computeEconomy({ ...defaultParams, melangerId: "m7" });
    expect(e.batches).toBe(2);
    near(e.laborHours, 6.5, 0.001);
    expect(e.fits).toBe(true);
  });

  it("cocoa 40 % raises beans, not sugar", () => {
    const e = computeEconomy({ ...defaultParams, cocoaShare: 0.4, sugarShare: 0.4, milkShare: 0.2 });
    near(e.cocoaKg, 5.6, 0.001);
    near(e.sugarKg, 5.6, 0.001);
  });

  it("husk loss 30 % increases beans bought", () => {
    const e = computeEconomy({ ...defaultParams, beanLoss: 0.3 });
    near(e.beansKg, 6, 0.001);
  });

  it("worker rate 400 doubles labor cost", () => {
    const e = computeEconomy({ ...defaultParams, laborRate: 400 });
    near(e.costs.labor, 2000, 0.01);
  });

  it("other monthly costs are spread per week (52/12)", () => {
    const e = computeEconomy({ ...defaultParams, otherMonthly: 5200 });
    near(e.costs.other, 1200, 0.01);
  });

  it("30 kg on 7 kg bowl does not fit in 2 days", () => {
    const e = computeEconomy({ ...defaultParams, weeklyKg: 30, melangerId: "m7" });
    expect(e.batches).toBe(5);
    expect(e.fits).toBe(false);
    expect(e.warnings.length).toBeGreaterThan(0);
  });

  it("bad inputs do not explode", () => {
    const e = computeEconomy({
      ...defaultParams,
      weeklyKg: -10,
      price: Number.NaN,
      beanLoss: 2,
      laborRate: -5,
    });
    expect(Number.isFinite(e.profit)).toBe(true);
    expect(e.weeklyKg).toBe(0);
    expect(e.batches).toBe(0);
  });
});

describe("break-even and target", () => {
  it("break-even price equals cost per bar and gives ~0 profit", () => {
    const e = computeEconomy(defaultParams);
    const p = priceForWeeklyProfit(defaultParams, 0)!;
    near(p, e.costPerBar, 0.001);
    near(computeEconomy({ ...defaultParams, price: p }).profit, 0, 0.01);
  });

  it("break-even volume at 30 Kč is above 14 kg", () => {
    const kg = kgForWeeklyProfit({ ...defaultParams, price: 30 }, 0);
    expect(kg).not.toBeNull();
    expect(kg!).toBeGreaterThan(14);
    expect(computeEconomy({ ...defaultParams, price: 30, weeklyKg: kg! }).profit).toBeGreaterThanOrEqual(0);
    expect(computeEconomy({ ...defaultParams, price: 30, weeklyKg: kg! - 0.5 }).profit).toBeLessThan(0);
  });

  it("best matrix cell skips cells that do not fit", () => {
    const b = bestCell(defaultParams);
    expect(b).not.toBeNull();
    expect(computeEconomy(withVolumePrice(defaultParams, b!.kg, b!.price)).fits).toBe(true);
  });
});
