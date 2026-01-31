import * as XLSX from "xlsx";

export interface ExcelColumn {
  key: string;
  header: string;
  required?: boolean;
  validate?: (value: unknown) => boolean;
}

export interface ImportResult<T> {
  success: boolean;
  data: T[];
  errors: string[];
}

export function exportToExcel<T extends Record<string, unknown>>(
  data: T[],
  columns: ExcelColumn[],
  filename: string
) {
  // Create worksheet data with headers
  const headers = columns.map((col) => col.header);
  const rows = data.map((item) =>
    columns.map((col) => {
      const value = item[col.key];
      // Handle nested objects (e.g., classes.name)
      if (col.key.includes(".")) {
        const keys = col.key.split(".");
        let nestedValue: unknown = item;
        for (const k of keys) {
          nestedValue = (nestedValue as Record<string, unknown>)?.[k];
        }
        return nestedValue ?? "";
      }
      return value ?? "";
    })
  );

  const wsData = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Auto-size columns
  const colWidths = headers.map((header, i) => {
    const maxLength = Math.max(
      header.length,
      ...rows.map((row) => String(row[i] ?? "").length)
    );
    return { wch: Math.min(maxLength + 2, 50) };
  });
  ws["!cols"] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data");
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  columns: ExcelColumn[],
  filename: string
) {
  const headers = columns.map((col) => col.header);
  const rows = data.map((item) =>
    columns.map((col) => {
      const value = item[col.key];
      if (col.key.includes(".")) {
        const keys = col.key.split(".");
        let nestedValue: unknown = item;
        for (const k of keys) {
          nestedValue = (nestedValue as Record<string, unknown>)?.[k];
        }
        return nestedValue ?? "";
      }
      return value ?? "";
    })
  );

  const csvContent = [headers, ...rows]
    .map((row) =>
      row
        .map((cell) => {
          const cellStr = String(cell);
          // Escape quotes and wrap in quotes if contains comma or quote
          if (cellStr.includes(",") || cellStr.includes('"')) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        })
        .join(",")
    )
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

export async function importFromExcel<T>(
  file: File,
  columns: ExcelColumn[],
  transform?: (row: Record<string, unknown>) => T
): Promise<ImportResult<T>> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    const errors: string[] = [];
    const data: T[] = [];

    reader.onload = (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);

        if (jsonData.length === 0) {
          errors.push("No data found in the file");
          resolve({ success: false, data: [], errors });
          return;
        }

        // Get headers from the first row
        const fileHeaders = Object.keys(jsonData[0]);
        const requiredHeaders = columns
          .filter((col) => col.required)
          .map((col) => col.header);

        // Check for missing required columns
        for (const required of requiredHeaders) {
          if (!fileHeaders.some((h) => h.toLowerCase() === required.toLowerCase())) {
            errors.push(`Missing required column: ${required}`);
          }
        }

        if (errors.length > 0) {
          resolve({ success: false, data: [], errors });
          return;
        }

        // Map headers to keys
        const headerToKey: Record<string, string> = {};
        for (const col of columns) {
          const matchedHeader = fileHeaders.find(
            (h) => h.toLowerCase() === col.header.toLowerCase()
          );
          if (matchedHeader) {
            headerToKey[matchedHeader] = col.key;
          }
        }

        // Process each row
        jsonData.forEach((row, index) => {
          const mappedRow: Record<string, unknown> = {};
          let rowHasError = false;

          for (const [header, key] of Object.entries(headerToKey)) {
            const value = row[header];
            const column = columns.find((c) => c.key === key);

            // Validate required fields
            if (column?.required && (value === undefined || value === null || value === "")) {
              errors.push(`Row ${index + 2}: ${column.header} is required`);
              rowHasError = true;
            }

            // Custom validation
            if (column?.validate && value !== undefined && !column.validate(value)) {
              errors.push(`Row ${index + 2}: Invalid value for ${column.header}`);
              rowHasError = true;
            }

            mappedRow[key] = value;
          }

          if (!rowHasError) {
            if (transform) {
              data.push(transform(mappedRow));
            } else {
              data.push(mappedRow as T);
            }
          }
        });

        resolve({
          success: errors.length === 0,
          data,
          errors,
        });
      } catch (error) {
        errors.push("Failed to parse file: " + (error as Error).message);
        resolve({ success: false, data: [], errors });
      }
    };

    reader.onerror = () => {
      errors.push("Failed to read file");
      resolve({ success: false, data: [], errors });
    };

    reader.readAsArrayBuffer(file);
  });
}

export function downloadTemplate(columns: ExcelColumn[], filename: string) {
  const ws = XLSX.utils.aoa_to_sheet([columns.map((col) => col.header)]);
  
  // Add column widths
  ws["!cols"] = columns.map((col) => ({ wch: Math.max(col.header.length + 2, 15) }));
  
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Template");
  XLSX.writeFile(wb, `${filename}_template.xlsx`);
}
