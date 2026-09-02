import { requireSession } from "@/lib/guards";
import { prisma } from "@/lib/prisma";

type Resource = { label: string; url: string };

export default async function CurriculumPage() {
  await requireSession();

  const sections = await prisma.curriculumSection.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold">Учебный план</h1>
        <p className="mt-1 text-ink-soft">План на весь учебный год</p>
      </div>

      {sections.length === 0 ? (
        <p className="brutal-card p-6 text-sm text-ink-soft">План пока не опубликован.</p>
      ) : (
        <ol className="flex flex-col gap-4">
          {sections.map((s, i) => {
            const resources = (Array.isArray(s.resources) ? s.resources : []) as unknown as Resource[];
            return (
              <li key={s.id} className="brutal-card flex gap-4 p-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-sun font-display text-sm font-extrabold">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="font-display text-xs font-bold uppercase tracking-widest text-violet">
                    {s.period}
                  </p>
                  <p className="mt-0.5 font-display text-lg font-bold">{s.title}</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-ink-soft">{s.description}</p>
                  {resources.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {resources.map((r) => (
                        <a
                          key={r.url}
                          href={r.url}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg border-2 border-ink bg-white px-3 py-1 text-xs font-semibold text-violet underline"
                        >
                          {r.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
