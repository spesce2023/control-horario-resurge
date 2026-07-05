import { NewEmployeeForm } from "./new-employee-form";

export default function NewEmployeePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Nuevo empleado</h1>
      <NewEmployeeForm />
    </div>
  );
}
