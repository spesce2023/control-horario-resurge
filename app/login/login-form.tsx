"use client";

import { useState, useTransition } from "react";
import { BrandMark } from "@/components/brand";
import { login } from "./actions";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="w-full max-w-[380px] rounded-[18px] border border-border bg-card p-8 shadow-[0_4px_24px_rgba(92,78,51,0.08)] sm:p-10">
      <div className="mb-8 text-center">
        <div className="mb-2.5 flex justify-center">
          <BrandMark size={30} wordmarkSize="text-[28px]" />
        </div>
        <p className="text-[12.5px] italic text-secondary">té, café y encuentros que inspiran</p>
      </div>

      <form
        action={(formData: FormData) => {
          setError(null);
          startTransition(async () => {
            const result = await login(formData);
            if (result?.error) setError(result.error);
          });
        }}
        className="space-y-[18px]"
      >
        {error && (
          <p role="alert" className="rounded-md bg-danger-bg px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        <div>
          <label htmlFor="username" className="mb-1.5 block text-[13px] font-semibold text-olive">
            Usuario
          </label>
          <input
            id="username"
            name="username"
            required
            autoComplete="username"
            autoCapitalize="none"
            className="w-full rounded-[10px] border-[1.5px] border-border bg-white px-3.5 py-3.5 text-[15px] text-olive outline-none transition-colors focus:border-sage focus:ring-4 focus:ring-sage-bg"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-[13px] font-semibold text-olive">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full rounded-[10px] border-[1.5px] border-border bg-white px-3.5 py-3.5 text-[15px] text-olive outline-none transition-colors focus:border-sage focus:ring-4 focus:ring-sage-bg"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-[10px] bg-sage py-[15px] text-[15px] font-bold text-white transition-colors hover:bg-sage-dark disabled:opacity-50"
        >
          {isPending ? "Ingresando…" : "Ingresar"}
        </button>
      </form>

      <p className="mt-4 text-center text-[12.5px] text-secondary">
        ¿Olvidaste tu contraseña?{" "}
        <span className="font-semibold text-sage-dark">Contactá al dueño del local</span>
      </p>
    </div>
  );
}
