import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { SUBMISSION_STATUS_LABELS } from "@/lib/labels";
import { ReviewPanel } from "./ReviewPanel";
import { CloseQuestButton } from "./CloseQuestButton";

export default async function ManageQuestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireStaff();

  const quest = await prisma.quest.findUnique({
    where: { id },
    include: {
      assignments: { include: { student: true }, orderBy: { student: { displayName: "asc" } } },
      submissions: { include: { files: true } },
    },
  });
  if (!quest) notFound();

  const submissionByStudent = new Map(quest.submissions.map((s) => [s.studentId, s]));

  return (
    <div className="flex flex-col gap-6">
      <div className="brutal-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-display text-xs font-bold uppercase tracking-widest text-violet">Квест</p>
            <h1 className="mt-1 font-display text-2xl font-extrabold sm:text-3xl">{quest.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone="violet">+{quest.xpReward} XP</Badge>
            {quest.status === "CLOSED" ? <Badge tone="ink">Закрыт</Badge> : <CloseQuestButton questId={quest.id} />}
          </div>
        </div>
        <p className="mt-4 whitespace-pre-wrap text-ink-soft">{quest.description}</p>
      </div>

      <div className="flex flex-col gap-4">
        {quest.assignments.map((a) => {
          const submission = submissionByStudent.get(a.studentId);
          const status = submission ? SUBMISSION_STATUS_LABELS[submission.status] : null;

          return (
            <div key={a.id} className="brutal-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-display text-base font-bold">{a.student.displayName}</p>
                {status ? <Badge tone={status.tone}>{status.label}</Badge> : <Badge tone="paper">Не сдано</Badge>}
              </div>

              {submission && (
                <div className="mt-3 flex flex-col gap-2 text-sm">
                  {submission.textContent && <p className="whitespace-pre-wrap text-ink-soft">{submission.textContent}</p>}
                  {submission.links.length > 0 && (
                    <ul className="flex flex-col gap-1">
                      {submission.links.map((l) => (
                        <li key={l}>
                          <a href={l} target="_blank" rel="noreferrer" className="break-all text-violet underline">
                            {l}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                  {submission.files.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {submission.files.map((f) => (
                        <a
                          key={f.id}
                          href={f.url}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg border-2 border-ink bg-white px-3 py-1 text-xs font-semibold"
                        >
                          {f.type === "IMAGE" ? "🖼️" : f.type === "VIDEO" ? "🎬" : "📎"} {f.filename}
                        </a>
                      ))}
                    </div>
                  )}
                  {submission.teacherComment && (
                    <p className="rounded-lg bg-sky/10 p-2 text-xs text-ink-soft">
                      Комментарий: {submission.teacherComment}
                    </p>
                  )}
                </div>
              )}

              {submission && submission.status === "SUBMITTED" && (
                <ReviewPanel submissionId={submission.id} defaultXp={quest.xpReward} />
              )}
              {submission && (submission.status === "APPROVED" || submission.status === "REJECTED" || submission.status === "NEEDS_REVISION") && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-xs font-semibold text-ink-soft">
                    Пересмотреть решение
                  </summary>
                  <ReviewPanel submissionId={submission.id} defaultXp={quest.xpReward} />
                </details>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
