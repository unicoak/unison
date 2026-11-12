import { requireStaff } from "@/lib/guards";
import { EXPORT_INFO, EXPORT_TYPES } from "@/lib/export";

const linkClass =
  "rounded-full bg-white px-4 py-1.5 font-display text-xs font-semibold text-blue ring-1 ring-line hover:bg-paper-dim";

export default async function ExportPage() {
  await requireStaff();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold">Выгрузка данных</h1>
        <p className="mt-1 max-w-2xl text-ink-soft">
          Таблицы для Excel. Файл .xlsx — одной книгой или отдельной таблицей, .csv открывается в Excel и Google
          Таблицах. Даты — по сахалинскому времени.
        </p>
      </div>

      <div className="brutal-card flex flex-wrap items-center justify-between gap-3 p-5">
        <div>
          <p className="font-display text-base font-bold">Всё сразу</p>
          <p className="text-sm text-ink-soft">Книга Excel со всеми таблицами на отдельных листах</p>
        </div>
        <a href="/api/export?type=all&format=xlsx" className="brutal-btn bg-blue text-white hover:bg-blue-deep">
          Скачать .xlsx
        </a>
      </div>

      <div className="flex flex-col gap-3">
        {EXPORT_TYPES.map((t) => (
          <div key={t} className="brutal-card flex flex-wrap items-center justify-between gap-3 p-5">
            <div className="min-w-0">
              <p className="font-display text-base font-bold">{EXPORT_INFO[t].title}</p>
              <p className="text-sm text-ink-soft">{EXPORT_INFO[t].description}</p>
            </div>
            <div className="flex gap-2">
              <a href={`/api/export?type=${t}&format=xlsx`} className={linkClass}>
                .xlsx
              </a>
              <a href={`/api/export?type=${t}&format=csv`} className={linkClass}>
                .csv
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
