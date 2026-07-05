import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EditEmployeeForm } from "./edit-employee-form";
import { EmployeeActions } from "./employee-actions";

export default async function EditEmployeePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const { data: employee } = await supabase
    .from("employees")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!employee) notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, full_name, email")
    .eq("id", params.id)
    .single();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold">{profile?.full_name}</h1>
        <p className="text-sm text-neutral-500">
          @{profile?.username} · {profile?.email}
        </p>
      </div>

      <EditEmployeeForm
        employeeId={employee.id}
        defaultValues={{
          fullName: profile?.full_name ?? "",
          cedula: employee.cedula,
          phone: employee.phone,
          mutualista: employee.mutualista,
          emergencyContact: employee.emergency_contact,
          weeklyHoursTarget: employee.weekly_hours_target,
        }}
      />

      <EmployeeActions employeeId={employee.id} active={employee.active} />
    </div>
  );
}
