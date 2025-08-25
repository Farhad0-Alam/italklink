export function formatDurationUsingIntl(daysInput) {
  const daysInYear = 365;
  const daysInMonth = 30;

  const years = Math.floor(daysInput / daysInYear);
  daysInput %= daysInYear;

  const months = Math.floor(daysInput / daysInMonth);
  const days = daysInput % daysInMonth;

  const parts = [];
  if (years > 0) parts.push(`${years} year${years > 1 ? "s" : ""}`);
  if (months > 0) parts.push(`${months} month${months > 1 ? "s" : ""}`);
  if (days > 0) parts.push(`${days} day${days > 1 ? "s" : ""}`);

  return parts.join(", ");
}
