"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";
const EVENT = "themechange";

/** Switches the light/dark theme; the choice is remembered in the browser (see the inline script in layout.tsx). */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const read = () =>
      setTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light");
    read();
    window.addEventListener(EVENT, read);
    return () => window.removeEventListener(EVENT, read);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      // storage can be blocked; the theme then just lasts until reload
    }
    window.dispatchEvent(new Event(EVENT));
  }

  const dark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      title={dark ? "Включить светлую тему" : "Включить тёмную тему"}
      aria-label={dark ? "Включить светлую тему" : "Включить тёмную тему"}
      className={`rounded-full border border-line bg-white px-3 py-1.5 text-sm leading-none hover:bg-paper-dim ${className}`}
    >
      {theme === null ? "🌓" : dark ? "☀️" : "🌙"}
    </button>
  );
}
