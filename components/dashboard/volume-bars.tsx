import type { ArenaToken } from "@/lib/live-analytics";
import { formatCurrency } from "@/utils/format";

export function VolumeBars({ tokens }: { tokens: ArenaToken[] }) {
  const max = Math.max(...tokens.map((t) => t.volume24h));

  return (
    <section className="rounded-2xl border border-[var(--line)] bg-[var(--panel-bg)] p-[14px] shadow-[0_10px_24px_rgba(2,7,16,.35)] transition hover:-translate-y-[1px] hover:border-[#4b66a3] hover:shadow-[0_16px_32px_rgba(2,7,16,.45)]">
      <header className="mb-2.5 flex items-baseline justify-between gap-2.5">
        <h2 className="m-0 font-[var(--font-montserrat)] text-[1.12rem] font-extrabold text-[var(--ink)]">Volume Cannon</h2>
        <span className="text-[0.77rem] text-[var(--muted)]">24H Traded</span>
      </header>
      <div className="grid gap-2">
        {tokens.map((token) => (
          <article key={token.symbol} className="grid items-center gap-2 md:grid-cols-[96px_1fr_auto]">
            <div>
              <p className="m-0 text-[0.82rem] font-bold text-[var(--ink)]">{token.symbol}</p>
              <small className="text-[var(--muted)]">{token.chain}</small>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-[#1a2540]" aria-hidden="true">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent),var(--warning))] [animation:barPulse_2.4s_ease-in-out_infinite]"
                style={{ width: `${(token.volume24h / max) * 100}%` }}
              />
            </div>
            <strong className="text-[0.8rem] text-[var(--ink)]">{formatCurrency(token.volume24h)}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}
