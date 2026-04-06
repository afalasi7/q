"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignupForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setMessage(null);

    try {
      const supabase = createClient();
      const { error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (signupError) {
        setError(signupError.message);
        return;
      }

      setMessage("Account created. Check your email if confirmation is enabled.");
      router.push("/dashboard");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Full name"
        value={fullName}
        onChange={(event) => setFullName(event.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none placeholder:text-white/35"
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none placeholder:text-white/35"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none placeholder:text-white/35"
      />
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-300">{message}</p> : null}
      <button className="w-full rounded-2xl bg-white px-4 py-3 font-semibold text-black" disabled={pending}>
        {pending ? "Creating account..." : "Sign up"}
      </button>
    </form>
  );
}
