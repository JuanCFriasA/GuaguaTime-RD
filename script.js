// ===== script.js — GuaguaTime RD =====

// Estado global
let rutasData = [];
let alertasConfig = {};
let alertasActivas = [];

// Debounce: evita llamadas repetidas al buscar
function debounce(fn, ms) {
    let timer;
    return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
}

// Carga rutas y alertas desde archivos JSON externos
async function cargarDatos() {
    const [rutasRes, alertasRes] = await Promise.all([
        fetch('./json/rutas.json'),
        fetch('./json/alertas.json')
    ]);
    rutasData     = await rutasRes.json();
    alertasConfig = await alertasRes.json();
}

// Activa o desactiva una alerta visual
function toggleAlerta(btn, id) {
    const idx = alertasActivas.indexOf(id);
    if (idx >= 0) {
        alertasActivas.splice(idx, 1);
        btn.classList.remove('alerta-activa');
    } else {
        alertasActivas.push(id);
        btn.classList.add('alerta-activa');
    }
}

// ===== REGLAS DE CÁLCULO DETERMINISTAS =====
// 1. Tiempo base = suma de tiempo_min de todos los tramos
// 2. Por cada alerta activa: tiempo = tiempo * (1 + tiempo_pct / 100)
// 3. Resultado redondeado al minuto: Math.round()
// 4. Costo total = suma de costo de tramos + suma de costo_extra de alertas activas
// 5. Transbordos = número de tramos - 1
// 6. Ranking por defecto: tiempo ascendente; alterable a costo o transbordos
function calcular(ruta) {
    let tiempo = ruta.tramos.reduce((s, t) => s + t.tiempo_min, 0);
    let costo  = ruta.tramos.reduce((s, t) => s + t.costo, 0);

    alertasActivas.forEach(id => {
        const a = alertasConfig[id];
        tiempo = tiempo * (1 + a.tiempo_pct / 100);
        costo += a.costo_extra;
    });

    return { ...ruta, tiempo: Math.round(tiempo), costo, transbordos: ruta.tramos.length - 1 };
}

// Busca, calcula y muestra rutas según origen, destino y criterio
function calcularRuta(e) {
    e.preventDefault();
    const origen   = document.getElementById('origen').value;
    const destino  = document.getElementById('destino').value;
    const criterio = document.getElementById('criterio').value;

    // Validación de formulario
    if (!origen || !destino) return alert('Selecciona origen y destino.');
    if (origen === destino)  return alert('El origen y destino no pueden ser iguales.');

    // Filtro: exacto → parcial → todas
    let resultado = rutasData.filter(r => r.origen === origen && r.destino === destino);
    if (resultado.length === 0) resultado = rutasData.filter(r => r.origen === origen || r.destino === destino);
    if (resultado.length === 0) resultado = rutasData.slice(0, 3);

    resultado = resultado.map(calcular);

    // Ranking alternativo
    if (criterio === 'costo')            resultado.sort((a, b) => a.costo - b.costo);
    else if (criterio === 'transbordos') resultado.sort((a, b) => a.transbordos - b.transbordos);
    else                                 resultado.sort((a, b) => a.tiempo - b.tiempo);

    const div = document.getElementById('resultados');
    div.innerHTML = '<h3>Rutas encontradas:</h3>' + resultado.map((r, i) => `
        <div class="ruta-card">
            ${i === 0 ? '<span class="badge-mejor">⭐ Mejor opción</span>' : ''}
            <strong>${r.nombre}</strong><br>
            ⏱ ${r.tiempo} min &nbsp;|&nbsp; 💵 RD$${r.costo} &nbsp;|&nbsp;
            🔄 ${r.transbordos} ${r.transbordos === 1 ? 'transbordo' : 'transbordos'}<br>
            <small>${r.tramos.map(t =>
                `${t.transporte}: ${t.desde} → ${t.hasta} (${t.tiempo_min}min, RD$${t.costo})`
            ).join(' &nbsp;|&nbsp; ')}</small><br>
            <button onclick='guardarFavorito(${JSON.stringify(r)})'>❤️ Guardar favorita</button>
        </div>
    `).join('');
}

// Guarda ruta en localStorage
function guardarFavorito(ruta) {
    let favs = JSON.parse(localStorage.getItem('gt_favs') || '[]');
    if (favs.find(f => f.id === ruta.id)) return alert('Ya está en favoritos.');
    favs.push({ id: ruta.id, nombre: ruta.nombre, tiempo: ruta.tiempo, costo: ruta.costo });
    localStorage.setItem('gt_favs', JSON.stringify(favs));
    alert('✅ ¡Guardado en favoritos!');
}

// Elimina ruta de favoritos en localStorage
function eliminarFavorito(id) {
    let favs = JSON.parse(localStorage.getItem('gt_favs') || '[]');
    localStorage.setItem('gt_favs', JSON.stringify(favs.filter(f => f.id !== id)));
    renderFavoritos();
}

// Renderiza las rutas favoritas guardadas
function renderFavoritos() {
    const div = document.getElementById('favs-lista');
    if (!div) return;
    const favs = JSON.parse(localStorage.getItem('gt_favs') || '[]');
    if (favs.length === 0) {
        div.innerHTML = '<p>No tienes rutas favoritas guardadas. ¡Búscalas y guárdalas para más tarde!</p>';
        return;
    }
    div.innerHTML = favs.map(f => `
        <div class="ruta-card">
            <strong>${f.nombre}</strong><br>
            ⏱ ${f.tiempo} min &nbsp;|&nbsp; 💵 RD$${f.costo}<br>
            <button onclick="eliminarFavorito('${f.id}')">🗑️ Eliminar</button>
        </div>
    `).join('');
}

// Simula envío del formulario de contacto
function enviarContacto(e) {
    e.preventDefault();
    document.getElementById('msg-enviado').style.display = 'block';
    e.target.reset();
}

// Inicialización: carga datos y configura eventos con debounce
async function init() {
    await cargarDatos();
    renderFavoritos();

    // Exponer funciones al scope global (requerido por onclick en HTML con type="module")
    window.toggleAlerta     = toggleAlerta;
    window.calcularRuta     = calcularRuta;
    window.guardarFavorito  = guardarFavorito;
    window.eliminarFavorito = eliminarFavorito;
    window.enviarContacto   = enviarContacto;

    // Debounce 400ms en selects para no buscar en cada tecla
    const origen  = document.getElementById('origen');
    const destino = document.getElementById('destino');
    if (origen && destino) {
        const buscarDebounced = debounce(() => {
            if (origen.value && destino.value)
                document.getElementById('form-ruta').dispatchEvent(new Event('submit'));
        }, 400);
        origen.addEventListener('change', buscarDebounced);
        destino.addEventListener('change', buscarDebounced);
    }
}

document.addEventListener('DOMContentLoaded', init);