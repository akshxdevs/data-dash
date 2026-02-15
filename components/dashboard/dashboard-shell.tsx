"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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
import { formatCurrency, formatSignedPct } from "@/utils/format";

import type {
  ArenaDashboardData,
  ArenaInterval,
  WatchCoin,
} from "@/lib/live-analytics";

const INTERVALS: ArenaInterval[] = ["1h", "24h", "7d", "30d"];

function signalScore(signal: {
  momentum: number;
  velocity: number;
  holderStrength: number;
  whalePenalty: number;
}) {
  return Math.round(
    signal.momentum * 0.35 +
      signal.velocity * 0.3 +
      signal.holderStrength * 0.25 -
      signal.whalePenalty * 0.2,
  );
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

const panelCls =
  "rounded-2xl border border-[var(--line)] bg-[var(--panel-bg)] p-[14px] shadow-[0_10px_24px_rgba(2,7,16,.35)] transition hover:-translate-y-[1px] hover:border-[#4b66a3] hover:shadow-[0_16px_32px_rgba(2,7,16,.45)]";

const controlInputCls =
  "w-full min-w-0 rounded-[10px] border border-[#d4e0fb] bg-white px-2.5 py-[7px] text-[0.8rem] text-[#2b3d61] outline-none focus:border-[#90b2ff] dark:border-[#31486f] dark:bg-[#0f172a] dark:text-[#dbe6ff] dark:focus:border-[#6f90d7]";

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
  const [chainFilter, setChainFilter] = useState<string>("all");

  const [compareA, setCompareA] = useState(defaultIds[0] ?? "");
  const [compareB, setCompareB] = useState(
    defaultIds[1] ?? defaultIds[0] ?? "",
  );

  const themeTransitionTimerRef = useRef<number | null>(null);

  const toggleTheme = () => {
    if (themeTransitionTimerRef.current) {
      window.clearTimeout(themeTransitionTimerRef.current);
      themeTransitionTimerRef.current = null;
    }

    document.documentElement.classList.add("theme-switching");
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("arena_theme");
    const savedWatchlist = localStorage.getItem("arena_watchlist");

    if (savedTheme === "dark" || savedTheme === "light") {
      setTheme(savedTheme);
    }

    if (savedWatchlist) {
      const parsed = JSON.parse(savedWatchlist) as string[];
      if (Array.isArray(parsed) && parsed.length >= 3) {
        setWatchlistIds(parsed);
      }
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("arena_theme", theme);

    if (themeTransitionTimerRef.current) {
      window.clearTimeout(themeTransitionTimerRef.current);
    }
    themeTransitionTimerRef.current = window.setTimeout(() => {
      document.documentElement.classList.remove("theme-switching");
      themeTransitionTimerRef.current = null;
    }, 380);

    return () => {
      if (themeTransitionTimerRef.current) {
        window.clearTimeout(themeTransitionTimerRef.current);
        themeTransitionTimerRef.current = null;
      }
    };
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
        const isAbort =
          error instanceof DOMException && error.name === "AbortError";
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
    if (!tokenIds.includes(compareB))
      setCompareB(tokenIds[1] ?? tokenIds[0] ?? "");
  }, [data.tokens, compareA, compareB]);

  const compareTokenA = useMemo(
    () => data.tokens.find((token) => token.id === compareA),
    [data.tokens, compareA],
  );
  const compareTokenB = useMemo(
    () => data.tokens.find((token) => token.id === compareB),
    [data.tokens, compareB],
  );

  const compareCorrelation = useMemo(() => {
    if (!compareTokenA || !compareTokenB) return 0;
    return correlation(compareTokenA.priceChange, compareTokenB.priceChange);
  }, [compareTokenA, compareTokenB]);

  const relativeDiff = useMemo(() => {
    if (!compareTokenA || !compareTokenB) return [0, 0, 0, 0, 0, 0, 0];
    return compareTokenA.priceChange.map(
      (value, idx) => value - (compareTokenB.priceChange[idx] ?? 0),
    );
  }, [compareTokenA, compareTokenB]);

  const chainFilters = useMemo(
    () => ["all", ...new Set(availableCoins.map((coin) => coin.chain))],
    [availableCoins],
  );

  const filteredCoins = useMemo(() => {
    return availableCoins.filter((coin) => {
      return chainFilter === "all" || coin.chain === chainFilter;
    });
  }, [availableCoins, chainFilter]);

  const totalCap = data.tokens.reduce((acc, token) => acc + token.marketCap, 0);
  const totalVolume = data.tokens.reduce(
    (acc, token) => acc + token.volume24h,
    0,
  );
  const averageSentiment = Math.round(
    data.tokens.reduce((acc, token) => acc + token.sentiment, 0) /
      data.tokens.length,
  );
  const positiveCount = data.tokens.filter(
    (token) => (token.priceChange[token.priceChange.length - 1] ?? 0) > 0,
  ).length;
  const year = new Date().getFullYear();

  const toggleWatch = (id: string) => {
    setWatchlistIds((prev) => {
      if (prev.includes(id)) {
        if (prev.length <= 3) return prev;
        return prev.filter((item) => item !== id);
      }
      return [...prev, id];
    });
  };

  const addVisibleToWatchlist = () => {
    if (!filteredCoins.length) return;
    setWatchlistIds((prev) => {
      const next = [...prev];
      for (const coin of filteredCoins) {
        if (!next.includes(coin.id)) next.push(coin.id);
      }
      return next;
    });
  };

  const resetWatchlist = () => {
    setWatchlistIds(defaultIds);
  };

  return (
    <div className="relative mx-auto flex w-full max-w-[1280px] flex-col gap-3 p-7 pt-24 max-md:p-3.5 max-md:pt-20 text-[var(--ink)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-[-20px] top-[-50px] -z-10 h-[340px] overflow-hidden transition-opacity duration-300 dark:opacity-0"
      >
        <span className="absolute left-[-6%] top-[-4%] h-[190px] w-[520px] rounded-[999px] bg-[linear-gradient(115deg,rgba(255,193,155,.42),rgba(255,193,155,0))] opacity-75 blur-3xl [animation:smokeFloat_20s_ease-in-out_infinite]" />
        <span className="absolute right-[-4%] top-[2%] h-[210px] w-[540px] rounded-[999px] bg-[linear-gradient(250deg,rgba(150,188,255,.4),rgba(150,188,255,0))] opacity-75 blur-3xl [animation:smokeFloat_24s_ease-in-out_infinite] [animation-delay:2s]" />
        <span className="absolute left-[16%] top-[18%] h-[180px] w-[470px] rounded-[999px] bg-[linear-gradient(130deg,rgba(162,232,220,.28),rgba(162,232,220,0))] opacity-70 blur-3xl [animation:smokeFloat_22s_ease-in-out_infinite] [animation-delay:4s]" />
        <span className="absolute right-[18%] top-[30%] h-[150px] w-[360px] rounded-[999px] bg-[linear-gradient(190deg,rgba(255,221,189,.28),rgba(255,221,189,0))] opacity-70 blur-3xl [animation:smokeFloat_26s_ease-in-out_infinite] [animation-delay:6s]" />
      </div>

      <div className="fixed left-1/2 top-3 z-50 w-[min(1280px,calc(100%-1rem))] -translate-x-1/2">
        <AppBar
          theme={theme}
          onToggleTheme={toggleTheme}
          source={data.source}
          lastUpdated={data.lastUpdated}
          loading={loading}
        />
      </div>

      <section className="mx-auto w-full md:w-1/2 motion-safe:[animation:fadeUp_.6s_ease-out_.08s_both]">
        <div className="rounded-2xl border border-[color-mix(in_srgb,var(--line)_86%,#9fb8e0_14%)] bg-[color-mix(in_srgb,var(--surface-2)_92%,white_8%)] p-2.5 shadow-[0_8px_24px_rgba(17,35,74,.08)] dark:border-[#2f466f] dark:bg-[color-mix(in_srgb,var(--surface-2)_92%,#0f1c34_8%)] dark:shadow-[0_10px_24px_rgba(2,8,20,.34)]">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex w-full items-center gap-1 rounded-xl border border-[#d8e4f8] bg-[color-mix(in_srgb,white_92%,#eef4ff_8%)] p-1 sm:w-auto dark:border-[#354e79] dark:bg-[#0f1a30]">
              {INTERVALS.map((item) => (
                <button
                  key={item}
                  className={cn(
                    "cursor-pointer rounded-[9px] px-3 py-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.06em] transition-colors",
                    item === interval
                      ? "border border-[#bfd2f5] bg-[#eaf2ff] text-[#294b82] dark:border-[#4d6da1] dark:bg-[#1b2f52] dark:text-[#d4e2fb]"
                      : "border border-transparent text-[#5d7398] hover:bg-[#f3f7ff] hover:text-[#3a557f] dark:text-[#a0b4d8] dark:hover:bg-[#152541] dark:hover:text-[#d8e5ff]",
                  )}
                  onClick={() => setInterval(item)}
                  type="button"
                >
                  {item.toUpperCase()}
                </button>
              ))}
            </div>
            <span className="inline-flex items-center gap-2 self-start rounded-full border border-[#d4e0f3] bg-[#f7faff] px-3 py-1.5 text-[0.69rem] font-medium uppercase tracking-[0.08em] text-[#4f678f] sm:self-auto dark:border-[#415c8a] dark:bg-[#11213c] dark:text-[#bad0f2]">
              <i
                aria-hidden="true"
                className={cn(
                  "h-2 w-2 rounded-full",
                  loading
                    ? "bg-[#f3a55a] shadow-[0_0_0_4px_rgba(243,165,90,.22)] animate-pulse"
                    : "bg-[#4cb894] shadow-[0_0_0_4px_rgba(76,184,148,.2)]",
                )}
              />
              {loading ? "Refreshing" : "Live Sync"}
            </span>
          </div>
        </div>
      </section>

      <section
        className={cn(
          panelCls,
          "relative overflow-hidden motion-safe:[animation:fadeUp_.6s_ease-out_.14s_both]",
        )}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-[-40px] top-[-30px] h-28 w-40 rounded-full bg-[radial-gradient(circle,rgba(58,134,255,.24),transparent_72%)] blur-xl"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-[-48px] bottom-[-40px] h-32 w-44 rounded-full bg-[radial-gradient(circle,rgba(255,107,53,.15),transparent_72%)] blur-xl"
        />
        <header className="mb-2.5 flex flex-wrap items-start justify-between gap-2.5 border-b border-[var(--line)] pb-2">
          <div className="min-w-0 flex-1">
            <h2 className="m-0 text-[1.04rem] font-[var(--font-montserrat)] font-extrabold tracking-[0.01em] text-[var(--ink)]">
              Watchlist Builder
            </h2>
            <p className="m-0 mt-1 max-w-[32ch] text-[0.75rem] leading-[1.35] tracking-[0.015em] text-[var(--muted)]">
              Curate your signal basket from the token matrix.
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[color-mix(in_srgb,var(--line)_80%,#8ab3ff_20%)] bg-[color-mix(in_srgb,var(--surface-2)_72%,#dceaff_28%)] px-2.5 py-1 text-[0.68rem] font-semibold tracking-[0.07em] text-[color-mix(in_srgb,var(--ink)_80%,#3d5f99_20%)] dark:bg-[color-mix(in_srgb,var(--surface-2)_76%,#1b3056_24%)] dark:text-[color-mix(in_srgb,var(--ink)_88%,#b8d0ff_12%)]">
            <span>
              {watchlistIds.length}/{availableCoins.length} Selected
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-[#07beb8]" />
          </div>
        </header>
        <div className="mb-2.5 grid gap-2">
          <div className="flex flex-wrap items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={addVisibleToWatchlist}
              className="rounded-[9px] border border-[color-mix(in_srgb,var(--line)_76%,#9bbcf8_24%)] bg-[color-mix(in_srgb,var(--surface-2)_74%,#e9f2ff_26%)] px-2.5 py-1 text-[0.72rem] font-semibold text-[color-mix(in_srgb,var(--ink)_82%,#3a5f9d_18%)] transition hover:border-[#9fbef7] hover:bg-[#eaf2ff] dark:border-[#3b5586] dark:bg-[#14233f] dark:text-[#bad0f5] dark:hover:border-[#5f82bd] dark:hover:bg-[#1a2f56]"
            >
              Add Visible
            </button>
            <button
              type="button"
              onClick={resetWatchlist}
              className="rounded-[9px] border border-[color-mix(in_srgb,var(--line)_76%,#9bbcf8_24%)] bg-[color-mix(in_srgb,var(--surface-2)_74%,#e9f2ff_26%)] px-2.5 py-1 text-[0.72rem] font-semibold text-[color-mix(in_srgb,var(--ink)_82%,#3a5f9d_18%)] transition hover:border-[#9fbef7] hover:bg-[#eaf2ff] dark:border-[#3b5586] dark:bg-[#14233f] dark:text-[#bad0f5] dark:hover:border-[#5f82bd] dark:hover:bg-[#1a2f56]"
            >
              Reset
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {chainFilters.map((chain) => (
              <button
                key={chain}
                type="button"
                onClick={() => setChainFilter(chain)}
                className={cn(
                  "rounded-full border px-2 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.07em] transition",
                  chainFilter === chain
                    ? "border-[#89b1ff] bg-[#eaf2ff] text-[#244d93] dark:border-[#6b95e2] dark:bg-[#1a3159] dark:text-[#c0d4ff]"
                    : "border-[#d2e0f8] bg-white/80 text-[#5c739f] hover:border-[#a8c1ef] hover:bg-[#f4f8ff] dark:border-[#39537f] dark:bg-[#11203a] dark:text-[#8ea8d4] dark:hover:border-[#5778af] dark:hover:bg-[#162949]",
                )}
              >
                {chain}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCoins.map((coin) => {
            const checked = watchlistIds.includes(coin.id);
            return (
              <label
                key={coin.id}
                className={cn(
                  "group relative grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded-xl border border-[#d8e4ff] bg-[linear-gradient(150deg,#f9fbff,#f3f8ff)] px-2.5 py-2 shadow-[0_3px_10px_rgba(26,44,82,.06)] transition hover:-translate-y-[1px] hover:border-[#b8cffc] hover:shadow-[0_10px_18px_rgba(23,40,72,.11)] dark:border-[#2d4066] dark:bg-[linear-gradient(145deg,#101a2f,#111e36)] dark:hover:border-[#4a6fa9]",
                  checked &&
                    "border-[#7ca8ff] bg-[linear-gradient(145deg,#edf4ff,#e7f1ff)] ring-1 ring-[#8eb4ff]/60 dark:border-[#6c95dd] dark:bg-[linear-gradient(145deg,#14284b,#162b4f)] dark:ring-[#6f98e8]/55",
                )}
              >
                <input
                  className="peer sr-only"
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleWatch(coin.id)}
                />
                <span
                  aria-hidden="true"
                  className={cn(
                    "inline-flex h-[18px] w-[18px] items-center justify-center rounded-[6px] border border-[#adc5f2] bg-white text-[11px] font-black text-transparent transition dark:border-[#4a6491] dark:bg-[#0f1a30]",
                    checked &&
                      "border-[#3a86ff] bg-[#3a86ff] text-white dark:border-[#78a7ff] dark:bg-[#5d8ff2]",
                  )}
                >
                  ✓
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[0.82rem] font-extrabold tracking-[0.012em] text-[var(--ink)]">
                    {coin.symbol}
                  </span>
                  <small className="block truncate text-[0.71rem] font-medium tracking-[0.015em] text-[color-mix(in_srgb,var(--muted)_84%,var(--ink)_16%)]">
                    {coin.name}
                  </small>
                  <small className="block truncate text-[0.63rem] uppercase tracking-[0.085em] text-[color-mix(in_srgb,var(--muted)_78%,#6282b6_22%)] dark:text-[color-mix(in_srgb,var(--muted)_84%,#b9cbec_16%)]">
                    {coin.chain}
                  </small>
                </span>
                <span
                  className={cn(
                    "rounded-full border px-2 py-0.5 text-[0.61rem] font-semibold uppercase tracking-[0.09em] text-[#58709f] dark:text-[#8ea8d4]",
                    checked
                      ? "border-[#8eb4ff] bg-[#eaf2ff] text-[#315a9e] dark:border-[#6d95de] dark:bg-[#1a2f56] dark:text-[#bad0ff]"
                      : "border-[#d1dff8] bg-white/75 dark:border-[#39537f] dark:bg-[#12213c]",
                  )}
                >
                  {checked ? "Added" : "Select"}
                </span>
              </label>
            );
          })}
        </div>
        {filteredCoins.length === 0 ? (
          <p className="mt-2 text-[0.77rem] text-[var(--muted)]">
            No coins match this filter.
          </p>
        ) : null}
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

      <div className="motion-safe:[animation:fadeUp_.58s_ease-out_.24s_both]">
        <TickerStrip tokens={data.tokens} />
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {data.tokens.slice(0, 4).map((token, idx) => (
          <div
            key={token.symbol}
            className="motion-safe:[animation:fadeUp_.56s_ease-out_both]"
            style={{ animationDelay: `${0.28 + idx * 0.06}s` }}
          >
            <TopSparkCard token={token} />
          </div>
        ))}
      </section>

      <main className="grid items-stretch gap-3 lg:grid-cols-2 xl:grid-cols-3 motion-safe:[animation:fadeUp_.62s_ease-out_.38s_both]">
        <MultiLineChart
          weeklyWars={data.weeklyWars}
          symbols={data.tokens.slice(0, 3).map((token) => token.symbol)}
        />
        <VolumeBars tokens={data.tokens} />
        <DonutFlow walletFlows={data.walletFlows} />
        <HeatMatrix
          heatMapRows={data.heatMapRows}
          heatMapCols={data.heatMapCols}
          heatMap={data.heatMap}
        />
        <LeaderboardTable tokens={data.tokens} />
      </main>

      <section
        className={cn(
          panelCls,
          "flex flex-col gap-3 motion-safe:[animation:fadeUp_.62s_ease-out_.46s_both]",
        )}
      >
        <header className="flex items-baseline justify-between gap-2.5">
          <h2 className="m-0 font-[var(--font-montserrat)] text-[1.12rem] font-extrabold">
            Compare Mode
          </h2>
          <span className="text-[0.77rem] text-[var(--muted)]">
            Correlation + Relative Strength
          </span>
        </header>
        <div className="grid gap-2 sm:grid-cols-[minmax(0,180px)_minmax(0,180px)_1fr] sm:items-center">
          <select
            className={controlInputCls}
            value={compareA}
            onChange={(e) => setCompareA(e.target.value)}
          >
            {data.tokens.map((token) => (
              <option key={token.id} value={token.id}>
                {token.symbol}
              </option>
            ))}
          </select>
          <select
            className={controlInputCls}
            value={compareB}
            onChange={(e) => setCompareB(e.target.value)}
          >
            {data.tokens.map((token) => (
              <option key={token.id} value={token.id}>
                {token.symbol}
              </option>
            ))}
          </select>
          <p className="m-0 text-[0.82rem] text-[var(--muted)] sm:justify-self-end">
            Correlation{" "}
            <strong className="text-[var(--ink)]">
              {compareCorrelation.toFixed(2)}
            </strong>
          </p>
        </div>
        <div className="grid gap-2.5 xl:grid-cols-[1.4fr_1fr]">
          <article className="rounded-xl border border-[#dbe6ff] bg-[#f8fbff] p-2.5 dark:border-[#2d4066] dark:bg-[#101a2f]">
            <h4 className="m-0 font-[var(--font-montserrat)] text-[0.95rem] font-extrabold">
              {compareTokenA?.symbol} vs {compareTokenB?.symbol}
            </h4>
            <svg
              viewBox="0 0 220 70"
              className="mt-2 h-[72px] w-full"
              aria-hidden="true"
            >
              <path
                d={linePath(relativeDiff, 220, 70, 8)}
                fill="none"
                stroke="#ff6b35"
                strokeWidth="3"
              />
            </svg>
            <p className="mt-2 text-[0.82rem] text-[var(--muted)]">
              Relative edge:{" "}
              <strong
                className={cn(
                  (relativeDiff[relativeDiff.length - 1] ?? 0) >= 0
                    ? "text-[#0f9f84]"
                    : "text-[#ce355c]",
                )}
              >
                {formatSignedPct(relativeDiff[relativeDiff.length - 1] ?? 0)}
              </strong>
            </p>
          </article>
          <article className="rounded-xl border border-[#dbe6ff] bg-[#f8fbff] p-2.5 dark:border-[#2d4066] dark:bg-[#101a2f]">
            <h4 className="m-0 font-[var(--font-montserrat)] text-[0.95rem] font-extrabold">
              Quick Stats
            </h4>
            <p className="mt-2 text-[0.82rem] text-[var(--muted)]">
              {compareTokenA?.symbol}:{" "}
              {formatCurrency(compareTokenA?.marketCap ?? 0)}
            </p>
            <p className="mt-2 text-[0.82rem] text-[var(--muted)]">
              {compareTokenB?.symbol}:{" "}
              {formatCurrency(compareTokenB?.marketCap ?? 0)}
            </p>
            <p className="mt-2 text-[0.82rem] text-[var(--muted)]">
              Volume ratio:{" "}
              {(
                (compareTokenA?.volume24h ?? 1) /
                Math.max(compareTokenB?.volume24h ?? 1, 1)
              ).toFixed(2)}
              x
            </p>
          </article>
        </div>
      </section>

      <section
        className={cn(
          panelCls,
          "flex flex-col gap-3 motion-safe:[animation:fadeUp_.62s_ease-out_.54s_both]",
        )}
      >
        <header className="flex items-baseline justify-between gap-2.5">
          <h2 className="m-0 font-[var(--font-montserrat)] text-[1.12rem] font-extrabold">
            Explainable Alpha
          </h2>
          <span className="text-[0.77rem] text-[var(--muted)]">
            Signal decomposition per token
          </span>
        </header>
        <div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-3">
          {data.tokens.map((token) => (
            <article
              key={token.id}
              className="rounded-xl border border-[#dbe6ff] bg-[#f9fbff] p-2.5 dark:border-[#2d4066] dark:bg-[#101a2f]"
            >
              <div className="mb-2 flex items-baseline justify-between">
                <h4 className="m-0 font-[var(--font-montserrat)] text-[0.95rem] font-extrabold">
                  {token.symbol}
                </h4>
                <strong className="text-[var(--ink)]">
                  {signalScore(token.signal)}
                </strong>
              </div>
              {["momentum", "velocity", "holderStrength", "whalePenalty"].map(
                (key) => {
                  const value = token.signal[key as keyof typeof token.signal];
                  const isRisk = key === "whalePenalty";
                  return (
                    <p
                      key={key}
                      className="mb-1.5 grid grid-cols-[100px_1fr] items-center gap-2 text-[0.76rem] text-[var(--muted)]"
                    >
                      <span>
                        {key === "holderStrength"
                          ? "Holder Strength"
                          : key === "whalePenalty"
                            ? "Whale Penalty"
                            : key[0].toUpperCase() + key.slice(1)}
                      </span>
                      <i className="block h-2 w-full overflow-hidden rounded-full bg-[#e9f0ff] dark:bg-[#1b2b49]">
                        <b
                          className={cn(
                            "block h-full bg-[linear-gradient(90deg,#07beb8,#3a86ff)]",
                            isRisk &&
                              "bg-[linear-gradient(90deg,#ff6b35,#ef476f)]",
                          )}
                          style={{ width: `${value}%` }}
                        />
                      </i>
                    </p>
                  );
                },
              )}
            </article>
          ))}
        </div>
      </section>

      <footer className="relative -mx-7 mt-10 px-7 pb-2 pt-2.5 max-md:-mx-3.5 max-md:px-3.5 motion-safe:[animation:fadeUp_.62s_ease-out_.72s_both]">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 h-px w-full bg-[linear-gradient(90deg,transparent,rgba(58,134,255,.6),rgba(255,107,53,.55),transparent)]"
        />
        <div className="mt-5 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#d6e3fb] bg-[linear-gradient(120deg,rgba(255,255,255,.72),rgba(239,247,255,.6))] px-3 py-5 shadow-[0_6px_18px_rgba(16,30,62,.08)] dark:border-[#30466f] dark:bg-[linear-gradient(120deg,rgba(13,21,37,.9),rgba(15,24,43,.92))]">
          <p className="m-0 inline-flex items-center gap-2 text-[0.76rem] tracking-[0.045em] text-slate-700 dark:text-[#c4d7fb]">
            <span className="inline-flex h-[18px] w-[18px] items-center justify-center rounded-full border border-[#b7c9ed] dark:border-[#355184]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#ff6b35] motion-safe:[animation:blink_1.8s_ease-in-out_infinite]" />
            </span>
            Crafted by
            <a
              className="font-black text-[#355a9a] underline decoration-transparent underline-offset-[3px] transition hover:decoration-current focus-visible:decoration-current dark:text-[#a9b9ff]"
              href="http://x.com/akshxdevs"
              rel="noreferrer"
              target="_blank"
            >
              akshxdevs
            </a>
          </p>
          <p className="m-0 rounded-full border border-[#cfddf6] bg-white/70 px-2 py-1 text-[0.64rem] uppercase tracking-[0.11em] text-slate-600 dark:border-[#324f7e] dark:bg-[#101c33] dark:text-[#8fa8d6]">
            © {year} All Rights Reserved
          </p>
        </div>
      </footer>
    </div>
  );
}
