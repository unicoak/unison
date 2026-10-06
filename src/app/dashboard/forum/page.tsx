import Link from "next/link";
import { requireSession } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { Avatar } from "@/components/ui/Avatar";
import { LinkButton } from "@/components/ui/Button";

const dateFmt = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export default async function ForumPage() {
  await requireSession();

  const topics = await prisma.forumTopic.findMany({
    include: {
      author: { select: { displayName: true, avatarUrl: true } },
      _count: { select: { posts: true } },
      posts: { orderBy: { createdAt: "desc" }, take: 1, select: { createdAt: true } },
    },
  });
  const sorted = topics
    .map((t) => ({ ...t, lastAt: t.posts[0]?.createdAt ?? t.createdAt }))
    .sort((a, b) => b.lastAt.getTime() - a.lastAt.getTime());

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-extrabold">Форум</h1>
        <LinkButton href="/dashboard/forum/new">+ Новая тема</LinkButton>
      </div>

      {sorted.length === 0 ? (
        <p className="brutal-card p-6 text-sm text-ink-soft">Тем пока нет — создайте первую!</p>
      ) : (
        <div className="flex flex-col gap-3">
          {sorted.map((t) => (
            <Link
              key={t.id}
              href={`/dashboard/forum/${t.id}`}
              className="brutal-card flex flex-wrap items-center justify-between gap-3 p-4"
            >
              <div className="flex min-w-0 items-center gap-3">
                <Avatar name={t.author.displayName} url={t.author.avatarUrl} />
                <div className="min-w-0">
                  <p className="truncate font-display text-base font-bold">{t.title}</p>
                  <p className="text-xs text-ink-soft">{t.author.displayName}</p>
                </div>
              </div>
              <div className="text-right text-xs text-ink-soft">
                <p className="font-semibold">Сообщений: {t._count.posts}</p>
                <p>{dateFmt.format(t.lastAt)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
