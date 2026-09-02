import { requireGod } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { ROLE_LABELS } from "@/lib/labels";
import { RoleToggle } from "./RoleToggle";

export default async function ManageUsersPage() {
  await requireGod();

  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold">Пользователи</h1>
        <p className="mt-1 text-ink-soft">Управление ролями — доступно только богу платформы</p>
      </div>

      <div className="flex flex-col gap-3">
        {users.map((u) => (
          <div key={u.id} className="brutal-card flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="font-display text-base font-bold">{u.displayName}</p>
              <p className="text-xs text-ink-soft">{u.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone={u.role === "GOD" ? "coral" : u.role === "TEACHER" ? "violet" : "lime"}>
                {ROLE_LABELS[u.role]}
              </Badge>
              <RoleToggle userId={u.id} role={u.role} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
