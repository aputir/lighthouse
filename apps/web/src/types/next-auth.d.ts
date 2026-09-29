import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "owner" | "staff" | "student";
    } & DefaultSession["user"];
  }
}
