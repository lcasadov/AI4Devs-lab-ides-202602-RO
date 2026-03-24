import * as XLSX from 'xlsx';

export interface ExportColumn {
  header: string;
  key: string;
}

export function exportToExcel(
  rows: Record<string, unknown>[],
  columns: ExportColumn[],
  filename: string,
): void {
  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const worksheetData = [
    columns.map((c) => c.header),
    ...rows.map((row) => columns.map((c) => row[c.key] ?? '')),
  ];
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');
  XLSX.writeFile(workbook, `${filename}-${date}.xlsx`);
}
