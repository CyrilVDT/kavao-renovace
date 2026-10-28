import type { Params } from "../calc/types";
import { Card, Field, Pct } from "../ui";

export default function RecipeEditor({
  params,
  setParams,
}: {
  params: Params;
  setParams: (p: Partial<Params>) => void;
}) {
  const sum = (params.cocoaShare + params.sugarShare + params.milkShare) * 100;
  return (
    <Card
      id="recipe"
      title="Рецепт молочного шоколада"
      hint="Доли от массы готового шоколада. Бобы покупаем только на какао-часть, с запасом на шелуху."
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Какао (из бобов)">
          <Pct value={params.cocoaShare} onChange={(cocoaShare) => setParams({ cocoaShare })} />
        </Field>
        <Field label="Сахар">
          <Pct value={params.sugarShare} onChange={(sugarShare) => setParams({ sugarShare })} />
        </Field>
        <Field label="Сухое молоко">
          <Pct value={params.milkShare} onChange={(milkShare) => setParams({ milkShare })} />
        </Field>
        <Field label="Шелуха и мусор" hint="Сколько бобов уходит в отход при очистке. Закупка = очищенные / (1 − шелуха).">
          <Pct value={params.beanLoss} onChange={(beanLoss) => setParams({ beanLoss })} />
        </Field>
      </div>
      <p className={`mt-2 text-xs ${Math.abs(sum - 100) > 0.5 ? "text-brick" : "text-moss"}`}>
        Сумма: {sum.toFixed(0)} % {Math.abs(sum - 100) > 0.5 ? "— должна быть 100 %" : "✓"}
      </p>
    </Card>
  );
}
