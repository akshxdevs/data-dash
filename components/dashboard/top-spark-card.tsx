import type { ArenaToken } from "@/lib/live-analytics";
import { cn } from "@/lib/utils";
import { areaPath, linePath } from "@/utils/chart";
import { formatSignedPct } from "@/utils/format";

const SPARK_COLORS: Record<string, { line: string; gradient: string }> = {
  DOGE: { line: "#ff8c42", gradient: "rgba(255,140,66,.55)" },
  SHIB: { line: "#22c55e", gradient: "rgba(34,197,94,.52)" },
  PEPE: { line: "#14b8a6", gradient: "rgba(20,184,166,.52)" },
  BONK: { line: "#a78bfa", gradient: "rgba(167,139,250,.52)" },
};

export function TopSparkCard({ token }: { token: ArenaToken }) {
  const latestMove = token.priceChange[token.priceChange.length - 1] ?? 0;
  const sparkColor = SPARK_COLORS[token.symbol] ?? {
    line: "#ffd60a",
    gradient: "rgba(255,214,10,.6)",
  };

  return (
    <article className="grid gap-1.5 rounded-2xl border border-[var(--line)] bg-[var(--surface-2)] p-3 transition duration-300 hover:-translate-y-1 hover:border-[#4b66a3] hover:shadow-[0_16px_30px_rgba(2,7,16,.38)]">
      <div>
        <p className="m-0 text-xs tracking-[0.08em] text-[var(--muted)]">{token.symbol}</p>
        <h3 className="mt-0.5 font-[var(--font-montserrat)] text-xl font-extrabold text-[var(--ink)]">{token.sentiment}/100</h3>
        <p className={cn("m-0 text-[0.78rem] font-bold", latestMove >= 0 ? "text-[#b9ffc6]" : "text-[#ff9f9f]")}>{formatSignedPct(latestMove)} 7D</p>
      </div>
      <svg viewBox="0 0 210 74" className="h-[74px] w-full" aria-hidden="true">
        <defs>
          <linearGradient id={`spark-${token.symbol}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={sparkColor.gradient} />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>
        <path d={areaPath(token.socials, 210, 74, 8)} fill={`url(#spark-${token.symbol})`} />
        <path d={linePath(token.socials, 210, 74, 8)} fill="none" stroke={sparkColor.line} strokeWidth="3" />
      </svg>
    </article>
  );
}
