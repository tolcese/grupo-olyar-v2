# Grupo Olyar v2 — Sistema de Gestión de Créditos Automotrices

Sistema interno de gestión de créditos prendarios para el equipo de Grupo Olyar. Migrado desde Google Sheets + Apps Script a una arquitectura moderna con Supabase y GitHub Pages.

---

## Stack tecnológico

| Componente | Tecnología |
|---|---|
| Frontend | Vanilla JS — monolito `index.html` |
| Base de datos | Supabase (PostgreSQL) — región São Paulo |
| Hosting | GitHub Pages |
| Repositorio | GitHub `tolcese/grupo-olyar-v2` |
| Email | Resend API (vía Supabase Edge Function) |
| Clima | wttr.in (sin API key) |

**URL producción:** `https://tolcese.github.io/grupo-olyar-v2`  
**Formulario público (Datero):** `https://tolcese.github.io/grupo-olyar-v2/datero.html`

---

## Credenciales de conexión

```
Supabase URL: https://zohniclbfhvqmurtrhka.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> Las credenciales completas están en el archivo `index.html` en la variable `SUPABASE_ANON`.

---

## Estructura del proyecto

```
tolcese/grupo-olyar-v2/
├── index.html        ← Sistema principal (monolito completo)
├── datero.html       ← Formulario público de carga de solicitudes
├── .nojekyll         ← Evita interferencia de Jekyll en GitHub Pages
└── README.md
```

---

## Roles de usuario

| Rol | Acceso |
|---|---|
| `admin` | Acceso total: contabilidad, liquidaciones, configuración, backup, usuarios |
| `user` | Solicitudes, gestoría, prendas, créditos, datero, calendario, reportes |
| `invitado` | Solo lectura, sin botones de acción |

---

## Secciones del sistema

### Solicitudes
Tabla principal con todos los créditos registrados. Permite crear, editar y filtrar solicitudes. Incluye exportación a Excel y PDF. Los estados posibles son: Pendiente, Aprobado, Rechazado, Avanza, Entregado.

### Datero (`datero.html`)
Formulario público para carga de solicitudes externas desde concesionarias. Incluye:
- Datos de agencia (provincia, concesionaria, encargado)
- Datos del solicitante (nombre, DNI, teléfono, compañía, email, código postal, teléfonos alternativos con nombre y relación)
- Estado civil y datos del cónyuge (se muestran solo si estado civil = Casado/a)
- Foto DNI (subida a Supabase Storage — bucket `datero-dni`)
- Título automotor
- Información laboral (empresa, fecha ingreso, domicilio, teléfono laboral)
- Datos del vehículo (monto, dominio, marca, modelo, año, GNC)
- Datos crediticios (banco, tipo tasa, monto, cuotas)
- Notificación por email vía Resend API al recibir una nueva solicitud
- Badge verde en el sistema cuando hay registros nuevos sin ver (basado en `created_at` exacto para evitar falsos positivos)

### Gestoría
Asignación de gestores a solicitudes aprobadas. Al desasignar un gestor el estado vuelve a "Aprobado" y sale de Prendas y Contabilidad. La ventana de gestores incluye filtro por provincia.

### Prendas pendientes
Lista solicitudes con gestor asignado que aún no tienen fecha de finalización.

### Prendas finalizadas
Lista solicitudes con fecha de finalización cargada. Permite editar la fecha de finalización y cargar fecha de entrega. Al cargar la fecha de entrega el registro pasa automáticamente a Prendas entregadas. Incluye botón de Acuse de recibo imprimible.

### Prendas entregadas
Lista solicitudes marcadas como entregadas. Desde acá el admin puede marcar una prenda como rechazada por el banco (botón ⛔), lo que la mueve a Prendas rechazadas.

### Prendas rechazadas
Nueva sección para el seguimiento de prendas rechazadas por el banco. Flujo:
1. Admin marca prenda como rechazada desde Prendas entregadas con fecha y motivo
2. La prenda aparece en esta sección con badge rojo en el sidebar
3. Al hacer click en un registro se despliega panel lateral con detalle completo
4. Admin puede reingresar la prenda al banco con fecha de reingreso (botón ✅)
5. Al reingresar vuelve a Prendas entregadas y desaparece de Rechazadas

### Contabilidad *(solo admin)*
Gestión contable con las siguientes pestañas:
- **Liquidaciones**: tabla completa con todos los campos contables por operación. Campos editables manualmente: Com. Lukaya, Com. Gestor, Retrib. Banco, Pagos Extras. Si tienen valor manual lo usan; si están vacíos calculan desde el coeficiente.
- **Totales**: resumen de comisiones y ganancias incluyendo Pagos Extras
- **Gastos**: registro de gastos con cálculo de ganancia neta
- **Cobranza Banco**: operaciones AVANZA sin fecha de pago banco
- **Prendas Cobradas**: operaciones AVANZA con fecha de pago banco cargada
- **Cambio de Coeficientes**: modificación de porcentajes de cálculo globales

Fórmula Ganancia Lukaya: `Com. Lukaya - Pagos Extras - Com. Operativo - Com. Gestor + Retrib. Banco`

### Liquidaciones a Terceros *(solo admin)*
Vista contable por punto de venta. Mismos campos editables que Contabilidad. Al abrir cualquier modal siempre lee desde Supabase para tener el dato más actualizado — los cambios en Contabilidad se reflejan en LT y viceversa. Los puntos de venta nuevos se guardan automáticamente en Supabase y se reflejan en el sidebar.

### Sistema de Créditos
Seguimiento de créditos prendarios activos con sus cuotas. Incluye:
- **Créditos**: lista con cuota actual calculada automáticamente. El número de cuota avanza al día siguiente del vencimiento.
- **Cuotas**: vista de vencimientos con número de cuota actual
- **Recordatorio Vencimiento Cuota (WA)**: lista de créditos con vencimiento próximo (7 días hábiles). El mensaje de WhatsApp incluye "Cuota X de Y". Al enviar queda registrado en Supabase y no vuelve a aparecer ese mes.

### Reportes
- Admin: gráficos de estados, registros por mes, comisiones
- Usuario: solicitudes del día (automático al entrar) + prendas pendientes

### Calendario
Eventos, tareas y recordatorios. Los creados por admin son visibles para todos; los creados por usuarios solo los ve el propio usuario.

### Datero (vista interna)
Tabla con todas las solicitudes recibidas desde el formulario público. Badge verde cuando hay registros nuevos sin ver.

### Bancos
Acceso rápido a portales bancarios:
- Banco Columbia: `columbiacompras.com.ar`
- Banco Supervielle: `carapp.iudu.com.ar`
- Banco Santander: `login-prendarios.santanderconsumer.com.ar`
- Banco Bancor: `aplicaciones.bancor.com.ar`

### Puntos de Venta *(sidebar admin)*
Lista de puntos de venta cargada desde Supabase al iniciar. Al hacer click se abre un modal con todas las operaciones asociadas.

### Simulador Prendario
Botón en el sidebar que abre `https://tolcese.github.io/simulador-prendarios/` en nueva pestaña.

### Modo Mantenimiento *(solo admin)*
Desde Configuración el admin puede activar/desactivar el modo mantenimiento. Cuando está activo, los usuarios ven una pantalla de mantenimiento y no pueden ingresar. El admin puede seguir usando el sistema normalmente.

---

## Supabase — Tablas principales

| Tabla | Descripción |
|---|---|
| `solicitudes` | Registros principales del sistema |
| `contabilidad` | Datos contables por solicitud |
| `gestores` | Gestores disponibles |
| `concesionarias` | Concesionarias registradas |
| `clientes` | Datos de clientes |
| `creditos` | Créditos prendarios activos |
| `cuotas` | Cuotas por crédito |
| `datero` | Solicitudes del formulario público |
| `listas` | Valores de listas desplegables y flags de configuración (ej. `_mantenimiento`) |
| `usuarios` | Usuarios del sistema con roles |
| `calendario` | Eventos, tareas y recordatorios |
| `gastos` | Gastos registrados en contabilidad |
| `historial_cambios` | Auditoría de cambios por sección |
| `punto_de_venta` | Puntos de venta disponibles |
| `recordatorios_enviados` | Registro de recordatorios WA enviados por crédito y mes |

### Columnas nuevas en `solicitudes`
- `prenda_rechazada` (boolean) — indica si la prenda fue rechazada por el banco
- `fecha_rechazo_prenda` (date) — fecha del rechazo
- `motivo_rechazo_prenda` (text) — motivo del rechazo
- `fecha_reingreso_prenda` (date) — fecha de reingreso al banco

### Columnas nuevas en `contabilidad`
- `pagos_extras` (numeric) — pagos extras que restan en la Ganancia Lukaya

---

## Supabase — Edge Functions

| Función | Descripción |
|---|---|
| `auto-backup` | Exporta todas las tablas a JSON y las sube al bucket `backups`. Se dispara automáticamente al login del admin si pasaron más de 24hs desde el último backup. |
| `resend-email` | Envía email de notificación al recibir una nueva solicitud del datero. Usa la API de Resend. |

**Secrets requeridos:**
- `SERVICE_ROLE_KEY` — para `auto-backup`
- `RESEND_API_KEY` — para `resend-email`

---

## Supabase — Storage Buckets

| Bucket | Contenido |
|---|---|
| `datero-dni` | Fotos de DNI subidas desde el formulario público |
| `backups` | Archivos JSON de backup automático |

---

## Funcionalidades especiales

### Backup automático
Al loguearse el admin, el sistema consulta el último archivo en el bucket `backups`. Si pasaron más de 24hs, ejecuta la Edge Function `auto-backup` automáticamente. El resultado se puede ver en la consola del navegador (F12).

### Recordatorios de WhatsApp
El sistema calcula 7 días hábiles (sin sábados ni domingos) antes del vencimiento de cada cuota activa. Cuando la fecha de recordatorio llega los usuarios ven un popup al entrar a Sistema de Créditos, con badge rojo en el sidebar y botón directo a WhatsApp con número de cuota incluido en el mensaje.

### Historial de cambios
Auditoría automática de modificaciones en: solicitudes, contabilidad, liquidaciones a terceros, gestores, concesionarias y prendas.

### Widget de clima *(solo claudionieva)*
Muestra temperatura y descripción del clima en el topbar usando `wttr.in`. Intenta geolocalización real; si falla, usa Córdoba como fallback.

### Auto-refresh
El sistema se refresca automáticamente cada 30 segundos. En móvil espera 3 segundos después del último scroll antes de refrescar para evitar parpadeos.

### Prevención de duplicados
Al agregar una opción nueva en cualquier lista desplegable (concesionaria, provincia, marca, etc.), el sistema verifica en Supabase si ya existe antes de insertar. La comparación es case-insensitive.

---

## Deploy

El deploy es automático: cada push a la rama `main` en GitHub actualiza el sitio en GitHub Pages en pocos segundos.

Para actualizar el sistema:
1. Editá `index.html` o `datero.html`
2. Subí el archivo a GitHub (Add file → Upload files → reemplazá el existente)
3. Commiteá a `main`
4. GitHub Pages publica el cambio automáticamente
5. Siempre recargá con **Ctrl+Shift+R** para limpiar caché del navegador

> **Nota:** El archivo `.nojekyll` en la raíz del repo es necesario para que GitHub Pages sirva correctamente los archivos sin interferencia de Jekyll.

---

## Notas de arquitectura

- Supabase se conecta directamente desde el browser — el hosting (GitHub Pages) no interviene en las llamadas a la base de datos.
- Todos los datos están en Supabase. Cambiar de hosting no afecta la data.
- La tabla `punto_de_venta` requiere `id` con `gen_random_uuid()` — los inserts desde el sistema lo generan automáticamente.
- La flag de mantenimiento se guarda en la tabla `listas` con `campo = '_mantenimiento'` y `valor = 'true'/'false'`.
- Los modales de Contabilidad y Liquidaciones a Terceros siempre leen desde Supabase al abrirse para garantizar datos actualizados entre secciones.
- Los valores editados manualmente en contabilidad (Retrib. Banco, Com. Gestor, Com. Lukaya, Pagos Extras) se respetan al recalcular — solo se usa el coeficiente si el campo está vacío.

---

*Última actualización: Abril 2026*
