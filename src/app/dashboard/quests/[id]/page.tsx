import { notFound } from "next/navigation";
import { requireRole } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { SUBMISSION_STATUS_LABELS } from "@/lib/labels";
import { SubmissionForm } from "./SubmissionForm";

function formatDate(d: Date | null) {
  if (!d) return null;
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric" }).format(d);
}

export default async function QuestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireRole(["STUDENT"]);

  const assignment = await prisma.questAssignment.findUnique({
    where: { questId_studentId: { questId: id, studentId: session.user.id } },
    include: {
      quest: true,
    },
  });
  if (!assignment) notFound();

  const submission = await prisma.questSubmission.findUnique({
    where: { questId_studentId: { questId: id, studentId: session.user.id } },
    include: { files: true },
  });

  const status = submission ? SUBMISSION_STATUS_LABELS[submission.status] : null;
  const canEdit = !submission || submission.status === "NEEDS_REVISION" || submission.status === "REJECTED";

  return (
    <div className="flex flex-col gap-6">
      <div className="brutal-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-display text-xs font-bold uppercase tracking-widest text-violet">Квест</p>
            <h1 className="mt-1 font-display text-2xl font-extrabold sm:text-3xl">{assignment.quest.title}</h1>
          </div>
          {status && <Badge tone={status.tone}>{status.label}</Badge>}
        </div>

        <p className="mt-4 whitespace-pre-wrap text-ink-soft">{assignment.quest.description}</p>

        <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold">
          <span className="rounded-full bg-violet/10 px-3 py-1 text-violet">+{assignment.quest.xpReward} XP</span>
          {assignment.quest.dueAt && (
            <span className="rounded-full bg-paper-dim px-3 py-1 text-ink-soft">
              дедлайн: {formatDate(assignment.quest.dueAt)}
            </span>
          )}
        </div>
      </div>

      {submission?.teacherComment && (
        <div className="brutal-card border-sky bg-sky/10 p-5">
          <p className="font-display text-sm font-bold">Комментарий учителя</p>
          <p className="mt-1 text-sm text-ink-soft">{submission.teacherComment}</p>
        </div>
      )}

      {submission?.status === "APPROVED" && (
        <div className="brutal-card bg-lime/20 p-5 text-center">
          <p className="font-display text-xl font-extrabold">Принято! +{submission.xpAwarded ?? assignment.quest.xpReward} XP 🎉</p>
        </div>
      )}

      {canEdit && (
        <SubmissionForm
          questId={id}
          initial={{
            textContent: submission?.textContent ?? "",
            links: submission?.links ?? [],
          }}
          isResubmission={!!submission}
        />
      )}

      {submission && !canEdit && (
        <div className="brutal-card p-5">
          <p className="font-display text-sm font-bold">
            {submission.status === "SUBMITTED" ? "Твоя сдача на проверке" : "Твоя сдача"}
          </p>
          {submission.textContent && <p className="mt-2 whitespace-pre-wrap text-sm text-ink-soft">{submission.textContent}</p>}
          {submission.links.length > 0 && (
            <ul className="mt-2 flex flex-col gap-1 text-sm">
              {submission.links.map((l) => (
                <li key={l}>
                  <a href={l} target="_blank" rel="noreferrer" className="text-violet underline break-all">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          )}
          {submission.files.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {submission.files.map((f) => (
                <a
                  key={f.id}
                  href={f.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border-2 border-ink bg-white px-3 py-1.5 text-xs font-semibold"
                >
                  {f.type === "IMAGE" ? "🖼️" : f.type === "VIDEO" ? "🎬" : "📎"} {f.filename}
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
