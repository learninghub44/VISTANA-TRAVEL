/**
 * Client-side CSV export, shared across admin list views.
 *
 * Two fixes over the original: values starting with = + - @ (or tab/CR) are
 * prefixed with an apostrophe so a malicious customer name like
 * `=HYPERLINK(...)` can't run as a formula when staff open the file in Excel,
 * and the file is built from a Blob (the old data: URI broke on any `#` in the data).
 */
export function csvCell(value: unknown): string {
  let s = String(value ?? "");
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export function buildCsv(headers: string[], rows: unknown[][]): string {
  return [headers.map(csvCell).join(","), ...rows.map((r) => r.map(csvCell).join(","))].join("\r\n");
}

export function downloadCsv(filenamePrefix: string, headers: string[], rows: (string | number)[][]) {
  const blob = new Blob(["\uFEFF" + buildCsv(headers, rows)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filenamePrefix}_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
