import { redirect } from "next/navigation";
import { auth } from "@/auth";

export type AppRole = "STUDENT" | "TEACHER" | "GOD";

export const isStaffRole = (role: AppRole) => role === "TEACHER" || role === "GOD";

export async function requireSession() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session;
}

export async function requireRole(roles: AppRole[]) {
  const session = await requireSession();
  if (!roles.includes(session.user.role)) redirect("/dashboard");
  return session;
}

export async function requireStaff() {
  return requireRole(["TEACHER", "GOD"]);
}

export async function requireGod() {
  return requireRole(["GOD"]);
}
