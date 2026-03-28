# 🚌 GuaguaTime RD

Simulador de rutas y costos del transporte público de Santo Domingo, República Dominicana.  
Proyecto del Primer Parcial — Programación III · Juan Carlos Frias Alfonso

---

## 🚀 Cómo ejecutar

> ⚠️ **No abrir los archivos con doble clic** (`file://`). Los módulos ES6 y el `fetch` requieren un servidor HTTP.

**Opción 1 — VS Code Live Server (recomendado)**
1. Abrir la carpeta del proyecto en VS Code
2. Click derecho en `index.html` → **Open with Live Server**
3. Se abre en `http://127.0.0.1:5500`

**Opción 2 — Python**
```bash
python -m http.server 8080
# Abrir: http://localhost:8080
```

---

## 📁 Estructura del proyecto

```
GuaguaTime-RD/
├── index.html            # Página principal con noticias
├── calcular-ruta.html    # Buscador de rutas con alertas
├── rutas-favoritas.html  # Rutas guardadas en localStorage
├── contacto.html         # Formulario de contacto
├── styles.css            # Estilos con variables CSS y Grid/Flex
├── script.js             # Lógica principal (ES6 module)
└── json/
    ├── rutas.json        # Datos de rutas y tramos
    └── alertas.json      # Condiciones y su impacto
```

---

## ⚙️ Reglas de cálculo (deterministas)

Todas las fórmulas están documentadas también en `script.js`.

| Regla | Fórmula |
|---|---|
| **Tiempo base** | `suma(tiempo_min)` de todos los tramos |
| **Con alertas** | `tiempo = tiempo × (1 + tiempo_pct / 100)` por cada alerta activa |
| **Redondeo** | `Math.round(tiempo_final)` |
| **Costo total** | `suma(costo_tramos) + suma(costo_extra_alertas)` |
| **Transbordos** | `tramos.length - 1` |
| **Ranking por defecto** | Ascendente por tiempo total |
| **Ranking alternativo** | El usuario puede ordenar por costo o transbordos |

### Alertas disponibles

| Alerta | Impacto en tiempo | Costo extra |
|---|---|---|
| 🌧️ Lluvia | +30% | +RD$20 |
| 🚦 Hora Pico | +50% | sin cambio |
| ⛔ Paro | +80% | +RD$50 |
| 🎉 Feriado | −15% | sin cambio |

---

## ✅ Checklist de requisitos

### HTML5 semántico
- [x] `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>` en todas las páginas
- [x] Formularios con `<label for="">` accesibles
- [x] `aria-label` en la navegación principal
- [x] `alt` en todas las imágenes

### CSS
- [x] Variables CSS en `:root` (`--azul`, `--naranja`, `--amarillo`, etc.)
- [x] `display: grid` en la sección de noticias
- [x] `display: flex` en la barra de alertas
- [x] Convención de clases kebab-case (`ruta-card`, `alerta-btn`, `calcular-section`)
- [x] Sin frameworks (no Bootstrap, no Tailwind)

### JavaScript
- [x] ES6 module (`type="module"` en todos los HTML)
- [x] `fetch()` para cargar `rutas.json` y `alertas.json`
- [x] Funciones puras para cálculos (`calcular`, `debounce`)
- [x] Validación de formulario (campos vacíos, origen igual a destino)
- [x] `debounce` de 400ms en los selects de búsqueda
- [x] `localStorage` para guardar y eliminar rutas favoritas
- [x] Sin librerías externas de JS

### Reglas de cálculo
- [x] Tiempo base = suma de `tiempo_min` de tramos
- [x] Alertas aplican multiplicador al tiempo
- [x] Costo = suma tramos + suma extras de alertas
- [x] Ranking por tiempo (default), costo o transbordos
- [x] Reglas documentadas con comentarios en `script.js`

---

## 🗺️ Rutas disponibles

| ID | Ruta | Tramos |
|---|---|---|
| r1 | Villa Consuelo → Centro | 2 |
| r2 | Los Mina → Zona Colonial | 3 |
| r3 | Cristo Rey → UASD | 2 |
| r4 | Arroyo Hondo → Bella Vista | 2 |
| r5 | Ensanche Ozama → Las Américas | 2 |
| r6 | Gazcue → Naco | 2 |
| r7 | Herrera → Av. 27 de Febrero | 1 |
| r8 | Piantini → Alma Rosa | 3 |
| r9 | Av. 27 de Febrero → Centro | 1 |
| r10 | Centro Olímpico → Máximo Gómez | 1 |

---

## 👤 Autor

**Juan Carlos Frias Alfonso**  
Programación III — Primer Parcial  
Universidad Autónoma de Santo Domingo (UASD) · 2026