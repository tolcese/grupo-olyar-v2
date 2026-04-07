# Grupo Olyar v2 — Sistema de Gestión de Créditos Automotrices

Sistema interno de gestión de créditos prendarios para el equipo de Grupo Olyar. Migrado desde Google Sheets + Apps Script a una arquitectura moderna con Supabase y Vercel.

---

## Stack tecnológico

| Componente | Tecnología |
|---|---|
| Frontend | Vanilla JS — monolito `index.html` |
| Base de datos | Supabase (PostgreSQL) — región São Paulo |
| Hosting | Vercel |
| Repositorio | GitHub `tolcese/grupo-olyar-v2` |
| Email | Resend API (vía Supabase Edge Function) |
| Clima | wttr.in (sin API key) |

**URL producción:** `grupo-olyar-v2.vercel.app`  
**Formulario público (Datero):** `grupo-olyar-v2.vercel.app/datero.html`

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
- Foto DNI (subida a Supabase Storage — bucket `datero-dni`)
- Título automotor
- Información laboral (empresa, fecha ingreso, domicilio, teléfono laboral)
- Datos del vehículo (monto, dominio, marca, modelo, año, GNC)
- Datos crediticios (banco, tipo tasa, monto, cuotas)
- Notificación por email vía Resend API al recibir una nueva solicitud

### Gestoría
Asignación de gestores a solicitudes aprobadas. Al desasignar un gestor el estado vuelve a "Aprobado" y sale de Prendas y Contabilidad.

### Prendas pendientes
Lista solicitudes con gestor asignado que aún no tienen los tres estados completos (en proceso, presentada, finalizada). Solo muestra prendas sin fecha de finalización.

### Contabilidad *(solo admin)*
Gestión contable con las siguientes pestañas:
- **Liquidaciones**: tabla completa con todos los campos contables por operación
- **Totales**: resumen de comisiones y ganancias
- **Gastos**: registro de gastos con cálculo de ganancia neta (Lukaya menos gastos)
- **Cobranza Banco**: operaciones AVANZA con campo editable "Fecha de pago Banco"
- **Cambio de Coeficientes**: modificación de porcentajes de cálculo

### Liquidaciones a Terceros
Vista contable por punto de venta. Permite editar los campos contables de cada operación AVANZA.

### Sistema de Créditos
Seguimiento de créditos prendarios activos con sus cuotas. Incluye:
- **Créditos**: lista de créditos con panel lateral de detalle
- **Cuotas**: vista de vencimientos por crédito
- **Recordatorio Vencimiento Cuota (WA)**: lista de créditos con vencimiento próximo (7 días hábiles) pendientes de aviso por WhatsApp. Al enviar el mensaje queda registrado en Supabase y no vuelve a aparecer para ningún usuario ese mes.

### Reportes
- Admin: gráficos de estados, registros por mes, comisiones
- Usuario: solicitudes del día (automático al entrar) + prendas pendientes

### Calendario
Eventos, tareas y recordatorios. Los creados por admin son visibles para todos; los de cada usuario solo los ve él mismo.

### Datero (vista interna)
Tabla con todas las solicitudes recibidas desde el formulario público. Badge verde cuando hay registros nuevos sin ver.

### Bancos
Acceso rápido a portales bancarios:
- Banco Columbia: `columbiacompras.com.ar`
- Banco Supervielle: `carapp.iudu.com.ar`
- Banco Santander: `login-prendarios.santanderconsumer.com.ar`

### Puntos de Venta *(sidebar admin)*
Lista de puntos de venta. Al hacer click se abre un modal con todas las operaciones asociadas.

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
| `listas` | Valores de listas desplegables (bancos, provincias, etc.) |
| `usuarios` | Usuarios del sistema con roles |
| `calendario` | Eventos, tareas y recordatorios |
| `gastos` | Gastos registrados en contabilidad |
| `historial_cambios` | Auditoría de cambios por sección |
| `punto_de_venta` | Puntos de venta disponibles |
| `recordatorios_enviados` | Registro de recordatorios WA enviados por crédito y mes |
| `mantenimiento` | Control de modo mantenimiento |

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
El sistema calcula 7 días hábiles (sin sábados ni domingos) antes del vencimiento de cada cuota activa. Cuando la fecha de recordatorio llega:
- Los usuarios (no admin) ven un popup al entrar a Sistema de Créditos
- Badge rojo en el botón del sidebar
- Pestaña "Recordatorio Vencimiento Cuota (WA)" con botón directo a WhatsApp
- Al enviar el mensaje se registra en `recordatorios_enviados` y no vuelve a aparecer para ningún usuario ese mes

### Historial de cambios
Auditoría automática de modificaciones en: solicitudes, contabilidad, liquidaciones a terceros, gestores, concesionarias y prendas.

### Widget de clima *(solo claudionieva)*
Muestra temperatura y descripción del clima en el topbar usando `wttr.in`. Intenta geolocalización real; si falla, usa Córdoba como fallback.

### Auto-refresh
El sistema se refresca automáticamente cada 30 segundos. En móvil espera 3 segundos después del último scroll antes de refrescar para evitar parpadeos.

---

## Deploy

El deploy es automático: cada push a la rama `main` en GitHub dispara un nuevo deploy en Vercel.

Para deployar manualmente:
1. Editá `index.html` o `datero.html`
2. Commiteá y pusheá a `main`
3. Vercel detecta el cambio y deploya automáticamente en ~30 segundos

---

## Pendientes / Roadmap

- Adaptación responsive móvil (en progreso)
- Mejora de vista de tabla del Datero en PC

---

*Última actualización: Abril 2026*
