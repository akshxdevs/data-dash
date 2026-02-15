import type { ArenaToken } from "@/lib/live-analytics";
import { formatCompact } from "@/utils/format";

export function VolumeBars({ tokens }: { tokens: ArenaToken[] }) {
  const ranked = [...tokens].sort((a, b) => b.socials[b.socials.length - 1] - a.socials[a.socials.length - 1]).slice(0, 4);
  const maxSocial = Math.max(...ranked.map((t) => t.socials[t.socials.length - 1] ?? 1), 1);
  const whaleRanked = [...tokens].sort((a, b) => b.volume24h - a.volume24h).slice(0, 4);
  const maxWhaleVolume = Math.max(...whaleRanked.map((t) => t.volume24h), 1);
  const narrativeIndex = Math.max(
    45,
    Math.min(
      99,
      Math.round(
        ranked.reduce((sum, token) => sum + token.sentiment * 0.65 + (token.priceChange[token.priceChange.length - 1] ?? 0) * 2.2, 0) /
          Math.max(ranked.length, 1),
      ),
    ),
  );
  const topGainers = ranked
    .map((token) => ({ symbol: token.symbol, move: token.priceChange[token.priceChange.length - 1] ?? 0 }))
    .sort((a, b) => b.move - a.move)
    .slice(0, 2);
  const barPalette = ["#26355A", "#2E4C8E", "#07BEB8", "#60EFFF"];
  const whaleBarPalette = ["#6A3030", "#A13A31", "#FF7747", "#E54F3A"];
  const netWhaleBuys = whaleRanked.reduce((sum, token) => sum + token.volume24h * (token.whales / 1000), 0);

  return (
    <section className="rounded-2xl border border-[var(--line)] bg-[var(--panel-bg)] p-[14px] shadow-[0_10px_24px_rgba(2,7,16,.35)] transition hover:-translate-y-[1px] hover:border-[#4b66a3] hover:shadow-[0_16px_32px_rgba(2,7,16,.45)]">
      <header className="mb-2.5 flex items-baseline justify-between gap-2.5">
        <h2 className="m-0 font-[var(--font-montserrat)] text-[1.12rem] font-extrabold text-[var(--ink)]">Token Matrix + Velocity</h2>
        <span className="text-[0.74rem] text-[#4d67a4] dark:text-[#8fb2ff]">Dual Graph View</span>
      </header>
      <div className="grid gap-3">
        <div className="rounded-2xl border border-[#bfd0f2] bg-[linear-gradient(135deg,#eaf1ff_0%,#dde8ff_58%,#f4f8ff_100%)] p-3.5 dark:border-[#3D4F78] dark:bg-[linear-gradient(135deg,#18233B_0%,#3F2B7A_58%,#0E1321_100%)]">
          <p className="m-0 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#4b66a4] dark:text-[#A9B9FF]">AI Narrative Index</p>
          <p className="mt-1 font-[var(--font-montserrat)] text-[2rem] font-extrabold leading-none text-[#21385f] dark:text-[#E8EEFF]">
            {narrativeIndex} / 100
          </p>
          <p className="mt-1 text-[0.72rem] text-[#4b6398] dark:text-[#C5CDEE]">
            {topGainers[0]?.symbol ?? "DOGE"} {topGainers[0]?.move >= 0 ? "+" : ""}
            {topGainers[0]?.move.toFixed(1) ?? "0.0"}% · {topGainers[1]?.symbol ?? "PEPE"} {topGainers[1]?.move >= 0 ? "+" : ""}
            {topGainers[1]?.move.toFixed(1) ?? "0.0"}%
          </p>
          <div className="mt-3 grid h-[90px] grid-cols-4 items-end gap-2" aria-label="Token matrix bar graph">
            {ranked.map((token, idx) => {
              const socialValue = token.socials[token.socials.length - 1] ?? 0;
              const barHeight = Math.max(20, Math.round((socialValue / maxSocial) * 82));
              return (
                <div key={token.id} className="flex flex-col items-stretch gap-1">
                  <div
                    className="w-full rounded-lg [animation:barPulse_2.4s_ease-in-out_infinite]"
                    style={{ height: `${barHeight}px`, background: barPalette[idx] ?? "#60EFFF", animationDelay: `${idx * 0.14}s` }}
                    title={`${token.symbol}: ${formatCompact(socialValue)}`}
                  />
                  <span className="text-center text-[0.6rem] font-semibold tracking-[0.04em] text-[#4b669d] dark:text-[#BFD1FF]">{token.symbol}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-2.5 flex items-center justify-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#26355A]" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#2E4C8E]" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#07BEB8]" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#60EFFF]" />
          </div>
        </div>

        <div className="rounded-2xl border border-[#e0b4ac] bg-[linear-gradient(135deg,#fff3ef_0%,#ffd9cc_55%,#ffe9df_100%)] p-3.5 dark:border-[#7A2C2C] dark:bg-[linear-gradient(135deg,#2A1010_0%,#6B1E12_55%,#1B0E16_100%)]">
          <p className="m-0 text-[0.78rem] font-semibold text-[#8f3521] dark:text-[#FFD6C8]">Net Whale Buys</p>
          <p className="mt-1 font-[var(--font-montserrat)] text-[2rem] font-extrabold leading-none text-[#5b2115] dark:text-[#FFF4EF]">
            +${formatCompact(netWhaleBuys)}
          </p>
          <div className="mt-3 grid h-[90px] grid-cols-4 items-end gap-2" aria-label="Whale velocity bar graph">
            {whaleRanked.map((token, idx) => {
              const barHeight = Math.max(20, Math.round((token.volume24h / maxWhaleVolume) * 82));
              return (
                <div key={token.id} className="flex flex-col items-stretch gap-1">
                  <div
                    className="w-full rounded-lg [animation:barPulse_2.4s_ease-in-out_infinite]"
                    style={{ height: `${barHeight}px`, background: whaleBarPalette[idx] ?? "#E54F3A", animationDelay: `${idx * 0.12}s` }}
                    title={`${token.symbol}: ${formatCompact(token.volume24h)}`}
                  />
                  <span className="text-center text-[0.6rem] font-semibold tracking-[0.04em] text-[#a44b36] dark:text-[#FFB29A]">{token.symbol}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-2.5 flex items-center justify-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#6A3030]" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#A13A31]" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#FF7747]" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#E54F3A]" />
          </div>
        </div>
      </div>
    </section>
  );
}
