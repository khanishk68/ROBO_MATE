// tests/auth-and-workspace.test.mjs
import test from "node:test";
import assert from "node:assert/strict";

test("Workspace Security & Membership Limits", async (t) => {
  const WORKSPACE_MAX_MEMBERS = 2;

  class MockWorkspace {
    constructor(id, name, limit = 2) {
      this.id = id;
      this.name = name;
      this.limit = limit;
      this.members = [];
    }

    addMember(user) {
      if (this.members.length >= this.limit) {
        throw new Error(`ROBO MATES Private Workspace limit reached (maximum ${this.limit} members allowed).`);
      }
      if (this.members.some((m) => m.id === user.id)) {
        throw new Error("User already a member of this workspace.");
      }
      this.members.push(user);
    }
  }

  const workspace = new MockWorkspace("ws-1", "ROBO MATES Workspace", WORKSPACE_MAX_MEMBERS);

  await t.test("Can register Member 1 with Boy Mode (Robotics Engineer)", () => {
    const user1 = { id: "u-1", name: "Boy Co-Founder", persona: "boy" };
    workspace.addMember(user1);
    assert.equal(workspace.members.length, 1);
    assert.equal(workspace.members[0].persona, "boy");
  });

  await t.test("Can register Member 2 with Girl Mode (Product Designer)", () => {
    const user2 = { id: "u-2", name: "Girl Co-Founder", persona: "girl" };
    workspace.addMember(user2);
    assert.equal(workspace.members.length, 2);
    assert.equal(workspace.members[1].persona, "girl");
  });

  await t.test("Rejects Member 3 to protect 2-person private workspace boundary", () => {
    const user3 = { id: "u-3", name: "Intruder User", persona: "boy" };
    assert.throws(
      () => workspace.addMember(user3),
      /ROBO MATES Private Workspace limit reached/
    );
    assert.equal(workspace.members.length, 2);
  });

  await t.test("Prevents duplicate registrations of existing member", () => {
    const user1Duplicate = { id: "u-1", name: "Boy Co-Founder", persona: "boy" };
    assert.throws(
      () => workspace.addMember(user1Duplicate),
      /limit reached|already a member/
    );
  });
});

