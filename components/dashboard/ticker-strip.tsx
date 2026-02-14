import type { ArenaToken } from "@/lib/live-analytics";
import { cn } from "@/lib/utils";
import { formatCurrency, formatSignedPct } from "@/utils/format";

export function TickerStrip({ tokens }: { tokens: ArenaToken[] }) {
  return (
    <section
      aria-label="Live tape"
      className="group overflow-hidden rounded-xl border border-[#d7e4ff] bg-[var(--ticker-bg)] backdrop-blur-md"
    >
      <div className="flex w-max items-center gap-5 whitespace-nowrap px-2.5 py-2 [animation:marquee_24s_linear_infinite] group-hover:[animation-play-state:paused]">
        {[...tokens, ...tokens].map((token, idx) => {
          const move = token.priceChange[token.priceChange.length - 1] ?? 0;
          return (
            <p key={`${token.symbol}-${idx}`} className="m-0 inline-flex items-center gap-2 text-[0.8rem] text-[#2f3d5b]">
              <strong className="tracking-[0.04em] text-[#0f1b31]">{token.symbol}</strong>
              <span className={cn(move >= 0 ? "text-[#0f9f84]" : "text-[#ce355c]")}>{formatSignedPct(move)}</span>
              <em className="not-italic text-[#57698f]">{formatCurrency(token.marketCap)}</em>
            </p>
          );
        })}
      </div>
    </section>
  );
}
