import { ensureQrToken, qrImageDataUrl } from "@/lib/qr";
import { RegenerateQrButton } from "./regenerate-qr-button";

export default async function QrPage() {
  const token = await ensureQrToken();
  const imageDataUrl = await qrImageDataUrl(token.token);

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">QR maestro del local</h1>
      <p className="max-w-lg text-sm text-neutral-500">
        Imprimí este QR y pegalo en el local. Los empleados lo escanean desde
        la app para confirmar cada marca de entrada/salida.
      </p>

      <div className="max-w-sm space-y-4 rounded-xl border border-neutral-200 bg-white p-6 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageDataUrl}
          alt="QR maestro del local"
          width={320}
          height={320}
          className="mx-auto"
        />

        <a
          href={imageDataUrl}
          download="qr-maestro-cafeteria.png"
          className="block w-full rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
        >
          Descargar QR
        </a>

        <RegenerateQrButton />

        <p className="text-xs text-neutral-400">
          Al regenerar, el QR anterior queda invalidado de inmediato: hay que
          reemplazar el impreso en el local.
        </p>
      </div>
    </div>
  );
}
