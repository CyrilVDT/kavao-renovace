import { computeEconomy, formatCzk, formatNum, withVolumePrice } from "../calc/economy";
import { kgForWeeklyProfit, priceForWeeklyProfit, weeklyTarget } from "../calc/optimize";
import type { Economy, Params } from "../calc/types";
import { Card, Field, Num } from "../ui";

export default function BreakEvenCalculator({
  params,
  setParams,
  e,
}: {
  params: Params;
  setParams: (p: Partial<Params>) => void;
  e: Economy;
}) {
  const kg = formatNum(e.weeklyKg, 1);
  const zeroPrice = priceForWeeklyProfit(params, 0);
  const zeroKg = kgForWeeklyProfit(params, 0);
  const target = weeklyTarget(params);
  const targetPrice = priceForWeeklyProfit(params, target);
  const targetKg = kgForWeeklyProfit(params, target);
  const targetRun = targetKg ? computeEconomy(withVolumePrice(params, targetKg, params.price)) : null;
  const kgText = (v: number | null) => (v ? `${formatNum(v, 1)} кг/нед` : "больше 300 кг");

  return (
    <Card id="breakeven" title="Без убытка и цель" hint={`Всё при меланжёре ${e.melanger.label} и остальных параметрах.`}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Stat k={`Цена без убытка при ${kg} кг`} v={zeroPrice ? formatCzk(zeroPrice) : "—"} />
        <Stat k={`Объём без убытка при ${formatCzk(params.price)}`} v={kgText(zeroKg)} />
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Хочу прибыль в месяц, Kč">
          <Num
            value={params.targetMonthlyProfit}
            min={0}
            step={1000}
            onChange={(targetMonthlyProfit) => setParams({ targetMonthlyProfit })}
          />
        </Field>
        <Stat k="Это в неделю" v={formatCzk(target)} />
        <Stat k={`Нужная цена при ${kg} кг`} v={targetPrice ? formatCzk(targetPrice) : "—"} />
        <Stat k={`Нужный объём при ${formatCzk(params.price)}`} v={kgText(targetKg)} />
      </div>
      {targetRun && !targetRun.fits && (
        <p className="mt-2 text-xs text-brick">
          {formatNum(targetRun.weeklyKg, 1)} кг меланжёр {targetRun.melanger.label} делает за {targetRun.batches} дн —
          больше, чем {targetRun.maxDays}.
        </p>
      )}
    </Card>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-xl bg-paper p-3">
      <div className="text-[11px] uppercase tracking-wide text-ink/50">{k}</div>
      <div className="serif mt-1 text-lg text-cocoa">{v}</div>
    </div>
  );
}
