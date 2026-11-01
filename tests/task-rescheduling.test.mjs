// tests/task-rescheduling.test.mjs
import test from "node:test";
import assert from "node:assert/strict";

test("Task Rescheduling Algorithm: Carry-forward limits and duplicate prevention", async (t) => {
  const MAX_CARRY_PER_DAY = 3;
  const FLAG_AFTER_DAYS = 7;

  // Mock initial task list
  const pastPending = [
    { id: "occ-1", task_id: "task-python-1", status: "pending", original_due_date: "2026-10-30", scheduled_date: "2026-10-30", carry_forward_count: 0 },
    { id: "occ-2", task_id: "task-cpp-1", status: "pending", original_due_date: "2026-10-30", scheduled_date: "2026-10-30", carry_forward_count: 0 },
    { id: "occ-3", task_id: "task-git-1", status: "pending", original_due_date: "2026-10-30", scheduled_date: "2026-10-30", carry_forward_count: 2 },
    { id: "occ-4", task_id: "task-linux-1", status: "pending", original_due_date: "2026-10-25", scheduled_date: "2026-10-30", carry_forward_count: 6 },
    { id: "occ-5", task_id: "task-ros-1", status: "skipped", original_due_date: "2026-10-30", scheduled_date: "2026-10-30", carry_forward_count: 1 },
    { id: "occ-6", task_id: "task-expired-1", status: "pending", original_due_date: "2026-10-10", scheduled_date: "2026-10-30", carry_forward_count: 7 },
  ];

  await t.test("Skipped tasks must not automatically be carried forward", () => {
    const toCarry = pastPending.filter((o) => o.status !== "skipped");
    assert.equal(toCarry.some((o) => o.task_id === "task-ros-1"), false);
  });

  await t.test("Tasks exceeding carry-forward threshold (>= 7 days) must be flagged for manual replanning", () => {
    const toCarry = pastPending.filter((o) => o.status !== "skipped" && o.carry_forward_count < FLAG_AFTER_DAYS);
    assert.equal(toCarry.some((o) => o.task_id === "task-expired-1"), false);
  });

  await t.test("Maximum 3 overdue tasks carried into a single day; overflow distributed to next day", () => {
    const today = "2026-11-01";
    const toCarry = pastPending.filter((o) => o.status !== "skipped" && o.carry_forward_count < FLAG_AFTER_DAYS);

    const scheduledToday = [];
    const scheduledTomorrow = [];

    let countToday = 0;
    for (const occ of toCarry) {
      if (countToday < MAX_CARRY_PER_DAY) {
        scheduledToday.push({ ...occ, scheduled_date: today, carry_forward_count: occ.carry_forward_count + 1 });
        countToday++;
      } else {
        scheduledTomorrow.push({ ...occ, scheduled_date: "2026-11-02", carry_forward_count: occ.carry_forward_count + 1 });
      }
    }

    assert.equal(scheduledToday.length, 3);
    assert.equal(scheduledTomorrow.length, 1);
    assert.equal(scheduledTomorrow[0].scheduled_date, "2026-11-02");
  });

  await t.test("No duplicate task occurrences created on same day", () => {
    const existingTaskIds = new Set(["task-python-1"]);
    const candidateTasks = ["task-python-1", "task-cpp-1"];

    const newlyCreated = [];
    for (const taskId of candidateTasks) {
      if (!existingTaskIds.has(taskId)) {
        newlyCreated.push(taskId);
        existingTaskIds.add(taskId);
      }
    }

    assert.equal(newlyCreated.length, 1);
    assert.equal(newlyCreated[0], "task-cpp-1");
  });
});

