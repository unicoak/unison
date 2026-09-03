"use client";

export default function DashboardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-6 text-center">
      <span className="text-4xl">🛠️</span>
      <p className="font-display text-xl font-bold">Что-то пошло не так</p>
      <p className="max-w-sm text-sm text-ink-soft">
        Не получилось выполнить действие — возможно, дело в слишком большом файле или временных проблемах связи.
        Попробуйте ещё раз, а если файл видео — попробуйте прислать ссылку на облако вместо самого файла.
      </p>
      <button onClick={() => reset()} className="brutal-btn bg-lime text-ink">
        Попробовать снова
      </button>
    </div>
  );
}
