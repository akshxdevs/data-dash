export function HeatMatrix({
  heatMapRows,
  heatMapCols,
  heatMap,
}: {
  heatMapRows: string[];
  heatMapCols: string[];
  heatMap: number[][];
}) {
  const gridStyle = {
    gridTemplateColumns: `1.2fr repeat(${heatMapCols.length}, minmax(0, 1fr))`,
  } as const;

  return (
    <section className="rounded-2xl border border-[var(--line)] bg-[var(--panel-bg)] p-[14px] shadow-[0_8px_22px_rgba(17,29,54,.07)] transition hover:-translate-y-[3px] hover:border-[#cadbff] hover:shadow-[0_18px_36px_rgba(20,35,62,.12)] lg:col-span-2">
      <header className="mb-2.5 flex items-baseline justify-between gap-2.5">
        <h2 className="m-0 font-[var(--font-montserrat)] text-[1.12rem] font-extrabold text-[var(--ink)]">Geo Hype Heat</h2>
        <span className="text-[0.77rem] text-[var(--muted)]">Engagement Index</span>
      </header>
      <div className="overflow-hidden rounded-xl border border-[var(--line)]" role="table" aria-label="Geo hype heat map">
        <div className="grid bg-[#f2f6ff]" role="row" style={gridStyle}>
          <span className="border-b border-r border-[var(--line)] px-2 py-2.5" />
          {heatMapCols.map((col) => (
            <strong key={col} className="border-b border-r border-[var(--line)] px-2 py-2.5 text-center text-[0.78rem]">{col}</strong>
          ))}
        </div>
        {heatMap.map((row, rowIdx) => (
          <div className="grid" role="row" key={heatMapRows[rowIdx]} style={gridStyle}>
            <strong className="border-b border-r border-[var(--line)] px-2 py-2.5 text-left text-[0.82rem] text-[var(--ink)]">{heatMapRows[rowIdx]}</strong>
            {row.map((cell, idx) => (
              <span
                key={`${rowIdx}-${idx}`}
                style={{ opacity: 0.25 + cell / 140 }}
                className="border-b border-r border-[var(--line)] bg-[linear-gradient(120deg,#fb8500,#ffb703)] px-2 py-2.5 text-center text-[0.78rem] font-bold text-[#172137]"
              >
                {cell}
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
