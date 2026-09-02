import { changeRoleAction } from "./actions";
import type { AppRole } from "@/lib/guards";

const TARGET_LABEL: Record<"STUDENT" | "TEACHER", string> = {
  STUDENT: "учеником",
  TEACHER: "учителем",
};

export function RoleToggle({ userId, role }: { userId: string; role: AppRole }) {
  if (role === "GOD") return null;

  const target = role === "STUDENT" ? "TEACHER" : "STUDENT";
  const action = changeRoleAction.bind(null, userId, target);

  return (
    <form action={action}>
      <button
        type="submit"
        className="rounded-full border-2 border-ink bg-white px-3 py-1 font-display text-xs font-semibold hover:bg-paper-dim"
      >
        Сделать {TARGET_LABEL[target]}
      </button>
    </form>
  );
}
