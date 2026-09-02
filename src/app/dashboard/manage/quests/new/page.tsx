import { requireStaff } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { NewQuestForm } from "./NewQuestForm";

export default async function NewQuestPage() {
  await requireStaff();

  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    select: { id: true, displayName: true },
    orderBy: { displayName: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-3xl font-extrabold">Новый квест</h1>
      <NewQuestForm students={students} />
    </div>
  );
}
