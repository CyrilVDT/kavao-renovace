import { useState } from "react";
import { formatCzk, matrix } from "../calc/economy";
import type { Economy, Params } from "../calc/types";
import { useCalc } from "../store";
import { Card, Field, inp } from "../ui";

function csvEscape(s: string | number) {
  const t = String(s);
  return /[",\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
}

export function economyToCsv(params: Params, e: Economy) {
  const r = (v: number) => Math.round(v);
  const lines: (string | number)[][] = [
    ["KAVAO — экономика шоколада, за неделю"],
    ["Строка", "Значение"],
    ["Объём кг", e.weeklyKg],
    ["Плитка г", params.barWeightG],
    ["Цена плитки Kč", params.price],
    ["Плиток", e.bars],
    ["Меланжёр", e.melanger.label],
    ["Партий = дней", e.batches],
    ["Выручка Kč", r(e.revenue)],
    ["Какао-бобы Kč", r(e.costs.beans)],
    ["Сахар Kč", r(e.costs.sugar)],
    ["Сухое молоко Kč", r(e.costs.milk)],
    ["Упаковка Kč", r(e.costs.packaging)],
    ["Электричество Kč", r(e.costs.energy)],
    ["Работник Kč", r(e.costs.labor)],
    ["Списание станков Kč", r(e.costs.equipment)],
    ["Прочие Kč", r(e.costs.other)],
    ["Расходы Kč", r(e.totalCost)],
    ["Прибыль / нед Kč", r(e.profit)],
    ["Прибыль / мес Kč", r(e.profitMonth)],
    ["Прибыль / год Kč", r(e.profitYear)],
    ["Себестоимость плитки Kč", e.costPerBar.toFixed(1)],
    [],
    ["Прибыль в неделю, Kč"],
    ["кг \\ цена", ...params.prices.map(String)],
  ];
  const m = matrix(params);
  params.volumes.forEach((kg, i) => {
    lines.push([String(kg), ...m[i].map((c) => String(r(c.profit)))]);
  });
  return lines.map((row) => row.map(csvEscape).join(",")).join("\n");
}

export default function ExportReport({ params, e }: { params: Params; e: Economy }) {
  const { saved, saveNamed, loadNamed, removeNamed, reset } = useCalc();
  const [name, setName] = useState("Оптимистичный");

  const download = () => {
    const blob = new Blob(["\uFEFF" + economyToCsv(params, e)], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "kavao-ekonomika.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <Card id="export" title="Сохранить, выгрузить, распечатать" className="no-print">
      <div className="flex flex-wrap gap-2">
        <button type="button" className="rounded-lg bg-cocoa px-3 py-2 text-sm text-paper" onClick={download}>
          Экспорт CSV
        </button>
        <button type="button" className="rounded-lg border border-cocoa/30 px-3 py-2 text-sm" onClick={() => window.print()}>
          Печать (обзор + как считается)
        </button>
        <button type="button" className="rounded-lg border border-brick/40 px-3 py-2 text-sm text-brick" onClick={reset}>
          Сброс к исходным
        </button>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
        <Field label="Сохранить набор параметров под именем">
          <input className={inp} value={name} onChange={(ev) => setName(ev.target.value)} />
        </Field>
        <button type="button" className="self-end rounded-lg bg-bronze px-3 py-2 text-sm text-white" onClick={() => saveNamed(name)}>
          Сохранить
        </button>
      </div>
      <ul className="mt-3 space-y-1 text-sm">
        {saved.map((s) => (
          <li key={s.name} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-paper px-3 py-2">
            <span>
              {s.name} <span className="text-xs text-ink/45">{new Date(s.savedAt).toLocaleString("ru")}</span>
            </span>
            <span className="flex gap-2">
              <button type="button" className="text-cocoa underline" onClick={() => loadNamed(s.name)}>
                загрузить
              </button>
              <button type="button" className="text-brick underline" onClick={() => removeNamed(s.name)}>
                удалить
              </button>
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-ink/50">
        Наборы хранятся в этом браузере. Сейчас: {formatCzk(e.profit)} прибыли в неделю, {e.bars} плиток.
      </p>
    </Card>
  );
}
