import type { Metadata } from "next";
import { Montserrat, Caveat, Golos_Text } from "next/font/google";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/brand";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "cyrillic"],
  weight: ["600", "700", "800", "900"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin", "cyrillic"],
  weight: ["600", "700"],
});

const golos = Golos_Text({
  variable: "--font-golos",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: `${SITE_NAME} — ${SITE_TAGLINE}`,
  description:
    "Платформа для уроков с квестами вместо домашки, опытом, уровнями и ачивками. Для учеников, учителей и немного магии.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        {/* Sets the saved (or system) theme before first paint to avoid a light flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("theme");if(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches)t="dark";if(t==="dark")document.documentElement.setAttribute("data-theme","dark")}catch(e){}`,
          }}
        />
      </head>
      <body className={`${montserrat.variable} ${caveat.variable} ${golos.variable} antialiased`}>{children}</body>
    </html>
  );
}
