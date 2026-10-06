import { requireStaff } from "@/lib/guards";
import { getLevelDefinitions } from "@/lib/xp";
import { LevelsEditor } from "./LevelsEditor";

export default async function ManageLevelsPage() {
  await requireStaff();
  const defs = await getLevelDefinitions();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold">Уровни и опыт</h1>
        <p className="mt-1 max-w-2xl text-ink-soft">
          Сколько всего XP нужно набрать, чтобы получить уровень. Можно менять звания и пороги, добавлять
          уровни в конец и убирать последний. После сохранения уровень и звание каждого ученика
          пересчитываются по его текущему XP, а сам XP не меняется.
        </p>
      </div>
      <LevelsEditor initial={defs.map((d) => ({ title: d.title, requiredXp: d.requiredXp }))} />
      <p className="text-xs text-ink-soft">
        Ачивка «Разогнался» выдаётся при достижении 5-го уровня: если сдвинуть пороги, она
        будет выдаваться по новому порогу.
      </p>
    </div>
  );
}
