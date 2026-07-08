# Estado de pruebas funcionales

Este documento registra, requerimiento por requerimiento, **qué se probó realmente en vivo** contra el proyecto de Supabase (no solo "el código está escrito"). Se actualiza a medida que se prueba cada pantalla. Para el estado de *desarrollo* (implementado / pendiente), ver la columna Estado de [`Backlog_Requerimientos_Control_Horario_Cafeteria.xlsx`](./Backlog_Requerimientos_Control_Horario_Cafeteria.xlsx); este archivo es específicamente sobre *verificación funcional en vivo*.

Leyenda:
- ✅ Verificado en vivo (funciona)
- 🔧 Verificado en vivo, se encontró y corrigió un bug
- ⏳ Pendiente de probar
- 👤 Probado por el usuario en su propio navegador
- 🤖 Probado por Claude (script directo o navegador)

| RF | Requerimiento | Estado | Cómo se verificó |
|---|---|---|---|
| RF-01 | Login de empleado | ✅ | 👤 Login real con usuario/contraseña |
| RF-02 | Login de dueño | ✅ | 👤 Login real, redirección a /admin por rol |
| RF-03 | Marcado de entrada/salida (QR) | ⏳ | Se intentó probar desde el celular por la red local, pero los navegadores exigen HTTPS para dar acceso a la cámara (solo `localhost` está exceptuado) — no es un bug de la app, en Vercel (HTTPS de fábrica) no pasa. Se decidió dejar esta prueba para cuando esté desplegado. Mientras tanto, se probó el circuito de marcas vía alta manual (RF-12), que comparte la misma lógica de cálculo. |
| RF-04 | Detección automática entrada/salida | ✅ | 👤 Marca manual creada (entrada/salida) se reflejó correctamente |
| RF-05 | Vista de marcas diarias (empleado) | ✅ | 👤 El empleado de prueba vio sus marcas del día correctamente |
| RF-06 | Vista de saldo semanal (empleado) | ✅ | 👤 Saldo semanal (pactadas/trabajadas/ajuste) correcto para el empleado de prueba |
| RF-07 | Vista de horario acordado (empleado) | ✅ | 👤 El empleado ve el horario actualizado en su home |
| RF-08 | Alta y edición de empleados | ✅ | 👤 Alta/edición ya validada en vivo antes; se confirmó que el campo obligatorio "Valor hora nominal" aparece correctamente en el alta de empleado (migración `0003_employee_hourly_rate.sql` aplicada a la base real) |
| RF-09 | Configuración de horario semanal | 🔧 | 👤 Se detectó y corrigió un bug real (ver abajo): al navegar entre semanas o empleados, el editor conservaba datos de la semana/empleado anterior. |
| RF-10 | Panel de marcas por empleado (dueño) | ✅ | 👤 Marcas visibles en /admin/marcas |
| RF-11 | Alerta de marca pendiente de revisión | ✅ | 👤 Se creó una entrada sin salida de un día pasado y el cartel "Pendiente de revisión" apareció correctamente |
| RF-12 | Corrección y registro manual de marcas | ✅ | 👤 Alta manual de entrada/salida confirmada |
| RF-13 | Cálculo de horas trabajadas por día | ✅ | 👤 Total del día correcto con datos reales (además de los 30 tests unitarios) |
| RF-14 | Cálculo de saldo semanal | ✅ | 👤 Saldo semanal correcto con datos reales (pactadas, trabajadas, ajuste) |
| RF-15 | Ajuste manual de horas | ✅ | 👤 Ajuste de -2h creado y reflejado en el saldo del empleado |
| RF-16 | Generación de reporte mensual | ✅ | 👤 El reporte semanal/consolidado ya fue validado en vivo antes. Se agregó la liquidación mensual (horas normales a valor simple + excedente al doble, con "horas extra pagadas" explícitas) y un detalle diario (entrada/salida/horas) en la hoja de cada empleado — cubierto por 8 tests unitarios nuevos en [`monthly-math.test.ts`](./lib/reports/__tests__/monthly-math.test.ts). Usuario confirmó en vivo que el reporte descargado muestra correctamente la liquidación calculada con el valor hora nominal. |
| RF-17 | Historial de marcas y ajustes | ✅ | 👤 Filtro de fecha ("Desde" 01-07-2026) mostró correctamente una marca fuera de la semana en curso |
| RF-18 | QR maestro: generar/descargar/regenerar | ✅ | 👤 Se encontró y corrigió de raíz una condición de carrera real (ver abajo). Confirmado en vivo: la página carga y el botón "Regenerar QR" funciona correctamente. |
| RF-19 | Registro de auditoría de correcciones | ✅ | 🤖 Verificado por script directo: audit_log registra correctamente alta de empleado, marcas manuales y ajustes, con actor y valores anterior/nuevo |
| RF-21 | Generación automática de usuario | ✅ | 👤 Confirmado al dar de alta un empleado real |
| RF-22 | Envío de correo de bienvenida | ✅ | 👤 Correo real recibido en la casilla del empleado |
| RF-23 | Configuración de contraseña por el empleado | ✅ | 👤 Reseteo de contraseña real completado |
| RF-24 | Reenvío de correo de bienvenida | ⏳ | (usa el mismo mecanismo que RF-22, ya validado, pero no se probó el botón específico) |

## Bug encontrado durante las pruebas: RF-16 no mostraba horas trabajadas

Al descargar el reporte de julio 2026, "Trabajadas" y "Ajustes" aparecían en 0 para todas las semanas, aunque el empleado de prueba tenía una marca y un ajuste cargados ese mismo día. Causa: la marca cayó en la semana que empieza el lunes 29 de junio, y la regla original ("cada semana se asigna al mes de su lunes") excluía esa semana del reporte de julio por completo — quedaba "huérfana", ni en junio (nadie pidió ese reporte) ni visible en julio.

Corregido en [`lib/reports/monthly-math.ts`](./lib/reports/monthly-math.ts): ahora el reporte de un mes incluye **todas las semanas que se superponen** con ese mes, no solo las que empiezan en él. La semana límite puede aparecer en los reportes de dos meses consecutivos (con sus fechas exactas en la etiqueta, sin ambigüedad), pero nunca desaparece.

## Bug encontrado durante las pruebas: RF-09 no reiniciaba el editor al cambiar de semana/empleado

El usuario detectó que, al editar el horario de una semana y navegar a otra semana (o a otro empleado), el editor seguía mostrando — y guardando — los datos de la semana/empleado anterior. Causa: el componente que edita los días (`ScheduleDaysEditor`) guarda su estado con `useState` a partir de los datos iniciales, pero React solo toma ese valor la primera vez que el componente se monta; al navegar del lado del cliente entre semanas o empleados, React reutiliza la misma instancia en vez de recrearla, dejando el estado desactualizado. El mismo patrón afectaba al formulario de edición de datos del empleado (inputs no controlados).

## Bug encontrado durante las pruebas: RF-18 rompía la página con una condición de carrera

Al abrir `/admin/qr`, la página tiraba `Error: duplicate key value violates unique constraint "qr_tokens_one_active"`. Causa real (llevó tres intentos de arreglo dar con ella): `regenerateQrToken` desactivaba el token vigente e insertaba el nuevo en **dos llamadas separadas** a Supabase, dejando un instante real con cero tokens activos en la base. Cualquier otra visita a la página que cayera justo en ese instante (por ejemplo, la precarga en segundo plano que Next.js hace del link "QR" del menú, sumada a la visita real) no encontraba ningún token para usar y rompía.

Corregido moviendo la desactivación + inserción a una única función de Postgres ([`supabase/migrations/0002_qr_regenerate_function.sql`](./supabase/migrations/0002_qr_regenerate_function.sql)) que corre en una sola transacción — ninguna consulta externa puede ya observar ese estado intermedio. También se agregó `prefetch={false}` en los links del menú del panel para reducir ejecuciones innecesarias en segundo plano.

Corregido agregando un `key` (semana + empleado, o empleado según el caso) en los tres puntos donde se renderizan estos formularios, forzando a React a reiniciarlos correctamente. Quedan en la base dos filas de `weekly_schedules` de Ana Rodriguez (semanas 2026-06-29 y 2026-06-08) con datos incorrectos producto de este bug — no se borraron sin autorización explícita del usuario.

## Cuentas de prueba activas

Creadas directamente (sin invitación por correo, para no gastar el límite de envíos) para probar el resto del flujo:

| Usuario | Contraseña | Nombre | Horas pactadas | Horario por defecto |
|---|---|---|---|---|
| `arodriguez` | `QaEmpleado2026!` | Ana Rodriguez | 40h | Lun-Mié 9 a 17 |
| `cfernandez` | `QaEmpleado2026!` | Carlos Fernandez | 30h | Lun-Mié 9 a 17 |
| `lmartinez` | `QaEmpleado2026!` | Lucia Martinez | 20h | Lun-Mié 9 a 17 |

Estas cuentas son solo para pruebas; se recomienda borrarlas (o desactivarlas) antes de empezar a usar la app con empleados reales.

## Ajustes de UI encontrados durante las pruebas

- **Formato de fecha**: las fechas se mostraban en formato ISO (`2026-06-29`). Se corrigió a `dd-MM-yyyy` (`29-06-2026`) en todas las pantallas donde se muestran fechas al usuario (home del empleado, horario semanal, ajustes, panel de marcas, reporte mensual). 👤 Confirmado por el usuario.
