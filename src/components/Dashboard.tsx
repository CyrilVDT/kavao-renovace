import { formatCzk, formatNum } from "../calc/economy";
import type { Economy } from "../calc/types";
import { Tip, batchesLabel } from "../ui";

function Kpi({
  label,
  value,
  sub,
  warn,
  tip,
}: {
  label: string;
  value: string;
  sub?: string;
  warn?: boolean;
  tip?: string;
}) {
  return (
    <div className={`rounded-xl border p-3 ${warn ? "border-brick/40 bg-brick/5" : "border-cocoa/10 bg-paper"}`}>
      <div className="text-[11px] uppercase tracking-wide text-ink/50">
        {label}
        {tip && <Tip text={tip} />}
      </div>
      <div className={`serif mt-1 text-xl ${warn ? "text-brick" : "text-cocoa"}`}>{value}</div>
      {sub && <div className="text-xs text-ink/55">{sub}</div>}
    </div>
  );
}

export default function Dashboard({ e }: { e: Economy }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Kpi label="Объём / нед" value={`${formatNum(e.weeklyKg, 1)} кг`} sub={`${e.bars} плиток`} />
      <Kpi label="Выручка / нед" value={formatCzk(e.revenue)} sub={`${e.bars} × ${formatCzk(e.price)}`} />
      <Kpi
        label="Расходы / нед"
        value={formatCzk(e.totalCost)}
        sub="сырьё, упаковка, работник, станки"
        tip="По строчкам — на вкладке «Как считается»."
      />
      <Kpi
        label="Прибыль / нед"
        value={formatCzk(e.profit)}
        sub={`≈ ${formatCzk(e.profitMonth)} в месяц`}
        warn={e.profit < 0}
        tip="Выручка минус все расходы, уже с зарплатой работника и списанием станков. До налогов."
      />
      <Kpi label="Прибыль / год" value={formatCzk(e.profitYear)} sub="52 недели" warn={e.profitYear < 0} />
      <Kpi label="Себестоимость плитки" value={formatCzk(e.costPerBar)} sub="дешевле продавать — в убыток" />
      <Kpi
        label="Прибыль с плитки"
        value={formatCzk(e.profitPerBar)}
        sub={`${formatNum(e.margin * 100, 0)} % от цены`}
        warn={e.profitPerBar < 0}
      />
      <Kpi
        label={`Меланжёр ${e.melanger.label}`}
        value={`${batchesLabel(e.batches)} / нед`}
        sub={e.fits ? `= ${e.batches} дн, укладываетесь в ${e.maxDays}` : `не укладываетесь в ${e.maxDays} дн`}
        warn={!e.fits}
      />
    </div>
  );
}
