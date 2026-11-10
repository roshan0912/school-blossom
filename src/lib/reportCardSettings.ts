export type ReportExamKey = "ut1" | "halfYearly" | "ut2" | "annual";
export type ReportDisplayMode = "marks" | "grades" | "both";
export type ReportPrintStyle = "forest" | "royal" | "monochrome";

export interface ReportCardSettings {
  exams: ReportExamKey[];
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
  displayMode: "both",
  printStyle: "forest",
};

export const isPrePrimaryClass = (name?: string | null) =>
  !!name && /play\s*group|playgroup|nursery|pre[- ]?nursery|pg\b/i.test(name);

export function resolveReportCardSettings(
  className: string | null | undefined,
  settings?: Partial<ReportCardSettings> | null,
): ReportCardSettings {
  const allowed = new Set(REPORT_EXAM_OPTIONS.map(({ key }) => key));
  const exams = Array.isArray(settings?.exams)
    ? REPORT_EXAM_OPTIONS.map(({ key }) => key).filter((key) => allowed.has(key) && settings.exams?.includes(key))
    : [...DEFAULT_REPORT_CARD_SETTINGS.exams];
  const validExams = exams.length ? exams : [...DEFAULT_REPORT_CARD_SETTINGS.exams];
  const requestedMode = settings?.displayMode;
  const displayMode = isPrePrimaryClass(className)
    ? "grades"
    : requestedMode === "marks" || requestedMode === "grades" || requestedMode === "both"
      ? requestedMode
      : DEFAULT_REPORT_CARD_SETTINGS.displayMode;
  const printStyle = settings?.printStyle === "royal" || settings?.printStyle === "monochrome"
    ? settings.printStyle
    : DEFAULT_REPORT_CARD_SETTINGS.printStyle;

  return { exams: validExams, displayMode, printStyle };
}