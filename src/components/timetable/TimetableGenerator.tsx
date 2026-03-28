import { useState, useRef, useCallback, useId } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Plus,
  Trash2,
  Printer,
  Download,
  Palette,
  Type,
  Merge,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  GripVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { TimetableExportDialog } from "./TimetableExportDialog";
import { exportTimetablePDF, exportTimetableExcel, exportTimetableWord } from "@/lib/timetableExport";

// ─── types ────────────────────────────────────────────────────────────────────

interface CellData {
  text: string;
  bg: string;
  color: string;
  bold: boolean;
  fontSize: number;
  isBreak?: boolean;      // if true → spans all day columns
}

interface RowData {
  id: string;
  isBreak: boolean;
  cells: CellData[];     // cells[0] = period header, cells[1..n] = day cells
}

// ─── constants ───────────────────────────────────────────────────────────────

const PALETTE = [
  "#ffffff", "#f8fafc", "#fef9c3", "#fef3c7", "#fce7f3",
  "#dbeafe", "#dcfce7", "#ede9fe", "#fee2e2", "#e0f2fe",
  "#fbbf24", "#fb923c", "#f472b6", "#60a5fa", "#34d399",
  "#a78bfa", "#f87171", "#38bdf8", "#4ade80", "#818cf8",
  "#1e293b", "#374151", "#6b7280", "#9ca3af", "#d1d5db",
];

const DEFAULT_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const DEFAULT_PERIODS = [
  "1st Period\n9:00–9:15 AM",
  "2nd Period\n9:15–9:30 AM",
  "3rd Period\n9:30–10:00 AM",
  "BREAK",
  "4th Period\n10:00–10:30 AM",
  "5th Period\n10:35–11:00 AM",
  "6th Period\n11:00–11:30 AM",
];

const BREAK_ROW_DEFAULT: CellData = {
  text: "LUNCHBREAK / MEDITATION",
  bg: "#fef3c7",
  color: "#92400e",
  bold: true,
  fontSize: 11,
  isBreak: true,
};

const makeCell = (text = "", bg = "#ffffff", color = "#1e293b"): CellData => ({
  text,
  bg,
  color,
  bold: false,
  fontSize: 11,
});

const makeHeaderCell = (text: string, bg = "#1e293b", color = "#ffffff"): CellData => ({
  text,
  bg,
  color,
  bold: true,
  fontSize: 11,
});

let _rowId = 0;
const newId = () => `row-${++_rowId}`;

function buildDefaultRows(days: string[]): RowData[] {
  return DEFAULT_PERIODS.map((label) => {
    if (label === "BREAK") {
      return {
        id: newId(),
        isBreak: true,
        cells: [BREAK_ROW_DEFAULT, ...days.map(() => ({ ...BREAK_ROW_DEFAULT }))],
      };
    }
    return {
      id: newId(),
      isBreak: false,
      cells: [
        makeHeaderCell(label, "#fbbf24", "#1e293b"),
        ...days.map(() => makeCell()),
      ],
    };
  });
}

// ─── ColorPicker popover ─────────────────────────────────────────────────────

function ColorPicker({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (c: string) => void;
  label?: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          title={label}
          className="flex items-center gap-1 px-2 py-1 rounded border hover:bg-muted/50 text-xs"
        >
          <span
            className="w-4 h-4 rounded border border-muted-foreground/30 inline-block"
            style={{ backgroundColor: value }}
          />
          {label && <span className="hidden sm:inline">{label}</span>}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-2 w-44">
        <div className="grid grid-cols-5 gap-1">
          {PALETTE.map((c) => (
            <button
              key={c}
              onClick={() => onChange(c)}
              className={cn(
                "w-6 h-6 rounded border transition-transform hover:scale-110",
                c === value ? "ring-2 ring-primary ring-offset-1" : "border-muted-foreground/20"
              )}
              style={{ backgroundColor: c }}
              title={c}
            />
          ))}
        </div>
        <div className="mt-2 flex items-center gap-1">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-6 h-6 rounded cursor-pointer border-0 p-0"
          />
          <span className="text-xs text-muted-foreground">Custom</span>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Single editable cell ────────────────────────────────────────────────────

function EditableCell({
  cell,
  onChange,
  isHeader = false,
  colSpan,
  isRowBreak = false,
}: {
  cell: CellData;
  onChange: (updated: Partial<CellData>) => void;
  isHeader?: boolean;
  colSpan?: number;
  isRowBreak?: boolean;
}) {
  const [editing, setEditing] = useState(false);

  return (
    <td
      colSpan={colSpan}
      className={cn(
        "border border-gray-300 relative group align-middle print:border-gray-400",
        isRowBreak && "text-center",
      )}
      style={{
        backgroundColor: cell.bg,
        minWidth: isHeader ? 110 : 90,
        width: isHeader ? 130 : undefined,
        padding: 0,
      }}
    >
      {/* cell toolbar – visible on hover */}
      {!isRowBreak && (
        <div className="absolute top-0 right-0 hidden group-hover:flex gap-0.5 p-0.5 z-10 print:hidden bg-white/80 rounded-bl shadow-sm">
          <ColorPicker value={cell.bg} onChange={(bg) => onChange({ bg })} label="BG" />
          <ColorPicker value={cell.color} onChange={(color) => onChange({ color })} label="Txt" />
          <button
            onClick={() => onChange({ bold: !cell.bold })}
            className={cn(
              "px-1.5 py-0.5 rounded text-xs border",
              cell.bold ? "bg-primary text-white" : "hover:bg-muted/50"
            )}
            title="Bold"
          >
            <strong>B</strong>
          </button>
        </div>
      )}

      {editing ? (
        <textarea
          autoFocus
          value={cell.text}
          onChange={(e) => onChange({ text: e.target.value })}
          onBlur={() => setEditing(false)}
          onKeyDown={(e) => { if (e.key === "Escape") setEditing(false); }}
          className="w-full h-full min-h-[56px] p-2 resize-none bg-transparent outline-none focus:ring-1 focus:ring-primary text-xs"
          style={{
            color: cell.color,
            fontWeight: cell.bold ? 700 : 400,
            fontSize: cell.fontSize,
          }}
        />
      ) : (
        <div
          className="p-2 cursor-pointer min-h-[56px] whitespace-pre-wrap text-xs leading-snug"
          style={{
            color: cell.color,
            fontWeight: cell.bold ? 700 : 400,
            fontSize: cell.fontSize,
          }}
          onClick={() => setEditing(true)}
          title="Click to edit"
        >
          {cell.text || (
            <span className="text-muted-foreground/40 text-[10px] italic">
              Click to type…
            </span>
          )}
        </div>
      )}
    </td>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export function TimetableGenerator() {
  const [title, setTitle] = useState("CLASS TIME TABLE");
  const [teacherLabel, setTeacherLabel] = useState("Mother Teacher: ");
  const [assistantLabel, setAssistantLabel] = useState("Assistant Teacher: ");

  const [days, setDays] = useState<string[]>(DEFAULT_DAYS);
  const [rows, setRows] = useState<RowData[]>(() => buildDefaultRows(DEFAULT_DAYS));

  const [exportOpen, setExportOpen] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // ── helpers ──────────────────────────────────────────────────────────────

  const updateCell = useCallback(
    (rowIdx: number, colIdx: number, patch: Partial<CellData>) => {
      setRows((prev) => {
        const next = prev.map((r, ri) => {
          if (ri !== rowIdx) return r;
          const cells = r.cells.map((c, ci) =>
            ci === colIdx ? { ...c, ...patch } : c
          );
          return { ...r, cells };
        });
        return next;
      });
    },
    []
  );

  const updateDayHeader = (idx: number, val: string) => {
    setDays((prev) => prev.map((d, i) => (i === idx ? val : d)));
    setRows((prev) =>
      prev.map((r) => {
        const cells = r.cells.map((c, ci) =>
          ci === idx + 1 ? { ...c } : c
        );
        return { ...r, cells };
      })
    );
  };

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      {
        id: newId(),
        isBreak: false,
        cells: [
          makeHeaderCell("New Period", "#fbbf24", "#1e293b"),
          ...days.map(() => makeCell()),
        ],
      },
    ]);
  };

  const addBreakRow = () => {
    setRows((prev) => [
      ...prev,
      {
        id: newId(),
        isBreak: true,
        cells: [{ ...BREAK_ROW_DEFAULT }, ...days.map(() => ({ ...BREAK_ROW_DEFAULT }))],
      },
    ]);
  };

  const removeRow = (idx: number) => {
    setRows((prev) => prev.filter((_, i) => i !== idx));
  };

  const moveRow = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= rows.length) return;
    setRows((prev) => {
      const next = [...prev];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  const toggleBreak = (idx: number) => {
    setRows((prev) =>
      prev.map((r, i) => {
        if (i !== idx) return r;
        const isBreak = !r.isBreak;
        return { ...r, isBreak };
      })
    );
  };

  const addColumn = () => {
    const newDay = `Day ${days.length + 1}`;
    setDays((prev) => [...prev, newDay]);
    setRows((prev) =>
      prev.map((r) => ({
        ...r,
        cells: [...r.cells, r.isBreak ? { ...BREAK_ROW_DEFAULT } : makeCell()],
      }))
    );
  };

  const removeColumn = (colIdx: number) => {
    if (days.length <= 1) return;
    setDays((prev) => prev.filter((_, i) => i !== colIdx));
    setRows((prev) =>
      prev.map((r) => ({
        ...r,
        cells: r.cells.filter((_, ci) => ci !== colIdx + 1),
      }))
    );
  };

  const resetGrid = () => {
    const d = DEFAULT_DAYS;
    setDays(d);
    setRows(buildDefaultRows(d));
    setTitle("CLASS TIME TABLE");
    setTeacherLabel("Mother Teacher: ");
    setAssistantLabel("Assistant Teacher: ");
  };

  // ── print ─────────────────────────────────────────────────────────────────

  const handlePrint = () => {
    const printContents = printRef.current?.innerHTML;
    if (!printContents) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: Calibri, Arial, sans-serif; padding: 16px; background: #fff; }
          .gen-print-wrapper { width: 100%; }
          .gen-title {
            text-align: center;
            font-size: 18pt;
            font-weight: bold;
            color: #1e293b;
            text-decoration: underline;
            margin-bottom: 8px;
          }
          .gen-meta { margin-bottom: 12px; }
          .gen-meta p { font-size: 10pt; font-weight: bold; color: #1e293b; }
          table { border-collapse: collapse; width: 100%; }
          td, th {
            border: 1px solid #666;
            padding: 4px 6px;
            vertical-align: middle;
            font-size: 9pt;
            white-space: pre-wrap;
            word-break: break-word;
          }
          .day-header {
            background: #1e293b !important;
            color: #ffffff !important;
            font-weight: bold;
            text-align: center;
          }
          @media print {
            @page { size: A4 landscape; margin: 12mm; }
          }
        </style>
      </head>
      <body>
        ${printContents}
      </body>
      </html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 300);
  };

  // ── export ────────────────────────────────────────────────────────────────

  const buildExportRows = () =>
    rows.map((r) => ({
      periodLabel: r.isBreak ? "BREAK" : r.cells[0]?.text || "",
      cells: r.isBreak
        ? days.map(() => r.cells[0]?.text || "BREAK")
        : r.cells.slice(1).map((c) => c.text),
      isBreak: r.isBreak,
    }));

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* ── toolbar ── */}
      <div className="flex flex-wrap gap-2 items-center p-3 bg-muted/30 rounded-lg border">
        <span className="text-xs font-semibold text-muted-foreground mr-1">Rows:</span>
        <Button size="sm" variant="outline" onClick={addRow} className="h-7 text-xs gap-1">
          <Plus className="h-3 w-3" /> Add Period
        </Button>
        <Button size="sm" variant="outline" onClick={addBreakRow} className="h-7 text-xs gap-1">
          <Plus className="h-3 w-3" /> Add Break
        </Button>

        <div className="h-5 border-l mx-1" />

        <span className="text-xs font-semibold text-muted-foreground mr-1">Columns:</span>
        <Button size="sm" variant="outline" onClick={addColumn} className="h-7 text-xs gap-1">
          <Plus className="h-3 w-3" /> Add Day
        </Button>

        <div className="h-5 border-l mx-1" />

        <Button
          size="sm"
          variant="outline"
          onClick={handlePrint}
          className="h-7 text-xs gap-1 text-blue-700 border-blue-200 hover:bg-blue-50"
        >
          <Printer className="h-3 w-3" /> Print
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setExportOpen(true)}
          className="h-7 text-xs gap-1 text-green-700 border-green-200 hover:bg-green-50"
        >
          <Download className="h-3 w-3" /> Export
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={resetGrid}
          className="h-7 text-xs gap-1 text-muted-foreground ml-auto"
          title="Reset to default template"
        >
          <RotateCcw className="h-3 w-3" /> Reset
        </Button>
      </div>

      {/* ── header fields ── */}
      <div className="space-y-2 p-4 rounded-lg border bg-card">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-center text-lg font-bold border-0 border-b rounded-none focus-visible:ring-0 px-0 pb-1"
          placeholder="TIME TABLE TITLE"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Input
            value={teacherLabel}
            onChange={(e) => setTeacherLabel(e.target.value)}
            className="text-sm border-0 border-b rounded-none focus-visible:ring-0 px-0"
            placeholder="Mother Teacher: Mrs. ..."
          />
          <Input
            value={assistantLabel}
            onChange={(e) => setAssistantLabel(e.target.value)}
            className="text-sm border-0 border-b rounded-none focus-visible:ring-0 px-0"
            placeholder="Assistant Teacher: Miss ..."
          />
        </div>
      </div>

      {/* ── editable grid ── */}
      <div className="overflow-x-auto rounded-lg border bg-card shadow-sm">
        <div ref={printRef} className="gen-print-wrapper">
          {/* print title */}
          <div className="gen-title print-only hidden print:block">{title}</div>
          <div className="gen-meta print-only hidden print:block">
            <p>{teacherLabel}</p>
            <p>{assistantLabel}</p>
          </div>

          <table className="w-full border-collapse">
            {/* Day headers */}
            <thead>
              <tr>
                {/* Period column header */}
                <th
                  className="border border-gray-300 p-2 text-xs font-bold text-center bg-slate-800 text-white day-header"
                  style={{ minWidth: 130, width: 130 }}
                >
                  Period / Time
                </th>
                {days.map((day, di) => (
                  <th
                    key={di}
                    className="border border-gray-300 p-1 bg-slate-800 text-white relative group day-header"
                    style={{ minWidth: 90 }}
                  >
                    <Input
                      value={day}
                      onChange={(e) => updateDayHeader(di, e.target.value)}
                      className="bg-transparent border-0 text-center text-xs font-bold text-white focus-visible:ring-0 h-6 px-1 placeholder:text-white/50"
                      placeholder="Day"
                    />
                    {/* remove col button */}
                    <button
                      onClick={() => removeColumn(di)}
                      className="absolute -top-1 -right-1 hidden group-hover:flex items-center justify-center w-4 h-4 bg-red-500 rounded-full text-white z-10 print:hidden"
                      title="Remove column"
                    >
                      <Trash2 className="h-2.5 w-2.5" />
                    </button>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.map((row, ri) => (
                <tr key={row.id} className="group/row">
                  {row.isBreak ? (
                    /* Break row — spans all columns */
                    <td
                      colSpan={days.length + 1}
                      className="border border-gray-300 relative"
                      style={{ backgroundColor: row.cells[0].bg }}
                    >
                      {/* row controls */}
                      <div className="absolute left-1 top-1/2 -translate-y-1/2 hidden group-hover/row:flex gap-0.5 z-10 print:hidden">
                        <button onClick={() => moveRow(ri, -1)} className="p-0.5 rounded bg-white/80 hover:bg-muted border text-muted-foreground" title="Move up"><ChevronUp className="h-3 w-3" /></button>
                        <button onClick={() => moveRow(ri, 1)} className="p-0.5 rounded bg-white/80 hover:bg-muted border text-muted-foreground" title="Move down"><ChevronDown className="h-3 w-3" /></button>
                        <button onClick={() => removeRow(ri)} className="p-0.5 rounded bg-red-100 hover:bg-red-200 border border-red-200 text-red-600" title="Delete row"><Trash2 className="h-3 w-3" /></button>
                      </div>
                      <div className="absolute right-1 top-1/2 -translate-y-1/2 hidden group-hover/row:flex gap-0.5 z-10 print:hidden">
                        <ColorPicker value={row.cells[0].bg} onChange={(bg) => {
                          setRows(prev => prev.map((r, i) => i === ri ? { ...r, cells: r.cells.map(c => ({ ...c, bg })) } : r));
                        }} label="BG" />
                        <ColorPicker value={row.cells[0].color} onChange={(color) => {
                          setRows(prev => prev.map((r, i) => i === ri ? { ...r, cells: r.cells.map(c => ({ ...c, color })) } : r));
                        }} label="Txt" />
                      </div>
                      <div
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => {
                          const text = e.currentTarget.textContent || "";
                          setRows(prev => prev.map((r, i) => i === ri ? { ...r, cells: r.cells.map(c => ({ ...c, text })) } : r));
                        }}
                        className="text-center py-3 px-16 text-sm font-bold outline-none min-h-[52px] flex items-center justify-center"
                        style={{ color: row.cells[0].color, fontSize: row.cells[0].fontSize }}
                      >
                        {row.cells[0].text}
                      </div>
                    </td>
                  ) : (
                    <>
                      {/* Period label + day cells */}
                      {/* row controls on the far-left */}
                      <td
                        className="border border-gray-300 relative"
                        style={{ backgroundColor: row.cells[0].bg, minWidth: 130, width: 130 }}
                      >
                        <div className="absolute -left-7 top-1/2 -translate-y-1/2 hidden group-hover/row:flex flex-col gap-0.5 z-10 print:hidden">
                          <button onClick={() => moveRow(ri, -1)} className="p-0.5 rounded bg-white border hover:bg-muted text-muted-foreground" title="Move up"><ChevronUp className="h-3 w-3" /></button>
                          <button onClick={() => moveRow(ri, 1)} className="p-0.5 rounded bg-white border hover:bg-muted text-muted-foreground" title="Move down"><ChevronDown className="h-3 w-3" /></button>
                          <button onClick={() => removeRow(ri)} className="p-0.5 rounded bg-red-100 border border-red-200 text-red-600 hover:bg-red-200" title="Delete row"><Trash2 className="h-3 w-3" /></button>
                          <button onClick={() => toggleBreak(ri)} className="p-0.5 rounded bg-amber-100 border border-amber-200 text-amber-700 hover:bg-amber-200" title="Toggle break row"><Merge className="h-3 w-3" /></button>
                        </div>
                        <EditableCell
                          cell={row.cells[0]}
                          onChange={(p) => updateCell(ri, 0, p)}
                          isHeader
                        />
                      </td>

                      {days.map((_, di) => (
                        <EditableCell
                          key={di}
                          cell={row.cells[di + 1] || makeCell()}
                          onChange={(p) => updateCell(ri, di + 1, p)}
                        />
                      ))}
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* hint */}
      <p className="text-xs text-muted-foreground text-center">
        💡 Click any cell to edit text • Hover to change colours or delete rows/columns • Drag ↑↓ buttons to reorder
      </p>

      {/* Export dialog */}
      {exportOpen && (
        <TimetableExportDialog
          open={exportOpen}
          onClose={() => setExportOpen(false)}
          onExportPDF={() => {
            const rows = buildExportRows();
            exportTimetablePDF(title, teacherLabel + "  " + assistantLabel, rows);
          }}
          onExportExcel={() => {
            const rows = buildExportRows();
            exportTimetableExcel(title, teacherLabel + "  " + assistantLabel, rows);
          }}
          onExportWord={() => {
            const rows = buildExportRows();
            exportTimetableWord(title, teacherLabel + "  " + assistantLabel, rows);
          }}
        />
      )}
    </div>
  );
}
