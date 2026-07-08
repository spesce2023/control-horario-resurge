import { ensureQrToken, qrImageDataUrl } from "@/lib/qr";
import { formatDateDisplay } from "@/lib/week";
import { RegenerateQrButton } from "./regenerate-qr-button";

export default async function QrPage() {
  const token = await ensureQrToken();
  const imageDataUrl = await qrImageDataUrl(token.token);
  const generatedDate = formatDateDisplay(token.created_at.slice(0, 10));

  return (
    <div className="mx-auto flex max-w-md flex-col items-center text-center">
      <h1 className="font-serif text-[20px] font-semibold text-olive">QR maestro del local</h1>
      <p className="mb-5 mt-1.5 max-w-sm text-[12.5px] leading-relaxed text-secondary">
        Imprimí este QR y pegalo en el local. Los empleados lo escanean desde la app para
        confirmar cada marca de entrada/salida.
      </p>

      <div className="flex w-[200px] items-center justify-center rounded-2xl border border-border bg-white p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageDataUrl}
          alt="QR maestro del local"
          width={320}
          height={320}
          className="h-full w-full"
        />
      </div>

      <p className="mb-4 mt-3 text-[11px] text-secondary">Generado el {generatedDate}</p>

      <div className="flex w-full flex-col items-center gap-2.5">
        <a
          href={imageDataUrl}
          download="qr-maestro-cafeteria.png"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-sage px-4 py-2.5 text-[13px] font-bold text-white hover:bg-sage-dark sm:w-[220px]"
        >
          ⬇ Descargar QR
        </a>

        <RegenerateQrButton />
      </div>

      <p className="mt-3 max-w-[260px] text-[11px] leading-relaxed text-secondary">
        Al regenerar, el QR anterior queda invalidado de inmediato: hay que reemplazar el impreso
        en el local.
      </p>
    </div>
  );
}
