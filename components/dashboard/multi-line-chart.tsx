import type { WeeklyWar } from "@/components/dashboard/types";

export function MultiLineChart({ weeklyWars, symbols }: { weeklyWars: WeeklyWar[]; symbols: string[] }) {
  const series = [
    { key: "alpha", color: "#ff6b35", label: symbols[0] ?? "A" },
    { key: "beta", color: "#07beb8", label: symbols[1] ?? "B" },
    { key: "gamma", color: "#3a86ff", label: symbols[2] ?? "C" },
  ] as const;
  const allValues = weeklyWars.flatMap((week) => [week.alpha, week.beta, week.gamma]);
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  const range = Math.max(max - min, 1);

  return (
    <section className="rounded-2xl border border-[var(--line)] bg-[var(--panel-bg)] p-[14px] shadow-[0_8px_22px_rgba(17,29,54,.07)] transition hover:-translate-y-[3px] hover:border-[#cadbff] hover:shadow-[0_18px_36px_rgba(20,35,62,.12)] lg:col-span-2">
      <header className="mb-2.5 flex items-baseline justify-between gap-2.5">
        <h2 className="m-0 font-[var(--font-montserrat)] text-[1.12rem] font-extrabold text-[var(--ink)]">Battle Momentum</h2>
        <span className="text-[0.77rem] text-[var(--muted)]">7D Social Dominance</span>
      </header>
      <svg viewBox="0 0 640 260" className="h-auto w-full rounded-xl bg-[linear-gradient(180deg,#f3f7ff,#f8fbff)] dark:bg-[linear-gradient(180deg,#14233e,#101a30)]" role="img" aria-label="Momentum line chart">
        {[0, 1, 2, 3, 4].map((g) => (
          <line
            key={g}
            x1={42}
            x2={612}
            y1={26 + g * 52}
            y2={26 + g * 52}
            stroke="rgba(18,25,39,.12)"
            strokeWidth="1"
          />
        ))}
        {series.map((s, idx) => {
          const values = weeklyWars.map((w) => w[s.key]);
          const points = values
            .map((value, i) => {
              const x = 42 + (i * 570) / Math.max(values.length - 1, 1);
              const y = 234 - ((value - min) / range) * 170;
              return `${x},${y}`;
            })
            .join(" ");

          return (
            <g key={s.key}>
              <polyline
                fill="none"
                stroke={s.color}
                strokeWidth="4"
                points={points}
                strokeLinecap="round"
                className="[stroke-dasharray:620] [stroke-dashoffset:620] [animation:lineReveal_1.1s_ease_forwards]"
                style={{ animationDelay: `${idx * 0.15}s` }}
              />
              {values.map((value, i) => {
                const x = 42 + (i * 570) / Math.max(values.length - 1, 1);
                const y = 234 - ((value - min) / range) * 170;
                return <circle key={`${s.key}-${i}`} cx={x} cy={y} r="4" fill={s.color} />;
              })}
            </g>
          );
        })}
        {weeklyWars.map((w, i) => (
          <text
            key={w.day}
            x={42 + (i * 570) / Math.max(weeklyWars.length - 1, 1)}
            y={252}
            textAnchor="middle"
            className="fill-[#5b6a8a] text-[12px]"
          >
            {w.day}
          </text>
        ))}
      </svg>
      <div className="mt-2 flex flex-wrap gap-3.5 text-[0.8rem] text-[var(--muted)]">
        {series.map((seriesItem) => (
          <span key={seriesItem.key} className="inline-flex items-center">
            <i className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full" style={{ background: seriesItem.color }} />
            {seriesItem.label}
          </span>
        ))}
      </div>
    </section>
  );
}
