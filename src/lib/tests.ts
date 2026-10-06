export function formatScore(score: number, max: number) {
  const percent = max > 0 ? Math.round((score / max) * 100) : 0;
  return `${score} из ${max} (${percent}%)`;
}
