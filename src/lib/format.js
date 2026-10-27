const displayDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

export function todayISO(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function shiftDateISO(days, base = new Date()) {
  const shifted = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  shifted.setDate(shifted.getDate() + days);
  return todayISO(shifted);
}

export function isValidISODate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ''));
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export function formatDisplayDate(value) {
  if (!isValidISODate(value)) return value || '—';
  const [year, month, day] = value.split('-').map(Number);
  return displayDateFormatter.format(new Date(year, month - 1, day));
}

export function initials(company) {
  const words = String(company || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (words.length === 0) return 'JT';
  return words.map((word) => word[0].toUpperCase()).join('');
}

export function safeHttpUrl(value) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
}
