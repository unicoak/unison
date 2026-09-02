const TONES = {
  lime: "bg-lime text-ink",
  violet: "bg-violet text-white",
  coral: "bg-coral text-white",
  sky: "bg-sky text-ink",
  sun: "bg-sun text-ink",
  ink: "bg-ink text-white",
  paper: "bg-white text-ink",
} as const;

export function Badge({
  children,
  tone = "ink",
  className = "",
}: {
  children: React.ReactNode;
  tone?: keyof typeof TONES;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border-2 border-ink px-3 py-1 font-display text-xs font-semibold uppercase tracking-wide ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
