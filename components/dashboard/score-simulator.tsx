import type { ArenaToken } from "@/lib/live-analytics";

export function ScoreSimulator({ tokens }: { tokens: ArenaToken[] }) {
  const avgSentiment = Math.round(tokens.reduce((a, t) => a + t.sentiment, 0) / tokens.length);
  const avgWhales = Math.round(tokens.reduce((a, t) => a + t.whales, 0) / tokens.length);
  const avgVelocity = tokens.reduce((a, t) => a + t.volume24h / Math.max(t.marketCap, 1), 0) / tokens.length;

  const battleIndex = Math.max(45, Math.min(95, avgSentiment + 14 - Math.floor(avgWhales / 8) + Math.round(avgVelocity * 20)));

  return (
    <section className="rounded-2xl border border-[var(--line)] bg-[var(--panel-bg)] p-[14px] shadow-[0_8px_22px_rgba(17,29,54,.07)] transition hover:-translate-y-[3px] hover:border-[#cadbff] hover:shadow-[0_18px_36px_rgba(20,35,62,.12)]">
      <header className="mb-2.5 flex items-baseline justify-between gap-2.5">
        <h2 className="m-0 font-[var(--font-montserrat)] text-[1.12rem] font-extrabold text-[var(--ink)]">Alpha Strategy Lab</h2>
        <span className="text-[0.77rem] text-[var(--muted)]">Unique Utility</span>
      </header>
      <p className="m-0 text-[0.82rem] text-[var(--muted)]">
        Live edge score blends momentum, whale pressure, and velocity. Use it as a tactical layer rather than a standalone trading signal.
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <article className="rounded-xl border border-[#dbe6ff] bg-[#f8fbff] p-2.5 dark:border-[#26375b] dark:bg-[#101a2f]">
          <small className="text-[0.74rem] text-[var(--muted)]">Battle Index</small>
          <h3 className="mt-1 m-0 font-[var(--font-montserrat)] text-[1.05rem] font-extrabold text-[var(--ink)]">{battleIndex}</h3>
        </article>
        <article className="rounded-xl border border-[#dbe6ff] bg-[#f8fbff] p-2.5 dark:border-[#26375b] dark:bg-[#101a2f]">
          <small className="text-[0.74rem] text-[var(--muted)]">Risk Temperature</small>
          <h3 className="mt-1 m-0 font-[var(--font-montserrat)] text-[1.05rem] font-extrabold text-[var(--ink)]">{avgWhales > 60 ? "High" : avgWhales > 45 ? "Medium" : "Low"}</h3>
        </article>
        <article className="rounded-xl border border-[#dbe6ff] bg-[#f8fbff] p-2.5 dark:border-[#26375b] dark:bg-[#101a2f]">
          <small className="text-[0.74rem] text-[var(--muted)]">Sentiment Floor</small>
          <h3 className="mt-1 m-0 font-[var(--font-montserrat)] text-[1.05rem] font-extrabold text-[var(--ink)]">{avgSentiment}</h3>
        </article>
      </div>
    </section>
  );
}
