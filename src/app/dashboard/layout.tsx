import { requireSession } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { getNavForRole } from "@/lib/nav";
import { TopBar } from "@/components/dashboard/TopBar";
import { SidebarLinks, MobileTabBar } from "@/components/dashboard/NavLinks";
import { LevelUpCelebration } from "@/components/dashboard/LevelUpCelebration";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  const { role, id, name } = session.user;
  const navItems = getNavForRole(role);

  let celebration: { level: number; title: string } | null = null;
  if (role === "STUDENT") {
    const profile = await prisma.studentProfile.findUnique({ where: { userId: id } });
    if (profile?.celebrateLevel) {
      celebration = { level: profile.celebrateLevel, title: profile.title };
    }
  }

  return (
    <div className="min-h-screen">
      <TopBar name={name ?? "Без имени"} role={role} />

      <div className="mx-auto flex max-w-6xl gap-6 px-4 pb-24 pt-6 md:px-8 md:pb-10">
        <aside className="hidden w-56 shrink-0 md:block">
          <div className="sticky top-24">
            <SidebarLinks items={navItems} />
          </div>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>

      <MobileTabBar items={navItems} />

      {celebration && <LevelUpCelebration level={celebration.level} title={celebration.title} />}
    </div>
  );
}
