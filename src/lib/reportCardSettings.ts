export type ReportExamKey = "ut1" | "halfYearly" | "ut2" | "annual";
export type ReportDisplayMode = "marks" | "grades" | "both";
export type ReportPrintStyle = "forest" | "royal" | "monochrome";

export interface ReportAssessmentColumn {
  id: string;
  label: string;
  examKey?: ReportExamKey;
  maxMarks: number;
  displayMode?: ReportDisplayMode;
}

export interface ReportCardSettings {
  exams: ReportExamKey[];
  columns: ReportAssessmentColumn[];
  displayMode: ReportDisplayMode;
  printStyle: ReportPrintStyle;
}

export const REPORT_EXAM_OPTIONS: { key: ReportExamKey; label: string }[] = [
  { key: "ut1", label: "1st Unit Test" },
  { key: "halfYearly", label: "Half Yearly" },
  { key: "ut2", label: "2nd Unit Test" },
  { key: "annual", label: "Annual Exam" },
];

export const DEFAULT_REPORT_CARD_SETTINGS: ReportCardSettings = {
  exams: REPORT_EXAM_OPTIONS.map(({ key }) => key),
  columns: REPORT_EXAM_OPTIONS.map(({ key, label }) => ({
    id: key,
    label,
    examKey: key,
    maxMarks: key === "ut1" || key === "ut2" ? 50 : 100,
  })),
  displayMode: "both",
  printStyle: "forest",
};

export const isPrePrimaryClass = (name?: string | null) =>
  !!name && /play\s*group|playgroup|nursery|pre[- ]?nursery|pg\b/i.test(name);

export function resolveReportCardSettings(
  className: string | null | undefined,
  settings?: Partial<ReportCardSettings> | null,
): ReportCardSettings {
  const validKeys = new Set(REPORT_EXAM_OPTIONS.map(({ key }) => key));
  const defaultColumns = Array.isArray(settings?.exams)
    ? DEFAULT_REPORT_CARD_SETTINGS.columns.filter(({ examKey }) => settings.exams?.includes(examKey as ReportExamKey))
    : DEFAULT_REPORT_CARD_SETTINGS.columns;
  const sourceColumns = Array.isArray(settings?.columns) ? settings.columns : defaultColumns;
  const seenIds = new Set<string>();
  const columns = sourceColumns.flatMap((column) => {
    if (!column || typeof column.id !== "string" || !column.id.trim() || seenIds.has(column.id)) return [];
    if (column.examKey && !validKeys.has(column.examKey)) return [];
    seenIds.add(column.id);
    const fallback = DEFAULT_REPORT_CARD_SETTINGS.columns.find(({ id }) => id === column.examKey);
    return [{
      id: column.id,
      label: typeof column.label === "string" && column.label.trim() ? column.label.trim() : fallback?.label || "Assessment",
      ...(column.examKey ? { examKey: column.examKey } : {}),
      maxMarks: Number.isFinite(Number(column.maxMarks)) && Number(column.maxMarks) > 0
        ? Number(column.maxMarks)
        : fallback?.maxMarks || 100,
    }];
  });
  const validColumns = columns.length ? columns : [...DEFAULT_REPORT_CARD_SETTINGS.columns];
  const exams = validColumns.flatMap(({ examKey }) => examKey ? [examKey] : []);
  const requestedMode = settings?.displayMode;
  const displayMode = isPrePrimaryClass(className)
    ? "grades"
    : requestedMode === "marks" || requestedMode === "grades" || requestedMode === "both"
      ? requestedMode
      : DEFAULT_REPORT_CARD_SETTINGS.displayMode;
  const printStyle = settings?.printStyle === "royal" || settings?.printStyle === "monochrome"
    ? settings.printStyle
    : DEFAULT_REPORT_CARD_SETTINGS.printStyle;

  return {
    exams,
    columns: validColumns.map((column) => ({
      ...column,
      displayMode: isPrePrimaryClass(className) ? "grades" : column.displayMode || displayMode,
    })),
    displayMode,
    printStyle,
  };
}

export function toggleReportExam(exams: ReportExamKey[], exam: ReportExamKey): ReportExamKey[] {
  if (exams.includes(exam)) {
    return exams.length > 1 ? exams.filter((item) => item !== exam) : exams;
  }
  return REPORT_EXAM_OPTIONS.map(({ key }) => key).filter((key) => exams.includes(key) || key === exam);
}

export function toggleAssessmentExam(settings: ReportCardSettings, exam: ReportExamKey): ReportCardSettings {
  const exists = settings.columns.some(({ examKey }) => examKey === exam);
  const columns = exists
    ? settings.columns.filter(({ examKey }) => examKey !== exam)
    : [...settings.columns, ...DEFAULT_REPORT_CARD_SETTINGS.columns.filter(({ examKey }) => examKey === exam)];
  if (!columns.length) return settings;
  return { ...settings, columns, exams: columns.flatMap(({ examKey }) => examKey ? [examKey] : []) };
}

export function removeAssessmentColumn(settings: ReportCardSettings, id: string): ReportCardSettings {
  const columns = settings.columns.filter((column) => column.id !== id);
  if (!columns.length) return settings;
  return { ...settings, columns, exams: columns.flatMap(({ examKey }) => examKey ? [examKey] : []) };
}

export function reportColumnsForExams(
  settings: ReportCardSettings,
  exams: ReportExamKey[],
): ReportAssessmentColumn[] {
  return settings.columns.filter((column) => !column.examKey || exams.includes(column.examKey));
}