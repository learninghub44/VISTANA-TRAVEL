import { describe, it, expect } from "vitest";
import { checkRoleChange } from "./roles";

const cust = { id: "c1", role: "customer" as const, email_verified: true };
const adm = { id: "a2", role: "admin" as const, email_verified: true };

describe("checkRoleChange", () => {
  it("allows promoting a verified customer", () => {
    expect(checkRoleChange({ actorId: "a1", target: cust, makeAdmin: true, adminCount: 1 })).toBeNull();
  });
  it("refuses unknown, already-admin and unverified targets", () => {
    expect(checkRoleChange({ actorId: "a1", target: null, makeAdmin: true, adminCount: 1 })).toMatch(/create an account/);
    expect(checkRoleChange({ actorId: "a1", target: adm, makeAdmin: true, adminCount: 2 })).toMatch(/already/);
    expect(checkRoleChange({ actorId: "a1", target: { ...cust, email_verified: false }, makeAdmin: true, adminCount: 1 })).toMatch(/verified/);
  });
  it("allows demoting another admin when others remain", () => {
    expect(checkRoleChange({ actorId: "a1", target: adm, makeAdmin: false, adminCount: 2 })).toBeNull();
  });
  it("refuses self-demotion, last-admin removal, and demoting non-admins", () => {
    expect(checkRoleChange({ actorId: "a2", target: adm, makeAdmin: false, adminCount: 3 })).toMatch(/own admin/);
    expect(checkRoleChange({ actorId: "a1", target: adm, makeAdmin: false, adminCount: 1 })).toMatch(/At least one/);
    expect(checkRoleChange({ actorId: "a1", target: cust, makeAdmin: false, adminCount: 2 })).toMatch(/not an admin/);
  });
});
