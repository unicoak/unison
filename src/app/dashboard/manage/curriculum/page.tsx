import { requireStaff } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { CurriculumForm } from "./CurriculumForm";
import { deleteCurriculumSectionAction } from "./actions";

export default async function ManageCurriculumPage() {
  await requireStaff();
  const sections = await prisma.curriculumSection.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-3xl font-extrabold">Учебный план</h1>
      <CurriculumForm />

      <div className="flex flex-col gap-3">
        {sections.map((s) => (
          <div key={s.id} className="brutal-card flex items-start justify-between gap-3 p-4">
            <div className="min-w-0">
              <p className="font-display text-xs font-bold uppercase tracking-widest text-violet">
                {s.order}. {s.period}
              </p>
              <p className="font-display text-base font-bold">{s.title}</p>
              <p className="text-sm text-ink-soft">{s.description}</p>
            </div>
            <form action={deleteCurriculumSectionAction.bind(null, s.id)}>
              <button type="submit" className="text-xs font-semibold text-coral hover:underline">
                удалить
              </button>
            </form>
          </div>
        ))}
        {sections.length === 0 && <p className="brutal-card p-5 text-sm text-ink-soft">План пока пуст.</p>}
      </div>
    </div>
  );
}
