import type { ArenaToken } from "@/lib/live-analytics";
import { cn } from "@/lib/utils";
import { formatCurrency, formatLocalTime, formatSignedPct } from "@/utils/format";

export function HeroSection({
  source,
  lastUpdated,
  totalCap,
  totalVolume,
  averageSentiment,
  positiveCount,
  tokens,
}: {
  source: "live" | "fallback";
  lastUpdated: string;
  totalCap: number;
  totalVolume: number;
  averageSentiment: number;
  positiveCount: number;
  tokens: ArenaToken[];
}) {
  const movers = tokens
    .map((token) => ({
      symbol: token.symbol,
      change: token.priceChange[token.priceChange.length - 1] ?? 0,
      sentiment: token.sentiment,
    }))
    .sort((a, b) => b.change - a.change);

  return (
    <header className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(130deg,#101b31_0%,#17284a_55%,#1e315a_100%)] p-7 text-[#f8fbff] shadow-[0_20px_55px_rgba(9,17,31,.28)]">
      <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(255,183,3,.65),rgba(255,183,3,0))]" />
      <p className="m-0 text-[0.72rem] uppercase tracking-[0.16em] opacity-85">Memecoin Arena Analytics</p>
      <h1 className="mt-2 max-w-[760px] font-[var(--font-montserrat)] text-[clamp(1.85rem,4.3vw,3rem)] font-extrabold leading-[1.12]">
        Battlefield Intelligence for Degens and Data Nerds
      </h1>
      <p className="max-w-[760px] text-[#d6deef]">
        Live market dashboard with momentum, wallet flow, geo hype, and risk temperature. Refreshes every five minutes with a safe fallback mode.
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2.5">
        <span className={cn("rounded-full px-2.5 py-1 text-[0.72rem] font-bold uppercase tracking-[.06em]", source === "live" ? "bg-[#d2f9f0] text-[#095d56]" : "bg-[#ffe8c3] text-[#8f5d00]")}>{source === "live" ? "Live Data" : "Fallback Data"}</span>
        <small className="text-[#c7d5f2]">Updated {formatLocalTime(lastUpdated)}</small>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full border border-[rgba(225,237,255,.18)] bg-[rgba(255,255,255,.1)] px-2.5 py-1.5 text-[0.75rem] text-[#dce7ff]">Momentum Win Rate: {Math.round((positiveCount / Math.max(tokens.length, 1)) * 100)}%</span>
        <span className="rounded-full border border-[rgba(225,237,255,.18)] bg-[rgba(255,255,255,.1)] px-2.5 py-1.5 text-[0.75rem] text-[#dce7ff]">Live Cohort: {tokens.length} tokens tracked</span>
        <span className="rounded-full border border-[rgba(225,237,255,.18)] bg-[rgba(255,255,255,.1)] px-2.5 py-1.5 text-[0.75rem] text-[#dce7ff]">Flow Mode: Adaptive Signal Engine</span>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <article className="rounded-2xl border border-[rgba(226,239,255,.2)] bg-[rgba(255,255,255,.09)] p-3.5 backdrop-blur-md">
          <small className="text-[#dce5f7]">Combined Market Cap</small>
          <h2 className="mt-1 font-[var(--font-montserrat)] text-[1.35rem] font-extrabold">{formatCurrency(totalCap)}</h2>
        </article>
        <article className="rounded-2xl border border-[rgba(226,239,255,.2)] bg-[rgba(255,255,255,.09)] p-3.5 backdrop-blur-md">
          <small className="text-[#dce5f7]">24H Arena Volume</small>
          <h2 className="mt-1 font-[var(--font-montserrat)] text-[1.35rem] font-extrabold">{formatCurrency(totalVolume)}</h2>
        </article>
        <article className="rounded-2xl border border-[rgba(226,239,255,.2)] bg-[rgba(255,255,255,.09)] p-3.5 backdrop-blur-md">
          <small className="text-[#dce5f7]">Avg Sentiment</small>
          <h2 className="mt-1 font-[var(--font-montserrat)] text-[1.35rem] font-extrabold">{averageSentiment}/100</h2>
        </article>
      </div>

      <div className="mt-3 grid gap-2 lg:grid-cols-3">
        {movers.slice(0, 3).map((mover) => (
          <article key={mover.symbol} className="rounded-xl border border-[rgba(231,239,255,.2)] bg-[rgba(255,255,255,.07)] px-2.5 py-2">
            <p className="m-0 text-xs text-[#d7e2f9]">{mover.symbol}</p>
            <strong className={cn("mt-1 block text-base", mover.change >= 0 ? "text-[#0f9f84]" : "text-[#ce355c]")}>{formatSignedPct(mover.change)}</strong>
            <small className="text-[0.72rem] text-[#c2d2f2]">Sentiment {mover.sentiment}</small>
          </article>
        ))}
      </div>
    </header>
  );
}
