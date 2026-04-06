import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 py-12 text-white">
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/[0.04] p-8">
        <p className="text-xs uppercase tracking-[0.24em] text-white/45">Auth</p>
        <h1 className="mt-3 text-3xl font-semibold">Login to q</h1>
        <LoginForm />
        <p className="mt-6 text-sm text-white/55">
          New here? <Link href="/signup" className="text-white">Create an account</Link>
        </p>
      </div>
    </main>
  );
}
