type Numbered = { order: number; number: string | null };

/** The number shown next to a plan section: "1.2", or just "3" for old rows. */
export function sectionNumber(s: Numbered) {
  return s.number ?? String(s.order);
}

/** Compares "1.2" < "1.10" < "2" segment by segment, as numbers. */
export function compareSections(a: Numbered, b: Numbered) {
  const pa = sectionNumber(a).split(".").map(Number);
  const pb = sectionNumber(b).split(".").map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pa[i] ?? -1) - (pb[i] ?? -1);
    if (diff !== 0) return diff;
  }
  return 0;
}
