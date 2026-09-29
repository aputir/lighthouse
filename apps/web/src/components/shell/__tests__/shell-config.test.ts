import { describe, expect, it } from "bun:test";
import { getStaffNavItems } from "../staff-shell-config";
import { getStudentNavItems } from "../student-shell-config";

describe("Staff Shell Config", () => {
  it("returns all 7 staff nav items for given locale", () => {
    const mockT = (key: string) => `translated:${key}`;
    const items = getStaffNavItems("fa", mockT);

    expect(items).toHaveLength(7);
    expect(items[0]).toEqual({ href: "/fa/staff", label: "translated:staff.nav.overview" });
    expect(items[1]).toEqual({ href: "/fa/staff/roster", label: "translated:staff.nav.roster" });
    expect(items[2]).toEqual({
      href: "/fa/staff/missions",
      label: "translated:staff.nav.missions",
    });
    expect(items[3]).toEqual({ href: "/fa/staff/grades", label: "translated:staff.nav.grades" });
    expect(items[4]).toEqual({ href: "/fa/staff/crews", label: "translated:staff.nav.crews" });
    expect(items[5]).toEqual({ href: "/fa/staff/world", label: "translated:staff.nav.world" });
    expect(items[6]).toEqual({ href: "/fa/staff/logs", label: "translated:staff.nav.logs" });
  });

  it("formats hrefs correctly for en locale", () => {
    const mockT = (key: string) => key;
    const items = getStaffNavItems("en", mockT);

    expect(items[0]?.href).toBe("/en/staff");
    expect(items[6]?.href).toBe("/en/staff/logs");
  });
});

describe("Student Shell Config", () => {
  it("returns all 4 student nav items for given locale", () => {
    const mockT = (key: string) => `translated:${key}`;
    const items = getStudentNavItems("fa", mockT);

    expect(items).toHaveLength(4);
    expect(items[0]).toEqual({ href: "/fa/dashboard", label: "translated:student.nav.dashboard" });
    expect(items[1]).toEqual({ href: "/fa/missions", label: "translated:student.nav.missions" });
    expect(items[2]).toEqual({ href: "/fa/crew", label: "translated:student.nav.crew" });
    expect(items[3]).toEqual({ href: "/fa/harbor", label: "translated:student.nav.harbor" });
  });

  it("formats hrefs correctly for en locale", () => {
    const mockT = (key: string) => key;
    const items = getStudentNavItems("en", mockT);

    expect(items[0]?.href).toBe("/en/dashboard");
    expect(items[3]?.href).toBe("/en/harbor");
  });
});
