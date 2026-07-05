"use server";

import { revalidatePath } from "next/cache";
import { regenerateQrToken } from "@/lib/qr";
import { getCurrentUserId } from "@/lib/auth/current-user";

export async function regenerateQr(): Promise<{ error?: string }> {
  try {
    const actorId = await getCurrentUserId();
    await regenerateQrToken(actorId);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "No se pudo regenerar el QR." };
  }

  revalidatePath("/admin/qr");
  return {};
}
