export function pickNextRandomIndex(length, previousIndex = -1, random = Math.random) {
  const count = Math.max(0, Math.floor(Number(length) || 0));
  if (count === 0) return -1;
  if (count === 1) return 0;

  const previous =
    Number.isInteger(previousIndex) && previousIndex >= 0 && previousIndex < count
      ? previousIndex
      : -1;
  const available = previous >= 0 ? count - 1 : count;
  const sample = Math.min(0.999999999, Math.max(0, Number(random()) || 0));
  let next = Math.floor(sample * available);
  if (previous >= 0 && next >= previous) next += 1;
  return next;
}
