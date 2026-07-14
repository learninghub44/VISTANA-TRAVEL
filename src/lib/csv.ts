/**
 * Client-side CSV export, shared across admin list views. Extracted from
 * BookingsManager's original inline exportToCSV so Customers/Reviews (and
 * anything added later) don't reimplement the same escaping/download logic.
 */
export function downloadCsv(filenamePrefix: string, headers: string[], rows: (string | number)[][]) {
  const csvContent =
    "data:text/csv;charset=utf-8," +
    [headers.join(","), ...rows.map((r) => r.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${filenamePrefix}_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
