import Link from "next/link";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/brand";
import { LinkButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const FEATURES = [
  {
    icon: "🗺️",
    title: "Квесты вместо домашки",
    text: "Учитель выдаёт задания-квесты, ученик сдаёт текстом, ссылкой, фото или видео — прямо с телефона.",
    tone: "lime" as const,
  },
  {
    icon: "📈",
    title: "Опыт и уровни",
    text: "Каждый принятый квест — это XP. Растёт полоса опыта — растёт уровень и звание.",
    tone: "sky" as const,
  },
  {
    icon: "🏅",
    title: "Ачивки и звания",
    text: "Учитель вручает ачивки за старания, часть — открывается автоматически за прогресс.",
    tone: "sun" as const,
  },
  {
    icon: "🗓️",
    title: "Расписание и план",
    text: "Учебный план и расписание на весь год — всегда под рукой, без бумажек и скринов из чата.",
    tone: "violet" as const,
  },
];

const ROLES = [
  { emoji: "🧑‍🎓", title: "Ученик", text: "Копит опыт, качает уровень, собирает ачивки и звания" },
  { emoji: "🧑‍🏫", title: "Учитель", text: "Создаёт квесты, проверяет сдачи, начисляет баллы и ведёт план" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 md:px-8">
        <span className="font-display text-xl font-extrabold tracking-tight">{SITE_NAME}</span>
        <nav className="flex items-center gap-2">
          <LinkButton href="/login" variant="ghost" size="sm">
            Войти
          </LinkButton>
          <LinkButton href="/register" variant="primary" size="sm">
            Начать
          </LinkButton>
        </nav>
      </header>

      <section className="mx-auto grid max-w-6xl gap-10 px-4 pb-16 pt-10 md:grid-cols-2 md:items-center md:px-8 md:pt-16">
        <div>
          <Badge tone="sun" className="mb-5">
            Новый учебный год, новая система
          </Badge>
          <h1 className="font-display text-4xl font-extrabold leading-[1.05] sm:text-5xl">
            {SITE_TAGLINE}
          </h1>
          <p className="mt-5 max-w-md text-lg text-ink-soft">
            Домашка превращается в квесты, баллы — в уровни, а старания — в звания и ачивки.
            Учитель ведёт класс, ученик прокачивается, всё в одном месте.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton href="/register" size="lg">
              Зарегистрироваться →
            </LinkButton>
            <LinkButton href="/login" variant="ghost" size="lg">
              У меня уже есть аккаунт
            </LinkButton>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-sm">
          <div className="brutal-card rotate-2 p-5">
            <p className="font-display text-xs uppercase tracking-widest text-ink-soft">Уровень 7</p>
            <p className="font-display text-2xl font-bold">Знаток алгоритмов</p>
            <div className="mt-3 h-5 w-full overflow-hidden rounded-full border-2 border-ink bg-paper-dim">
              <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-lime to-sky" />
            </div>
            <p className="mt-2 text-xs font-semibold text-ink-soft">640 / 900 XP до 8 уровня</p>
          </div>

          <div className="sticker brutal-card absolute -bottom-6 -left-6 -rotate-6 bg-sun p-3 text-sm font-bold">
            🏅 Первый квест сдан
          </div>
          <div className="sticker brutal-card absolute -right-4 -top-4 rotate-6 bg-white p-3 text-sm font-bold">
            +50 XP ✅
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 md:px-8">
        <h2 className="font-display text-3xl font-extrabold">Что внутри</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="brutal-card p-5">
              <span className="sticker mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl border-2 border-ink bg-white text-xl">
                {f.icon}
              </span>
              <p className="font-display text-lg font-bold">{f.title}</p>
              <p className="mt-1.5 text-sm text-ink-soft">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 md:px-8">
        <h2 className="font-display text-3xl font-extrabold">Ученик и учитель — в одной системе</h2>
        <div className="mx-auto mt-8 grid max-w-2xl gap-5 sm:grid-cols-2">
          {ROLES.map((r) => (
            <div key={r.title} className="brutal-card p-6 text-center">
              <p className="text-4xl">{r.emoji}</p>
              <p className="mt-3 font-display text-xl font-bold">{r.title}</p>
              <p className="mt-1.5 text-sm text-ink-soft">{r.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 md:px-8">
        <div className="brutal-card flex flex-col items-center gap-4 bg-ink p-10 text-center text-paper">
          <p className="font-display text-2xl font-extrabold sm:text-3xl">Готовы качать скиллы?</p>
          <LinkButton href="/register" variant="primary" size="lg">
            Создать аккаунт бесплатно
          </LinkButton>
        </div>
      </section>

      <footer className="border-t-2 border-ink px-4 py-6 text-center text-sm text-ink-soft">
        <Link href="/">{SITE_NAME}</Link> · © {new Date().getFullYear()}
      </footer>
    </div>
  );
}
