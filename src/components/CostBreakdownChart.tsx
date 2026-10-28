import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatCzk } from "../calc/economy";
import type { Economy } from "../calc/types";
import { Card } from "../ui";

const COLORS = ["#4a2c22", "#c47a3a", "#d4b483", "#6b5344", "#3d6b4a", "#a84830", "#8a5a32", "#1c1410"];

export default function CostBreakdownChart({ e }: { e: Economy }) {
  const data = [
    { name: "Какао-бобы", v: e.costs.beans },
    { name: "Сахар", v: e.costs.sugar },
    { name: "Сухое молоко", v: e.costs.milk },
    { name: "Упаковка", v: e.costs.packaging },
    { name: "Электричество", v: e.costs.energy },
    { name: "Работник", v: e.costs.labor },
    { name: "Списание станков", v: e.costs.equipment },
    { name: "Прочие", v: e.costs.other },
  ].filter((d) => d.v > 0.5);

  return (
    <Card title="Куда уходят деньги" hint="Расходы за неделю при текущем объёме, цене и меланжёре.">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-64">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={data} dataKey="v" nameKey="name" innerRadius={50} outerRadius={90}>
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => formatCzk(v)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="space-y-1 text-sm">
          {data.map((d, i) => (
            <li key={d.name} className="flex justify-between gap-2">
              <span className="flex items-center gap-2">
                <i className="inline-block h-2 w-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                {d.name}
              </span>
              <span>
                {formatCzk(d.v)} · {e.totalCost ? ((d.v / e.totalCost) * 100).toFixed(0) : 0} %
              </span>
            </li>
          ))}
          <li className="flex justify-between gap-2 border-t border-cocoa/10 pt-1 font-medium">
            <span>Всего</span>
            <span>{formatCzk(e.totalCost)}</span>
          </li>
        </ul>
      </div>
    </Card>
  );
}
