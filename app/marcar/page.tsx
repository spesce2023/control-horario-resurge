import Link from "next/link";
import { QrScanner } from "./qr-scanner";

export default function MarcarPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 p-6">
      <div>
        <Link href="/" className="text-sm underline">
          &larr; Volver
        </Link>
        <h1 className="mt-1 text-lg font-semibold">Escaneá el QR del local</h1>
      </div>
      <QrScanner />
    </main>
  );
}
