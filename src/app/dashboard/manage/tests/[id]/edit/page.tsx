import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { TestBuilder } from "../../new/TestBuilder";

export default async function EditTestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireStaff();

  const test = await prisma.test.findUnique({
    where: { id },
    include: {
      questions: { orderBy: { order: "asc" }, include: { options: { orderBy: { order: "asc" } } } },
      _count: { select: { attempts: true } },
    },
  });
  if (!test) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href={`/dashboard/manage/tests/${id}`} className="text-sm font-semibold text-violet hover:underline">
          ← К тесту
        </Link>
        <h1 className="mt-1 font-display text-3xl font-extrabold">Редактирование теста</h1>
      </div>
      <TestBuilder
        initial={{
          testId: test.id,
          title: test.title,
          description: test.description ?? "",
          hasAttempts: test._count.attempts > 0,
          questions: test.questions.map((q) => ({
            id: q.id,
            type: q.type,
            text: q.text,
            points: q.points,
            imageUrl: q.imageUrl,
            options: q.options.map((o) => ({ id: o.id, text: o.text, isCorrect: o.isCorrect })),
          })),
        }}
      />
    </div>
  );
}
