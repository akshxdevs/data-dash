"use client";

import { useEffect, useMemo, useState } from "react";

import { DonutFlow } from "@/components/dashboard/donut-flow";
import { AppBar } from "@/components/dashboard/app-bar";
import { HeatMatrix } from "@/components/dashboard/heat-matrix";
import { HeroSection } from "@/components/dashboard/hero-section";
import { LeaderboardTable } from "@/components/dashboard/leaderboard-table";
import { MultiLineChart } from "@/components/dashboard/multi-line-chart";
import { TickerStrip } from "@/components/dashboard/ticker-strip";
import { TopSparkCard } from "@/components/dashboard/top-spark-card";
import { VolumeBars } from "@/components/dashboard/volume-bars";
import { cn } from "@/lib/utils";
import { linePath } from "@/utils/chart";
import { formatCompact, formatCurrency, formatSignedPct } from "@/utils/format";

import type { ArenaDashboardData, ArenaInterval, WatchCoin } from "@/lib/live-analytics";

type Preset = { name: string; ids: string[] };
type AlertRule = {
  id: string;
  tokenId: string;
  metric: "sentiment" | "move" | "volume";
  operator: ">" | "<";
  value: number;
  enabled: boolean;
  webhookUrl?: string;
  lastTriggeredAt?: number;
};

type NotificationItem = {
  id: string;
  text: string;
  at: number;
};

const INTERVALS: ArenaInterval[] = ["1h", "24h", "7d", "30d"];

function metricValue(rule: AlertRule, token: ArenaDashboardData["tokens"][number]) {
  if (rule.metric === "sentiment") return token.sentiment;
  if (rule.metric === "move") return token.priceChange[token.priceChange.length - 1] ?? 0;
  return token.volume24h;
}

function signalScore(signal: { momentum: number; velocity: number; holderStrength: number; whalePenalty: number }) {
  return Math.round(signal.momentum * 0.35 + signal.velocity * 0.3 + signal.holderStrength * 0.25 - signal.whalePenalty * 0.2);
}

function correlation(a: number[], b: number[]) {
  if (a.length !== b.length || a.length < 2) return 0;
  const meanA = a.reduce((sum, v) => sum + v, 0) / a.length;
  const meanB = b.reduce((sum, v) => sum + v, 0) / b.length;

  let num = 0;
  let denA = 0;
  let denB = 0;

  for (let i = 0; i < a.length; i += 1) {
    const da = a[i] - meanA;
    const db = b[i] - meanB;
    num += da * db;
    denA += da * da;
    denB += db * db;
  }

  const den = Math.sqrt(denA * denB);
  return den === 0 ? 0 : num / den;
}

async function postWebhook(url: string, message: string) {
  await fetch("/api/alerts/webhook", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      url,
      payload: {
        text: message,
        source: "Data Dash",
        timestamp: new Date().toISOString(),
      },
    }),
  });
}

const panelCls =
  "rounded-2xl border border-[var(--line)] bg-[var(--panel-bg)] p-[14px] shadow-[0_8px_22px_rgba(17,29,54,.07)] transition hover:-translate-y-[3px] hover:border-[#cadbff] hover:shadow-[0_18px_36px_rgba(20,35,62,.12)]";

const controlInputCls =
  "rounded-[9px] border border-[#d4e0fb] bg-white px-2.5 py-[7px] text-[0.8rem] text-[#2b3d61] outline-none focus:border-[#90b2ff]";

export function DashboardShell({
  initialData,
  availableCoins,
}: {
  initialData: ArenaDashboardData;
  availableCoins: WatchCoin[];
}) {
  const defaultIds = initialData.tokens.map((token) => token.id);

  const [data, setData] = useState(initialData);
  const [interval, setInterval] = useState<ArenaInterval>(initialData.interval);
  const [watchlistIds, setWatchlistIds] = useState<string[]>(defaultIds);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [loading, setLoading] = useState(false);

  const [presets, setPresets] = useState<Preset[]>([]);
  const [presetName, setPresetName] = useState("");

  const [alerts, setAlerts] = useState<AlertRule[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [alertForm, setAlertForm] = useState<Omit<AlertRule, "id" | "enabled">>({
    tokenId: defaultIds[0] ?? availableCoins[0]?.id ?? "",
    metric: "move",
    operator: ">",
    value: 5,
    webhookUrl: "",
  });

  const [compareA, setCompareA] = useState(defaultIds[0] ?? "");
  const [compareB, setCompareB] = useState(defaultIds[1] ?? defaultIds[0] ?? "");

  useEffect(() => {
    const savedTheme = localStorage.getItem("arena_theme");
    const savedWatchlist = localStorage.getItem("arena_watchlist");
    const savedPresets = localStorage.getItem("arena_presets");
    const savedAlerts = localStorage.getItem("arena_alerts");

    if (savedTheme === "dark" || savedTheme === "light") {
      setTheme(savedTheme);
    }

    if (savedWatchlist) {
      const parsed = JSON.parse(savedWatchlist) as string[];
      if (Array.isArray(parsed) && parsed.length >= 3) {
        setWatchlistIds(parsed);
      }
    }

    if (savedPresets) {
      const parsed = JSON.parse(savedPresets) as Preset[];
      if (Array.isArray(parsed)) setPresets(parsed);
    }

    if (savedAlerts) {
      const parsed = JSON.parse(savedAlerts) as AlertRule[];
      if (Array.isArray(parsed)) setAlerts(parsed);
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("arena_theme", theme);
  }, [theme]);

  useEffect(() => {
    if (watchlistIds.length < 3) return;

    localStorage.setItem("arena_watchlist", JSON.stringify(watchlistIds));

    const controller = new AbortController();
    let active = true;
    const run = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams({
          interval,
          ids: watchlistIds.join(","),
        });
        const response = await fetch(`/api/arena?${query.toString()}`, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) return;
        const payload = (await response.json()) as ArenaDashboardData;
        if (active) setData(payload);
      } catch (error) {
        const isAbort = error instanceof DOMException && error.name === "AbortError";
        if (!isAbort) {
          console.error("Arena refresh failed", error);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    run().catch(() => undefined);

    return () => {
      active = false;
      controller.abort();
    };
  }, [interval, watchlistIds]);

  useEffect(() => {
    const tokenIds = data.tokens.map((token) => token.id);
    if (!tokenIds.includes(compareA)) setCompareA(tokenIds[0] ?? "");
    if (!tokenIds.includes(compareB)) setCompareB(tokenIds[1] ?? tokenIds[0] ?? "");
    if (!tokenIds.includes(alertForm.tokenId)) {
      setAlertForm((prev) => ({ ...prev, tokenId: tokenIds[0] ?? "" }));
    }
  }, [data.tokens, compareA, compareB, alertForm.tokenId]);

  useEffect(() => {
    const cooldownMs = 15 * 60 * 1000;

    setAlerts((prev) => {
      let changed = false;

      const next = prev.map((rule) => {
        if (!rule.enabled) return rule;
        const token = data.tokens.find((item) => item.id === rule.tokenId);
        if (!token) return rule;

        const value = metricValue(rule, token);
        const triggered = rule.operator === ">" ? value > rule.value : value < rule.value;

        if (!triggered) return rule;
        if (rule.lastTriggeredAt && Date.now() - rule.lastTriggeredAt < cooldownMs) return rule;

        changed = true;
        const text = `Alert: ${token.symbol} ${rule.metric} ${rule.operator} ${rule.value} (current: ${rule.metric === "volume" ? formatCurrency(value) : value.toFixed(2)})`;

        setNotifications((old) => [{ id: crypto.randomUUID(), text, at: Date.now() }, ...old].slice(0, 8));

        if (rule.webhookUrl) {
          postWebhook(rule.webhookUrl, text).catch(() => undefined);
        }

        return { ...rule, lastTriggeredAt: Date.now() };
      });

      if (changed) {
        localStorage.setItem("arena_alerts", JSON.stringify(next));
      }

      return next;
    });
  }, [data]);

  const compareTokenA = useMemo(() => data.tokens.find((token) => token.id === compareA), [data.tokens, compareA]);
  const compareTokenB = useMemo(() => data.tokens.find((token) => token.id === compareB), [data.tokens, compareB]);

  const compareCorrelation = useMemo(() => {
    if (!compareTokenA || !compareTokenB) return 0;
    return correlation(compareTokenA.priceChange, compareTokenB.priceChange);
  }, [compareTokenA, compareTokenB]);

  const relativeDiff = useMemo(() => {
    if (!compareTokenA || !compareTokenB) return [0, 0, 0, 0, 0, 0, 0];
    return compareTokenA.priceChange.map((value, idx) => value - (compareTokenB.priceChange[idx] ?? 0));
  }, [compareTokenA, compareTokenB]);

  const totalCap = data.tokens.reduce((acc, token) => acc + token.marketCap, 0);
  const totalVolume = data.tokens.reduce((acc, token) => acc + token.volume24h, 0);
  const averageSentiment = Math.round(data.tokens.reduce((acc, token) => acc + token.sentiment, 0) / data.tokens.length);
  const positiveCount = data.tokens.filter((token) => (token.priceChange[token.priceChange.length - 1] ?? 0) > 0).length;

  const toggleWatch = (id: string) => {
    setWatchlistIds((prev) => {
      if (prev.includes(id)) {
        if (prev.length <= 3) return prev;
        return prev.filter((item) => item !== id);
      }
      return [...prev, id];
    });
  };

  const savePreset = () => {
    const name = presetName.trim();
    if (!name || watchlistIds.length < 3) return;
    const next = [{ name, ids: watchlistIds }, ...presets.filter((p) => p.name !== name)].slice(0, 8);
    setPresets(next);
    localStorage.setItem("arena_presets", JSON.stringify(next));
    setPresetName("");
  };

  const addAlert = () => {
    if (!alertForm.tokenId) return;
    const next: AlertRule[] = [{ id: crypto.randomUUID(), ...alertForm, enabled: true }, ...alerts].slice(0, 12);
    setAlerts(next);
    localStorage.setItem("arena_alerts", JSON.stringify(next));
  };

  const removeAlert = (id: string) => {
    const next = alerts.filter((rule) => rule.id !== id);
    setAlerts(next);
    localStorage.setItem("arena_alerts", JSON.stringify(next));
  };

  return (
    <div className="relative mx-auto flex w-full max-w-[1280px] flex-col gap-3 p-7 max-md:p-3.5 text-[var(--ink)]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-[-20px] top-[-50px] -z-10 h-[340px] overflow-hidden">
        <span className="absolute left-[-40px] top-3 h-[220px] w-[220px] rounded-full bg-[radial-gradient(circle,rgba(255,107,53,.35),rgba(255,107,53,0))] [animation:drift_16s_ease-in-out_infinite]" />
        <span className="absolute right-[6%] top-[-40px] h-[260px] w-[260px] rounded-full bg-[radial-gradient(circle,rgba(58,134,255,.3),rgba(58,134,255,0))] [animation:drift_16s_ease-in-out_infinite] [animation-delay:2s]" />
        <span className="absolute right-[30%] top-[54px] h-[180px] w-[180px] rounded-full bg-[radial-gradient(circle,rgba(7,190,184,.35),rgba(7,190,184,0))] [animation:drift_16s_ease-in-out_infinite] [animation-delay:4s]" />
      </div>

      <AppBar
        theme={theme}
        onToggleTheme={() => setTheme(theme === "light" ? "dark" : "light")}
        source={data.source}
        lastUpdated={data.lastUpdated}
        loading={loading}
      />

      <section className="grid gap-2.5 xl:grid-cols-[1.2fr_1.8fr]">
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-2.5">
          {INTERVALS.map((item) => (
            <button
              key={item}
              className={cn(
                "cursor-pointer rounded-full border px-2.5 py-1.5 text-[0.75rem]",
                item === interval
                  ? "border-[#0e1728] bg-[#0e1728] text-white"
                  : "border-[#d4e0fb] bg-[#f5f9ff] text-[#35496f]",
              )}
              onClick={() => setInterval(item)}
              type="button"
            >
              {item.toUpperCase()}
            </button>
          ))}
          <span className="text-[0.77rem] text-[var(--muted)]">{loading ? "Refreshing..." : "Live sync"}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-2.5">
          <input className={controlInputCls} value={presetName} onChange={(e) => setPresetName(e.target.value)} placeholder="Preset name" />
          <button className="rounded-[9px] border border-[#1b2c4b] bg-[#1b2c4b] px-2.5 py-[7px] text-[0.8rem] text-white" onClick={savePreset} type="button">Save Preset</button>
          <select
            className={controlInputCls}
            defaultValue=""
            onChange={(e) => {
              const preset = presets.find((item) => item.name === e.target.value);
              if (preset) setWatchlistIds(preset.ids);
            }}
          >
            <option value="">Load preset</option>
            {presets.map((preset) => (
              <option key={preset.name} value={preset.name}>{preset.name}</option>
            ))}
          </select>
        </div>
      </section>

      <section className={cn(panelCls)}>
        <header className="mb-2 flex items-baseline justify-between gap-2.5">
          <h2 className="m-0 font-[var(--font-montserrat)] text-[1.12rem] font-extrabold">Watchlist Builder</h2>
          <span className="text-[0.77rem] text-[var(--muted)]">Pick at least 3</span>
        </header>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {availableCoins.map((coin) => (
            <label key={coin.id} className="grid grid-cols-[auto_1fr] items-center gap-x-2 gap-y-0.5 rounded-[10px] border border-[#d8e4ff] bg-[#f8fbff] p-2">
              <input
                className="row-span-2"
                type="checkbox"
                checked={watchlistIds.includes(coin.id)}
                onChange={() => toggleWatch(coin.id)}
              />
              <span className="text-[0.82rem] font-bold">{coin.symbol}</span>
              <small className="text-[0.73rem] text-[var(--muted)]">{coin.name}</small>
            </label>
          ))}
        </div>
      </section>

      <HeroSection
        source={data.source}
        lastUpdated={data.lastUpdated}
        totalCap={totalCap}
        totalVolume={totalVolume}
        averageSentiment={averageSentiment}
        positiveCount={positiveCount}
        tokens={data.tokens}
      />

      <TickerStrip tokens={data.tokens} />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {data.tokens.slice(0, 4).map((token) => (
          <TopSparkCard key={token.symbol} token={token} />
        ))}
      </section>

      <main className="grid items-stretch gap-3 lg:grid-cols-2 xl:grid-cols-3">
        <MultiLineChart weeklyWars={data.weeklyWars} symbols={data.tokens.slice(0, 3).map((token) => token.symbol)} />
        <VolumeBars tokens={data.tokens} />
        <DonutFlow walletFlows={data.walletFlows} />
        <HeatMatrix heatMapRows={data.heatMapRows} heatMapCols={data.heatMapCols} heatMap={data.heatMap} />
        <LeaderboardTable tokens={data.tokens} />
      </main>

      <section className={cn(panelCls, "flex flex-col gap-3")}> 
        <header className="flex items-baseline justify-between gap-2.5">
          <h2 className="m-0 font-[var(--font-montserrat)] text-[1.12rem] font-extrabold">Compare Mode</h2>
          <span className="text-[0.77rem] text-[var(--muted)]">Correlation + Relative Strength</span>
        </header>
        <div className="flex flex-wrap items-center gap-2">
          <select className={controlInputCls} value={compareA} onChange={(e) => setCompareA(e.target.value)}>
            {data.tokens.map((token) => (
              <option key={token.id} value={token.id}>{token.symbol}</option>
            ))}
          </select>
          <select className={controlInputCls} value={compareB} onChange={(e) => setCompareB(e.target.value)}>
            {data.tokens.map((token) => (
              <option key={token.id} value={token.id}>{token.symbol}</option>
            ))}
          </select>
          <p className="m-0 text-[0.82rem] text-[var(--muted)]">Correlation <strong className="text-[var(--ink)]">{compareCorrelation.toFixed(2)}</strong></p>
        </div>
        <div className="grid gap-2.5 xl:grid-cols-[1.4fr_1fr]">
          <article className="rounded-xl border border-[#dbe6ff] bg-[#f8fbff] p-2.5">
            <h4 className="m-0 font-[var(--font-montserrat)] text-[0.95rem] font-extrabold">{compareTokenA?.symbol} vs {compareTokenB?.symbol}</h4>
            <svg viewBox="0 0 220 70" className="mt-2 h-[72px] w-full" aria-hidden="true">
              <path d={linePath(relativeDiff, 220, 70, 8)} fill="none" stroke="#ff6b35" strokeWidth="3" />
            </svg>
            <p className="mt-2 text-[0.82rem] text-[var(--muted)]">
              Relative edge: <strong className={cn((relativeDiff[relativeDiff.length - 1] ?? 0) >= 0 ? "text-[#0f9f84]" : "text-[#ce355c]")}>{formatSignedPct(relativeDiff[relativeDiff.length - 1] ?? 0)}</strong>
            </p>
          </article>
          <article className="rounded-xl border border-[#dbe6ff] bg-[#f8fbff] p-2.5">
            <h4 className="m-0 font-[var(--font-montserrat)] text-[0.95rem] font-extrabold">Quick Stats</h4>
            <p className="mt-2 text-[0.82rem] text-[var(--muted)]">{compareTokenA?.symbol}: {formatCurrency(compareTokenA?.marketCap ?? 0)}</p>
            <p className="mt-2 text-[0.82rem] text-[var(--muted)]">{compareTokenB?.symbol}: {formatCurrency(compareTokenB?.marketCap ?? 0)}</p>
            <p className="mt-2 text-[0.82rem] text-[var(--muted)]">Volume ratio: {((compareTokenA?.volume24h ?? 1) / Math.max(compareTokenB?.volume24h ?? 1, 1)).toFixed(2)}x</p>
          </article>
        </div>
      </section>

      <section className={cn(panelCls, "flex flex-col gap-3")}> 
        <header className="flex items-baseline justify-between gap-2.5">
          <h2 className="m-0 font-[var(--font-montserrat)] text-[1.12rem] font-extrabold">Explainable Alpha</h2>
          <span className="text-[0.77rem] text-[var(--muted)]">Signal decomposition per token</span>
        </header>
        <div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-3">
          {data.tokens.map((token) => (
            <article key={token.id} className="rounded-xl border border-[#dbe6ff] bg-[#f9fbff] p-2.5">
              <div className="mb-2 flex items-baseline justify-between">
                <h4 className="m-0 font-[var(--font-montserrat)] text-[0.95rem] font-extrabold">{token.symbol}</h4>
                <strong className="text-[var(--ink)]">{signalScore(token.signal)}</strong>
              </div>
              {["momentum", "velocity", "holderStrength", "whalePenalty"].map((key) => {
                const value = token.signal[key as keyof typeof token.signal];
                const isRisk = key === "whalePenalty";
                return (
                  <p key={key} className="mb-1.5 grid grid-cols-[100px_1fr] items-center gap-2 text-[0.76rem] text-[var(--muted)]">
                    <span>{key === "holderStrength" ? "Holder Strength" : key === "whalePenalty" ? "Whale Penalty" : key[0].toUpperCase() + key.slice(1)}</span>
                    <i className="block h-2 w-full overflow-hidden rounded-full bg-[#e9f0ff]">
                      <b className={cn("block h-full bg-[linear-gradient(90deg,#07beb8,#3a86ff)]", isRisk && "bg-[linear-gradient(90deg,#ff6b35,#ef476f)]")} style={{ width: `${value}%` }} />
                    </i>
                  </p>
                );
              })}
            </article>
          ))}
        </div>
      </section>

      <section className="grid items-stretch gap-3 xl:grid-cols-[1.35fr_1fr]">
        <section className={panelCls}>
          <header className="mb-2 flex items-baseline justify-between gap-2.5">
            <h2 className="m-0 font-[var(--font-montserrat)] text-[1.12rem] font-extrabold">Alert Rules</h2>
            <span className="text-[0.77rem] text-[var(--muted)]">Threshold + optional webhook</span>
          </header>
          <div className="grid gap-2 sm:grid-cols-3">
            <select className={controlInputCls} value={alertForm.tokenId} onChange={(e) => setAlertForm((prev) => ({ ...prev, tokenId: e.target.value }))}>
              {data.tokens.map((token) => (
                <option key={token.id} value={token.id}>{token.symbol}</option>
              ))}
            </select>
            <select className={controlInputCls} value={alertForm.metric} onChange={(e) => setAlertForm((prev) => ({ ...prev, metric: e.target.value as AlertRule["metric"] }))}>
              <option value="move">Move %</option>
              <option value="sentiment">Sentiment</option>
              <option value="volume">Volume</option>
            </select>
            <select className={controlInputCls} value={alertForm.operator} onChange={(e) => setAlertForm((prev) => ({ ...prev, operator: e.target.value as AlertRule["operator"] }))}>
              <option value=">">{">"}</option>
              <option value="<">{"<"}</option>
            </select>
            <input className={controlInputCls} type="number" value={alertForm.value} onChange={(e) => setAlertForm((prev) => ({ ...prev, value: Number(e.target.value) }))} placeholder="threshold" />
            <input className={cn(controlInputCls, "sm:col-span-2")} value={alertForm.webhookUrl} onChange={(e) => setAlertForm((prev) => ({ ...prev, webhookUrl: e.target.value }))} placeholder="https://webhook.url (optional)" />
            <button className="rounded-[9px] border border-[#1b2c4b] bg-[#1b2c4b] px-2.5 py-[7px] text-[0.8rem] text-white" type="button" onClick={addAlert}>Add Alert</button>
          </div>

          <div className="mt-2.5 grid gap-2">
            {alerts.map((rule) => (
              <article key={rule.id} className="flex items-center justify-between gap-2 rounded-[10px] border border-[#d8e4ff] bg-[#f8fbff] p-2">
                <p className="m-0 text-[0.8rem]">
                  {data.tokens.find((token) => token.id === rule.tokenId)?.symbol ?? rule.tokenId} {rule.metric} {rule.operator} {rule.metric === "volume" ? formatCompact(rule.value) : rule.value}
                </p>
                <button className="cursor-pointer rounded-lg border border-[#d84f68] bg-[#ffe7ec] px-2 py-1 text-xs text-[#b62b48]" type="button" onClick={() => removeAlert(rule.id)}>Remove</button>
              </article>
            ))}
          </div>
        </section>

        <section className={panelCls}>
          <header className="mb-2 flex items-baseline justify-between gap-2.5">
            <h2 className="m-0 font-[var(--font-montserrat)] text-[1.12rem] font-extrabold">Live Alerts Feed</h2>
            <span className="text-[0.77rem] text-[var(--muted)]">Most recent triggers</span>
          </header>
          <div className="grid gap-2">
            {notifications.length === 0 ? (
              <p className="text-[0.82rem] text-[var(--muted)]">No triggers yet.</p>
            ) : (
              notifications.map((item) => (
                <article key={item.id} className="flex items-center justify-between gap-2 rounded-[10px] border border-[#d8e4ff] bg-[#f8fbff] p-2">
                  <p className="m-0 text-[0.8rem]">{item.text}</p>
                  <small className="text-[var(--muted)]">{new Date(item.at).toLocaleTimeString()}</small>
                </article>
              ))
            )}
          </div>
        </section>
      </section>

      <footer className="text-[0.8rem] text-[#6d7a95]">
        <p>
          Source: CoinGecko public APIs. Alerts are evaluated on each refresh cycle. Use webhook URLs with caution.
        </p>
      </footer>
    </div>
  );
}
