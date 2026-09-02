import type { AppRole } from "@/lib/guards";

export type NavItem = { href: string; label: string; icon: string };

const STUDENT_NAV: NavItem[] = [
  { href: "/dashboard", label: "Обзор", icon: "🏠" },
  { href: "/dashboard/quests", label: "Квесты", icon: "🗺️" },
  { href: "/dashboard/achievements", label: "Ачивки", icon: "🏅" },
  { href: "/dashboard/schedule", label: "Расписание", icon: "🗓️" },
  { href: "/dashboard/curriculum", label: "План", icon: "📚" },
];

const STAFF_NAV: NavItem[] = [
  { href: "/dashboard", label: "Обзор", icon: "🏠" },
  { href: "/dashboard/manage/quests", label: "Квесты", icon: "🗺️" },
  { href: "/dashboard/manage/students", label: "Ученики", icon: "🧑‍🎓" },
  { href: "/dashboard/manage/schedule", label: "Расписание", icon: "🗓️" },
  { href: "/dashboard/manage/curriculum", label: "План", icon: "📚" },
];

const GOD_EXTRA_NAV: NavItem[] = [{ href: "/dashboard/manage/users", label: "Пользователи", icon: "🛡️" }];

export function getNavForRole(role: AppRole): NavItem[] {
  if (role === "STUDENT") return STUDENT_NAV;
  if (role === "TEACHER") return STAFF_NAV;
  return [...STAFF_NAV, ...GOD_EXTRA_NAV];
}
