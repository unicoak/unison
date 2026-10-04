import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { ROLE_LABELS } from "@/lib/labels";
import { ReplyForm } from "./ReplyForm";

const dateFmt = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });

export default async function ForumTopicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireSession();

  const topic = await prisma.forumTopic.findUnique({
    where: { id },
    include: { posts: { include: { author: true }, orderBy: { createdAt: "asc" } } },
  });
  if (!topic) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/dashboard/forum" className="text-sm font-semibold text-violet hover:underline">
          ← Все темы
        </Link>
        <h1 className="mt-1 font-display text-3xl font-extrabold">{topic.title}</h1>
      </div>

      <div className="flex flex-col gap-3">
        {topic.posts.map((p) => (
          <div key={p.id} className="brutal-card p-5">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-display text-sm font-bold">{p.author.displayName}</p>
              {p.author.role !== "STUDENT" && <Badge tone="violet">{ROLE_LABELS[p.author.role]}</Badge>}
              <p className="text-xs text-ink-soft">{dateFmt.format(p.createdAt)}</p>
            </div>
            <p className="mt-2 whitespace-pre-wrap break-words text-ink-soft">{p.body}</p>
          </div>
        ))}
      </div>

      <ReplyForm topicId={topic.id} />
    </div>
  );
}
