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
    <header className="relative overflow-hidden rounded-[28px] border border-[#32466f] bg-[linear-gradient(135deg,#151f37_0%,#3f2b7a_52%,#0e1321_100%)] p-6 text-[#f8fbff] shadow-[0_24px_60px_rgba(2,8,18,.42)] motion-safe:[animation:fadeUp_.65s_ease-out_both,heroBreath_10s_ease-in-out_infinite]">
      <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(147,125,255,.45),rgba(147,125,255,0))]" />
      <p className="m-0 text-[0.68rem] uppercase tracking-[0.18em] text-[#a9b9ff]">AI Narrative Index</p>
      <h1 className="mt-2 max-w-[760px] font-[var(--font-montserrat)] text-[clamp(1.75rem,4vw,2.7rem)] font-extrabold leading-[1.1]">
        Token Matrix
      </h1>
      <p className="max-w-[760px] text-[#c5cdee]">
        Liquidity deepening and velocity acceleration across your selected cohort.
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2.5">
        <span className={cn("rounded-full px-2.5 py-1 text-[0.7rem] font-bold uppercase tracking-[.08em]", source === "live" ? "bg-[#113834] text-[#86f6de]" : "bg-[#3f3316] text-[#ffd899]")}>{source === "live" ? "Live Data" : "Fallback Data"}</span>
        <small className="text-[#b4c3ea]">Updated {formatLocalTime(lastUpdated)}</small>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <article className="rounded-2xl border border-[#3d4f78] bg-[rgba(11,18,33,.55)] p-3.5 backdrop-blur-md">
          <small className="text-[#d4dcf6]">Narrative Score</small>
          <h2 className="mt-1 font-[var(--font-montserrat)] text-[1.35rem] font-extrabold">{averageSentiment}/100</h2>
        </article>
        <article className="rounded-2xl border border-[#3d4f78] bg-[rgba(11,18,33,.55)] p-3.5 backdrop-blur-md">
          <small className="text-[#d4dcf6]">Combined Market Cap</small>
          <h2 className="mt-1 font-[var(--font-montserrat)] text-[1.35rem] font-extrabold">{formatCurrency(totalCap)}</h2>
        </article>
        <article className="rounded-2xl border border-[#3d4f78] bg-[rgba(11,18,33,.55)] p-3.5 backdrop-blur-md">
          <small className="text-[#d4dcf6]">24H Arena Volume</small>
          <h2 className="mt-1 font-[var(--font-montserrat)] text-[1.35rem] font-extrabold">{formatCurrency(totalVolume)}</h2>
        </article>
      </div>

      <div className="mt-3 grid gap-2 lg:grid-cols-3">
        {movers.slice(0, 3).map((mover) => (
          <article key={mover.symbol} className="rounded-xl border border-[#2a3657] bg-[rgba(11,18,33,.7)] px-2.5 py-2">
            <p className="m-0 text-xs text-[#d7e2f9]">{mover.symbol}</p>
            <strong className={cn("mt-1 block text-base", mover.change >= 0 ? "text-[#b9ffc6]" : "text-[#ff9f9f]")}>{formatSignedPct(mover.change)}</strong>
            <small className="text-[0.72rem] text-[#c2d2f2]">Sentiment {mover.sentiment}</small>
          </article>
        ))}
      </div>
      <p className="mt-3 text-[0.65rem] uppercase tracking-[0.12em] text-[#8fa0cc]">
        Cohort: {tokens.length} tokens · Momentum Win Rate: {Math.round((positiveCount / Math.max(tokens.length, 1)) * 100)}%
      </p>
    </header>
  );
}
