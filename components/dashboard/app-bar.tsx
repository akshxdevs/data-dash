import { cn } from "@/lib/utils";
import { formatLocalTime } from "@/utils/format";

export function AppBar({
  theme,
  onToggleTheme,
  source,
  lastUpdated,
  loading,
}: {
  theme: "light" | "dark";
  onToggleTheme: () => void;
  source: "live" | "fallback";
  lastUpdated: string;
  loading: boolean;
}) {
  return (
    <header className="relative grid items-center gap-3 rounded-2xl border border-[var(--line)] bg-[linear-gradient(120deg,rgba(255,255,255,.94),rgba(243,248,255,.9))] px-3 py-2 shadow-[0_12px_28px_rgba(17,29,54,.12)] backdrop-blur-md max-sm:grid-cols-1 sm:grid-cols-[auto_1fr_auto] motion-safe:[animation:fadeUp_.55s_ease-out_both] dark:bg-[linear-gradient(120deg,rgba(15,25,44,.95),rgba(12,20,36,.94))] dark:shadow-[0_14px_30px_rgba(2,6,16,.4)]">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#ffb703,#ff6b35)] text-xs font-black text-slate-900 shadow-[0_8px_18px_rgba(255,107,53,.35)]">
          DD
        </span>
        <div className="min-w-0">
          <p className="m-0 truncate font-[var(--font-montserrat)] text-[0.95rem] font-black leading-tight text-[var(--ink)]">Data Dash Arena</p>
          <small className="m-0 hidden truncate text-[0.7rem] text-[var(--muted)] sm:block">Intelligence Console</small>
        </div>
      </div>

      <nav
        aria-label="Dashboard quick tabs"
        className="no-scrollbar justify-self-stretch overflow-x-auto whitespace-nowrap rounded-full border border-[#dce7ff] bg-[#f6faff] p-1 max-sm:w-full dark:border-[#2a3c63] dark:bg-[#101b31]"
      >
        <div className="flex items-center gap-1">
          {[
            { label: "Command", active: true },
            { label: "Signals", active: false },
            { label: "Compare", active: false },
            { label: "Alerts", active: false },
          ].map(({ label, active }) => (
            <span
              key={label}
              className={cn(
                "rounded-full px-2.5 py-1 text-[0.7rem] transition-colors",
                active
                  ? "bg-[#162845] text-white dark:bg-[#ffd166] dark:text-[#17233d]"
                  : "text-[#526384] dark:text-[#9fb4dc]",
              )}
            >
              {label}
            </span>
          ))}
        </div>
      </nav>

      <div className="flex items-center gap-2 whitespace-nowrap max-sm:justify-self-start">
        <p
          title={source === "live" ? "Live data source" : "Fallback data source"}
          className={cn(
            "m-0 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[0.72rem] font-bold",
            source === "live" ? "bg-[#d2f9f0] text-[#045b55] dark:bg-[#113834] dark:text-[#86f6de]" : "bg-[#ffe9c9] text-[#8b5d00] dark:bg-[#3f3316] dark:text-[#ffd899]",
          )}
        >
          <i
            className={cn(
              "inline-block h-2 w-2 rounded-full [animation:blink_1.6s_ease-in-out_infinite]",
              source === "live" ? "bg-[#07beb8]" : "bg-[#ffb703]",
            )}
          />
          {loading ? "Syncing" : source === "live" ? "Live" : "Fallback"}
        </p>

        <small className="hidden text-[0.7rem] text-[var(--muted)] md:block">{formatLocalTime(lastUpdated)}</small>

        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-[#d6e5ff] bg-[#eaf2ff] dark:border-[#2d4066] dark:bg-[#162540]">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-[#355587] dark:fill-[#ffd166]" role="img">
            <path d="M12 3l2.8 5.7L21 9.6l-4.5 4.4 1.1 6.2L12 17.2 6.4 20.2 7.5 14 3 9.6l6.2-.9z" />
          </svg>
        </span>

        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#1a2b48] bg-[#1a2b48] text-white transition hover:brightness-110 dark:border-[#ffd166] dark:bg-[#ffd166] dark:text-[#17233d]"
          onClick={onToggleTheme}
          aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
          title={theme === "light" ? "Dark mode" : "Light mode"}
        >
          {theme === "light" ? (
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" role="img">
              <path d="M21 12.8A9 9 0 1111.2 3 7 7 0 0021 12.8z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-[1.7]" role="img">
              <circle cx="12" cy="12" r="4.2" fill="currentColor" stroke="none" />
              <path d="M12 2.5v3M12 18.5v3M21.5 12h-3M5.5 12h-3M18.7 5.3l-2 2M7.3 16.7l-2 2M18.7 18.7l-2-2M7.3 7.3l-2-2" />
            </svg>
          )}
        </button>
      </div>
    </header>
  );
}
