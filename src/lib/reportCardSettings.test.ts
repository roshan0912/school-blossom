import { describe, expect, it } from "vitest";
import { resolveReportCardSettings } from "./reportCardSettings";

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

  it("allows other classes to choose grades-only or marks-only", () => {
    expect(resolveReportCardSettings("Class IV", { displayMode: "grades" }).displayMode).toBe("grades");
    expect(resolveReportCardSettings("Class IV", { displayMode: "marks" }).displayMode).toBe("marks");
  });

  it("uses only the selected exam columns in the requested order", () => {
    expect(resolveReportCardSettings("Class IV", { exams: ["annual", "ut1"] }).exams).toEqual(["ut1", "annual"]);
  });
});