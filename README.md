# Grupo Olyar — Sistema de Gestión de Solicitudes

**Versión actual:** v2.25.19

Sistema interno de gestión de créditos automotores para Grupo Olyar. Administra solicitudes a través de bancos, gestores, concesionarias y clientes. Incluye además un módulo independiente de gestión de **Sociedades** (presupuestos, prendas, seguimiento).

---

## 🌐 Acceso

**URL:** [tolcese.github.io/grupo-olyar-v2](https://tolcese.github.io/grupo-olyar-v2)

---

## 🏗️ Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | Vanilla JS — monolito `index.html` |
| Hosting | GitHub Pages |
| Backend | Supabase (PostgreSQL) — región São Paulo |
| Proyecto Supabase | `zohniclbfhvqmurtrhka` |

---

## 🏠 Panel Principal

Al loguearse, la mayoría de los roles ven primero una pantalla intermedia sin sidebar ni navegación, con accesos directos en forma de cuadrados:

| Acceso | Quién lo ve | A dónde lleva |
|--------|-------------|----------------|
| 📄 Presupuestos | Todos los roles del Panel Principal | Presupuestos + Histórico Presupuestos |
| 🏛️ Sociedades | Todos los roles del Panel Principal | Sociedades + Prendas Sociedades Finalizadas + Presupuestos Sociedades |
| 🚗 Comercializadora | Todos los roles del Panel Principal | Sistema completo según el rol real (sin Presupuestos/Sociedades en el sidebar) |
| 🧾 Contabilidad | Solo `admin` | Contabilidad (acceso exclusivo y aislado) |
| 🏢 Administración | Solo `admin` | Administración (acceso exclusivo y aislado) |

En cualquiera de los modos hay un botón fijo **"🏠 Panel Principal"** en el sidebar para volver a elegir sección. Los roles `presupuestos` y `administracion` (puros) no pasan por este panel — van directo a su única sección, ya que no tienen otro lugar al que navegar.

---

## 👥 Roles de usuario

| Rol | Acceso |
|-----|--------|
| `admin` | Control total del sistema. Ve el Panel Principal con los 5 accesos. |
| `user` | Ve todo, no puede editar/eliminar. Ve el Panel Principal (Presupuestos/Sociedades/Comercializadora). |
| `invitado` | Solo lectura. Ve el Panel Principal. |
| `presupuestos` | Solo sección Presupuestos. No ve el Panel Principal. |
| `usuario_presupuestos` | Todo como user + Presupuestos. Ve el Panel Principal. |
| `administracion` | Solo sección Administración. No ve el Panel Principal. |
| `usuario_administracion` | Todo como user + Administración. Ve el Panel Principal. |

**Restricciones por usuario específico (no por rol):**
- **Contabilidad:** visible para `admin` (excepto en modo Comercializadora del Panel Principal) y para los usernames `claudionieva`, `golcese`, `tolcese`, `Invitado`.
- **Administración:** oculta para los usernames `abarco` y `yohanavarro`, sin importar su rol.
- **Widget de clima:** visible para `claudionieva` o cualquier `admin`.
- **Calculador p/mail Galicia:** visible solo para `claudionieva`.

---

## 🏦 Bancos operativos

- **Columbia** — `#1d6fce`
- **Galicia** — `#e8821a`
- **Santander** — `#ec0000`
- **Supervielle** — `#682489`
- **Bancor** — `#005f5b`

Acceso directo a portales: Santander Consumer (`login-prendarios.santanderconsumer.com.ar`). Calculadores propios para Columbia, Galicia y Santander.

---

## 📦 Módulos del sistema

### Gestión
- **Solicitudes** — tabla principal con paginación, filtros y búsqueda
- **Nueva solicitud** — formulario de carga y edición
- **Gestoría** — prendas en estado AVANZA, asignación de gestores
- **Contabilidad** — liquidaciones, cupos por banco, histórico
- **Datero** — formulario público de carga de datos; indicador de "no leído" persistente por usuario en Supabase (tabla `datero_last_seen`), con botón de impresión de Hoja de Guía Lukaya desde el panel de detalle
- **Presupuestos** — CRUD de presupuestos con seguimiento de pagos
- **Stock de prendas** — control de prendas en blanco por banco y gestor
- **Administración** — Trámites, con CRUD completo de gastos y categorías

### Sociedades (módulo independiente)
- **Sociedades** — CRUD de operaciones de sociedades (tabla `sociedades`): datos generales, operación, prendas finalizadas, honorarios y gastos, comentarios
  - Estado calculado automáticamente: INICIADA → EN TRÁMITE → FINALIZADA (según fechas de envío/entrega de prenda)
  - Panel lateral de detalle con Editar, Duplicar, Seguimiento (vista a dos columnas con comentarios editables) y Eliminar (solo admin)
  - Filtros avanzados: Localidad, Gestor, Digital, Pago honorarios, rango de fechas de envío/entrega
- **Prendas Sociedades Finalizadas** — listado filtrado solo a operaciones en estado FINALIZADA
- **Presupuestos Sociedades** — confección de presupuestos tipo Prenda Digital o Agro, con cálculos automáticos de aranceles, sellados e inscripciones según el monto; impresión con logo institucional. Visible solo desde el Panel Principal (modo Sociedades) o para `admin`

### Reportes (admin)
- Torta y barras por estado/banco
- Comisiones
- Prendas pendientes (con columna de Días de atraso, codificado por color) / finalizadas / entregadas
- Solicitudes del día y del día anterior (con WhatsApp)
- Conversión por concesionaria
- Listado de prendas
- % Financiamiento
- Brecha de financiamiento

### Configuración
- **Gestores** — ABM con filtro por provincia
- **Concesionarias** — ABM con campos estafadora y WhatsApp grupo
- **Bancos** — porcentajes por tipo/año de vehículo
- **Clientes** — historial de solicitudes
- **Usuarios** — ABM con roles
- **Calculadores** — acceso a Columbia, Galicia y Santander
- **Calculador p/mail Galicia** — exclusivo de `claudionieva`, cálculo de comisiones AUTONET/LUKAYA sobre el monto del crédito
- **Backup** — manual y automático diario (1 por día)
- **Calendario** — vista de solicitudes por fecha

---

## 🔄 Flujo de stock de prendas

1. **Cargar stock** → entra al stock general por banco
2. **Registrar envío al gestor** → descuenta del stock general, suma al stock del gestor
3. **Asignar gestor en Gestoría** → descuenta del stock del gestor automáticamente

## 🔄 Flujo de prenda rechazada

Al marcar una prenda como rechazada, el sistema resetea automáticamente `entregada`, `en_proceso`, `presentada` y `finalizada`, y vuelve el estado a `AVANZA` — la operación reaparece en Prendas Pendientes y vuelve a descontar cupo, sin pasos manuales adicionales.

---

## 📱 PWA

El sistema es instalable como PWA en Android:
- `manifest.json` — configuración de la app
- `sw.js` — service worker para caché (cache-busting vía `CACHE_NAME` en cada release relevante)
- `icons/` — íconos 192px, 512px y apple-touch-icon

---

## 🗂️ Archivos en el repo

```
grupo-olyar-v2/
├── index.html          ← Sistema principal
├── datero.html         ← Formulario público de datero
├── manifest.json       ← PWA manifest
├── sw.js               ← Service worker
├── icons/
│   ├── icon-192.png
│   ├── icon-512.png
│   └── apple-touch-icon.png
└── README.md
```

---

## 🗄️ Tablas principales en Supabase

`solicitudes`, `gestores`, `concesionarias`, `usuarios`, `tramites`, `presupuestos`, `sociedades`, `presupuestos_sociedades`, `datero_last_seen`, `stock_prendas`, `stock_prendas_movimientos`, `stock_prendas_gestor`, `coeficientes_banco`, `lukaya_solicitudes`.

---

## 🔧 Deploy

El deploy es automático al subir archivos a la rama `main`. GitHub Pages sirve el contenido directamente sin build.

Si se sospecha de caché del Service Worker (cambios que no se reflejan tras subir), incrementar manualmente `CACHE_NAME` en `sw.js` para forzar la reinstalación.

---

*Sistema desarrollado y mantenido por Grupo Olyar.*
