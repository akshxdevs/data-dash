import type { ArenaToken } from "@/lib/live-analytics";

export function ScoreSimulator({ tokens }: { tokens: ArenaToken[] }) {
  const avgSentiment = Math.round(tokens.reduce((a, t) => a + t.sentiment, 0) / tokens.length);
  const avgWhales = Math.round(tokens.reduce((a, t) => a + t.whales, 0) / tokens.length);
  const avgVelocity = tokens.reduce((a, t) => a + t.volume24h / Math.max(t.marketCap, 1), 0) / tokens.length;

  const battleIndex = Math.max(45, Math.min(95, avgSentiment + 14 - Math.floor(avgWhales / 8) + Math.round(avgVelocity * 20)));

  return (
    <section className="panel simulator">
      <header className="panel-head">
        <h2>Alpha Strategy Lab</h2>
        <span>Unique Utility</span>
      </header>
      <p>
        Live edge score blends momentum, whale pressure, and velocity. Use it as a tactical layer rather than a standalone trading signal.
      </p>
      <div className="sim-values">
        <article>
          <small>Battle Index</small>
          <h3>{battleIndex}</h3>
        </article>
        <article>
          <small>Risk Temperature</small>
          <h3>{avgWhales > 60 ? "High" : avgWhales > 45 ? "Medium" : "Low"}</h3>
        </article>
        <article>
          <small>Sentiment Floor</small>
          <h3>{avgSentiment}</h3>
        </article>
      </div>
    </section>
  );
}
