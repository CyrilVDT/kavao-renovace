import { formatCzk, formatNum } from "../calc/economy";
import { compareAtVolume, paybackPairs, recommend, volumeGrid } from "../calc/melangers";
import type { MelangerSpec, Params } from "../calc/types";
import { Card, Field, Num, batchesLabel, yearsLabel } from "../ui";

export default function MelangerComparison({
  params,
  setParams,
}: {
  params: Params;
  setParams: (p: Partial<Params>) => void;
}) {
  const runs = compareAtVolume(params);
  const rec = recommend(runs);
  const grid = volumeGrid(params);

  const updateSpec = (id: string, patch: Partial<MelangerSpec>) => {
    setParams({
      melangerCatalog: params.melangerCatalog.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    });
  };

  return (
    <Card
      id="machines"
      title="Какой меланжёр брать: 7, 25 или 35 кг"
      explain={
        <>
          <p>
            Партия в меланжёре идёт почти сутки, поэтому <strong>партий в неделю = дней работы</strong>. Маленькая чаша
            дешевле, но на большом объёме ей нужно больше дней и больше часов работника.
          </p>
          <p>
            Прибыль в карточках считается так же, как сверху: уже минус зарплата и списание станков (меланжёр +
            остальная линия, делённые на срок службы).
          </p>
        </>
      }
    >
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Field label="Сколько дней в неделю готовы делать шоколад" hint="Кафе, не завод. Обычно 1–2.">
          <Num value={params.maxWorkDays} min={1} max={7} step={1} onChange={(maxWorkDays) => setParams({ maxWorkDays })} />
        </Field>
        <Field label="Срок службы станков, лет" hint="За сколько лет списываем покупку. Предположение.">
          <Num
            value={params.machineLifeYears}
            min={1}
            max={20}
            step={1}
            onChange={(machineLifeYears) => setParams({ machineLifeYears })}
          />
        </Field>
        <Field
          label="Остальная линия Kadzama, €"
          hint="Дробилка с веялкой, темперирование, Silk, вибростол. Одна и та же при любой чаше."
        >
          <Num value={params.restOfLineEur} min={0} step={50} onChange={(restOfLineEur) => setParams({ restOfLineEur })} />
        </Field>
      </div>

      <div className="mb-4 rounded-xl bg-moss/10 px-4 py-3 text-sm">
        <p className="font-medium text-cocoa">
          При {formatNum(params.weeklyKg, 1)} кг в неделю и {formatCzk(params.price)} за плитку
        </p>
        {rec.cheapestFit ? (
          <p className="mt-1">
            Хватает <strong>{rec.cheapestFit.melanger.label}</strong>: {batchesLabel(rec.cheapestFit.batches)} в неделю.
            {rec.bestFit && rec.bestFit.melanger.id !== rec.cheapestFit.melanger.id && (
              <>
                {" "}
                Больше всего прибыли — <strong>{rec.bestFit.melanger.label}</strong> ({formatCzk(rec.bestFit.profit)}/нед).
              </>
            )}
          </p>
        ) : (
          <p className="mt-1 text-brick">
            Ни одна чаша не успевает за {params.maxWorkDays} дн. Нужно меньше кг или больше дней.
          </p>
        )}
        {paybackPairs(runs).map((p) => (
          <p key={`${p.from.melanger.id}-${p.to.melanger.id}`} className="mt-1 text-xs text-ink/70">
            {p.from.melanger.label} → {p.to.melanger.label}: доплата {formatCzk(p.extraCzk)}
            {p.years === null
              ? " — часов работника не экономит, не окупится."
              : ` — экономит ${formatCzk(p.weeklySaving)} зарплаты в неделю, окупится за ~${yearsLabel(p.years)}${
                  p.years > params.machineLifeYears ? " (дольше срока службы)" : ""
                }.`}
          </p>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        {runs.map((r) => {
          const inPlan = r.melanger.id === params.melangerId;
          return (
            <article
              key={r.melanger.id}
              className={`rounded-2xl border p-4 ${
                !r.fits ? "border-brick/40 bg-brick/5" : inPlan ? "border-moss/50 bg-moss/10" : "border-cocoa/10 bg-paper"
              }`}
            >
              <header className="flex items-baseline justify-between gap-2">
                <h3 className="serif text-xl text-cocoa">{r.melanger.label}</h3>
                <span className="text-xs text-ink/50">{r.melanger.assumed ? "цена — оценка" : "цена из прайса"}</span>
              </header>
              <p className="mt-1 text-xs text-ink/55">{r.melanger.source}</p>
              <label className="mt-2 block text-sm">
                Цена меланжёра, €
                <input
                  className="mt-1 w-full rounded-lg border border-cocoa/20 bg-white px-3 py-2 text-sm"
                  type="number"
                  min={0}
                  step={10}
                  value={r.melanger.priceEur}
                  onChange={(e) => updateSpec(r.melanger.id, { priceEur: Number(e.target.value) })}
                />
              </label>
              <dl className="mt-3 space-y-1 text-sm">
                <Row k="Партий = дней в неделю" v={String(r.batches)} />
                <Row k="Чаша заполнена" v={`${formatNum(r.fill * 100, 0)} %`} />
                <Row k="Часы работника / нед" v={`${formatNum(r.laborHours, 1)} ч`} />
                <Row k="Списание станков / нед" v={formatCzk(r.costs.equipment)} />
                <Row k="Прибыль / нед" v={formatCzk(r.profit)} />
                <Row k="Укладываетесь в дни?" v={r.fits ? `да, ${r.batches} из ${r.maxDays}` : `нет, нужно ${r.batches}`} />
              </dl>
              <button
                type="button"
                disabled={inPlan}
                className={`mt-3 w-full rounded-lg px-3 py-2 text-sm ${inPlan ? "bg-moss/20 text-moss" : "bg-cocoa text-paper"}`}
                onClick={() => setParams({ melangerId: r.melanger.id })}
              >
                {inPlan ? "✓ Сейчас в расчёте" : "Считать с этим меланжёром"}
              </button>
            </article>
          );
        })}
      </div>

      <h3 className="serif mt-6 text-base text-cocoa">Если объём вырастет</h3>
      <p className="mb-2 text-sm text-ink/60">
        Прибыль в неделю при цене {formatCzk(params.price)}. «дн» — сколько дней гонять партии. Красное — не
        укладываетесь в {params.maxWorkDays} дн.
      </p>
      <div className="overflow-x-auto">
        <table className="min-w-full text-center text-sm">
          <thead>
            <tr>
              <th className="p-2 text-left">кг/нед</th>
              {params.melangerCatalog.map((m) => (
                <th key={m.id} className="p-2">
                  {m.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grid.map((row) => (
              <tr key={row.kg} className={row.kg === params.weeklyKg ? "bg-bronze/10" : ""}>
                <th className="p-2 text-left font-medium">
                  {row.kg}
                  {row.kg === params.weeklyKg ? " ← сейчас" : ""}
                </th>
                {row.runs.map((r) => (
                  <td key={r.melanger.id} className={`p-2 ${r.fits ? "" : "bg-brick/10 text-brick"}`}>
                    <div>{formatCzk(r.profit)}</div>
                    <div className="text-xs opacity-70">{r.batches} дн</div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-2 border-b border-cocoa/5 py-1">
      <dt className="text-ink/55">{k}</dt>
      <dd>{v}</dd>
    </div>
  );
}