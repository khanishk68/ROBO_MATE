// tests/curriculum_month1.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

test("Month 1 Curriculum Dataset Integrity (Authoritative PDF Source)", async (t) => {
  const tsContent = fs.readFileSync(
    path.resolve(process.cwd(), "src/lib/curriculum-month1-khanishk.ts"),
    "utf-8"
  );

  await t.test("Month 1 dates strictly span 8 Nov 2026 to 7 Dec 2026 (30 days)", () => {
    assert.match(tsContent, /startDate:\s*"2026-11-08"/);
    assert.match(tsContent, /endDate:\s*"2026-12-07"/);
    assert.match(tsContent, /totalDays:\s*30/);
  });

  await t.test("All 30 days are individually declared from Day 1 to Day 30", () => {
    for (let day = 1; day <= 30; day++) {
      assert.ok(
        tsContent.includes(`dayNumber: ${day},`),
        `Day ${day} must be explicitly declared`
      );
    }
  });

  await t.test("Equipment checklist prohibits hardware purchases for Month 1 (₹0 hardware)", () => {
    assert.ok(tsContent.includes("not_this_month"));
    assert.ok(tsContent.includes("₹0 this month"));
    assert.ok(tsContent.includes("Do not buy yet"));
  });

  await t.test("7 Verified learning resources are present with correct links", () => {
    const urls = [
      "https://docs.python.org/3/tutorial/",
      "https://www.python.org/about/gettingstarted/",
      "https://cs50.harvard.edu/python/",
      "https://git-scm.com/book/en/v2",
      "https://skills.github.com/",
      "https://learn.microsoft.com/powershell/",
      "https://exercism.org/tracks/python",
    ];

    urls.forEach((url) => {
      assert.ok(tsContent.includes(url), `Resource URL missing: ${url}`);
    });
  });

  await t.test("Robot Mission Logger v1 contains 10 required test scenarios", () => {
    for (let i = 1; i <= 10; i++) {
      const id = i < 10 ? `tc-0${i}` : `tc-${i}`;
      assert.ok(tsContent.includes(`id: "${id}"`), `Missing test case ${id}`);
    }
  });

  await t.test("Authoritative PDF exists in public folder for in-browser viewing", () => {
    const pdfPath = path.resolve(
      process.cwd(),
      "public/curriculum/Khanishk_Month_1_Robotics_Engineering_Plan.pdf"
    );
    assert.ok(fs.existsSync(pdfPath), "PDF file must exist in public/curriculum/");
    const stats = fs.statSync(pdfPath);
    assert.ok(stats.size > 10000, "PDF file must be non-empty");
  });
});
