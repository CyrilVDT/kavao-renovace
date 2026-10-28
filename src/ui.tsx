import type { ReactNode } from "react";

export function Card({
  title,
  hint,
  explain,
  id,
  children,
  className = "",
}: {
  title?: string;
  hint?: string;
  explain?: ReactNode;
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`rounded-2xl border border-cocoa/10 bg-white/80 p-4 shadow-sm print-break ${className}`}>
      {title && (
        <header className="mb-3">
          <h2 className="serif text-lg text-cocoa">{title}</h2>
          {hint && <p className="mt-1 text-xs text-ink/60">{hint}</p>}
        </header>
      )}
      {explain && (
        <div className="mb-3 space-y-1 rounded-xl bg-paper px-3 py-2 text-sm leading-relaxed text-ink/75">{explain}</div>
      )}
      {children}
    </section>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="flex items-center gap-1 font-medium text-ink/80">
        {label}
        {hint && (
          <abbr title={hint} className="cursor-help text-xs font-normal text-bronze no-underline">
            ?
          </abbr>
        )}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

export const inp =
  "w-full rounded-lg border border-cocoa/20 bg-paper px-3 py-2 text-sm outline-none focus:border-bronze";

export function Num({
  value,
  onChange,
  step = 1,
  min,
  max,
}: {
  value: number;
  onChange: (n: number) => void;
  step?: number;
  min?: number;
  max?: number;
}) {
  return (
    <input
      className={inp}
      type="number"
      value={Number.isFinite(value) ? value : ""}
      step={step}
      min={min}
      max={max}
      onChange={(e) => onChange(e.target.value === "" ? Number.NaN : Number(e.target.value))}
    />
  );
}

export function Pct({
  value,
  onChange,
}: {
  value: number;
  onChange: (frac: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        className={inp}
        type="number"
        step={0.1}
        min={0}
        max={99}
        value={Number((value * 100).toFixed(2))}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
      />
      <span className="text-xs text-ink/50">%</span>
    </div>
  );
}

export function Slide({
  value,
  min,
  max,
  step,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (n: number) => void;
}) {
  return (
    <input
      className="w-full accent-cocoa"
      type="range"
      min={min}
      max={max}
      step={step}
      value={Number.isFinite(value) ? value : min}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  );
}

export function plural(n: number, one: string, few: string, many: string) {
  const a = Math.abs(Math.round(n));
  if (a % 10 === 1 && a % 100 !== 11) return one;
  if (a % 10 >= 2 && a % 10 <= 4 && (a % 100 < 12 || a % 100 > 14)) return few;
  return many;
}

export const batchesLabel = (n: number) => `${n} ${plural(n, "партия", "партии", "партий")}`;

export function yearsLabel(v: number) {
  const s = new Intl.NumberFormat("cs-CZ", { maximumFractionDigits: 1 }).format(v);
  return s.includes(",") ? `${s} года` : `${s} ${plural(Math.round(v), "год", "года", "лет")}`;
}

export function Tip({ text }: { text: string }) {
  return (
    <abbr title={text} className="ml-1 cursor-help text-bronze no-underline">
      ?
    </abbr>
  );
}
