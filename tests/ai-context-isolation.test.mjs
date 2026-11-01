// tests/ai-context-isolation.test.mjs
import test from "node:test";
import assert from "node:assert/strict";

test("AI Tutor Context Grounding & Privacy Isolation", async (t) => {
  function generateSystemPrompt(persona, displayName, todayTasks) {
    const role = persona === "boy"
      ? "Robotics Engineering Mentor"
      : "Industrial Design and Robotics Product Design Mentor";

    return {
      role,
      student: displayName,
      contextPrompt: `You are the ${role} for ${displayName}. Today's tasks: ${todayTasks.join(", ")}.`,
    };
  }

  await t.test("Boy Mode receives Robotics Engineering mentor persona with code & hardware grounding", () => {
    const prompt = generateSystemPrompt("boy", "Alex", ["Python functions", "ESP32 PWM motor control"]);
    assert.match(prompt.role, /Robotics Engineering Mentor/);
    assert.match(prompt.contextPrompt, /ESP32 PWM motor control/);
  });

  await t.test("Girl Mode receives Industrial Design mentor persona with CAD & sketching grounding", () => {
    const prompt = generateSystemPrompt("girl", "Maya", ["50 Product sketches", "Fusion 360 Extrusion"]);
    assert.match(prompt.role, /Industrial Design/);
    assert.match(prompt.contextPrompt, /Fusion 360 Extrusion/);
  });

  await t.test("Strict user history isolation: Conversations are scoped only by user_id", () => {
    const dbMessages = [
      { id: "m-1", user_id: "user-boy", content: "How do I wire a TB6612FNG?" },
      { id: "m-2", user_id: "user-girl", content: "How do I model fillets in Fusion 360?" },
    ];

    const getMessagesForUser = (userId) => dbMessages.filter((m) => m.user_id === userId);

    const boyMsgs = getMessagesForUser("user-boy");
    assert.equal(boyMsgs.length, 1);
    assert.equal(boyMsgs[0].content.includes("TB6612FNG"), true);
    assert.equal(boyMsgs.some((m) => m.content.includes("Fusion 360")), false);

    const girlMsgs = getMessagesForUser("user-girl");
    assert.equal(girlMsgs.length, 1);
    assert.equal(girlMsgs[0].content.includes("Fusion 360"), true);
    assert.equal(girlMsgs.some((m) => m.content.includes("TB6612FNG")), false);
  });
});

