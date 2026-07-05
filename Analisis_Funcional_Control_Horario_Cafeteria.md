# Documento de Análisis Funcional
## Sistema de Control Horario para Cafetería (hasta 10 empleados)

**Preparado para:** Equipo de implementación (Cowork y Code)  
**Alcance:** registro de entrada/salida, cálculo de horas y saldo semanal, y reporte mensual para liquidación de haberes.  
**Plazo estimado de implementación:** 2 semanas.

---

## 1. Descripción de la solución (experiencia de uso)

La solución es una web responsiva accesible desde el celular de cada empleado, con dos perfiles de acceso: Empleado y Dueño. No se requiere infraestructura costosa ni licencias pagas.

### Experiencia del empleado
- Inicia sesión con usuario (generado automáticamente al alta) y contraseña personal definida por él mismo.
- En la pantalla principal ve un botón único de "Marcar entrada" o "Marcar salida" (el sistema decide cuál corresponde según su última marca).
- Confirma la marca escaneando el QR maestro fijo, impreso y pegado en el local.
- Puede ver sus marcas del día (incluyendo más de un tramo, ej. mañana y tarde), el horario acordado para la semana en curso, y su saldo de horas semanales (horas pactadas vs. trabajadas).

### Experiencia del dueño
- Accede a un panel administrativo donde gestiona empleados, horarios semanales y ajustes manuales de horas.
- Visualiza las marcas de todos los empleados, con alertas de jornadas "pendientes de revisión" (falta marca de salida).
- Corrige manualmente marcas erróneas u olvidadas, o crea una marca nueva si es necesario (ej. falla técnica del empleado).
- Descarga y, si lo necesita, regenera el QR maestro del local.
- A principio de mes, genera y descarga un reporte (Excel/PDF) con horas trabajadas, saldos semanales y ajustes aplicados, listo para liquidación de haberes.

> **Nota sobre la mecánica de marcado:** se utiliza un QR maestro fijo (regenerable a demanda) como validación de que la marca se realiza en el local. Se deja documentada como mejora futura (RF-20, prioridad Baja) la posibilidad de un QR dinámico que rote periódicamente. No forma parte del alcance inicial.

---

## 2. Reglas de negocio

| Regla | Definición |
|---|---|
| 1. Marca de salida olvidada | La jornada queda abierta indefinidamente con flag "pendiente de revisión" hasta corrección manual del dueño. No hay cierre automático. Mientras esté pendiente, esas horas no se contabilizan en el saldo semanal. |
| 2. Roles del sistema | Únicamente "Empleado" y "Dueño". No se contempla rol de encargado en esta versión. |
| 3. Horario esperado | Se define por semana (lunes a domingo), acordado al inicio de cada semana. El dueño puede modificarlo en cualquier momento, incluso el mismo día. El empleado puede consultar el horario acordado vigente, pero el sistema no valida ni alerta desvíos: es solo informativo. |
| 4. Cálculo de saldo | Se calcula contra horas semanales pactadas por empleado (no contra un horario diario estricto). Saldo semanal = horas pactadas − horas trabajadas efectivas (+ ajustes manuales). |
| 5. Roles adicionales | No aplica en esta versión (ver regla 2). |
| 6. Tolerancia de atraso | No se penaliza ni restringe. Puede mostrarse a modo informativo (ej. "llegó X min después del horario acordado"), sin impacto en el cálculo de horas. |
| 7. Múltiples marcas por día | Permitido. El sistema soporta más de un par entrada/salida por día (ej. mañana y tarde) y suma todos los tramos para el total diario. |
| 8. Feriados / ausencias | No se gestionan en esta versión. Se cubren parcialmente mediante el "ajuste manual de horas", que permite al dueño sumar o restar horas con un concepto libre. |
| 9. Redondeo | No aplica. Cálculo de horas al minuto exacto. |
| 10. Mecánica de marcado | QR maestro fijo, descargable por el dueño, sin expiración salvo regeneración manual. El sistema valida que el escaneo corresponda al QR vigente del local (sin validación temporal ni geográfica en esta fase). |
| 11. Regeneración del QR maestro | El dueño puede regenerar el QR maestro cuando lo desee (ej. mensualmente, por seguridad). Al regenerarse, el QR anterior queda invalidado de inmediato; las marcas ya registradas con el QR anterior no se ven afectadas retroactivamente. |
| 12. Datos obligatorios del empleado | Al dar de alta un empleado, son obligatorios: nombre completo, cédula, teléfono de contacto, mutualista, contacto de emergencia y correo electrónico. El correo es indispensable, ya que se utiliza para generar el acceso y enviar comunicaciones del sistema. |
| 13. Generación de nombre de usuario | Se genera automáticamente combinando la primera letra del nombre y el apellido completo, en minúsculas y sin acentos ni espacios. Ante una coincidencia con un usuario existente, el sistema agrega un carácter adicional para diferenciarlo (no se solicita intervención del dueño para resolver el conflicto). |
| 14. Responsabilidad sobre la contraseña | La contraseña de acceso es definida exclusivamente por el propio empleado, a través del enlace enviado por correo al momento del alta. El dueño puede reenviar ese enlace, pero no puede ver ni definir la contraseña de un empleado. |

---

## 3. Requerimientos funcionales

Listado detallado para el equipo de desarrollo. Prioridad: **Alta** = imprescindible para el lanzamiento inicial; **Media** = deseable en la primera versión; **Baja** = mejora futura, fuera del alcance inicial.

| ID | Requerimiento | Descripción | Prioridad | Actor |
|---|---|---|---|---|
| RF-01 | Login de empleado | El empleado accede a la web responsiva con usuario y PIN/contraseña simple asignado por el dueño. | Alta | Empleado |
| RF-02 | Login de dueño | El dueño accede a un panel administrativo con credenciales propias y permisos de gestión total. | Alta | Dueño |
| RF-03 | Marcado de entrada/salida | El empleado presiona "Marcar entrada/salida" (determinado automáticamente por el sistema) y confirma escaneando el QR maestro fijo del local. Se permite más de un ciclo entrada/salida por día. | Alta | Empleado |
| RF-04 | Detección automática de tipo de marca | El sistema determina si la próxima marca corresponde a "entrada" o "salida" según el historial del empleado en el día. | Media | Sistema |
| RF-05 | Vista de marcas diarias (empleado) | El empleado visualiza todas sus marcas del día (pudiendo ser más de un tramo) y el total de horas del día. | Alta | Empleado |
| RF-06 | Vista de saldo semanal (empleado) | El empleado visualiza horas trabajadas en la semana en curso (lunes a domingo) y el saldo respecto a sus horas semanales pactadas. | Alta | Empleado |
| RF-07 | Vista de horario acordado de la semana (empleado) | El empleado visualiza el horario acordado para la semana en curso, definido por el dueño. Es solo informativo, sin validación de cumplimiento. | Alta | Empleado |
| RF-08 | Alta y edición de empleados | El dueño puede crear, editar y desactivar empleados. Al crear un empleado, debe ingresar: nombre completo, cédula, teléfono de contacto, mutualista, contacto de emergencia y correo electrónico (obligatorio, utilizado para el acceso y las comunicaciones del sistema), además de su cantidad de horas semanales pactadas y un horario por defecto (días/horas), que se usará como base al configurar la semana en curso. | Alta | Dueño |
| RF-09 | Configuración de horario semanal por empleado | El dueño puede definir/editar el horario acordado (días/horas) para cada empleado, por semana (lunes a domingo), incluso el mismo día si es necesario. Al definir o modificar el horario, el sistema calcula y muestra automáticamente el total de horas semanales resultante, a modo de sugerencia/verificación para el dueño (no reemplaza la carga manual de horas pactadas si el dueño decide un valor distinto). | Alta | Dueño |
| RF-10 | Panel de marcas por empleado | El dueño visualiza el listado de marcas de todos los empleados, filtrable por empleado, día y semana. | Alta | Dueño |
| RF-11 | Alerta de marca pendiente de revisión | El sistema marca visualmente los registros donde falta una marca de salida (jornada abierta), sin cerrarla automáticamente. | Alta | Sistema |
| RF-12 | Corrección y registro manual de marcas | El dueño puede editar, completar o eliminar una marca (entrada/salida) errónea u olvidada, y también crear manualmente una nueva marca de entrada o salida para un empleado (por ejemplo, ante inconvenientes técnicos como que el empleado se quede sin batería en el celular). Al resolver una marca "pendiente de revisión", esta pasa a estado "resuelta" y se incluye en el cálculo de horas. Toda marca creada o corregida manualmente queda identificada como tal en el historial. | Alta | Dueño |
| RF-13 | Cálculo de horas trabajadas por día | El sistema suma automáticamente todos los tramos (entrada/salida) de un mismo día para obtener el total diario, al minuto exacto. | Alta | Sistema |
| RF-14 | Cálculo de saldo semanal | El sistema calcula, por empleado, la diferencia entre horas semanales pactadas y horas efectivamente trabajadas (marcas resueltas + ajustes manuales), actualizado en tiempo real. | Alta | Sistema |
| RF-15 | Ajuste manual de horas | El dueño puede agregar o restar horas al saldo de un empleado en un período dado, indicando un concepto libre (texto) que describa el motivo. | Alta | Dueño |
| RF-16 | Generación de reporte mensual | El sistema genera un reporte descargable (Excel/PDF) por empleado y consolidado, con horas trabajadas, saldos semanales, ajustes manuales aplicados y totales del mes, listo para liquidación de haberes. | Alta | Dueño |
| RF-17 | Historial de marcas y ajustes | El dueño puede consultar el historial completo de marcas y ajustes manuales de un empleado en cualquier rango de fechas pasado. | Media | Dueño |
| RF-18 | Generación, descarga y regeneración de QR maestro | El sistema genera un QR fijo (uno para todo el local) que el dueño puede descargar e imprimir. El QR permanece válido hasta que el dueño decida regenerarlo a demanda desde su panel (por ejemplo, mensualmente, por motivos de seguridad); al regenerarse, el QR anterior deja de ser válido y debe reemplazarse el impreso en el local. | Alta | Dueño / Sistema |
| RF-19 | Registro de auditoría de correcciones | El sistema guarda un log de correcciones manuales y ajustes de horas (quién, cuándo, valor anterior/nuevo, concepto). | Media | Sistema |
| RF-20 | QR dinámico diario/rotativo (mejora futura) | Fuera del alcance inicial. El sistema podrá generar un QR que cambie periódicamente como validación adicional de presencia física. | Baja | Sistema |
| RF-21 | Generación automática de nombre de usuario | Al dar de alta un empleado, el sistema genera automáticamente su nombre de usuario combinando la primera letra del nombre y el apellido completo (en minúsculas, sin espacios ni acentos; ej. "Maria Gomez" → "mgomez"). Si el nombre de usuario generado ya existe, el sistema agrega automáticamente un carácter adicional para diferenciarlo. | Alta | Sistema |
| RF-22 | Envío de correo de bienvenida | Al confirmarse el alta de un empleado, el sistema envía automáticamente un correo a la casilla registrada, incluyendo la URL de acceso a la aplicación, el nombre de usuario generado y un enlace para que el empleado configure su contraseña personal. | Alta | Sistema |
| RF-23 | Configuración de contraseña por el empleado | A través del enlace recibido por correo, el empleado accede a una pantalla donde define su contraseña personal de acceso. El dueño no tiene visibilidad de esta contraseña en ningún momento. | Alta | Empleado |
| RF-24 | Reenvío de correo de bienvenida | El dueño puede solicitar el reenvío del correo de bienvenida (con el enlace de configuración de contraseña) para un empleado que no lo haya recibido o no haya completado el proceso. | Media | Dueño |

---

## 4. Requisitos no funcionales

| Requisito | Descripción |
|---|---|
| Accesibilidad móvil | Web responsiva, utilizable desde navegadores móviles estándar (Chrome/Safari, Android e iOS), sin instalación de app nativa. |
| Tiempo de respuesta | Confirmación de marcado (entrada/salida) en menos de 2 segundos bajo condiciones normales de red. |
| Disponibilidad | Disponible 24/7 dado el bajo costo de hosting actual, con tolerancia a caídas breves sin pérdida de datos. |
| Bajo costo de infraestructura | Priorizar hosting/base de datos de bajo costo o gratuitos, sin licencias por usuario. |
| Resguardo de datos | Backup periódico (diario o semanal) de marcas y ajustes, dado su uso para liquidación de haberes. |
| Simplicidad de uso | Interfaz utilizable sin capacitación formal, tanto para empleados como para el dueño. |
| Seguridad básica | Credenciales protegidas (sin texto plano), cierre de sesión automático por inactividad. |
| Escalabilidad limitada | Soportar cómodamente hasta 15-20 empleados sin necesidad de rediseño. |
| Trazabilidad | Toda corrección manual o ajuste de horas queda registrado (quién, cuándo, valor anterior/nuevo, motivo). |

---

## 5. Stack tecnológico sugerido

Se define explícitamente la tecnología a utilizar para evitar que el equipo de implementación elija otras herramientas por defecto. Criterio de selección: costo (planes gratuitos suficientes para este volumen), simplicidad de despliegue, y reutilización para futuros proyectos pequeños del dueño.

| Capa | Tecnología | Motivo / función |
|---|---|---|
| Base de datos | Supabase | Base de datos (Postgres) con plan gratuito suficiente para este volumen. Incluye sistema de autenticación de usuarios ya integrado (login de empleado/dueño) y un panel visual para consultar/editar datos sin saber programar. |
| Framework de aplicación | Next.js | Tecnología con la que se construye la web (vistas de empleado y de dueño). Gratuita, estándar de la industria, y reutilizable como base para futuros proyectos pequeños del dueño. |
| Hosting / publicación | Vercel | Plataforma donde queda publicada la web, con plan gratuito acorde a este volumen. Se integra directamente con GitHub: cada actualización del código se publica automáticamente, sin intervención manual. |
| Control de versiones / repositorio | GitHub | Repositorio donde queda alojado el código del proyecto, en la nube. Ya vinculado a la cuenta del dueño y a Claude Code. |
| Envío de correos transaccionales | Supabase Auth (incluido) | El propio sistema de autenticación de Supabase permite enviar automáticamente el correo de bienvenida con el enlace para que el empleado configure su contraseña, sin necesidad de contratar un servicio de correo por separado. |

### Flujo de despliegue
Code desarrolla y guarda el código en el repositorio de GitHub del dueño → Vercel detecta el cambio y publica automáticamente la web actualizada → Supabase almacena y gestiona los datos (empleados, marcas, horarios, ajustes). El dueño no interviene manualmente en ningún paso de este flujo una vez configurado.

### Checklist de cuentas y accesos
> Las cuentas de Vercel y Supabase ya fueron creadas por el dueño y vinculadas a su cuenta de GitHub. **No se comparten usuarios ni contraseñas** con el equipo de desarrollo.

1. **GitHub:** repositorio del proyecto bajo la cuenta del dueño. Code opera directamente con esa conexión ya vinculada.
2. **Vercel:** proyecto importado desde el repositorio de GitHub (vinculación ya realizada por el dueño). El despliegue es automático ante cada cambio en el repositorio.
3. **Supabase:** proyecto ya creado por el dueño. El equipo de desarrollo debe solicitar al dueño las claves de conexión (Project URL, `anon key` y `service role key`, disponibles en Settings → API) para integrarlas como variables de entorno de la aplicación.
