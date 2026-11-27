import { describe, expect, it } from "vitest";

import { credentialsEmail, generatePassword, inviteEmail, loginUrl, welcomeEmail } from "@/lib/cms/account-emails";
import { passwordProblem } from "@/lib/cms/auth";

const member = { name: "Priya <b>Sharma</b>", email: "priya@setuware.in", roleName: "Editor" };

describe("generatePassword", () => {
  it("meets the password rules and differs each time", () => {
    const passwords = Array.from({ length: 50 }, generatePassword);
    for (const password of passwords) {
      expect(password).toMatch(/^[A-Za-z2-9]{4}-[A-Za-z2-9]{4}-[A-Za-z2-9]{4}$/);
      expect(passwordProblem(password)).toBeNull();
    }
    expect(new Set(passwords).size).toBe(passwords.length);
  });
});

describe("account emails", () => {
  it("sends the sign-in page, email and temporary password", () => {
    const email = credentialsEmail(member, "Kq7m-xT3p-Rw9a", "Satyam Raj");
    expect(email.subject).toContain("login details");
    for (const part of [email.html, email.text]) {
      expect(part).toContain("Kq7m-xT3p-Rw9a");
      expect(part).toContain("priya@setuware.in");
      expect(part).toContain(loginUrl());
    }
    expect(email.html).not.toContain("<b>Sharma");
    expect(email.html).toContain("Hi Priya,");
  });

  it("puts the invite link in the invite", () => {
    const email = inviteEmail(member, "https://setuware.in/admin/set-password?token=abc", "Satyam Raj");
    expect(email.html).toContain("set-password?token=abc");
    expect(email.text).toContain("set-password?token=abc");
  });

  it("welcome lists only the job details that are set", () => {
    const full = welcomeEmail({ ...member, designation: "Designer", managerName: "Satyam Raj", joinedOn: "2026-12-01" }, "Satyam Raj");
    expect(full.subject).toBe("Welcome to Setuware Technologies, Priya");
    expect(full.text).toContain("Designation: Designer");
    expect(full.text).toContain("Reports to: Satyam Raj");
    expect(full.text).toContain("Joining date: 1 December 2026");
    const bare = welcomeEmail(member, "Satyam Raj");
    expect(bare.text).not.toContain("Reports to");
    expect(bare.text).toContain("Admin access: Editor");
  });

  it("welcome says how they sign in", () => {
    expect(welcomeEmail(member, "Satyam Raj", "invite").text).toContain("invite link");
    expect(welcomeEmail(member, "Satyam Raj", "invite").text).not.toContain("sign-in details");
    expect(welcomeEmail(member, "Satyam Raj", "credentials").text).toContain("temporary password");
    expect(welcomeEmail(member, "Satyam Raj").text).not.toContain("separate email");
  });
});
