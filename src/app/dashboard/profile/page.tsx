import { requireSession } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { ROLE_LABELS } from "@/lib/labels";
import { Badge } from "@/components/ui/Badge";
import { AvatarForm } from "./AvatarForm";

export default async function ProfilePage() {
  const session = await requireSession();
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return null;

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold">Профиль</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-ink-soft">
          <span className="font-semibold text-ink">{user.displayName}</span>
          <Badge tone="violet">{ROLE_LABELS[user.role]}</Badge>
          {user.username && <span className="text-sm">@{user.username}</span>}
        </div>
      </div>
      <AvatarForm name={user.displayName} avatarUrl={user.avatarUrl} />
    </div>
  );
}
