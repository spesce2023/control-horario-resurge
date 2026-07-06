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
| RF-03 | Marcado de entrada/salida (QR) | ⏳ | Falta probar el escaneo con cámara real (necesita un teléfono; no se puede simular desde acá). Se probó el circuito de marcas vía alta manual (RF-12), que comparte la misma lógica de cálculo. |
| RF-04 | Detección automática entrada/salida | ✅ | 👤 Marca manual creada (entrada/salida) se reflejó correctamente |
| RF-05 | Vista de marcas diarias (empleado) | ✅ | 👤 El empleado de prueba vio sus marcas del día correctamente |
| RF-06 | Vista de saldo semanal (empleado) | ✅ | 👤 Saldo semanal (pactadas/trabajadas/ajuste) correcto para el empleado de prueba |
| RF-07 | Vista de horario acordado (empleado) | ⏳ | Falta confirmar explícitamente la vista, aunque el horario por defecto ya se cargó al crear los empleados de prueba |
| RF-08 | Alta y edición de empleados | ✅ | 👤 Alta real de empleado con invitación por correo |
| RF-09 | Configuración de horario semanal | ⏳ | Falta probar el editor de horario semanal en vivo |
| RF-10 | Panel de marcas por empleado (dueño) | ✅ | 👤 Marcas visibles en /admin/marcas |
| RF-11 | Alerta de marca pendiente de revisión | ⏳ | Falta un caso con una entrada sin salida de un día pasado para ver la alerta |
| RF-12 | Corrección y registro manual de marcas | ✅ | 👤 Alta manual de entrada/salida confirmada |
| RF-13 | Cálculo de horas trabajadas por día | ✅ | 👤 Total del día correcto con datos reales (además de los 30 tests unitarios) |
| RF-14 | Cálculo de saldo semanal | ✅ | 👤 Saldo semanal correcto con datos reales (pactadas, trabajadas, ajuste) |
| RF-15 | Ajuste manual de horas | ✅ | 👤 Ajuste de -2h creado y reflejado en el saldo del empleado |
| RF-16 | Generación de reporte mensual | ✅ | 👤 Se descargó el reporte, se encontró y corrigió un bug (ver abajo), y se confirmó que ahora muestra correctamente las horas trabajadas y el ajuste de Ana. |
| RF-17 | Historial de marcas y ajustes | ⏳ | — |
| RF-18 | QR maestro: generar/descargar/regenerar | ✅ | 👤 QR visible y descarga confirmada. Falta probar el botón de regenerar. |
| RF-19 | Registro de auditoría de correcciones | ⏳ | No se revisó audit_log directamente, pero las acciones que lo escriben (alta de empleado, marca manual, ajuste) sí se ejecutaron |
| RF-21 | Generación automática de usuario | ✅ | 👤 Confirmado al dar de alta un empleado real |
| RF-22 | Envío de correo de bienvenida | ✅ | 👤 Correo real recibido en la casilla del empleado |
| RF-23 | Configuración de contraseña por el empleado | ✅ | 👤 Reseteo de contraseña real completado |
| RF-24 | Reenvío de correo de bienvenida | ⏳ | (usa el mismo mecanismo que RF-22, ya validado, pero no se probó el botón específico) |

## Bug encontrado durante las pruebas: RF-16 no mostraba horas trabajadas

Al descargar el reporte de julio 2026, "Trabajadas" y "Ajustes" aparecían en 0 para todas las semanas, aunque el empleado de prueba tenía una marca y un ajuste cargados ese mismo día. Causa: la marca cayó en la semana que empieza el lunes 29 de junio, y la regla original ("cada semana se asigna al mes de su lunes") excluía esa semana del reporte de julio por completo — quedaba "huérfana", ni en junio (nadie pidió ese reporte) ni visible en julio.

Corregido en [`lib/reports/monthly-math.ts`](./lib/reports/monthly-math.ts): ahora el reporte de un mes incluye **todas las semanas que se superponen** con ese mes, no solo las que empiezan en él. La semana límite puede aparecer en los reportes de dos meses consecutivos (con sus fechas exactas en la etiqueta, sin ambigüedad), pero nunca desaparece.

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
