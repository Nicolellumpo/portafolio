# 🎓 Sistema de Gestión de Alumnos

Aplicación web para gestionar alumnos universitarios, desarrollada con **HTML, CSS y JavaScript vanilla** — sin frameworks ni librerías externas.

## Demo en vivo

> Abrí `sist_Alumnos.html` directo en el navegador. No necesita servidor.

## Funcionalidades

| Feature | Descripción |
|---|---|
| **CRUD completo** | Agregar, editar y eliminar alumnos |
| **Validaciones** | Campos requeridos, rango de notas, legajo único |
| **Filtros** | Por estado: Activos / Inactivos / Egresados / Becados |
| **Búsqueda** | Por nombre o legajo en tiempo real |
| **Ordenamiento** | Click en encabezados de columna (asc/desc) |
| **Estadísticas** | Total, activos, egresados, promedio general |
| **Stats por carrera** | Barras de progreso con cantidad y promedio por carrera |
| **Exportar CSV** | Descarga todos los datos como archivo `.csv` |
| **Persistencia** | Los datos se guardan en `localStorage` del navegador |
| **Modal de confirmación** | Confirma antes de eliminar un alumno |
| **Toasts** | Feedback visual en cada acción |
| **Datos de demo** | Se cargan 6 alumnos de ejemplo al abrir por primera vez |

## Conceptos de JavaScript aplicados

```
✔ Manipulación del DOM (querySelector, innerHTML, createElement)
✔ Eventos (addEventListener, onclick, oninput, submit)
✔ LocalStorage (getItem, setItem, JSON.parse / JSON.stringify)
✔ Array methods: filter(), map(), sort(), find(), reduce(), forEach()
✔ Validación de formularios sin librerías
✔ Generación de IDs únicos (Date.now + Math.random)
✔ Exportación de archivos con Blob y URL.createObjectURL
✔ Modales con overlay
✔ Toast notifications
```

## Cómo usar

```bash
# Opción 1: abrir directo
open index.html

# Opción 2: con Live Server de VSCode
# Click derecho en index.html → "Open with Live Server"
```

## Modelo de datos

Cada alumno se almacena en `localStorage` con esta estructura:

```json
{
  "id":       "lf3k2abc",
  "nombre":   "Nicole Llumpo",
  "legajo":   "2022001",
  "carrera":  "Ingeniería en Sistemas",
  "anio":     3,
  "nota":     8.2,
  "estado":   "activo",
  "fechaAlta": "01/03/2022"
}
```

### Estados posibles

| Estado | Color |
|---|---|
| `activo`   | 🟢 Verde |
| `inactivo` | ⚫ Gris  |
| `egresado` | 🔵 Azul  |
| `beca`     | 🟡 Ámbar |

## Captura de pantalla

```
┌─────────────────────────────────────────────────────────┐
│  🎓 Sistema de Gestión de Alumnos              v1.0     │
├──────────────┬──────────────────────────────────────────┤
│ ➕ Nuevo     │  [Total: 6] [Activos: 3] [⌀ 7.3] [Egr:1]│
│              ├──────────────────────────────────────────┤
│  Nombre      │  🔍 Buscar...  [Todos][Activos][...]      │
│  Legajo      ├────────────────────────────────────────── │
│  Carrera     │  Alumno    Legajo  Carrera  Año  Prom     │
│  Año         │  ─────────────────────────────────────── │
│  Promedio    │  NL Nicole  2022001  Ing.Sist  3°  8.2   │
│  Estado      │  VT Valenti 2021045  Ing.Ind   4°  7.5   │
│              │  ...                                      │
│ [Agregar]    │                                           │
└──────────────┴──────────────────────────────────────────┘
```

---

> Desarrollado por **Nicole Llumpo** — Ingeniería en Sistemas de Información, UTN