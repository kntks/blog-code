import Link from "next/link";
import { redirect } from "next/navigation";

import { getAuthenticatedActor } from "@/contexts/identity/application/identity-service";

type AuthenticatedLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/expense-requests", label: "Expense requests" },
  { href: "/approvals", label: "Approvals" },
];

export default async function AuthenticatedLayout({
  children,
}: AuthenticatedLayoutProps) {
  const actor = await getAuthenticatedActor();

  if (!actor) {
    redirect("/login");
  }

  const visibleNavItems = navItems.filter((item) => {
    if (item.href === "/approvals") {
      return actor.role !== "member";
    }

    return true;
  });

  return (
    <div className="min-h-screen">
      <header className="nav-shell">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-5 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <Link href="/" className="button-link w-fit text-sm">
              ← Public home
            </Link>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="pill-badge pill-badge-blue">
                  authenticated area
                </span>
                <span className="pill-badge pill-badge-neutral">
                  {actor.departmentCode}
                </span>
              </div>
              <p className="text-[1.75rem] font-bold tracking-[-0.03em] text-[color:var(--foreground)]">
                {actor.name}
              </p>
              <p className="text-sm text-[color:var(--text-secondary)]">
                {actor.email} / {actor.role}
              </p>
            </div>
          </div>

          <nav className="flex flex-wrap gap-2">
            {visibleNavItems.map((item) => (
              <Link key={item.href} href={item.href} className="nav-link">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <div className="page-shell">{children}</div>
    </div>
  );
}
