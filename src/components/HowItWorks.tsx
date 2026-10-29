import { formatCzk, formatNum, weeksPerMonth } from "../calc/economy";
import { compareAtVolume, paybackPairs } from "../calc/melangers";
import type { Economy, Params } from "../calc/types";
import { Card, batchesLabel, yearsLabel } from "../ui";

type Step = { what: string; how: string; now: string; total?: boolean };

export default function HowItWorks({ params, e }: { params: Params; e: Economy }) {
  const kg = formatNum(e.weeklyKg, 1);
  const pct = (v: number) => `${formatNum(v * 100, 1)} %`;
  const kc = (v: number) => formatCzk(v);

  const steps: Step[] = [
    {
      what: "Плитки",
      how: "кг в неделю × 1000 / вес плитки, только целые",
      now: `${kg} × 1000 / ${formatNum(params.barWeightG, 0)} г = ${e.bars} шт`,
    },
    {
      what: "Выручка",
      how: "плитки × цена плитки",
      now: `${e.bars} × ${kc(e.price)} = ${kc(e.revenue)}`,
      total: true,
    },
    {
      what: "Какао-бобы",
      how: "кг × доля какао / (1 − шелуха) × €/кг × курс",
      now: `${kg} × ${pct(params.cocoaShare)} / ${formatNum(1 - params.beanLoss, 2)} = ${formatNum(e.beansKg, 2)} кг × ${formatNum(params.beanEurPerKg, 2)} € × ${formatNum(params.fx, 2)} = ${kc(e.costs.beans)}`,
    },
    {
      what: "Сахар",
      how: "кг × доля сахара × цена за кг",
      now: `${kg} × ${pct(params.sugarShare)} = ${formatNum(e.sugarKg, 2)} кг × ${kc(params.sugarCzkKg)} = ${kc(e.costs.sugar)}`,
    },
    {
      what: "Сухое молоко",
      how: "кг × доля молока × цена за кг",
      now: `${kg} × ${pct(params.milkShare)} = ${formatNum(e.milkKg, 2)} кг × ${kc(params.milkCzkKg)} = ${kc(e.costs.milk)}`,
    },
    {
      what: "Упаковка",
      how: "плитки × цена упаковки",
      now: `${e.bars} × ${kc(params.packCzk)} = ${kc(e.costs.packaging)}`,
    },
    {
      what: "Электричество",
      how: "кг × кВт·ч на кг × тариф",
      now: `${kg} × ${formatNum(params.kwhPerKg, 2)} = ${formatNum(e.energyKwh, 1)} кВт·ч × ${kc(params.kwhRate)} = ${kc(e.costs.energy)}`,
    },
    {
      what: "Партии",
      how: "кг / чаша меланжёра, вверх до целого. Партия крутится почти сутки сама — это занятый день, а не часы работника. Дальше партии идут в «Работник» и в проверку дней",
      now: `${kg} / ${formatNum(e.melanger.batchKg, 0)} кг → ${batchesLabel(e.batches)}`,
    },
    {
      what: "Работник",
      how: "(партии × часы на партию + кг × часы на кг) × ставка. Часы на партию — только ручная работа, без времени, пока крутит меланжёр",
      now: `(${e.batches} × ${formatNum(params.batchFixedHours, 2)} + ${kg} × ${formatNum(params.perKgHours, 2)}) = ${formatNum(e.laborHours, 1)} ч × ${kc(params.laborRate)} = ${kc(e.costs.labor)}`,
    },
    {
      what: "Списание станков",
      how: "(меланжёр + остальная линия) × курс / (лет службы × 52 недели)",
      now: `(${formatNum(e.melanger.priceEur, 0)} + ${formatNum(params.restOfLineEur, 0)}) € × ${formatNum(params.fx, 2)} / (${formatNum(params.machineLifeYears, 0)} × 52) = ${kc(e.costs.equipment)}`,
    },
    {
      what: "Прочие",
      how: "в месяц / 4,33 недели",
      now: `${kc(params.otherMonthly)} / ${formatNum(weeksPerMonth, 2)} = ${kc(e.costs.other)}`,
    },
    {
      what: "Расходы",
      how: "сумма строк от бобов до прочих",
      now: kc(e.totalCost),
      total: true,
    },
    {
      what: "Прибыль в неделю",
      how: "выручка − расходы",
      now: `${kc(e.revenue)} − ${kc(e.totalCost)} = ${kc(e.profit)}`,
      total: true,
    },
    {
      what: "В месяц и в год",
      how: "× 52 / 12 и × 52",
      now: `${kc(e.profitMonth)} и ${kc(e.profitYear)}`,
    },
    {
      what: "Себестоимость плитки",
      how: "расходы / плитки. Это и есть цена без убытка",
      now: `${kc(e.totalCost)} / ${e.bars} = ${kc(e.costPerBar)}`,
    },
    {
      what: "Прибыль с плитки",
      how: "цена − себестоимость плитки",
      now: `${kc(e.price)} − ${kc(e.costPerBar)} = ${kc(e.profitPerBar)}`,
    },
  ];

  const example = paybackPairs(compareAtVolume(params))[0];

  return (
    <Card title="Как считается" hint="Все формулы калькулятора с вашими текущими цифрами. Всё — за одну неделю.">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-ink/50">
            <tr>
              <th className="p-2">Что</th>
              <th className="p-2">Как считаем</th>
              <th className="p-2">Сейчас</th>
            </tr>
          </thead>
          <tbody>
            {steps.map((s) => (
              <tr key={s.what} className={`border-t border-cocoa/10 ${s.total ? "bg-paper font-medium" : ""}`}>
                <td className="p-2 align-top text-cocoa">{s.what}</td>
                <td className="p-2 align-top text-ink/70">{s.how}</td>
                <td className="p-2 align-top tabular-nums">{s.now}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="serif mt-6 text-base text-cocoa">Какой меланжёр</h3>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink/75">
        <li>Для каждой чаши считаем всё то же самое. Меняются только партии (отсюда часы работника) и цена меланжёра (отсюда списание).</li>
        <li>
          Чаша подходит, если партий в неделю не больше, чем дней, которые вы готовы делать шоколад (сейчас{" "}
          {formatNum(params.maxWorkDays, 0)}).
        </li>
        <li>
          Окупаемость большой чаши = доплата / сэкономленная зарплата в неделю / 52.
          {example && (
            <>
              {" "}
              Сейчас {example.from.melanger.label} → {example.to.melanger.label}:{" "}
              {example.years === null
                ? `доплата ${kc(example.extraCzk)}, а часов не экономит — не окупается`
                : `${kc(example.extraCzk)} / ${kc(example.weeklySaving)} / 52 = ${yearsLabel(example.years)}`}
              .
            </>
          )}
        </li>
      </ul>

      <h3 className="serif mt-6 text-base text-cocoa">Чего здесь нет</h3>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink/75">
        <li>Налогов и НДС: прибыль — до налогов.</li>
        <li>Непроданных и бракованных плиток: считаем, что продаётся всё, что сделали.</li>
        <li>Аренды — только если вписать её в «Прочие расходы».</li>
        <li>Доставки, установки станков и форм (по смете около 50 тыс. Kč).</li>
      </ul>
    </Card>
  );
}
