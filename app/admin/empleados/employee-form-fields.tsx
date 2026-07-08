export function EmployeeFormFields({
  defaultValues,
  accessExtra,
  scheduleExtra,
}: {
  defaultValues?: {
    fullName?: string;
    email?: string;
    username?: string;
    cedula?: string;
    phone?: string;
    mutualista?: string;
    emergencyContact?: string;
    weeklyHoursTarget?: number;
    hourlyRate?: number;
  };
  /** Nota de bienvenida + botón de reenvío — solo aplica en edición. */
  accessExtra?: React.ReactNode;
  /** Chips de horario por defecto (solo lectura) — solo aplica en edición. */
  scheduleExtra?: React.ReactNode;
}) {
  const isEdit = defaultValues !== undefined;

  return (
    <div className="space-y-5">
      <Section title="Datos personales">
        <FieldRow>
          <Field label="Nombre completo" name="fullName" defaultValue={defaultValues?.fullName} required />
          <Field label="Cédula" name="cedula" defaultValue={defaultValues?.cedula} required />
        </FieldRow>
        <FieldRow>
          <Field label="Teléfono" name="phone" defaultValue={defaultValues?.phone} required />
          <Field label="Mutualista" name="mutualista" defaultValue={defaultValues?.mutualista} required />
        </FieldRow>
        <FieldRow cols={1}>
          <Field
            label="Contacto de emergencia"
            name="emergencyContact"
            defaultValue={defaultValues?.emergencyContact}
            required
          />
        </FieldRow>
      </Section>

      <Section title="Acceso al sistema">
        {!isEdit && (
          <FieldRow cols={1}>
            <Field label="Correo electrónico" name="email" type="email" required />
          </FieldRow>
        )}
        {isEdit && (
          <FieldRow>
            <Field
              label="Correo electrónico"
              name="displayEmail"
              defaultValue={defaultValues?.email}
              disabled
            />
            <Field
              label="Usuario (generado)"
              name="displayUsername"
              defaultValue={defaultValues?.username ? `@${defaultValues.username}` : ""}
              disabled
            />
          </FieldRow>
        )}
        {accessExtra}
      </Section>

      <Section title="Horas y horario">
        <FieldRow>
          <Field
            label="Horas semanales pactadas"
            name="weeklyHoursTarget"
            type="number"
            step="0.5"
            min="0"
            defaultValue={defaultValues?.weeklyHoursTarget}
            required
          />
          <Field
            label="Valor hora nominal ($)"
            name="hourlyRate"
            type="number"
            step="0.01"
            min="0.01"
            defaultValue={defaultValues?.hourlyRate}
            required
          />
        </FieldRow>
        {scheduleExtra}
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-2.5 border-b border-border pb-1.5 text-[11px] font-bold uppercase tracking-wide text-sage-dark">
        {title}
      </h4>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

function FieldRow({ children, cols = 2 }: { children: React.ReactNode; cols?: 1 | 2 }) {
  return (
    <div className={`grid gap-2.5 ${cols === 2 ? "sm:grid-cols-2" : "grid-cols-1"}`}>{children}</div>
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
  disabled,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | number;
  required?: boolean;
  step?: string;
  min?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1 block text-[10.5px] font-semibold uppercase tracking-wide text-secondary"
      >
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
        disabled={disabled}
        className="w-full rounded-lg border border-border bg-white px-3 py-2 text-[12.5px] text-olive outline-none focus:border-sage focus:ring-2 focus:ring-sage-bg disabled:bg-[#F1ECE0] disabled:text-secondary"
      />
    </div>
  );
}
