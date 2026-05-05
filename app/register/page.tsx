import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
import { SiteNav } from "@/components/site-nav";

export default function RegisterPage() {
  return (
    <main className="min-h-screen px-4 pb-20 pt-32">
      <SiteNav />
      <section className="mx-auto max-w-4xl text-center">
        <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#9b5b24]">Create account</p>
        <h1 className="mt-4 font-display text-6xl font-bold leading-none">Start your CandleX loop.</h1>
        <p className="mx-auto mt-5 max-w-2xl leading-7 text-stone-600">
          Register as a buyer or seller. Admin accounts are created separately through the database seed.
        </p>
        <div className="mt-10">
          <Suspense fallback={null}>
            <AuthForm mode="register" />
          </Suspense>
        </div>
        <p className="mt-6 text-sm text-stone-600">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-[#9b5b24]">
            Login
          </Link>
        </p>
      </section>
    </main>
  );
}
