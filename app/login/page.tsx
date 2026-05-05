import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
import { SiteNav } from "@/components/site-nav";

export default function LoginPage() {
  return (
    <main className="min-h-screen px-4 pb-20 pt-32">
      <SiteNav />
      <section className="mx-auto max-w-4xl text-center">
        <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#9b5b24]">Account access</p>
        <h1 className="mt-4 font-display text-6xl font-bold leading-none">Login to CandleX.</h1>
        <p className="mx-auto mt-5 max-w-2xl leading-7 text-stone-600">
          Use your customer or seller account for dashboard access. Admin accounts can use this same login, but admin links stay hidden from the customer site.
        </p>
        <div className="mt-10">
          <Suspense fallback={null}>
            <AuthForm mode="login" />
          </Suspense>
        </div>
        <p className="mt-6 text-sm text-stone-600">
          New to CandleX?{" "}
          <Link href="/register" className="font-semibold text-[#9b5b24]">
            Create an account
          </Link>
        </p>
      </section>
    </main>
  );
}
