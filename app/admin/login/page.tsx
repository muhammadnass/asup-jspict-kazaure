"use client";

import Image from "next/image";
import { useFormState, useFormStatus } from "react-dom";
import { signIn } from "@/lib/actions/auth";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-green text-cream font-semibold py-2.5 rounded-sm hover:bg-green-light transition-colors disabled:opacity-60"
    >
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}

export default function AdminLoginPage() {
  const [state, formAction] = useFormState(signIn, null);

  return (
    <div className="mx-auto max-w-sm px-4 py-24">
      <Image
        src="/logo.png"
        alt="ASUP logo"
        width={56}
        height={56}
        className="rounded-full mx-auto mb-6"
      />
      <h1 className="font-display text-2xl text-green text-center mb-1">
        Admin Sign In
      </h1>
      <p className="text-center text-sm text-ink/60 mb-8">
        Chapter secretary access only.
      </p>

      <form action={formAction} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-ink/80 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            required
            className="w-full border border-green/20 rounded-sm px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink/80 mb-1">
            Password
          </label>
          <input
            type="password"
            name="password"
            required
            className="w-full border border-green/20 rounded-sm px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </div>
        {state?.error && (
          <p className="text-sm text-red" role="alert">
            {state.error}
          </p>
        )}
        <SubmitButton />
      </form>
    </div>
  );
}
