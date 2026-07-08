import { NewEmployeeForm } from "./new-employee-form";

export default function NewEmployeePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="font-serif text-[19px] font-semibold text-olive">Nuevo empleado</h1>
      <NewEmployeeForm />
    </div>
  );
}
