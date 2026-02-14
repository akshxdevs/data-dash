import type { WalletFlow } from "@/components/dashboard/types";
import { formatCompact } from "@/utils/format";

export function DonutFlow({ walletFlows }: { walletFlows: WalletFlow[] }) {
  const total = walletFlows.reduce((acc, cur) => acc + cur.value, 0);
  const colors = ["#ff6b35", "#ffb703", "#219ebc", "#8338ec"];

  const segments = walletFlows.reduce<Array<{ label: string; value: number; start: number; end: number; color: string }>>(
    (acc, flow, idx) => {
      const prior = acc[acc.length - 1];
      const start = prior ? prior.end : 0;
      const end = start + (flow.value / total) * 360;
      acc.push({ ...flow, start, end, color: colors[idx] });
      return acc;
    },
    [],
  );

  const describeArc = (startAngle: number, endAngle: number) => {
    const r = 74;
    const cx = 90;
    const cy = 90;
    const start = ((startAngle - 90) * Math.PI) / 180;
    const end = ((endAngle - 90) * Math.PI) / 180;
    const x1 = cx + r * Math.cos(start);
    const y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end);
    const y2 = cy + r * Math.sin(end);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  return (
    <section className="rounded-2xl border border-[var(--line)] bg-[var(--panel-bg)] p-[14px] shadow-[0_8px_22px_rgba(17,29,54,.07)] transition hover:-translate-y-[3px] hover:border-[#cadbff] hover:shadow-[0_18px_36px_rgba(20,35,62,.12)]">
      <header className="mb-2.5 flex items-baseline justify-between gap-2.5">
        <h2 className="m-0 font-[var(--font-montserrat)] text-[1.12rem] font-extrabold text-[var(--ink)]">Wallet Flow Split</h2>
        <span className="text-[0.77rem] text-[var(--muted)]">Live Blend</span>
      </header>
      <div className="grid items-center gap-2 md:grid-cols-[190px_1fr]">
        <svg viewBox="0 0 180 180" className="w-full max-w-[180px] [filter:drop-shadow(0_8px_14px_rgba(14,23,40,.1))]" role="img" aria-label="Wallet flow donut chart">
          <circle cx="90" cy="90" r="74" fill="none" stroke="rgba(31,42,68,.1)" strokeWidth="22" />
          {segments.map((seg) => (
            <path
              key={seg.label}
              d={describeArc(seg.start, seg.end)}
              fill="none"
              stroke={seg.color}
              strokeWidth="22"
              strokeLinecap="round"
            />
          ))}
          <text x="90" y="84" textAnchor="middle" className="fill-[var(--ink)] text-[18px] font-bold">{formatCompact(total)}</text>
          <text x="90" y="104" textAnchor="middle" className="fill-[var(--muted)] text-[11px]">wallet moves</text>
        </svg>
        <div className="grid gap-1.5 text-[0.83rem]">
          {segments.map((seg) => (
            <p key={seg.label} className="m-0 flex items-center justify-between gap-2 text-[var(--ink)]">
              <span className="inline-flex items-center gap-1.5">
                <i className="inline-block h-[9px] w-[9px] rounded-full" style={{ background: seg.color }} />
                {seg.label}
              </span>
              <strong>{seg.value}</strong>
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
