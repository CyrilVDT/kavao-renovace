import { useMemo, useState } from "react";
import BreakEvenCalculator from "./components/BreakEvenCalculator";
import CostBreakdownChart from "./components/CostBreakdownChart";
import Dashboard from "./components/Dashboard";
import ExportReport from "./components/ExportReport";
import HowItWorks from "./components/HowItWorks";
import MelangerComparison from "./components/MelangerComparison";
import ProductionSettings from "./components/ProductionSettings";
import ProfitMatrix from "./components/ProfitMatrix";
import RecipeEditor from "./components/RecipeEditor";
import { computeEconomy, formatCzk, formatNum } from "./calc/economy";
import { useCalc } from "./store";

type Tab = "overview" | "params" | "how";

const TABS: [Tab, string][] = [
  ["overview", "Обзор"],
  ["params", "Параметры"],
  ["how", "Как считается"],
];

export default function Chocolate() {
  const { params, setParams, selectedKg, selectedPrice, selectCell } = useCalc();
  const e = useMemo(() => computeEconomy(params), [params]);
  const [tab, setTab] = useState<Tab>("overview");

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-paper text-ink">
      <header className="w-full border-b border-cocoa/10 bg-cocoa/95 text-paper">
        <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-3 px-4 pt-4 pb-3">
          <div>
            <h1 className="serif text-2xl">Экономика шоколада</h1>
            <p className="mt-1 max-w-2xl text-sm text-paper/70">
              Грубо, за неделю: выручка минус сырьё, упаковка, электричество, работник и списание станков. До налогов.
            </p>
          </div>
          <div className="text-right text-sm">
            <div className="serif text-2xl">{formatCzk(e.profit)} / нед</div>
            <div className="text-paper/60">
              {formatNum(e.weeklyKg, 1)} кг · {formatCzk(e.price)} · меланжёр {e.melanger.label}
            </div>
          </div>
        </div>
        <nav className="no-print mx-auto flex max-w-7xl gap-1 px-4" aria-label="Шоколад">
          {TABS.map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`rounded-t-xl px-5 py-2 text-sm font-medium ${
                tab === id ? "bg-paper text-cocoa" : "bg-transparent text-paper/70 hover:text-paper"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto grid max-w-7xl gap-4 px-4 py-6">
        {e.warnings.length > 0 && (
          <div className="rounded-xl border border-brick/30 bg-brick/5 px-4 py-3 text-sm text-brick">
            {e.warnings.map((w) => (
              <p key={w}>{w}</p>
            ))}
          </div>
        )}

        <div className={tab === "overview" ? "grid gap-4" : "hidden print:grid print:gap-4"}>
          <Dashboard e={e} />
          <MelangerComparison params={params} setParams={setParams} />
          <ProfitMatrix
            params={params}
            setParams={setParams}
            selectedKg={selectedKg}
            selectedPrice={selectedPrice}
            onSelect={selectCell}
          />
          <CostBreakdownChart e={e} />
          <BreakEvenCalculator params={params} setParams={setParams} e={e} />
        </div>

        <div className={tab === "params" ? "grid gap-4 print:hidden" : "hidden"}>
          <ProductionSettings params={params} setParams={setParams} />
          <RecipeEditor params={params} setParams={setParams} />
          <ExportReport params={params} e={e} />
        </div>

        <div className={tab === "how" ? "grid gap-4" : "hidden print:grid print:gap-4"}>
          <HowItWorks params={params} e={e} />
        </div>

        <footer className="pb-8 text-xs text-ink/45">
          Грубый расчёт до налогов. Цена меланжёра 25 кг — оценка, в оффере Kadzama его не было.
        </footer>
      </main>
    </div>
  );
}
