This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
mise x -- pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Expense requests

This sample app includes an authenticated `expense-requests` flow backed by PostgreSQL via Drizzle ORM.

Before starting the app, make sure these environment variables are available:

- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `KEYCLOAK_ISSUER`
- `KEYCLOAK_CLIENT_ID`
- `KEYCLOAK_CLIENT_SECRET` _(set locally; do not commit it)_
- `AUTHZ_PROVIDER` _(optional: `local` / `casbin` / `opa`, default: `local`)_

Before starting the app, apply the auth schema and database migrations:

```bash
mise x -- pnpm auth:generate
mise x -- pnpm db:generate
mise x -- env KEYCLOAK_CLIENT_SECRET=... pnpm db:migrate
```

Key routes:

- `/` public home
- `/login` Better Auth + Keycloak login
- `/dashboard` authenticated shell
- `/expense-requests` list
- `/expense-requests/new` create page
- `/expense-requests/:requestId` detail page
- `/expense-requests/:requestId/edit` edit page
- `/approvals` approval queue for manager / admin
- `/admin/users` identity users reference
- `/admin/departments` departments reference
- `/api/health` health check
- `/api/auth/*` Better Auth endpoints

The source is organized under `src/app`, `src/contexts`, and `src/shared`.

Current bounded context notes:

- `expense-request`: applicant-side use cases such as drafting, editing, submitting, withdrawing, invalidating, settling, and viewing expense requests
- `approval`: approver-side use cases such as reviewing, approving, and rejecting submitted requests
- `identity`: application-side source of truth for user role, department, and employee code. Auth sessions are linked to these records by email on first sign-in
- `shared/auth`: technical authentication integration with Better Auth, Keycloak, cookies, and session retrieval; this is shared infrastructure, not a business bounded context

## Authorization provider switch

`AUTHZ_PROVIDER` controls which expense-request authorization engine is used.

- `local`: TypeScript policy implementation
- `casbin`: Casbin model/policy based authorization
- `opa`: OPA/Rego policy compiled to Wasm via `@open-policy-agent/opa-wasm`

When `AUTHZ_PROVIDER=opa`, the app loads bundled policy artifacts from:

- `src/contexts/expense-request/policies/opa/expense-request-authorization.wasm`
- `src/contexts/expense-request/policies/opa/expense-request-authorization-data.json`

OPA provider currently targets Node runtime and evaluates a boolean `allow` decision from the Wasm policy.

Seeded identity data:

| Email                | Role      | Department | Notes                          |
| -------------------- | --------- | ---------- | ------------------------------ |
| `myuser@exmple.com`  | `member`  | `GENERAL`  | default applicant user         |
| `manager@exmple.com` | `manager` | `SALES`    | department approver            |
| `admin@exmple.com`   | `admin`   | `GENERAL`  | cross-department administrator |

Unknown users are auto-provisioned as `member` in `GENERAL` on first sign-in so the sample app remains usable.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
