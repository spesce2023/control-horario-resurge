"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(
        "No se pudo guardar la contraseña. El enlace puede haber vencido; pedile al dueño que te reenvíe la invitación."
      );
      return;
    }

    router.replace("/");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm space-y-4 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm"
    >
      <h1 className="text-lg font-semibold">Definí tu contraseña</h1>
      <p className="text-sm text-neutral-500">
        Esta contraseña es personal: el dueño no puede verla ni definirla por vos.
      </p>

      {error && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Nueva contraseña
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-3 text-base"
        />
      </div>

      <div>
        <label htmlFor="confirm" className="block text-sm font-medium">
          Repetir contraseña
        </label>
        <input
          id="confirm"
          type="password"
          required
          minLength={8}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-3 text-base"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-neutral-900 py-3 text-base font-medium text-white disabled:opacity-50"
      >
        {loading ? "Guardando…" : "Guardar contraseña"}
      </button>
    </form>
  );
}
