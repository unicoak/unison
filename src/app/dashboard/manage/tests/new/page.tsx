import { requireStaff } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { TestBuilder } from "./TestBuilder";

export default async function NewTestPage() {
  await requireStaff();
  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    select: { id: true, displayName: true },
    orderBy: { displayName: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-3xl font-extrabold">Новый тест</h1>
      <TestBuilder students={students} />
    </div>
  );
}
