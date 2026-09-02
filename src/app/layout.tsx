import type { Metadata } from "next";
import { Unbounded, Golos_Text } from "next/font/google";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/brand";
import "./globals.css";

const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600", "700", "800"],
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
    <html lang="ru">
      <body className={`${unbounded.variable} ${golos.variable} antialiased`}>{children}</body>
    </html>
  );
}
