import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getArenaDashboardData, getAvailableWatchCoins } from "@/lib/live-analytics";

export const revalidate = 300;

export default async function Home() {
  const [initialData, availableCoins] = await Promise.all([
    getArenaDashboardData({ interval: "7d" }),
    Promise.resolve(getAvailableWatchCoins()),
  ]);

  return <DashboardShell initialData={initialData} availableCoins={availableCoins} />;
}
