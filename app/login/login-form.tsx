"use client";

import { useState, useTransition } from "react";
import { login } from "./actions";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(formData: FormData) => {
        setError(null);
        startTransition(async () => {
          const result = await login(formData);
          if (result?.error) setError(result.error);
        });
      }}
      className="w-full max-w-sm space-y-4 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm"
    >
      <h1 className="text-lg font-semibold">Control Horario Cafetería</h1>

      {error && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div>
        <label htmlFor="username" className="block text-sm font-medium">
          Usuario
        </label>
        <input
          id="username"
          name="username"
          required
          autoComplete="username"
          autoCapitalize="none"
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-3 text-base"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-3 text-base"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-neutral-900 py-3 text-base font-medium text-white disabled:opacity-50"
      >
        {isPending ? "Ingresando…" : "Ingresar"}
      </button>
    </form>
  );
}
