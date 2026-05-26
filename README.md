# Grupo Olyar — Sistema de Gestión de Solicitudes

**Versión actual:** v2.23.20

Sistema interno de gestión de créditos automotores para Grupo Olyar. Administra solicitudes a través de bancos, gestores, concesionarias y clientes.

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

## 👥 Roles de usuario

| Rol | Acceso |
|-----|--------|
| `admin` | Control total del sistema |
| `user` | Ve todo, no puede editar/eliminar |
| `presupuestos` | Solo sección Presupuestos |
| `usuario_presupuestos` | Todo como user + Presupuestos |
| `administracion` | Solo sección Administración |
| `usuario_administracion` | Todo como user + Administración |

---

## 🏦 Bancos operativos

- **Columbia** — `#1d6fce`
- **Galicia** — `#e8821a`
- **Santander** — `#ec0000`
- **Supervielle** — `#682489`
- **Bancor** — `#005f5b`

---

## 📦 Módulos del sistema

### Gestión
- **Solicitudes** — tabla principal con paginación, filtros y búsqueda
- **Nueva solicitud** — formulario de carga y edición
- **Gestoría** — prendas en estado AVANZA, asignación de gestores
- **Contabilidad** — liquidaciones, cupos por banco, histórico
- **Datero** — formulario público de carga de datos
- **Presupuestos** — CRUD de presupuestos con seguimiento de pagos
- **Stock de prendas** — control de prendas en blanco por banco y gestor
- **Administración** — sección en desarrollo

### Reportes (admin)
- Torta y barras por estado/banco
- Comisiones
- Prendas pendientes / finalizadas / entregadas
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
- **Calculadores** — acceso a Columbia y Galicia
- **Backup** — manual y automático diario (1 por día)
- **Calendario** — vista de solicitudes por fecha

---

## 🔄 Flujo de stock de prendas

1. **Cargar stock** → entra al stock general por banco
2. **Registrar envío al gestor** → descuenta del stock general, suma al stock del gestor
3. **Asignar gestor en Gestoría** → descuenta del stock del gestor automáticamente

---

## 📱 PWA

El sistema es instalable como PWA en Android:
- `manifest.json` — configuración de la app
- `sw.js` — service worker para caché
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

## 🔧 Deploy

El deploy es automático al subir archivos a la rama `main`. GitHub Pages sirve el contenido directamente sin build.

---

*Sistema desarrollado y mantenido por Grupo Olyar.*
