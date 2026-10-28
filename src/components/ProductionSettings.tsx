import type { ReactNode } from "react";
import type { Params } from "../calc/types";
import { Card, Field, Num, Slide, inp } from "../ui";

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <h3 className="serif mt-5 text-base text-cocoa">{title}</h3>
      <div className="mt-2 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{children}</div>
    </>
  );
}

export default function ProductionSettings({
  params,
  setParams,
}: {
  params: Params;
  setParams: (p: Partial<Params>) => void;
}) {
  return (
    <Card id="settings" title="Параметры" hint="Грубые оценки. Меняйте, когда появятся счета и реальные цифры.">
      <Group title="Продажи">
        <Field label="Объём, кг в неделю" hint="Сколько готового шоколада делаете и продаёте за неделю. Не бобов.">
          <Num value={params.weeklyKg} min={0} step={0.5} onChange={(weeklyKg) => setParams({ weeklyKg })} />
          <Slide value={params.weeklyKg} min={1} max={120} step={1} onChange={(weeklyKg) => setParams({ weeklyKg })} />
        </Field>
        <Field label="Вес плитки, г">
          <Num value={params.barWeightG} min={1} onChange={(barWeightG) => setParams({ barWeightG })} />
        </Field>
        <Field label="Цена плитки, Kč">
          <Num value={params.price} min={0} onChange={(price) => setParams({ price })} />
          <Slide value={params.price} min={20} max={200} step={1} onChange={(price) => setParams({ price })} />
        </Field>
      </Group>

      <Group title="Сырьё и упаковка">
        <Field label="Какао-бобы, €/кг">
          <Num value={params.beanEurPerKg} step={0.1} min={0} onChange={(beanEurPerKg) => setParams({ beanEurPerKg })} />
        </Field>
        <Field label="Курс, Kč за €">
          <Num value={params.fx} step={0.1} min={1} onChange={(fx) => setParams({ fx })} />
        </Field>
        <Field label="Сахар, Kč/кг">
          <Num value={params.sugarCzkKg} min={0} onChange={(sugarCzkKg) => setParams({ sugarCzkKg })} />
        </Field>
        <Field label="Сухое молоко, Kč/кг" hint="Оценка, не прайс поставщика.">
          <Num value={params.milkCzkKg} min={0} onChange={(milkCzkKg) => setParams({ milkCzkKg })} />
        </Field>
        <Field label="Упаковка, Kč за плитку">
          <Num value={params.packCzk} step={0.5} min={0} onChange={(packCzk) => setParams({ packCzk })} />
        </Field>
      </Group>

      <Group title="Работа и электричество">
        <Field label="Ставка работника, Kč/ч" hint="Сколько стоит час того, кто делает шоколад: работника или ваш, если делаете сами.">
          <Num value={params.laborRate} min={0} step={10} onChange={(laborRate) => setParams({ laborRate })} />
        </Field>
        <Field label="Часы на одну партию" hint="Загрузка меланжёра, темперирование, мойка. Не зависит от кг.">
          <Num
            value={params.batchFixedHours}
            step={0.25}
            min={0}
            onChange={(batchFixedHours) => setParams({ batchFixedHours })}
          />
        </Field>
        <Field label="Часы на 1 кг" hint="Отливка в формы, упаковка. Растёт с объёмом.">
          <Num value={params.perKgHours} step={0.05} min={0} onChange={(perKgHours) => setParams({ perKgHours })} />
        </Field>
        <Field label="Электричество, кВт·ч на 1 кг" hint="Около 15 кВт·ч на 14 кг. Оценка.">
          <Num value={params.kwhPerKg} step={0.05} min={0} onChange={(kwhPerKg) => setParams({ kwhPerKg })} />
        </Field>
        <Field label="Тариф, Kč за кВт·ч">
          <Num value={params.kwhRate} step={0.1} min={0} onChange={(kwhRate) => setParams({ kwhRate })} />
        </Field>
      </Group>

      <Group title="Станки и прочее">
        <Field label="Меланжёр в расчёте">
          <select className={inp} value={params.melangerId} onChange={(e) => setParams({ melangerId: e.target.value })}>
            {params.melangerCatalog.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label} — {m.priceEur.toLocaleString("cs-CZ")} €
              </option>
            ))}
          </select>
        </Field>
        <Field label="Остальная линия Kadzama, €" hint="Дробилка с веялкой, темперирование, Silk, вибростол.">
          <Num value={params.restOfLineEur} min={0} step={50} onChange={(restOfLineEur) => setParams({ restOfLineEur })} />
        </Field>
        <Field label="Срок службы станков, лет">
          <Num
            value={params.machineLifeYears}
            min={1}
            max={20}
            step={1}
            onChange={(machineLifeYears) => setParams({ machineLifeYears })}
          />
        </Field>
        <Field label="Сколько дней в неделю готовы делать шоколад">
          <Num value={params.maxWorkDays} min={1} max={7} step={1} onChange={(maxWorkDays) => setParams({ maxWorkDays })} />
        </Field>
        <Field label="Прочие расходы, Kč в месяц" hint="Доля аренды, маркетинг и т. п. По умолчанию 0: аренду кафе платите и так.">
          <Num value={params.otherMonthly} min={0} step={500} onChange={(otherMonthly) => setParams({ otherMonthly })} />
        </Field>
      </Group>
    </Card>
  );
}
