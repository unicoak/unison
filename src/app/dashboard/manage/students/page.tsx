import Link from "next/link";
import { requireStaff } from "@/lib/guards";
import { prisma } from "@/lib/prisma";

export default async function ManageStudentsPage() {
  await requireStaff();

  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    include: { studentProfile: true },
    orderBy: { displayName: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-3xl font-extrabold">Ученики</h1>

      {students.length === 0 ? (
        <p className="brutal-card p-6 text-sm text-ink-soft">Пока никто не зарегистрировался.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {students.map((s) => (
            <Link
              key={s.id}
              href={`/dashboard/manage/students/${s.id}`}
              className="brutal-card flex items-center justify-between gap-3 p-4"
            >
              <div>
                <p className="font-display text-base font-bold">{s.displayName}</p>
                <p className="text-xs text-ink-soft">{s.email}</p>
              </div>
              <div className="text-right">
                <p className="font-display text-sm font-extrabold text-violet">
                  Ур. {s.studentProfile?.level ?? 1}
                </p>
                <p className="text-xs text-ink-soft">{s.studentProfile?.xp ?? 0} XP</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
