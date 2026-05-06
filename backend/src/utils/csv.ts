export type CsvRow = Record<string, string>;

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let token = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        token += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === "," && !inQuotes) {
      out.push(token.trim());
      token = "";
      continue;
    }
    token += ch;
  }

  out.push(token.trim());
  return out;
}

export function parseCsv(csvText: string): CsvRow[] {
  const lines = csvText
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (lines.length < 2) return [];
  const headers = splitCsvLine(lines[0]).map((h) => h.toLowerCase());

  return lines.slice(1).map((line) => {
    const cols = splitCsvLine(line);
    const row: CsvRow = {};
    headers.forEach((h, i) => {
      row[h] = (cols[i] || "").trim();
    });
    return row;
  });
}
