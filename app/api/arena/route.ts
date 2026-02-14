import { getArenaDashboardData, type ArenaInterval } from "@/lib/live-analytics";

function toInterval(value: string | null): ArenaInterval {
  if (value === "1h" || value === "24h" || value === "7d" || value === "30d") {
    return value;
  }
  return "7d";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const interval = toInterval(searchParams.get("interval"));
  const ids = (searchParams.get("ids") ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  const data = await getArenaDashboardData({ interval, selectedIds: ids.length ? ids : undefined });
  return Response.json(data, {
    headers: {
      "cache-control": "public, max-age=60, s-maxage=60, stale-while-revalidate=240",
    },
  });
}
