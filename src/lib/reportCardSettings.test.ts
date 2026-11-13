import { describe, expect, it } from "vitest";
import {
  DEFAULT_REPORT_CARD_SETTINGS,
  addCustomAssessmentColumn,
  removeAssessmentColumn,
  reportColumnsForExams,
  resolveReportCardSettings,
  setReportDisplayMode,
  toggleAssessmentExam,
  toggleReportExam,
  updateAssessmentColumn,
} from "./reportCardSettings";

describe("report card settings", () => {
  it("keeps Playgroup grade-only regardless of saved mode", () => {
    expect(resolveReportCardSettings("Playgroup", { displayMode: "both" }).displayMode).toBe("grades");
  });

  it("keeps Nursery grade-only regardless of saved mode", () => {
    expect(resolveReportCardSettings("Nursery", { displayMode: "marks" }).displayMode).toBe("grades");
  });

  it("defaults other classes to marks and grades", () => {
    expect(resolveReportCardSettings("Class IV").displayMode).toBe("both");
  });

  it("defaults to all four examination columns", () => {
    expect(DEFAULT_REPORT_CARD_SETTINGS.exams).toEqual(["ut1", "halfYearly", "ut2", "annual"]);
    expect(DEFAULT_REPORT_CARD_SETTINGS.columns.map(({ id }) => id)).toEqual(["ut1", "halfYearly", "ut2", "annual"]);
  });

  it("allows other classes to choose grades-only or marks-only", () => {
    expect(resolveReportCardSettings("Class IV", { displayMode: "grades" }).displayMode).toBe("grades");
    expect(resolveReportCardSettings("Class IV", { displayMode: "marks" }).displayMode).toBe("marks");
  });

  it("uses only the selected exam columns in the requested order", () => {
    expect(resolveReportCardSettings("Class IV", { exams: ["annual", "ut1"] }).exams).toEqual(["ut1", "annual"]);
  });

  it("allows an exam column to be added or removed but keeps one column", () => {
    expect(toggleReportExam(["ut1"], "annual")).toEqual(["ut1", "annual"]);
    expect(toggleReportExam(["ut1", "annual"], "ut1")).toEqual(["annual"]);
    expect(toggleReportExam(["annual"], "annual")).toEqual(["annual"]);
  });

  it("adds and removes configurable custom assessment columns", () => {
    const configured = resolveReportCardSettings("Class IV", {
      columns: [...DEFAULT_REPORT_CARD_SETTINGS.columns, { id: "project", label: "Project", maxMarks: 25 }],
    });
    expect(configured.columns.at(-1)).toMatchObject({ id: "project", label: "Project", maxMarks: 25 });
    expect(removeAssessmentColumn(configured, "project").columns).toHaveLength(4);
  });

  it("keeps at least one assessment column when removing defaults", () => {
    const oneColumn = { ...DEFAULT_REPORT_CARD_SETTINGS, columns: [DEFAULT_REPORT_CARD_SETTINGS.columns[0]], exams: ["ut1"] };
    expect(toggleAssessmentExam(oneColumn, "ut1").columns).toHaveLength(1);
    expect(removeAssessmentColumn(oneColumn, "ut1").columns).toHaveLength(1);
  });

  it("filters standard columns to the selected report exams and retains custom columns", () => {
    const settings = resolveReportCardSettings("Class IV", {
      columns: [...DEFAULT_REPORT_CARD_SETTINGS.columns, { id: "project", label: "Project", maxMarks: 25 }],
    });
    expect(reportColumnsForExams(settings, ["annual"]).map(({ id }) => id)).toEqual(["annual", "project"]);
  });

  it("adds, renames, and removes custom assessment columns", () => {
    const added = addCustomAssessmentColumn(DEFAULT_REPORT_CARD_SETTINGS);
    expect(added.columns.at(-1)).toMatchObject({ id: "custom-1", label: "Assessment 1", maxMarks: 100 });
    const renamed = updateAssessmentColumn(added, "custom-1", { label: "Practical", maxMarks: 25 });
    expect(renamed.columns.at(-1)).toMatchObject({ label: "Practical", maxMarks: 25 });
    expect(removeAssessmentColumn(renamed, "custom-1").columns).toHaveLength(4);
  });

  it("applies a display mode across columns and preserves individual column modes", () => {
    const grades = setReportDisplayMode(DEFAULT_REPORT_CARD_SETTINGS, "grades");
    expect(grades.columns.every(({ displayMode }) => displayMode === "grades")).toBe(true);
    const mixed = updateAssessmentColumn(grades, "annual", { displayMode: "marks" });
    expect(resolveReportCardSettings("Class IV", mixed).columns.find(({ id }) => id === "annual")?.displayMode).toBe("marks");
  });
});