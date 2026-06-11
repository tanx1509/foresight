"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, KeyRound, LogIn, ShieldCheck } from "lucide-react";
import ForesightLogo from "@/components/ForesightLogo";

export default function LoginPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-fluent-bg text-fluent-text flex items-center justify-center p-6">
      <section className="w-full max-w-[920px] grid grid-cols-1 md:grid-cols-[1fr_360px] bg-fluent-surface border border-fluent-border rounded-sm shadow-sm overflow-hidden">
        <div className="p-8 md:p-10 border-b md:border-b-0 md:border-r border-fluent-border">
          <Link href="/" className="inline-flex items-center gap-1.5 text-[13px] text-fluent-brand hover:underline mb-8">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </Link>
          <div className="flex items-center gap-3 text-fluent-brand">
            <ForesightLogo size={38} color="currentColor" />
            <div>
              <h1 className="text-[24px] font-semibold tracking-tight text-fluent-text">FORESIGHT</h1>
              <p className="text-[13px] text-fluent-text-muted">Decision intelligence for Microsoft teams</p>
            </div>
          </div>

          <div className="mt-10 space-y-4">
            <div className="flex gap-3">
              <ShieldCheck className="w-5 h-5 text-fluent-success shrink-0 mt-0.5" />
              <div>
                <h2 className="text-[14px] font-semibold">Microsoft-ready authentication surface</h2>
                <p className="text-[13px] text-fluent-text-muted mt-1">Use this page as the entry point for Entra ID, Teams, or Copilot Studio auth later.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <KeyRound className="w-5 h-5 text-fluent-brand shrink-0 mt-0.5" />
              <div>
                <h2 className="text-[14px] font-semibold">Local demo mode enabled</h2>
                <p className="text-[13px] text-fluent-text-muted mt-1">No credentials are required while you test the decision workflow locally.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8 flex flex-col justify-center">
          <label className="text-[12px] font-semibold text-fluent-text-muted mb-1.5">Work account</label>
          <input
            className="h-9 border border-fluent-border bg-fluent-bg rounded-sm px-3 text-[13px] outline-none focus:ring-1 focus:ring-fluent-brand"
            placeholder="name@company.com"
            defaultValue="admin@foresight.local"
          />
          <label className="text-[12px] font-semibold text-fluent-text-muted mt-4 mb-1.5">Password</label>
          <input
            type="password"
            className="h-9 border border-fluent-border bg-fluent-bg rounded-sm px-3 text-[13px] outline-none focus:ring-1 focus:ring-fluent-brand"
            defaultValue="demo-password"
          />
          <button
            onClick={() => router.push("/")}
            className="h-10 mt-5 bg-fluent-brand hover:bg-fluent-brand-hover text-white rounded-sm text-[13px] font-semibold inline-flex items-center justify-center gap-1.5"
          >
            <LogIn className="w-4 h-4" />
            Continue
          </button>
          <p className="text-[11px] text-fluent-text-muted mt-3 leading-5">
            Demo sign-in routes to the homepage. Connect Entra ID when you are ready for production auth.
          </p>
        </div>
      </section>
    </main>
  );
}
