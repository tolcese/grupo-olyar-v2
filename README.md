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

### Gestoría
Asignación de gestores a solicitudes aprobadas. Al desasignar un gestor el estado vuelve a "Aprobado" y sale de Prendas y Contabilidad.

### Prendas pendientes
Lista solicitudes con gestor asignado que aún no tienen fecha de finalización.

### Prendas finalizadas
Lista solicitudes con fecha de finalización cargada. Permite editar la fecha de finalización y cargar fecha de entrega. Al cargar la fecha de entrega el registro pasa automáticamente a Prendas entregadas. Incluye botón de Acuse de recibo imprimible.

### Prendas entregadas
Lista solicitudes marcadas como entregadas (con fecha de entrega cargada).

### Contabilidad *(solo admin)*
Gestión contable con las siguientes pestañas:
- **Liquidaciones**: tabla completa con todos los campos contables por operación
- **Totales**: resumen de comisiones y ganancias
- **Gastos**: registro de gastos con cálculo de ganancia neta (Lukaya menos gastos)
- **Cobranza Banco**: operaciones AVANZA sin fecha de pago banco
- **Prendas Cobradas**: operaciones AVANZA con fecha de pago banco cargada
- **Cambio de Coeficientes**: modificación de porcentajes de cálculo

### Liquidaciones a Terceros *(solo admin)*
Vista contable por punto de venta. Permite editar los campos contables de cada operación AVANZA. Los puntos de venta nuevos agregados desde acá se guardan automáticamente en Supabase y se reflejan en el sidebar.

### Sistema de Créditos
Seguimiento de créditos prendarios activos con sus cuotas. Incluye:
- **Créditos**: lista de créditos con panel lateral de detalle. Muestra la cuota actual calculada automáticamente según la fecha del día.
- **Cuotas**: vista de vencimientos por crédito con número de cuota actual
- **Recordatorio Vencimiento Cuota (WA)**: lista de créditos con vencimiento próximo (7 días hábiles) pendientes de aviso por WhatsApp. Muestra "Cuota X de Y" en la card y en el mensaje de WA. Al enviar el mensaje queda registrado en Supabase y no vuelve a aparecer para ningún usuario ese mes.

El número de cuota actual se calcula automáticamente: meses transcurridos desde la fecha del primer vencimiento + 1, avanzando al siguiente si el día de vencimiento del mes actual ya pasó.

### Reportes
- Admin: gráficos de estados, registros por mes, comisiones
- Usuario: solicitudes del día (automático al entrar) + prendas pendientes

### Calendario
Eventos, tareas y recordatorios. Los creados por admin son visibles para todos; los de cada usuario solo los ve él mismo.

### Datero (vista interna)
Tabla con todas las solicitudes recibidas desde el formulario público. Badge verde cuando hay registros nuevos sin ver. El badge se marca como visto guardando el `created_at` exacto del último datero para evitar falsos positivos.

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
- Pestaña "Recordatorio Vencimiento Cuota (WA)" con botón directo a WhatsApp con número de cuota incluido en el mensaje
- Al enviar el mensaje se registra en `recordatorios_enviados` y no vuelve a aparecer para ningún usuario ese mes

### Historial de cambios
Auditoría automática de modificaciones en: solicitudes, contabilidad, liquidaciones a terceros, gestores, concesionarias y prendas.

### Widget de clima *(solo claudionieva)*
Muestra temperatura y descripción del clima en el topbar usando `wttr.in`. Intenta geolocalización real; si falla, usa Córdoba como fallback.

### Auto-refresh
El sistema se refresca automáticamente cada 30 segundos. En móvil espera 3 segundos después del último scroll antes de refrescar para evitar parpadeos.

---

## Deploy

El deploy es automático: cada push a la rama `main` en GitHub actualiza el sitio en GitHub Pages en pocos segundos.

Para actualizar el sistema:
1. Editá `index.html` o `datero.html`
2. Subí el archivo a GitHub (Add file → Upload files → reemplazá el existente)
3. Commiteá a `main`
4. GitHub Pages publica el cambio automáticamente

> **Nota:** El archivo `.nojekyll` en la raíz del repo es necesario para que GitHub Pages sirva correctamente los archivos sin interferencia de Jekyll.

---

## Notas de arquitectura

- Supabase se conecta directamente desde el browser — el hosting (GitHub Pages) no interviene en las llamadas a la base de datos.
- Todos los datos están en Supabase. Cambiar de hosting no afecta la data.
- La tabla `punto_de_venta` requiere `id` con `gen_random_uuid()` — los inserts desde el sistema lo generan automáticamente.
- La flag de mantenimiento se guarda en la tabla `listas` con `campo = '_mantenimiento'` y `valor = 'true'/'false'`.

---

*Última actualización: Abril 2026*
