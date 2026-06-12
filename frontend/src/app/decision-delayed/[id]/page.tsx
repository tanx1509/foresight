"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Clock3, Home, ShieldAlert } from "lucide-react";

export default function DecisionDelayedPage() {
  const params = useParams();
  const router = useRouter();
  const [seconds, setSeconds] = useState(6);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSeconds((value) => {
        if (value <= 1) {
          window.clearInterval(timer);
          router.push("/");
          return 0;
        }
        return value - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [router]);

  return (
    <main className="min-h-screen bg-fluent-bg text-fluent-text flex items-center justify-center p-6">
      <section className="w-full max-w-3xl bg-fluent-surface border border-fluent-border rounded-sm shadow-sm">
        <div className="border-b border-fluent-border px-6 py-4 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-1.5 text-[13px] text-fluent-brand hover:underline">
            <ArrowLeft className="w-3.5 h-3.5" />
            Home
          </Link>
          <span className="text-[12px] text-fluent-text-muted">Decision ID: {String(params.id)}</span>
        </div>

        <div className="p-8">
          <div className="w-12 h-12 bg-fluent-warning-bg border border-fluent-warning/30 rounded-sm flex items-center justify-center mb-5">
            <Clock3 className="w-6 h-6 text-fluent-warning" />
          </div>
          <h1 className="text-[26px] font-semibold tracking-tight">Decision delayed for review</h1>
          <p className="text-[14px] text-fluent-text-muted mt-2 max-w-2xl leading-6">
            FORESIGHT recorded this decision as delayed. The recommendation is to resolve the highest-risk assumptions,
            verify rollback ownership, and rerun the simulation when new evidence is available.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
            {[
              "Assign an accountable owner",
              "Validate operational capacity",
              "Rerun with updated evidence"
            ].map((item) => (
              <div key={item} className="border border-fluent-border-subtle bg-fluent-bg rounded-sm p-3 text-[13px] font-medium flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-fluent-warning shrink-0 mt-0.5" />
                {item}
              </div>
            ))}
          </div>

          <div className="mt-7 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <p className="text-[12px] text-fluent-text-muted">Returning to homepage in {seconds}s.</p>
            <button
              onClick={() => router.push("/")}
              className="h-9 px-4 bg-fluent-brand hover:bg-fluent-brand-hover text-white rounded-sm text-[13px] font-semibold inline-flex items-center justify-center gap-1.5"
            >
              <Home className="w-4 h-4" />
              Back to homepage
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
