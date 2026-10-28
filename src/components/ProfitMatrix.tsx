import { useMemo, useState } from "react";
import { bestCell, computeEconomy, formatCzk, formatNum, matrix, withVolumePrice } from "../calc/economy";
import type { Economy, Params } from "../calc/types";
import { Card, Field, inp } from "../ui";

function heat(profit: number, min: number, max: number) {
  if (profit < 0) {
    const t = Math.min(1, Math.abs(profit) / Math.max(1, Math.abs(min)));
    return `rgba(168, 72, 48, ${0.12 + t * 0.45})`;
  }
  const t = profit / Math.max(1, max);
  return `rgba(61, 107, 74, ${0.08 + t * 0.5})`;
}

export default function ProfitMatrix({
  params,
  setParams,
  selectedKg,
  selectedPrice,
  onSelect,
}: {
  params: Params;
  setParams: (p: Partial<Params>) => void;
  selectedKg: number | null;
  selectedPrice: number | null;
  onSelect: (kg: number, price: number) => void;
}) {
  const grid = useMemo(() => matrix(params), [params]);
  const profits = grid
    .flat()
    .filter((e) => e.fits)
    .map((e) => e.profit);
  const min = Math.min(...profits, 0);
  const max = Math.max(...profits, 1);
  const best = useMemo(() => bestCell(params), [params]);

  const selKg = selectedKg ?? params.weeklyKg;
  const selPrice = selectedPrice ?? params.price;
  const detail: Economy = useMemo(
    () => computeEconomy(withVolumePrice(params, selKg, selPrice)),
    [params, selKg, selPrice]
  );

  return (
    <Card
      id="matrix"
      title="Прибыль в неделю: цена плитки × объём"
      hint={`Строка — кг в неделю, столбец — цена плитки, в клетке — прибыль за неделю. Меланжёр ${detail.melanger.label}. Серое с «!» — не успевает за ${params.maxWorkDays} дн. Нажмите клетку, чтобы увидеть расчёт.`}
    >
      {best && (
        <p className="mb-3 inline-block rounded-lg bg-moss/15 px-3 py-1 text-xs text-moss">
          Больше всего в таблице: {formatCzk(best.profit)} при {best.kg} кг и {best.price} Kč
        </p>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-center text-xs">
          <thead>
            <tr>
              <th className="sticky left-0 bg-white p-2 text-left">кг \ Kč</th>
              {params.prices.map((p) => (
                <th key={p} className="p-2 font-medium">
                  {p}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {params.volumes.map((kg, ri) => (
              <tr key={kg}>
                <th className="sticky left-0 bg-white p-2 text-left font-medium">{kg}</th>
                {grid[ri].map((cell, ci) => {
                  const px = params.prices[ci];
                  const active = kg === selKg && px === selPrice;
                  const isBest = Boolean(best && best.kg === kg && best.price === px);
                  return (
                    <td key={`${kg}-${px}`} className="p-0">
                      <button
                        type="button"
                        onClick={() => onSelect(kg, px)}
                        className={`block w-full px-2 py-2 ${isBest ? "ring-2 ring-moss" : ""} ${
                          active ? "font-semibold underline" : ""
                        } ${cell.fits ? "" : "text-ink/40"}`}
                        style={{ background: cell.fits ? heat(cell.profit, min, max) : "rgba(20, 17, 15, 0.05)" }}
                      >
                        {formatNum(cell.profit, 0)}
                        {!cell.fits && <span className="ml-1 text-[9px] text-brick">!</span>}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <details className="mt-3 no-print">
        <summary className="cursor-pointer text-sm text-cocoa">Изменить цены и объёмы в таблице</summary>
        <MatrixRanges params={params} setParams={setParams} />
      </details>

      <div className="mt-4 grid gap-x-6 gap-y-1 rounded-xl bg-paper p-3 text-sm sm:grid-cols-2">
        <h3 className="serif col-span-full flex flex-wrap items-center justify-between gap-2 text-cocoa">
          <span>
            Клетка {formatNum(selKg, 1)} кг × {formatCzk(selPrice)}
          </span>
          <button
            type="button"
            className="rounded-lg bg-cocoa px-3 py-1 text-xs text-paper no-print"
            onClick={() => setParams({ weeklyKg: selKg, price: selPrice })}
          >
            Сделать основным расчётом
          </button>
        </h3>
        <Line k="Плиток" v={String(detail.bars)} />
        <Line k="Выручка" v={formatCzk(detail.revenue)} />
        <Line k="Сырьё (бобы, сахар, молоко)" v={formatCzk(detail.costs.beans + detail.costs.sugar + detail.costs.milk)} />
        <Line k="Упаковка" v={formatCzk(detail.costs.packaging)} />
        <Line k="Электричество" v={formatCzk(detail.costs.energy)} />
        <Line k={`Работник, ${formatNum(detail.laborHours, 1)} ч`} v={formatCzk(detail.costs.labor)} />
        <Line k="Списание станков" v={formatCzk(detail.costs.equipment)} />
        {detail.costs.other > 0 && <Line k="Прочие" v={formatCzk(detail.costs.other)} />}
        <Line k="Расходы" v={formatCzk(detail.totalCost)} />
        <Line k="Прибыль / нед" v={formatCzk(detail.profit)} />
        <Line k="Прибыль с плитки" v={formatCzk(detail.profitPerBar)} />
        {detail.warnings.map((w) => (
          <p key={w} className="col-span-full text-xs text-brick">
            {w}
          </p>
        ))}
      </div>
    </Card>
  );
}

function Line({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-2 border-b border-cocoa/5 py-1">
      <span className="text-ink/60">{k}</span>
      <span>{v}</span>
    </div>
  );
}

function MatrixRanges({ params, setParams }: { params: Params; setParams: (p: Partial<Params>) => void }) {
  const [pTxt, setP] = useState(params.prices.join(", "));
  const [vTxt, setV] = useState(params.volumes.join(", "));
  const parse = (txt: string) =>
    txt
      .split(/[,;\s]+/)
      .map(Number)
      .filter((n) => n > 0);
  return (
    <div className="mt-3 grid gap-3 md:grid-cols-2">
      <Field label="Цены плитки, Kč (через запятую)">
        <input
          className={inp}
          value={pTxt}
          onChange={(e) => setP(e.target.value)}
          onBlur={() => {
            const prices = parse(pTxt);
            if (prices.length) setParams({ prices });
          }}
        />
      </Field>
      <Field label="Объёмы, кг/нед (через запятую)">
        <input
          className={inp}
          value={vTxt}
          onChange={(e) => setV(e.target.value)}
          onBlur={() => {
            const volumes = parse(vTxt);
            if (volumes.length) setParams({ volumes });
          }}
        />
      </Field>
    </div>
  );
}
