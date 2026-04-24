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
Tabla principal con todos los créditos registrados. Permite crear, editar y filtrar solicitudes. Incluye exportación a Excel y PDF. Los estados posibles son: Pendiente, Aprobado, Rechazado, Avanza, Entregado. Al modificar el importe de una solicitud AVANZA que ya tiene datos contables, el sistema pregunta si recalcular Contabilidad con el nuevo importe.

### Datero (`datero.html`)
Formulario público para carga de solicitudes externas desde concesionarias. Incluye datos personales, estado civil y cónyuge, foto DNI, datos laborales, vehículo y crédito. Badge verde en el sistema cuando hay registros nuevos sin ver.

### Gestoría
Asignación de gestores a solicitudes aprobadas. Ventana con filtro por nombre y por provincia. Solo el admin puede editar el nombre de una concesionaria existente.

### Prendas pendientes
Lista solicitudes con gestor asignado que aún no tienen fecha de finalización.

### Prendas finalizadas
Lista solicitudes con fecha de finalización cargada. Permite editar la fecha y cargar fecha de entrega. Incluye botón de Acuse de recibo imprimible con campos editables (nombre, DNI, documentación con checkboxes, extras opcionales).

### Prendas entregadas
Lista solicitudes marcadas como entregadas. Desde acá el admin puede marcar una prenda como rechazada por el banco (botón ⛔).

### Prendas rechazadas
Seguimiento de prendas rechazadas por el banco. Flujo: rechazada → panel lateral con detalle, correcciones editables por admin y usuario → reingresar al banco (admin) → vuelve a Prendas entregadas. Badge rojo en sidebar cuando hay prendas pendientes de reingreso.

### Contabilidad *(solo admin)*
Gestión contable con las siguientes pestañas:

- **Liquidaciones**: tabla de operaciones AVANZA sin fecha de pago banco. Campos editables en modal: Com. Lukaya, Com. Gestor, Retrib. Banco, Pagos Extras, Com. Operativo, Gastos Gestoría, Ganancia Lukaya, A Liquidar Agencia, Fecha Liquidación, Pago Agencia, Fecha Pago Agencia, Pago Com. Gest., Observaciones.
- **Totales**: resumen del período con Imp. Solicitado, A Liquidar, 1,2 Imp. Crédito, Gastos Gestoría, Com. Lukaya, Pagos Extras, Com. Operativo, Com. Gestor, Retrib. Banco, Ganancia Lukaya, Pago Agencia, Pago Com. Gest.
- **Gastos**: registro de gastos con ganancia neta.
- **Prendas a cobrar**: operaciones AVANZA sin fecha de pago banco. Campo editable de fecha de pago. Total Retribución Banco al pie. Al cargar la fecha pasa automáticamente a Prendas Cobradas y sale de Liquidaciones.
- **Prendas Cobradas**: operaciones con fecha de pago banco cargada. Fecha editable para corregir o borrar (si se borra vuelve a Prendas a cobrar). Total Retribución Banco al pie. Botón ✏️ para editar el registro completo.
- **Cambio de Coeficientes**: modificación de porcentajes globales de cálculo.

**Fórmula Ganancia Lukaya:** `Com. Lukaya - Pagos Extras - Com. Operativo - Com. Gestor + Retrib. Banco`

Los modales de Contabilidad siempre leen desde Supabase al abrirse para garantizar datos actualizados. Los valores editados manualmente se respetan al recalcular — solo se usa el coeficiente si el campo está vacío.

### Sistema de Créditos
Seguimiento de créditos prendarios activos. Cuota actual calculada automáticamente — avanza al día siguiente del vencimiento. Recordatorio de WhatsApp 7 días hábiles antes del vencimiento con "Cuota X de Y" en el mensaje. Créditos se pueden cargar manualmente desde el sistema sin afectar Contabilidad.

### Reportes
- Admin: gráficos de estados, barras por mes, comisiones, conversión por concesionaria, listado imprimible de prendas con filtro por estado.
- Usuario: solicitudes del día (automático), solicitudes día anterior (solo Aprobadas).

### Calendario
Eventos del admin visibles para todos. Eventos de usuarios solo visibles para el propio usuario.

### Datero (vista interna)
Tabla con todas las solicitudes del formulario público. Badge verde con detección exacta de nuevos registros.

### Bancos
Acceso rápido a: Columbia, Supervielle, Santander, Bancor.

### Modo Mantenimiento *(solo admin)*
Activa pantalla de mantenimiento para usuarios. Admin puede seguir usando el sistema.

### Widget de clima *(solo claudionieva)*
Muestra ícono y temperatura en el topbar usando wttr.in.

---

## Supabase — Tablas principales

| Tabla | Descripción |
|---|---|
| `solicitudes` | Registros principales del sistema |
| `contabilidad` | Datos contables por solicitud |
| `gestores` | Gestores con nombre, teléfono, email, dirección, CP, localidad, provincia |
| `concesionarias` | Concesionarias registradas |
| `clientes` | Datos de clientes |
| `creditos` | Créditos prendarios activos |
| `cuotas` | Cuotas por crédito |
| `datero` | Solicitudes del formulario público |
| `listas` | Valores de listas desplegables y flags de configuración |
| `usuarios` | Usuarios del sistema con roles |
| `calendario` | Eventos, tareas y recordatorios |
| `gastos` | Gastos registrados en contabilidad |
| `historial_cambios` | Auditoría de cambios por sección |
| `punto_de_venta` | Puntos de venta disponibles |
| `recordatorios_enviados` | Registro de recordatorios WA enviados por crédito y mes |

### Columnas clave en `solicitudes`
- `prenda_rechazada`, `fecha_rechazo_prenda`, `motivo_rechazo_prenda`, `fecha_reingreso_prenda`, `correcciones_prenda`

### Columnas clave en `contabilidad`
- `pagos_extras` — pagos extras que restan en Ganancia Lukaya

---

## Supabase — Edge Functions

| Función | Descripción |
|---|---|
| `auto-backup` | Exporta tablas a JSON en bucket `backups`. Se dispara al login del admin si pasaron +24hs. |
| `resend-email` | Notificación email al recibir nuevo datero. |

---

## Deploy

1. Editá `index.html` o `datero.html`
2. Subí a GitHub (Add file → Upload files → reemplazá el existente)
3. Commiteá a `main`
4. Recargá con **Ctrl+Shift+R** para limpiar caché

---

## Notas de arquitectura

- Supabase se conecta directamente desde el browser — GitHub Pages no interviene en las llamadas a la BD.
- Los modales de Contabilidad siempre hacen fetch fresco a Supabase al abrirse.
- Al modificar importe en solicitud AVANZA con datos contables existentes, el sistema pregunta si recalcular.
- La flag de mantenimiento se guarda en `listas` con `campo = '_mantenimiento'`.
- Liquidaciones a Terceros fue eliminada del sistema — toda la gestión contable se hace desde Contabilidad.

---

*Última actualización: Abril 2026*
