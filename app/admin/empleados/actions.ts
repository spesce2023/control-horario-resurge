"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { baseUsername, insertWithUniqueUsername } from "@/lib/username";
import { getCurrentUserId } from "@/lib/auth/current-user";
import { logAudit } from "@/lib/audit";
import { scheduleMatchesTarget } from "@/lib/schedule";

const scheduleDaySchema = z.object({
  weekday: z.number().int().min(1).max(7),
  start: z.string().min(1),
  end: z.string().min(1),
});

const defaultScheduleField = z.string().transform((value, ctx) => {
  try {
    return z.array(scheduleDaySchema).parse(JSON.parse(value));
  } catch {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Horario por defecto inválido." });
    return z.NEVER;
  }
});

const employeeSchema = z.object({
  fullName: z.string().trim().min(1, "Ingresá el nombre completo."),
  email: z.string().trim().email("Correo inválido."),
  cedula: z.string().trim().min(1, "Ingresá la cédula."),
  phone: z.string().trim().min(1, "Ingresá el teléfono de contacto."),
  mutualista: z.string().trim().min(1, "Ingresá la mutualista."),
  emergencyContact: z.string().trim().min(1, "Ingresá el contacto de emergencia."),
  weeklyHoursTarget: z.coerce.number().min(0, "Debe ser un número positivo."),
  hourlyRate: z.coerce.number().positive("Ingresá el valor hora nominal."),
  defaultSchedule: defaultScheduleField,
});

function inviteRedirectUrl() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;
  return `${siteUrl}/auth/callback?next=/set-password`;
}

export async function createEmployee(
  formData: FormData
): Promise<{ error: string } | void> {
  const parsed = employeeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const data = parsed.data;

  if (!scheduleMatchesTarget(data.defaultSchedule, data.weeklyHoursTarget)) {
    return {
      error:
        "La suma de horas del horario por defecto no coincide con las horas semanales pactadas.",
    };
  }

  const admin = createAdminClient();

  const { data: invited, error: inviteError } =
    await admin.auth.admin.inviteUserByEmail(data.email, {
      redirectTo: inviteRedirectUrl(),
      data: { username: baseUsername(data.fullName), full_name: data.fullName },
    });

  if (inviteError || !invited?.user) {
    return {
      error: `No se pudo invitar al empleado: ${inviteError?.message ?? "error desconocido"}`,
    };
  }

  const userId = invited.user.id;

  const { username, error: profileError } = await insertWithUniqueUsername(
    data.fullName,
    async (candidate) =>
      await admin.from("profiles").insert({
        id: userId,
        username: candidate,
        email: data.email,
        full_name: data.fullName,
        role: "employee",
      })
  );

  if (profileError) {
    return { error: `Error al crear el perfil: ${profileError}` };
  }

  const { error: employeeError } = await admin.from("employees").insert({
    id: userId,
    cedula: data.cedula,
    phone: data.phone,
    mutualista: data.mutualista,
    emergency_contact: data.emergencyContact,
    weekly_hours_target: data.weeklyHoursTarget,
    hourly_rate: data.hourlyRate,
    default_schedule: data.defaultSchedule,
  });

  if (employeeError) {
    return { error: `Error al crear el empleado: ${employeeError.message}` };
  }

  const actorId = await getCurrentUserId();
  await logAudit({
    actorId,
    action: "create",
    entity: "employee",
    entityId: userId,
    newValue: { username, full_name: data.fullName, email: data.email },
  });

  revalidatePath("/admin/empleados");
  redirect("/admin/empleados");
}

const updateSchema = z.object({
  id: z.string().uuid(),
  fullName: z.string().trim().min(1, "Ingresá el nombre completo."),
  cedula: z.string().trim().min(1),
  phone: z.string().trim().min(1),
  mutualista: z.string().trim().min(1),
  emergencyContact: z.string().trim().min(1),
  weeklyHoursTarget: z.coerce.number().min(0),
  hourlyRate: z.coerce.number().positive("Ingresá el valor hora nominal."),
});

export async function updateEmployee(
  formData: FormData
): Promise<{ error: string } | void> {
  const parsed = updateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const data = parsed.data;
  const admin = createAdminClient();

  const [{ data: before }] = await Promise.all([
    admin.from("employees").select("*").eq("id", data.id).single(),
  ]);

  const { error: employeeError } = await admin
    .from("employees")
    .update({
      cedula: data.cedula,
      phone: data.phone,
      mutualista: data.mutualista,
      emergency_contact: data.emergencyContact,
      weekly_hours_target: data.weeklyHoursTarget,
      hourly_rate: data.hourlyRate,
      updated_at: new Date().toISOString(),
    })
    .eq("id", data.id);

  if (employeeError) {
    return { error: `Error al actualizar: ${employeeError.message}` };
  }

  const { error: profileError } = await admin
    .from("profiles")
    .update({ full_name: data.fullName })
    .eq("id", data.id);

  if (profileError) {
    return { error: `Error al actualizar el perfil: ${profileError.message}` };
  }

  const actorId = await getCurrentUserId();
  await logAudit({
    actorId,
    action: "update",
    entity: "employee",
    entityId: data.id,
    oldValue: before,
    newValue: data,
  });

  revalidatePath("/admin/empleados");
  revalidatePath(`/admin/empleados/${data.id}`);
  return undefined;
}

export async function setEmployeeActive(employeeId: string, active: boolean) {
  const admin = createAdminClient();
  const { error } = await admin
    .from("employees")
    .update({ active, updated_at: new Date().toISOString() })
    .eq("id", employeeId);

  if (error) {
    return { error: error.message };
  }

  const actorId = await getCurrentUserId();
  await logAudit({
    actorId,
    action: active ? "activate" : "deactivate",
    entity: "employee",
    entityId: employeeId,
    newValue: { active },
  });

  revalidatePath("/admin/empleados");
  revalidatePath(`/admin/empleados/${employeeId}`);
  return undefined;
}

export async function resendInvite(employeeId: string) {
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("email, username, full_name")
    .eq("id", employeeId)
    .single();

  if (!profile) {
    return { error: "Empleado no encontrado." };
  }

  const { error } = await admin.auth.admin.inviteUserByEmail(profile.email, {
    redirectTo: inviteRedirectUrl(),
    data: { username: profile.username, full_name: profile.full_name },
  });

  if (error) {
    return {
      error: `No se pudo reenviar la invitación: ${error.message}`,
    };
  }

  const actorId = await getCurrentUserId();
  await logAudit({
    actorId,
    action: "resend_invite",
    entity: "employee",
    entityId: employeeId,
  });

  return undefined;
}
