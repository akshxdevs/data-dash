export type ArenaInterval = "1h" | "24h" | "7d" | "30d";

export type SignalFactors = {
  momentum: number;
  velocity: number;
  holderStrength: number;
  whalePenalty: number;
};

export type ArenaToken = {
  id: string;
  symbol: string;
  name: string;
  chain: string;
  currentPrice: number;
  marketCap: number;
  volume24h: number;
  holders: number;
  whales: number;
  sentiment: number;
  socials: number[];
  priceChange: number[];
  signal: SignalFactors;
};

export type ArenaDashboardData = {
  interval: ArenaInterval;
  tokens: ArenaToken[];
  weeklyWars: Array<{ day: string; alpha: number; beta: number; gamma: number }>;
  heatMapRows: string[];
  heatMapCols: string[];
  heatMap: number[][];
  walletFlows: Array<{ label: string; value: number }>;
  lastUpdated: string;
  source: "live" | "fallback";
};

export type WatchCoin = {
  id: string;
  symbol: string;
  name: string;
  chain: string;
};

type CoinGeckoMarket = {
  id: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  price_change_percentage_24h_in_currency: number | null;
};

type CoinGeckoChart = {
  prices: Array<[number, number]>;
};

const WATCHLIST: WatchCoin[] = [
  { id: "dogecoin", symbol: "DOGE", name: "Dogecoin", chain: "Dogecoin" },
  { id: "shiba-inu", symbol: "SHIB", name: "Shiba Inu", chain: "Ethereum" },
  { id: "pepe", symbol: "PEPE", name: "Pepe", chain: "Ethereum" },
  { id: "bonk", symbol: "BONK", name: "Bonk", chain: "Solana" },
  { id: "dogwifcoin", symbol: "WIF", name: "dogwifhat", chain: "Solana" },
  { id: "floki", symbol: "FLOKI", name: "Floki", chain: "Ethereum" },
];

const FALLBACK_BASE: ArenaToken[] = [
  {
    id: "dogecoin",
    symbol: "DOGE",
    name: "Dogecoin",
    chain: "Dogecoin",
    currentPrice: 0.16,
    marketCap: 6200000000,
    volume24h: 840000000,
    holders: 191200,
    whales: 73,
    sentiment: 71,
    socials: [54, 58, 63, 67, 65, 70, 71],
    priceChange: [-1.2, 0.8, 1.4, 2.1, 1.8, 3.2, 2.6],
    signal: { momentum: 69, velocity: 66, holderStrength: 74, whalePenalty: 38 },
  },
  {
    id: "shiba-inu",
    symbol: "SHIB",
    name: "Shiba Inu",
    chain: "Ethereum",
    currentPrice: 0.000023,
    marketCap: 5100000000,
    volume24h: 760000000,
    holders: 154800,
    whales: 67,
    sentiment: 66,
    socials: [50, 51, 57, 60, 62, 64, 66],
    priceChange: [-0.8, -0.2, 0.6, 1.9, 1.4, 2.1, 1.8],
    signal: { momentum: 62, velocity: 63, holderStrength: 70, whalePenalty: 42 },
  },
  {
    id: "pepe",
    symbol: "PEPE",
    name: "Pepe",
    chain: "Ethereum",
    currentPrice: 0.000012,
    marketCap: 3300000000,
    volume24h: 690000000,
    holders: 117200,
    whales: 61,
    sentiment: 64,
    socials: [45, 48, 52, 58, 59, 63, 64],
    priceChange: [-1.9, -1.1, 0.4, 1.2, 2.5, 1.9, 3.3],
    signal: { momentum: 64, velocity: 68, holderStrength: 65, whalePenalty: 45 },
  },
  {
    id: "bonk",
    symbol: "BONK",
    name: "Bonk",
    chain: "Solana",
    currentPrice: 0.000026,
    marketCap: 1500000000,
    volume24h: 420000000,
    holders: 81200,
    whales: 53,
    sentiment: 59,
    socials: [39, 44, 47, 52, 55, 57, 59],
    priceChange: [-2.3, -1.7, -0.2, 0.3, 1.1, 1.7, 1.2],
    signal: { momentum: 54, velocity: 61, holderStrength: 58, whalePenalty: 51 },
  },
  {
    id: "dogwifcoin",
    symbol: "WIF",
    name: "dogwifhat",
    chain: "Solana",
    currentPrice: 2.3,
    marketCap: 980000000,
    volume24h: 270000000,
    holders: 60700,
    whales: 45,
    sentiment: 55,
    socials: [32, 36, 41, 46, 50, 53, 55],
    priceChange: [-3.3, -2.6, -1.2, -0.4, 0.1, 0.9, 0.2],
    signal: { momentum: 48, velocity: 56, holderStrength: 53, whalePenalty: 57 },
  },
  {
    id: "floki",
    symbol: "FLOKI",
    name: "Floki",
    chain: "Ethereum",
    currentPrice: 0.00019,
    marketCap: 920000000,
    volume24h: 220000000,
    holders: 52400,
    whales: 42,
    sentiment: 52,
    socials: [31, 34, 38, 41, 45, 50, 52],
    priceChange: [-3.9, -3.2, -1.8, -0.9, 0.4, 0.6, 0.5],
    signal: { momentum: 46, velocity: 49, holderStrength: 51, whalePenalty: 59 },
  },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function sampleSeries(values: number[], points: number) {
  if (!values.length) {
    return Array.from({ length: points }, () => 0);
  }

  const maxIndex = values.length - 1;
  return Array.from({ length: points }, (_, i) => {
    const idx = Math.round((maxIndex * i) / Math.max(points - 1, 1));
    return values[idx];
  });
}

function seriesToPctChange(series: number[]) {
  if (!series.length || series[0] === 0) {
    return Array.from({ length: series.length || 7 }, () => 0);
  }

  return series.map((value) => Number((((value - series[0]) / series[0]) * 100).toFixed(2)));
}

function mapIntervalToDays(interval: ArenaInterval) {
  if (interval === "1h") return 1;
  if (interval === "24h") return 1;
  if (interval === "7d") return 7;
  return 30;
}

function dayLabels(interval: ArenaInterval) {
  if (interval === "1h") return ["-60m", "-50m", "-40m", "-30m", "-20m", "-10m", "Now"];
  if (interval === "24h") return ["-24h", "-20h", "-16h", "-12h", "-8h", "-4h", "Now"];
  if (interval === "7d") return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return ["-30d", "-25d", "-20d", "-15d", "-10d", "-5d", "Now"];
}

function buildSignal({ momentum, velocity, holders, whales }: { momentum: number; velocity: number; holders: number; whales: number }) {
  const holderStrength = clamp(Math.round(Math.log10(Math.max(holders, 1)) * 15), 20, 92);
  const whalePenalty = clamp(Math.round(whales), 10, 95);
  return {
    momentum: clamp(Math.round(momentum), 10, 95),
    velocity: clamp(Math.round(velocity), 10, 95),
    holderStrength,
    whalePenalty,
  };
}

function toArenaToken(
  coin: CoinGeckoMarket,
  meta: WatchCoin,
  sampledPrices: number[],
): ArenaToken {
  const priceChange = seriesToPctChange(sampledPrices);
  const latestMove = priceChange[priceChange.length - 1] ?? 0;
  const change24 = coin.price_change_percentage_24h_in_currency ?? 0;
  const velocityRatio = coin.market_cap > 0 ? coin.total_volume / coin.market_cap : 0;

  const sentiment = Math.round(clamp(50 + latestMove * 2.2 + change24 * 1.2 + velocityRatio * 120, 30, 96));
  const whales = Math.round(clamp(24 + velocityRatio * 210 + Math.abs(change24) * 2.2, 10, 96));
  const estimatedHolders = Math.round(clamp((coin.market_cap / Math.max(coin.current_price, 0.00000001)) ** 0.36, 15000, 450000));

  const socials = priceChange.map((pct, idx) =>
    Math.round(clamp(sentiment - 14 + idx * 3 + pct * 1.4, 18, 99)),
  );

  const velocityScore = clamp(Math.round(velocityRatio * 210), 12, 95);
  const signal = buildSignal({
    momentum: sentiment + latestMove,
    velocity: velocityScore,
    holders: estimatedHolders,
    whales,
  });

  return {
    id: meta.id,
    symbol: meta.symbol,
    name: meta.name,
    chain: meta.chain,
    currentPrice: coin.current_price,
    marketCap: coin.market_cap,
    volume24h: coin.total_volume,
    holders: estimatedHolders,
    whales,
    sentiment,
    socials,
    priceChange,
    signal,
  };
}

function buildWeeklyWars(tokens: ArenaToken[], interval: ArenaInterval) {
  const labels = dayLabels(interval);
  const top3 = tokens.slice(0, 3);

  return labels.map((day, i) => {
    const alpha = Math.round(clamp((top3[0]?.socials[i] ?? 30) / 2.1, 8, 48));
    const beta = Math.round(clamp((top3[1]?.socials[i] ?? 28) / 2.3, 8, 44));
    const gamma = Math.round(clamp((top3[2]?.socials[i] ?? 26) / 2.5, 8, 40));

    return { day, alpha, beta, gamma };
  });
}

function buildHeatMap(tokens: ArenaToken[]) {
  const rows = ["US", "EU", "Asia", "LATAM"];
  const cols = tokens.map((t) => t.symbol);
  const cellBase = tokens.map((t) => Math.round(clamp(t.sentiment + t.signal.velocity * 0.2, 35, 98)));

  const multipliers = [1.08, 0.98, 1.04, 0.9];
  const matrix = multipliers.map((m) =>
    cellBase.map((base, i) => Math.round(clamp(base * m - i * 2, 32, 99))),
  );

  return { rows, cols, matrix };
}

function buildWalletFlows(tokens: ArenaToken[]) {
  const totalVol = tokens.reduce((sum, token) => sum + token.volume24h, 0);
  const avgSentiment = tokens.reduce((sum, token) => sum + token.sentiment, 0) / tokens.length;

  const smart = Math.round(clamp(totalVol / 45000000 + avgSentiment * 1.4, 90, 900));
  const fresh = Math.round(clamp(totalVol / 34000000 + avgSentiment * 1.9, 130, 1300));
  const wakeups = Math.round(clamp(totalVol / 80000000 + avgSentiment, 60, 600));
  const exits = Math.round(clamp((100 - avgSentiment) * 2.4 + totalVol / 100000000, 70, 650));

  return [
    { label: "Smart Wallets", value: smart },
    { label: "New Wallets", value: fresh },
    { label: "Dormant Wakeups", value: wakeups },
    { label: "Exits", value: exits },
  ];
}

function buildDashboard(tokens: ArenaToken[], source: "live" | "fallback", interval: ArenaInterval): ArenaDashboardData {
  const sorted = tokens.slice().sort((a, b) => b.marketCap - a.marketCap);
  const heat = buildHeatMap(sorted);

  return {
    interval,
    tokens: sorted,
    weeklyWars: buildWeeklyWars(sorted, interval),
    heatMapRows: heat.rows,
    heatMapCols: heat.cols,
    heatMap: heat.matrix,
    walletFlows: buildWalletFlows(sorted),
    lastUpdated: new Date().toISOString(),
    source,
  };
}

async function fetchMarkets(selected: WatchCoin[]) {
  const ids = selected.map((coin) => coin.id).join(",");
  const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&sparkline=false&price_change_percentage=24h`;

  const response = await fetch(url, {
    next: { revalidate: 300 },
    headers: { accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`CoinGecko markets failed: ${response.status}`);
  }

  const payload = (await response.json()) as CoinGeckoMarket[];
  if (!Array.isArray(payload) || payload.length < 3) {
    throw new Error("CoinGecko markets payload insufficient");
  }

  return payload;
}

async function fetchCoinSeries(id: string, interval: ArenaInterval) {
  const days = mapIntervalToDays(interval);
  const endpoint = `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${days}&interval=hourly`;

  const response = await fetch(endpoint, {
    next: { revalidate: 300 },
    headers: { accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Series fetch failed for ${id}: ${response.status}`);
  }

  const payload = (await response.json()) as CoinGeckoChart;
  const raw = payload.prices?.map((point) => point[1]) ?? [];
  if (!raw.length) {
    throw new Error(`Series empty for ${id}`);
  }

  const scoped =
    interval === "1h" ? raw.slice(-12) : interval === "24h" ? raw.slice(-24) : raw;

  return sampleSeries(scoped, 7);
}

async function fetchLiveTokens(interval: ArenaInterval, selected: WatchCoin[]) {
  const markets = await fetchMarkets(selected);
  const marketById = new Map(markets.map((item) => [item.id, item]));

  const seriesEntries = await Promise.all(
    selected.map(async (coin) => [coin.id, await fetchCoinSeries(coin.id, interval)] as const),
  );
  const seriesById = new Map(seriesEntries);

  const mapped = selected.flatMap((meta) => {
    const market = marketById.get(meta.id);
    const series = seriesById.get(meta.id);
    if (!market || !series) return [];
    return [toArenaToken(market, meta, series)];
  });

  if (mapped.length < 3) {
    throw new Error("Mapped live rows are insufficient");
  }

  return mapped;
}

function fallbackFor(selectedIds?: string[]) {
  if (!selectedIds?.length) return FALLBACK_BASE;
  const chosen = FALLBACK_BASE.filter((token) => selectedIds.includes(token.id));
  return chosen.length >= 3 ? chosen : FALLBACK_BASE;
}

function pickWatchCoins(selectedIds?: string[]) {
  if (!selectedIds?.length) return WATCHLIST;
  const selected = WATCHLIST.filter((coin) => selectedIds.includes(coin.id));
  return selected.length >= 3 ? selected : WATCHLIST;
}

export function getAvailableWatchCoins() {
  return WATCHLIST;
}

export async function getArenaDashboardData(options?: {
  interval?: ArenaInterval;
  selectedIds?: string[];
}): Promise<ArenaDashboardData> {
  const interval = options?.interval ?? "7d";
  const selected = pickWatchCoins(options?.selectedIds);

  try {
    const live = await fetchLiveTokens(interval, selected);
    return buildDashboard(live, "live", interval);
  } catch {
    return buildDashboard(fallbackFor(options?.selectedIds), "fallback", interval);
  }
}
