import Link from "next/link";
import { requireRole } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { XpHistoryList } from "@/components/dashboard/XpHistoryList";

const LIMIT = 200;

export default async function XpHistoryPage() {
  const session = await requireRole(["STUDENT"]);
  const userId = session.user.id;

  const [profile, entries, total] = await Promise.all([
    prisma.studentProfile.findUnique({ where: { userId }, select: { xp: true } }),
    prisma.xpTransaction.findMany({ where: { userId }, orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: LIMIT }),
    prisma.xpTransaction.count({ where: { userId } }),
  ]);

  // Running balance after each entry, newest first: start from the current XP and walk back.
  let balance = profile?.xp ?? 0;
  const items = entries.map((e) => {
    const item = { ...e, balance };
    balance -= e.amount;
    return item;
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/dashboard" className="text-sm font-semibold text-violet hover:underline">
          ← Обзор
        </Link>
        <h1 className="mt-1 font-display text-3xl font-extrabold">История опыта</h1>
        <p className="mt-1 text-ink-soft">Сейчас у вас {profile?.xp ?? 0} XP. Здесь все начисления и списания и причины.</p>
      </div>
      <XpHistoryList items={items} />
      {total > LIMIT && <p className="text-xs text-ink-soft">Показаны последние {LIMIT} записей из {total}.</p>}
    </div>
  );
}
