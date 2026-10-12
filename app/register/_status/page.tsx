import type { Metadata } from "next";
import { Suspense } from "react";
import { StatusLookup } from "@/components/registration/StatusLookup";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Registration Status",
  description: "Check the payment status of your Destroy The Decibel registration.",
  robots: { index: false },
};

export default function StatusPage() {
  return (
    <>
      <PageHeader
        label="Registration status"
        title={
          <>
            Check your <span className="text-metal">entry.</span>
          </>
        }
      >
        <p>Enter the reference you received when you registered.</p>
      </PageHeader>
      <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 lg:py-24">
        <Suspense fallback={<p className="label-tech text-silver/60">Loading…</p>}>
          <StatusLookup />
        </Suspense>
      </div>
    </>
  );
}
