import Link from "next/link";
import { SITE_NAME } from "@/lib/brand";
import { ROLE_LABELS } from "@/lib/labels";
import type { AppRole } from "@/lib/guards";
import { Badge } from "@/components/ui/Badge";
import { logoutAction } from "@/app/dashboard/actions";

export function TopBar({ name, role }: { name: string; role: AppRole }) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b-2 border-ink bg-paper/95 px-4 py-3 backdrop-blur md:px-8">
      <Link href="/dashboard" className="font-display text-lg font-extrabold tracking-tight">
        {SITE_NAME}
      </Link>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="font-display text-sm font-semibold leading-tight">{name}</p>
        </div>
        <Badge tone={role === "GOD" ? "coral" : role === "TEACHER" ? "violet" : "lime"}>
          {ROLE_LABELS[role]}
        </Badge>
        <form action={logoutAction}>
          <button
            type="submit"
            className="rounded-lg border-2 border-ink bg-white px-3 py-1.5 font-display text-xs font-semibold hover:bg-paper-dim"
          >
            Выйти
          </button>
        </form>
      </div>
    </header>
  );
}
