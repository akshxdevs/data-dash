import type { ArenaToken } from "@/lib/live-analytics";
import { cn } from "@/lib/utils";
import { linePath } from "@/utils/chart";
import { formatCompact, formatCurrency } from "@/utils/format";

export function LeaderboardTable({ tokens }: { tokens: ArenaToken[] }) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-[var(--line)] bg-[var(--panel-bg)] p-[14px] shadow-[0_8px_22px_rgba(17,29,54,.07)] transition hover:-translate-y-[3px] hover:border-[#cadbff] hover:shadow-[0_18px_36px_rgba(20,35,62,.12)] lg:col-span-3">
      <header className="flex items-baseline justify-between gap-2.5">
        <h2 className="m-0 font-[var(--font-montserrat)] text-[1.12rem] font-extrabold text-[var(--ink)]">Memecoin Command Table</h2>
        <span className="text-[0.77rem] text-[var(--muted)]">Ranked by Market Cap</span>
      </header>
      <div className="overflow-x-auto">
        <table className="min-w-[880px] w-full border-collapse">
          <thead>
            <tr>
              {[
                "#",
                "Token",
                "Chain",
                "Market Cap",
                "24H Volume",
                "Holders*",
                "Whales",
                "Sentiment",
                "7D Price Arc",
              ].map((th) => (
                <th key={th} className="sticky top-0 z-[1] border-b border-[var(--line)] bg-[#f4f8ff] px-2 py-2.5 text-left text-[0.73rem] uppercase tracking-[0.08em] text-[var(--muted)]">{th}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tokens.map((token, idx) => (
              <tr key={token.symbol} className="transition hover:bg-[#f8fbff]">
                <td className="border-b border-[var(--line)] px-2 py-2.5 text-[0.84rem]">{idx + 1}</td>
                <td className="border-b border-[var(--line)] px-2 py-2.5 text-[0.84rem]">
                  <strong className="text-[var(--ink)]">{token.symbol}</strong>
                  <small className="block text-[0.72rem] text-[var(--muted)]">{token.name}</small>
                </td>
                <td className="border-b border-[var(--line)] px-2 py-2.5 text-[0.84rem]">{token.chain}</td>
                <td className="border-b border-[var(--line)] px-2 py-2.5 text-[0.84rem]">{formatCurrency(token.marketCap)}</td>
                <td className="border-b border-[var(--line)] px-2 py-2.5 text-[0.84rem]">{formatCurrency(token.volume24h)}</td>
                <td className="border-b border-[var(--line)] px-2 py-2.5 text-[0.84rem]">{formatCompact(token.holders)}</td>
                <td className="border-b border-[var(--line)] px-2 py-2.5 text-[0.84rem]">{token.whales}</td>
                <td className="border-b border-[var(--line)] px-2 py-2.5 text-[0.84rem]">
                  <span
                    className={cn(
                      "inline-block rounded-full px-2 py-0.5 text-[0.76rem] font-bold",
                      token.sentiment > 68
                        ? "bg-[#d2f9f0] text-[#046e67]"
                        : token.sentiment > 57
                          ? "bg-[#fff2cf] text-[#9a6b00]"
                          : "bg-[#ffe0e7] text-[#9f2547]",
                    )}
                  >
                    {token.sentiment}
                  </span>
                </td>
                <td className="border-b border-[var(--line)] px-2 py-2.5 text-[0.84rem]">
                  <svg viewBox="0 0 120 34" className="h-[34px] w-[120px]" aria-hidden="true">
                    <path d={linePath(token.priceChange, 120, 34, 4)} fill="none" stroke="#121927" strokeWidth="2.5" />
                  </svg>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
