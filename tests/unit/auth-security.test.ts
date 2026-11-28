import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createUser, IDLE_TIMEOUT_HOURS, isNewDeviceSignIn, needsTwoFactorSetup, signIn, userForToken } from "@/lib/cms/auth";
import { getDb, resetDb } from "@/lib/cms/db";
import { getSetting, setSetting } from "@/lib/cms/crm";

beforeEach(() => resetDb());
afterEach(() => resetDb());

describe("required two-step sign-in", () => {
  it("requires setup only for privileged users without two-step enabled", () => {
    expect(needsTwoFactorSetup({ permissions: ["users.view"], twoFactor: false }, true)).toBe(true);
    expect(needsTwoFactorSetup({ permissions: ["users.manage"], twoFactor: false }, true)).toBe(true);
    expect(needsTwoFactorSetup({ permissions: ["roles.manage"], twoFactor: false }, true)).toBe(true);
    expect(needsTwoFactorSetup({ permissions: ["settings.manage"], twoFactor: false }, true)).toBe(true);
    expect(needsTwoFactorSetup({ permissions: ["settings.manage"], twoFactor: true }, true)).toBe(false);
    expect(needsTwoFactorSetup({ permissions: ["tasks.view"], twoFactor: false }, true)).toBe(false);
    expect(needsTwoFactorSetup({ permissions: ["settings.manage"], twoFactor: false }, false)).toBe(false);
  });

  it("stores the setting as a boolean and defaults it to false", () => {
    expect(getSetting("require2faAdmins", false)).toBe(false);
    setSetting("require2faAdmins", true);
    expect(getSetting("require2faAdmins", false)).toBe(true);
  });
});

describe("idle session timeout", () => {
  async function signedIn() {
    const user = await createUser({ email: "session@example.com", name: "Session User", role: "developer", password: "SessionPass123" });
    const result = await signIn(user.email, "SessionPass123", { userAgent: "Chrome on Mac" });
    if (!result.ok) throw new Error("sign-in failed");
    return { user, token: result.token };
  }

  it("alerts only when earlier sessions do not match the current device", async () => {
    const { user, token } = await signedIn();
    expect(isNewDeviceSignIn(user.id, "Chrome on Mac", token)).toBe(false);

    const sameDevice = await signIn(user.email, "SessionPass123", { userAgent: "Chrome on Mac" });
    if (!sameDevice.ok) throw new Error("sign-in failed");
    expect(isNewDeviceSignIn(user.id, "Chrome on Mac", sameDevice.token)).toBe(false);

    const newDevice = await signIn(user.email, "SessionPass123", { userAgent: "Firefox on Linux" });
    if (!newDevice.ok) throw new Error("sign-in failed");
    expect(isNewDeviceSignIn(user.id, "Firefox on Linux", newDevice.token)).toBe(true);
  });

  it("deletes a session whose last activity is older than the timeout", async () => {
    const { user, token } = await signedIn();
    const stale = new Date(Date.now() - (IDLE_TIMEOUT_HOURS + 1) * 60 * 60_000).toISOString();
    getDb().prepare("UPDATE sessions SET last_seen_at = ? WHERE user_id = ?").run(stale, user.id);

    expect(userForToken(token)).toBeNull();
    expect(getDb().prepare("SELECT id FROM sessions WHERE user_id = ?").get(user.id)).toBeUndefined();
  });

  it("uses session creation time when last_seen_at is null", async () => {
    const { user, token } = await signedIn();
    const stale = new Date(Date.now() - (IDLE_TIMEOUT_HOURS + 1) * 60 * 60_000).toISOString();
    getDb().prepare("UPDATE sessions SET last_seen_at = NULL, created_at = ? WHERE user_id = ?").run(stale, user.id);

    expect(userForToken(token)).toBeNull();
    expect(getDb().prepare("SELECT id FROM sessions WHERE user_id = ?").get(user.id)).toBeUndefined();
  });
});
