/**
 * Pull dates out of term names, e.g. "Louisiana Purchase (1803)",
 * "Burning of Washington (Aug. 24, 1814)", "Election of 1840",
 * "Printing technology (1830s)". Curated overrides for undated terms live in
 * src/unit/timeline.ts and are listed in CONTENT_NOTES.md.
 */
export interface ParsedDate {
  /** Fractional year used for positioning (1814.64 ≈ late Aug 1814). */
  start: number;
  /** Fractional end year for spans (inclusive of the end year). */
  end?: number;
  label: string;
}

const MONTHS: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, june: 5, jun: 5, july: 6, jul: 6, aug: 7, sept: 8, sep: 8, oct: 9, nov: 10, dec: 11,
};

export function parseTermDate(name: string): ParsedDate | null {
  const years: number[] = [];
  let decade: number | null = null;
  let monthLabel: string | null = null;
  let fraction = 0;
  let listLabel: string | null = null;

  for (const [, g] of name.matchAll(/\(([^)]*)\)/g)) {
    for (const f of g.matchAll(/\b(1[6-9]\d{2})(s?)\b/g)) {
      if (f[2] === 's') decade = Number(f[1]);
      else years.push(Number(f[1]));
    }
    const mm = /\b([A-Z][a-z]{2,4})\.?\s+(?:(\d{1,2}),\s*)?(1[6-9]\d{2})\b/.exec(g);
    if (mm && monthLabel === null && MONTHS[mm[1].toLowerCase()] !== undefined) {
      const day = mm[2] ? Number(mm[2]) : 15;
      fraction = (MONTHS[mm[1].toLowerCase()] + (day - 1) / 31) / 12;
      monthLabel = mm[0];
    }
    if (/^\d{4}(,\s*\d{4})+$/.test(g.trim())) listLabel = g.trim();
  }

  const of = /\bof (1[6-9]\d{2})\b/.exec(name);
  if (of) years.push(Number(of[1]));
  const lead = /^(1[6-9]\d{2}) /.exec(name);
  if (lead) years.push(Number(lead[1]));

  if (!years.length) {
    return decade !== null ? { start: decade, end: decade + 9.99, label: `${decade}s` } : null;
  }

  const start = Math.min(...years);
  const end = Math.max(...years);
  const label = monthLabel ?? listLabel ?? (start === end ? String(start) : `${start}–${end}`);
  return end > start ? { start: start + fraction, end: end + 0.99, label } : { start: start + fraction, label };
}
