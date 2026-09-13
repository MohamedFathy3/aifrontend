"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useLogout } from "@/features/auth/hooks/useLogout";

export default function DashboardPage() {
  const router = useRouter();
  const { data: user, isLoading, isError } = useCurrentUser();
  const logout = useLogout();

  useEffect(() => {
    // Client-side redirect if the session turns out to be invalid. This is a
    // UX convenience only - every real protected endpoint re-checks auth
    // and role server-side regardless of what this page decides to render.
    if (!isLoading && (isError || user === null)) {
      router.replace("/login");
    }
  }, [isLoading, isError, user, router]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold">Pyramidth CRM</h1>
          <p className="text-sm text-slate-500">
            {user.name} &middot; {user.role_label}
          </p>
        </div>
        <button
          onClick={() => logout.mutate()}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Sign out
        </button>
      </header>

      <main className="p-6">
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          Dashboard metrics, lead pipeline charts, and follow-up widgets land in Phase 8.
          <br />
          Phase 1 confirms the authenticated request pipeline is real: this page only
          renders because <code className="rounded bg-slate-100 px-1">/api/v1/auth/me</code> returned
          a valid session for <strong>{user.email}</strong>.
        </div>
      </main>
    </div>
  );
}
