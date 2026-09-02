import Link from "next/link";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/brand";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-ink p-10 text-paper lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, var(--color-violet) 0, transparent 45%), radial-gradient(circle at 80% 70%, var(--color-coral) 0, transparent 45%)",
          }}
        />
        <Link href="/" className="relative font-display text-2xl font-extrabold">
          {SITE_NAME}
        </Link>

        <div className="relative">
          <p className="max-w-sm font-display text-4xl font-extrabold leading-tight">
            {SITE_TAGLINE}
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {["🗺️ квесты вместо домашки", "🏅 ачивки и звания", "📈 честный прогресс"].map((t) => (
              <span
                key={t}
                className="sticker rounded-full border-2 border-paper/40 bg-white/10 px-3 py-1.5 text-sm font-semibold backdrop-blur"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-paper/60">
          © {new Date().getFullYear()} {SITE_NAME}
        </p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
