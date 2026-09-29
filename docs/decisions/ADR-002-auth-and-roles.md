# ADR-002: Authentication — Invite-Only Email+Password via Auth.js v5

**Date:** 2026-09-29  
**Status:** Accepted  
**Deciders:** Course TA (system owner)

## Context

The system serves two actor types: TAs (staff) and students. We need a simple, secure auth system that:
- Controls who can access the course (no public registration)
- Is easy to set up and operate without external dependencies
- Can be extended later (GitHub OAuth, UT SSO) without rearchitecting

Options considered:
1. GitHub OAuth only
2. Email + password (invite-only)
3. UT University SSO
4. Magic link (email-only)
5. Hybrid (email + GitHub OAuth from day 1)

## Decision

**Auth.js v5 Credentials provider** (email + password) with **invite-only registration**.

- No public sign-up endpoint exists
- TAs/owner create `Invite` records in the DB (email + token)
- Student follows the invite link → sets their password → account activated
- Login: standard email + password form → Auth.js JWT session
- TAs are provisioned manually by the owner (role field set in DB)

## Role Model

| Role | Set By | Access |
|------|--------|--------|
| `owner` | Seed script | Everything — head TA / course admin |
| `staff` | Owner manually | TA dashboard: grades, missions, roster |
| `student` | Invite flow | Personal progress, harbor map |

## Rationale

- **Invite-only is secure and simple**: no bot registrations, no student can create a TA account, no external OAuth dependency on day 1.
- **Auth.js v5** is designed for Next.js App Router and handles session, CSRF, and cookie security out of the box.
- **Extensibility**: Auth.js providers are additive. Adding GitHub OAuth or UT SSO (when institutional approval arrives) is a 1-day change that doesn't affect the invite system or role model.
- **UT SSO deferred**: requires institutional IT approval — not a safe dependency for a course starting immediately.

## Consequences

- **Good**: Zero external auth service dependency (no Firebase, Clerk, Supabase Auth billing surprises).
- **Good**: Full audit trail (invites table tracks who created each account).
- **Good**: Extensible to GitHub OAuth or UT SSO via Auth.js provider addition.
- **Trade-off**: TAs manually create invite records per student. For a class of 30-100 students, this is acceptable. A bulk import CSV for invites can be added if needed.
- **Trade-off**: Password reset requires a mail server. For Phase 1, TAs can reset passwords manually via DB until a mailer is wired up.
