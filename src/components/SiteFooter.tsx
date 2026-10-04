import { SITE_NAME, ORGANIZATION } from "@/lib/brand";

const buildTime = process.env.NEXT_PUBLIC_BUILD_TIME;
const commit = process.env.NEXT_PUBLIC_GIT_COMMIT;

function formatBuildTime(iso: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Moscow",
  }).format(new Date(iso));
}

export function SiteFooter({ className = "" }: { className?: string }) {
  const version = process.env.NEXT_PUBLIC_APP_VERSION;
  return (
    <footer className={`px-4 py-4 text-center text-xs text-ink-soft ${className}`}>
      <p>
        {SITE_NAME} · {ORGANIZATION} · © {new Date().getFullYear()}
      </p>
      <p className="mt-0.5">
        v{version}
        {commit ? ` (${commit})` : ""}
        {buildTime ? ` · сборка ${formatBuildTime(buildTime)} МСК` : ""}
      </p>
    </footer>
  );
}
