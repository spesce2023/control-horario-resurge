export function EmployeeFormFields({
  defaultValues,
}: {
  defaultValues?: {
    fullName?: string;
    email?: string;
    cedula?: string;
    phone?: string;
    mutualista?: string;
    emergencyContact?: string;
    weeklyHoursTarget?: number;
  };
}) {
  return (
    <>
      <Field
        label="Nombre completo"
        name="fullName"
        defaultValue={defaultValues?.fullName}
        required
      />
      {defaultValues === undefined && (
        <Field
          label="Correo electrónico"
          name="email"
          type="email"
          required
        />
      )}
      <Field label="Cédula" name="cedula" defaultValue={defaultValues?.cedula} required />
      <Field
        label="Teléfono de contacto"
        name="phone"
        defaultValue={defaultValues?.phone}
        required
      />
      <Field
        label="Mutualista"
        name="mutualista"
        defaultValue={defaultValues?.mutualista}
        required
      />
      <Field
        label="Contacto de emergencia"
        name="emergencyContact"
        defaultValue={defaultValues?.emergencyContact}
        required
      />
      <Field
        label="Horas semanales pactadas"
        name="weeklyHoursTarget"
        type="number"
        step="0.5"
        min="0"
        defaultValue={defaultValues?.weeklyHoursTarget}
        required
      />
    </>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  required,
  step,
  min,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | number;
  required?: boolean;
  step?: string;
  min?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        step={step}
        min={min}
        defaultValue={defaultValue}
        required={required}
        className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-base"
      />
    </div>
  );
}
