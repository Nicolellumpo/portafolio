/* ────────────────────────────────────────────────────────
   MODELO DE DATOS
   Cada alumno:
   { id, nombre, legajo, carrera, anio, nota, estado, fechaAlta }
─────────────────────────────────────────────────────────── */

const LS_KEY = 'sga_alumnos_v1';

// ── Persistencia ──────────────────────────────────────────
function cargar() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; }
  catch { return []; }
}

function guardar(lista) {
  localStorage.setItem(LS_KEY, JSON.stringify(lista));
}

// ── Estado de la app ──────────────────────────────────────
let alumnos   = cargar();
let filtroActual  = 'todos';
let sortCol   = 'nombre';
let sortAsc   = true;
let editandoId    = null;
let eliminandoId  = null;

// ── Utilidades ────────────────────────────────────────────
function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}

function colorAvatar(nombre) {
  const colores = ['#2563eb','#7c3aed','#db2777','#ea580c','#16a34a','#0891b2'];
  let h = 0;
  for (let c of nombre) h = (h * 31 + c.charCodeAt(0)) % colores.length;
  return colores[h];
}

function iniciales(nombre) {
  return nombre.trim().split(' ').slice(0,2).map(w => w[0]?.toUpperCase()).join('');
}

function badgeEstado(estado) {
  const map = {
    activo:   ['badge-green',  'Activo'],
    inactivo: ['badge-gray',   'Inactivo'],
    egresado: ['badge-blue',   'Egresado'],
    beca:     ['badge-amber',  'Becado'],
  };
  const [cls, txt] = map[estado] || ['badge-gray', estado];
  return `<span class="badge ${cls}">${txt}</span>`;
}

function badgeNota(nota) {
  const n = parseFloat(nota);
  if (n >= 8)   return `<span class="badge badge-green">${n.toFixed(1)}</span>`;
  if (n >= 6)   return `<span class="badge badge-amber">${n.toFixed(1)}</span>`;
  return             `<span class="badge badge-red">${n.toFixed(1)}</span>`;
}

// ── Validación ────────────────────────────────────────────
function validar() {
  let ok = true;

  const campos = [
    { id: 'inp-nombre',  err: 'err-nombre',  check: v => v.trim().length >= 3 },
    { id: 'inp-legajo',  err: 'err-legajo',  check: v => v.trim().length >= 3 },
    { id: 'inp-carrera', err: 'err-carrera', check: v => v !== '' },
    { id: 'inp-anio',    err: 'err-anio',    check: v => v !== '' },
    { id: 'inp-nota',    err: 'err-nota',    check: v => v !== '' && +v >= 0 && +v <= 10 },
  ];

  campos.forEach(({ id, err, check }) => {
    const el   = document.getElementById(id);
    const errEl = document.getElementById(err);
    if (!check(el.value)) {
      el.classList.add('error');
      errEl.classList.add('show');
      ok = false;
    } else {
      el.classList.remove('error');
      errEl.classList.remove('show');
    }
  });

  // Legajo duplicado
  if (ok) {
    const leg = document.getElementById('inp-legajo').value.trim();
    const dup = alumnos.find(a => a.legajo === leg && a.id !== editandoId);
    if (dup) {
      document.getElementById('inp-legajo').classList.add('error');
      document.getElementById('err-legajo').textContent = 'Ese legajo ya existe.';
      document.getElementById('err-legajo').classList.add('show');
      ok = false;
    } else {
      document.getElementById('err-legajo').textContent = 'Ingresá un legajo válido.';
    }
  }

  return ok;
}

// ── CRUD ──────────────────────────────────────────────────
document.getElementById('form-alumno').addEventListener('submit', e => {
  e.preventDefault();
  if (!validar()) return;

  const alumno = {
    id:       editandoId || genId(),
    nombre:   document.getElementById('inp-nombre').value.trim(),
    legajo:   document.getElementById('inp-legajo').value.trim(),
    carrera:  document.getElementById('inp-carrera').value,
    anio:     parseInt(document.getElementById('inp-anio').value),
    nota:     parseFloat(document.getElementById('inp-nota').value),
    estado:   document.getElementById('inp-estado').value,
    fechaAlta: editandoId
      ? alumnos.find(a => a.id === editandoId)?.fechaAlta
      : new Date().toLocaleDateString('es-AR'),
  };

  if (editandoId) {
    alumnos = alumnos.map(a => a.id === editandoId ? alumno : a);
    toast('Alumno actualizado correctamente.', 'success');
    cancelarEdicion();
  } else {
    alumnos.push(alumno);
    toast('Alumno agregado correctamente.', 'success');
  }

  guardar(alumnos);
  limpiarForm();
  renderTabla();
  renderStats();
});

function limpiarForm() {
  ['inp-nombre','inp-legajo','inp-carrera','inp-anio','inp-nota'].forEach(id => {
    document.getElementById(id).value = '';
    document.getElementById(id).classList.remove('error');
  });
  document.getElementById('inp-estado').value = 'activo';
  document.querySelectorAll('.error-msg').forEach(el => el.classList.remove('show'));
}

function editarAlumno(id) {
  const a = alumnos.find(x => x.id === id);
  if (!a) return;
  editandoId = id;

  document.getElementById('inp-nombre').value  = a.nombre;
  document.getElementById('inp-legajo').value  = a.legajo;
  document.getElementById('inp-carrera').value = a.carrera;
  document.getElementById('inp-anio').value    = a.anio;
  document.getElementById('inp-nota').value    = a.nota;
  document.getElementById('inp-estado').value  = a.estado;

  document.getElementById('form-title').textContent = 'Editar Alumno';
  document.getElementById('btn-submit').textContent = '💾 Guardar cambios';
  document.getElementById('btn-cancelar').style.display = 'inline-flex';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function cancelarEdicion() {
  editandoId = null;
  limpiarForm();
  document.getElementById('form-title').textContent = 'Nuevo Alumno';
  document.getElementById('btn-submit').textContent = '➕ Agregar alumno';
  document.getElementById('btn-cancelar').style.display = 'none';
}

function pedirEliminar(id) {
  eliminandoId = id;
  const a = alumnos.find(x => x.id === id);
  document.getElementById('modal-name').textContent = a?.nombre || '';
  document.getElementById('modal-delete').classList.add('open');
}

function cerrarModal() {
  eliminandoId = null;
  document.getElementById('modal-delete').classList.remove('open');
}

function confirmarEliminar() {
  alumnos = alumnos.filter(a => a.id !== eliminandoId);
  guardar(alumnos);
  cerrarModal();
  renderTabla();
  renderStats();
  toast('Alumno eliminado.', 'error');
}

// ── Filtros y ordenamiento ────────────────────────────────
function setFiltro(btn) {
  filtroActual = btn.dataset.f;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderTabla();
}

function ordenarPor(col) {
  if (sortCol === col) sortAsc = !sortAsc;
  else { sortCol = col; sortAsc = true; }
  // Limpiar iconos
  document.querySelectorAll('.sort-icon').forEach(el => {
    el.textContent = '↕';
    el.closest('th')?.classList.remove('sorted');
  });
  const icon = document.getElementById('sort-' + col);
  if (icon) {
    icon.textContent = sortAsc ? '↑' : '↓';
    icon.closest('th')?.classList.add('sorted');
  }
  renderTabla();
}

// ── Render tabla ──────────────────────────────────────────
function renderTabla() {
  const buscar = document.getElementById('inp-buscar').value.toLowerCase().trim();

  let lista = alumnos.filter(a => {
    const matchFiltro = filtroActual === 'todos' || a.estado === filtroActual;
    const matchBuscar = !buscar ||
      a.nombre.toLowerCase().includes(buscar) ||
      a.legajo.toLowerCase().includes(buscar);
    return matchFiltro && matchBuscar;
  });

  // Ordenar
  lista.sort((a, b) => {
    let va = a[sortCol], vb = b[sortCol];
    if (typeof va === 'string') va = va.toLowerCase();
    if (typeof vb === 'string') vb = vb.toLowerCase();
    if (va < vb) return sortAsc ? -1 : 1;
    if (va > vb) return sortAsc ?  1 : -1;
    return 0;
  });

  const tbody = document.getElementById('tabla-body');
  const empty = document.getElementById('empty-state');
  const count = document.getElementById('tabla-count');

  if (lista.length === 0) {
    tbody.innerHTML = '';
    empty.style.display = 'block';
    count.textContent = '';
    return;
  }

  empty.style.display = 'none';
  count.textContent = `Mostrando ${lista.length} de ${alumnos.length} alumnos`;

  tbody.innerHTML = lista.map(a => `
    <tr>
      <td>
        <div class="td-name">
          <div class="avatar" style="background:${colorAvatar(a.nombre)}">${iniciales(a.nombre)}</div>
          <div>
            <div style="font-weight:600;font-size:.85rem">${a.nombre}</div>
            <div style="font-size:.72rem;color:var(--muted);font-family:var(--mono)">${a.fechaAlta}</div>
          </div>
        </div>
      </td>
      <td><span style="font-family:var(--mono);font-size:.8rem">${a.legajo}</span></td>
      <td style="font-size:.82rem;max-width:160px">${a.carrera}</td>
      <td style="text-align:center">${a.anio}°</td>
      <td>${badgeNota(a.nota)}</td>
      <td>${badgeEstado(a.estado)}</td>
      <td>
        <div class="td-actions">
          <button class="btn btn-success" onclick="editarAlumno('${a.id}')">✏️ Editar</button>
          <button class="btn btn-danger"  onclick="pedirEliminar('${a.id}')">🗑 Eliminar</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// ── Render stats ──────────────────────────────────────────
function renderStats() {
  const total = alumnos.length;
  const activos   = alumnos.filter(a => a.estado === 'activo').length;
  const egresados = alumnos.filter(a => a.estado === 'egresado').length;
  const promedio  = total
    ? (alumnos.reduce((s, a) => s + a.nota, 0) / total).toFixed(1)
    : '—';

  document.getElementById('st-total').textContent    = total;
  document.getElementById('st-activos').textContent  = activos;
  document.getElementById('st-egresados').textContent = egresados;
  document.getElementById('st-promedio').textContent  = promedio;

  // Stats por carrera
  const porCarrera = {};
  alumnos.forEach(a => {
    if (!porCarrera[a.carrera]) porCarrera[a.carrera] = { count: 0, suma: 0 };
    porCarrera[a.carrera].count++;
    porCarrera[a.carrera].suma += a.nota;
  });

  const div = document.getElementById('stats-carrera');
  if (!Object.keys(porCarrera).length) {
    div.innerHTML = '<p style="font-size:.8rem;color:var(--muted)">Sin datos aún.</p>';
    return;
  }

  div.innerHTML = Object.entries(porCarrera).map(([car, d]) => {
    const prom = (d.suma / d.count).toFixed(1);
    const pct  = Math.min((d.count / total) * 100, 100).toFixed(0);
    const color = prom >= 8 ? '#16a34a' : prom >= 6 ? '#d97706' : '#dc2626';
    const shortName = car.replace('Ingeniería en ','Ing. ').replace('Licenciatura en ','Lic. ');
    return `
      <div class="progress-wrap">
        <div class="progress-label">
          <span style="font-size:.72rem;color:var(--text)">${shortName}</span>
          <span style="font-family:var(--mono)">${d.count} · ⌀${prom}</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" style="width:${pct}%;background:${color}"></div>
        </div>
      </div>`;
  }).join('');
}

// ── Exportar CSV ──────────────────────────────────────────
function exportarCSV() {
  if (!alumnos.length) { toast('No hay alumnos para exportar.', 'error'); return; }
  const header = 'ID,Nombre,Legajo,Carrera,Año,Promedio,Estado,Fecha Alta';
  const rows   = alumnos.map(a =>
    [a.id, a.nombre, a.legajo, a.carrera, a.anio, a.nota, a.estado, a.fechaAlta].join(',')
  );
  const csv  = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const link = Object.assign(document.createElement('a'), {
    href: url, download: `alumnos_${Date.now()}.csv`
  });
  link.click();
  URL.revokeObjectURL(url);
  toast('CSV exportado correctamente.', 'success');
}

// ── Toast ─────────────────────────────────────────────────
function toast(msg, tipo = 'success') {
  const el = document.createElement('div');
  el.className = `toast ${tipo}`;
  el.innerHTML = (tipo === 'success' ? '✅' : '❌') + ' ' + msg;
  document.getElementById('toast-container').appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

// ── Cerrar modal al click en overlay ─────────────────────
document.getElementById('modal-delete').addEventListener('click', e => {
  if (e.target === e.currentTarget) cerrarModal();
});

// ── Init ──────────────────────────────────────────────────
renderTabla();
renderStats();

// Cargar datos de demo si está vacío
if (!alumnos.length) {
  const demo = [
    { id: genId(), nombre: 'Nicole Llumpo',     legajo: '2022001', carrera: 'Ingeniería en Sistemas',    anio: 3, nota: 8.2, estado: 'activo',   fechaAlta: '01/03/2022' },
    { id: genId(), nombre: 'Valentina Torres',   legajo: '2021045', carrera: 'Ingeniería Industrial',     anio: 4, nota: 7.5, estado: 'beca',      fechaAlta: '01/03/2021' },
    { id: genId(), nombre: 'Facundo Ramírez',    legajo: '2020012', carrera: 'Ingeniería en Sistemas',    anio: 5, nota: 6.1, estado: 'activo',    fechaAlta: '01/03/2020' },
    { id: genId(), nombre: 'Sofía Medina',       legajo: '2019033', carrera: 'Ingeniería Civil',          anio: 5, nota: 9.0, estado: 'egresado',  fechaAlta: '01/03/2019' },
    { id: genId(), nombre: 'Lucas Fernández',    legajo: '2023007', carrera: 'Ingeniería Electrónica',    anio: 2, nota: 5.4, estado: 'inactivo',  fechaAlta: '01/03/2023' },
    { id: genId(), nombre: 'Camila Sosa',        legajo: '2022089', carrera: 'Licenciatura en Administración', anio: 3, nota: 7.8, estado: 'activo', fechaAlta: '01/03/2022' },
  ];
  alumnos = demo;
  guardar(alumnos);
  renderTabla();
  renderStats();
}
