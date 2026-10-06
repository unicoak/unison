const SIZES = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-28 w-28 text-3xl",
} as const;

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "?") + (parts[1]?.[0] ?? "")).toUpperCase();
}

export function Avatar({
  name,
  url,
  size = "md",
  className = "",
}: {
  name: string;
  url?: string | null;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const base = `inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full ${SIZES[size]} ${className}`;
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt={name} className={`${base} object-cover ring-2 ring-white`} />;
  }
  return (
    <span aria-label={name} className={`${base} bg-blue font-display font-extrabold text-white`}>
      {initials(name)}
    </span>
  );
}
