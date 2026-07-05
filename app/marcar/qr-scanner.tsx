"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const READER_ELEMENT_ID = "qr-reader";

type Status = "scanning" | "checking" | "success" | "error";

export function QrScanner() {
  const [status, setStatus] = useState<Status>("scanning");
  const [message, setMessage] = useState("Apuntá la cámara al QR del local.");
  const router = useRouter();
  const scannerRef = useRef<import("html5-qrcode").Html5Qrcode | null>(null);
  const handledRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function stopScanner() {
      try {
        await scannerRef.current?.stop();
        scannerRef.current?.clear();
      } catch {
        // el scanner puede no haber llegado a iniciar; no es un error real
      }
    }

    async function start() {
      const { Html5Qrcode } = await import("html5-qrcode");
      if (cancelled) return;

      const scanner = new Html5Qrcode(READER_ELEMENT_ID);
      scannerRef.current = scanner;

      try {
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: 250 },
          async (decodedText) => {
            if (handledRef.current) return;
            handledRef.current = true;
            await stopScanner();
            await confirmMark(decodedText);
          },
          () => {
            // fallos de lectura frame a frame: se ignoran, se sigue escaneando
          }
        );
      } catch {
        if (!cancelled) {
          setStatus("error");
          setMessage("No se pudo acceder a la cámara. Revisá los permisos del navegador.");
        }
      }
    }

    start();

    return () => {
      cancelled = true;
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function confirmMark(decodedText: string) {
    setStatus("checking");
    setMessage("Registrando marca…");

    try {
      const res = await fetch("/api/time-entries/mark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scanned: decodedText }),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setStatus("error");
        setMessage(data.error ?? "No se pudo registrar la marca.");
        return;
      }

      const time = new Date(data.occurredAt).toLocaleTimeString("es-UY", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "America/Montevideo",
      });
      setStatus("success");
      setMessage(`${data.type === "in" ? "Entrada" : "Salida"} registrada a las ${time}.`);
      setTimeout(() => {
        router.replace("/");
        router.refresh();
      }, 1500);
    } catch {
      setStatus("error");
      setMessage("Error de red. Probá de nuevo.");
    }
  }

  return (
    <div className="space-y-4 text-center">
      <div id={READER_ELEMENT_ID} className="mx-auto overflow-hidden rounded-xl" />

      <p
        className={
          status === "error"
            ? "text-sm text-red-600"
            : status === "success"
              ? "text-sm text-green-700"
              : "text-sm text-neutral-600"
        }
      >
        {message}
      </p>

      {status === "error" && (
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-md border border-neutral-300 px-4 py-2 text-sm"
        >
          Reintentar
        </button>
      )}
    </div>
  );
}
