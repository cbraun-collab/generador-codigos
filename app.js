// ============================================================
// APP.JS — Generador de Códigos + Carpetas Drive · SENERCOM
// ============================================================

const SHEETS_API = 'https://sheets.googleapis.com/v4/spreadsheets';
const DRIVE_API  = 'https://www.googleapis.com/drive/v3';

let tokenClient  = null;
let accessToken  = null;

// Estado del flujo actual
let state = {
  tipo: null,             // 'O' | 'A'
  cliente: null,          // { codigo, nombre, rut, isNew }
  origPresupuesto: null,  // { codigo, nombreProyecto, driveId } — solo si adicional
  ingeniero: null,        // { iniciales, nombre }
  nombreProyecto: '',
};

// Caché local de la planilla
let cacheGeneral      = null;  // [{ codigo, nombre, rut }]
let cacheCentroCostos = null;  // [{ id, nombreProyecto, clienteCodigo, clienteNombre, responsable, fecha, anio }]

// Historial de la sesión
let todayHistory = [];

// Año en curso (robusto ante cambio de año)
const anioActual  = new Date().getFullYear();
const anioSufijo  = String(anioActual).slice(-2);   // "26" para 2026, "27" para 2027…

// ============================================================
// AUTH
// ============================================================
window.onload = () => {
  buildIngenieroPills();
  initAuth();
};

function initAuth() {
  if (!CONFIG.GOOGLE_CLIENT_ID || CONFIG.GOOGLE_CLIENT_ID.includes('TU_')) {
    toast('Falta configurar el Client ID en config.js', true); return;
  }

  // Google Identity renderiza el botón de "Continuar con Google"
  google.accounts.id.initialize({ client_id: CONFIG.GOOGLE_CLIENT_ID, callback: () => {} });
  google.accounts.id.renderButton(
    document.getElementById('gSignInBtn'),
    { theme: 'filled_blue', size: 'large', shape: 'pill', text: 'continue_with' }
  );

  // El token OAuth (con scopes de Sheets + Drive) lo pedimos aparte
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CONFIG.GOOGLE_CLIENT_ID,
    scope: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/userinfo.profile',
    ].join(' '),
    callback: async (resp) => {
      if (resp.error) { toast('No se pudo iniciar sesión.', true); return; }
      accessToken = resp.access_token;
      await onSignedIn();
    },
  });

  // El botón visible de Google solo dispara el tokenClient
  setTimeout(() => {
    document.getElementById('gSignInBtn')
      .addEventListener('click', () => tokenClient.requestAccessToken({ prompt: '' }));
  }, 300);
}

async function onSignedIn() {
  showLoading('Cargando tu perfil…');
  try {
    const r = await fetch('https://www.googleapis.com/oauth2/v3/userinfo',
      { headers: { Authorization: `Bearer ${accessToken}` } });
    const p = await r.json();
    document.getElementById('userName').textContent = p.given_name || p.name || '';
    if (p.picture) {
      const av = document.getElementById('userAvatar');
      av.src = p.picture; av.style.display = 'inline-block';
    }
  } catch(e) { /* perfil opcional */ }

  document.getElementById('signinScreen').style.display = 'none';
  document.getElementById('appRoot').style.display = 'block';
  await loadSheetData();
  hideLoading();
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('signOutBtn')?.addEventListener('click', () => {
    google.accounts.oauth2.revoke(accessToken, () => {});
    accessToken = null; location.reload();
  });
});

// ============================================================
// LOADING / TOAST
// ============================================================
function showLoading(text) {
  document.getElementById('loadingText').textContent = text || 'Cargando…';
  document.getElementById('loadingOverlay').classList.add('show');
}
function hideLoading() {
  document.getElementById('loadingOverlay').classList.remove('show');
}
function toast(msg, isErr) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show' + (isErr ? ' err' : '');
  clearTimeout(t._t);
  t._t = setTimeout(() => { t.className = 'toast' + (isErr ? ' err' : ''); }, 3400);
}

// ============================================================
// SHEETS API
// ============================================================
async function sheetsGet(range) {
  const url = `${SHEETS_API}/${CONFIG.SPREADSHEET_ID}/values/${encodeURIComponent(range)}`;
  const r = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!r.ok) throw new Error(`Sheets GET "${range}": ${r.status}`);
  return (await r.json()).values || [];
}

async function sheetsAppend(range, row) {
  const url = `${SHEETS_API}/${CONFIG.SPREADSHEET_ID}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;
  const r = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ values: [row] }),
  });
  if (!r.ok) throw new Error(`Sheets APPEND "${range}": ${r.status}`);
  return r.json();
}

async function loadSheetData() {
  try {
    const [gRows, ccRows] = await Promise.all([
      sheetsGet(CONFIG.RANGE_GENERAL_READ),
      sheetsGet(CONFIG.RANGE_CC_READ),
    ]);
    cacheGeneral      = parseGeneral(gRows);
    cacheCentroCostos = parseCentroCostos(ccRows);
  } catch(e) {
    console.error(e);
    toast('No se pudo cargar la planilla. Verifica tu conexión.', true);
  }
}

// General A2:E — col D (idx 3) = "001 ECBI", col E (idx 4) = RUT
function parseGeneral(rows) {
  const seen = new Map();
  for (const row of rows) {
    const raw = (row[3] || '').trim();
    const rut = (row[4] || '').trim();
    if (!raw) continue;
    const m = raw.match(/^(\d{2,3})\s+(.+)$/);
    if (!m) continue;
    const cod = m[1].padStart(3, '0'), nom = m[2].trim();
    if (!seen.has(cod)) seen.set(cod, { codigo: cod, nombre: nom, rut });
    else if (rut && !seen.get(cod).rut) seen.get(cod).rut = rut;
  }
  return [...seen.values()].sort((a,b) => a.codigo.localeCompare(b.codigo));
}

// CentroCostos A4:L — A=Id(0), B=NombreProyecto(1), D=Cliente(3), E=Responsable(4), F=Fecha(5), L=Año(11)
function parseCentroCostos(rows) {
  return rows
    .filter(r => r[0]?.trim())
    .map(r => {
      const raw = (r[3] || '').trim();
      const m   = raw.match(/^(\d{2,3})\s+(.+)$/);
      return {
        id: r[0].trim(),
        nombreProyecto: (r[1] || '').trim(),
        clienteCodigo:  m ? m[1].padStart(3,'0') : '',
        clienteNombre:  m ? m[2].trim() : raw,
        responsable:    (r[4] || '').trim(),
        fecha:          (r[5] || '').trim(),
        anio:           (r[11] || '').trim(),
      };
    });
}

// ============================================================
// DRIVE API
// ============================================================

/** Busca una carpeta por nombre dentro de un parent. Devuelve id o null. */
async function driveFindFolder(name, parentId) {
  const q = `name='${name.replace(/'/g,"\\'")}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`;
  const url = `${DRIVE_API}/files?q=${encodeURIComponent(q)}&fields=files(id,name)&supportsAllDrives=true&includeItemsFromAllDrives=true`;
  const r = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!r.ok) throw new Error(`Drive buscar "${name}": ${r.status}`);
  const data = await r.json();
  return data.files?.[0]?.id || null;
}

/** Crea una carpeta dentro de un parent. Devuelve id. */
async function driveCreateFolder(name, parentId) {
  const r = await fetch(`${DRIVE_API}/files?supportsAllDrives=true`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId],
    }),
  });
  if (!r.ok) {
    const err = await r.text();
    throw new Error(`Drive crear "${name}": ${r.status} ${err}`);
  }
  return (await r.json()).id;
}

/** Encuentra o crea una carpeta (idempotente). Devuelve id. */
async function driveEnsureFolder(name, parentId) {
  const existing = await driveFindFolder(name, parentId);
  if (existing) return existing;
  return driveCreateFolder(name, parentId);
}

/** URL pública de una carpeta Drive dado su id. */
function driveFolderUrl(id) {
  return `https://drive.google.com/drive/folders/${id}`;
}

// ============================================================
// FLUJO PRINCIPAL DE CREACIÓN DE CARPETAS
// ============================================================

/**
 * Asegura que exista la carpeta del año dentro de la raíz OBRAS.
 * Nombre de la carpeta: el año completo, ej "2026".
 */
async function ensureAnioFolder() {
  return driveEnsureFolder(String(anioActual), CONFIG.DRIVE_OBRAS_ROOT);
}

/**
 * Asegura que exista la carpeta del cliente dentro del año.
 * Nombre: "001 ECBI"
 */
async function ensureClienteFolder(anioFolderId, cliente) {
  const name = `${cliente.codigo} ${cliente.nombre}`;
  return driveEnsureFolder(name, anioFolderId);
}

/**
 * Crea la carpeta del presupuesto con toda su estructura interna.
 * Devuelve { rootId, estudioId, ejecucionId, adicionalId }
 */
async function crearEstructuraPresupuesto(parentId, codigoPpto) {
  // Carpeta raíz del presupuesto
  const rootId = await driveEnsureFolder(codigoPpto, parentId);

  // 01 - ESTUDIO PROYECTO con subcarpetas
  const estudioId = await driveEnsureFolder('01 - ESTUDIO PROYECTO', rootId);
  for (const sub of CONFIG.SUBCARPETAS_ESTUDIO) {
    await driveEnsureFolder(sub, estudioId);
  }

  // 02 - EJECUCIÓN PROYECTO con subcarpetas
  const ejecucionId = await driveEnsureFolder('02 - EJECUCIÓN PROYECTO', rootId);
  for (const sub of CONFIG.SUBCARPETAS_EJECUCION) {
    await driveEnsureFolder(sub, ejecucionId);
  }

  return { rootId, estudioId, ejecucionId };
}

// ============================================================
// NAVEGACIÓN DE PASOS
// ============================================================
function updateStepDots(n) {
  document.querySelectorAll('.step-dot').forEach(d => {
    const i = +d.dataset.step;
    d.classList.toggle('active', i === n);
    d.classList.toggle('done', i < n);
  });
}

function hideAllSteps() {
  ['step1','step2','step2b','step3','step4'].forEach(id => {
    document.getElementById(id).style.display = 'none';
  });
}

function goStep(n) {
  hideAllSteps();
  if (n === 1) { document.getElementById('step1').style.display = 'block'; }
  if (n === 2) {
    const id = state.tipo === 'A' ? 'step2b' : 'step2';
    document.getElementById(id).style.display = 'block';
  }
  if (n === 3) { document.getElementById('step3').style.display = 'block'; validateStep3(); }
  if (n === 4) { document.getElementById('step4').style.display = 'block'; }
  updateStepDots(n);
}

function goStepBack3() { goStep(2); }

// ============================================================
// STEP 1 — TIPO
// ============================================================
function selectTipo(tipo) {
  state.tipo = tipo;
  document.getElementById('btnOriginal').classList.toggle('selected', tipo === 'O');
  document.getElementById('btnAdicional').classList.toggle('selected', tipo === 'A');
  setTimeout(() => goStep(2), 180);
}

// ============================================================
// STEP 2a — CLIENTE (autocomplete)
// ============================================================
document.addEventListener('input', e => {
  if (e.target.id === 'clienteInput') renderClienteSugg(e.target.value);
  if (e.target.id === 'origInput')    renderOrigSugg(e.target.value);
  if (e.target.id === 'nombreProyecto') { state.nombreProyecto = e.target.value; validateStep3(); }
});
document.addEventListener('focus', e => {
  if (e.target.id === 'clienteInput') renderClienteSugg(e.target.value);
  if (e.target.id === 'origInput')    renderOrigSugg(e.target.value);
}, true);
document.addEventListener('click', e => {
  if (!e.target.closest('.autocomplete-wrap'))
    document.querySelectorAll('.ac-list').forEach(l => l.classList.remove('show'));
});

function renderClienteSugg(q) {
  const list = document.getElementById('clienteList');
  const query = q.trim().toLowerCase();
  if (!cacheGeneral) { list.innerHTML = '<div class="ac-empty">Cargando…</div>'; list.classList.add('show'); return; }

  let matches = query.length === 0
    ? cacheGeneral.slice(-8).reverse()
    : cacheGeneral.filter(c =>
        c.nombre.toLowerCase().includes(query) ||
        c.codigo.includes(query) ||
        (c.rut && c.rut.replace(/\./g,'').toLowerCase().includes(query.replace(/\./g,'')))
      ).slice(0, 8);

  let html = matches.length
    ? matches.map(c => `
        <div class="ac-item" onclick="pickCliente('${esc(c.codigo)}','${esc(c.nombre)}','${esc(c.rut)}',false)">
          <span>${escHtml(c.nombre)}</span>
          <span class="ac-code">${c.codigo}</span>
        </div>`).join('')
    : `<div class="ac-empty">No encontrado.</div>`;

  if (query.length >= 2)
    html += `<div class="ac-new" onclick="crearNuevoCliente('${esc(q)}')">＋ Crear cliente: "${escHtml(q)}"</div>`;

  list.innerHTML = html;
  list.classList.add('show');
}

function pickCliente(codigo, nombre, rut, isNew) {
  state.cliente = { codigo, nombre, rut, isNew: !!isNew };
  document.getElementById('clienteInput').value = `${codigo} ${nombre}`;
  document.getElementById('clienteList').classList.remove('show');
  document.getElementById('clienteHint').innerHTML = isNew
    ? `<span class="badge badge-warn">⚠ Cliente nuevo · código ${codigo} pendiente validación</span>`
    : `Código existente: <strong>${codigo}</strong>`;
  document.getElementById('step2Next').disabled = false;
}

function crearNuevoCliente(nombreRaw) {
  const nombre = nombreRaw.trim();
  if (!cacheGeneral) { toast('Aún cargando datos…', true); return; }
  const max = cacheGeneral.reduce((m, c) => Math.max(m, +c.codigo || 0), 0);
  pickCliente(String(max + 1).padStart(3,'0'), nombre, '', true);
}

// ============================================================
// STEP 2b — PRESUPUESTO ORIGINAL (adicionales)
// ============================================================
function renderOrigSugg(q) {
  const list = document.getElementById('origList');
  const query = q.trim().toLowerCase();
  if (!cacheCentroCostos) { list.innerHTML = '<div class="ac-empty">Cargando…</div>'; list.classList.add('show'); return; }

  const originales = cacheCentroCostos.filter(p => /-O\d{2}-/.test(p.id));
  let matches = query.length === 0
    ? originales.slice(-8).reverse()
    : originales.filter(p =>
        p.id.toLowerCase().includes(query) ||
        p.nombreProyecto.toLowerCase().includes(query) ||
        p.clienteNombre.toLowerCase().includes(query)
      ).slice(0, 8);

  list.innerHTML = matches.length
    ? matches.map(p => `
        <div class="ac-item" onclick="pickOrig('${esc(p.id)}','${esc(p.nombreProyecto)}')">
          <span>${escHtml(p.nombreProyecto || '(sin nombre)')}</span>
          <span class="ac-code">${escHtml(p.id)}</span>
        </div>`).join('')
    : '<div class="ac-empty">No se encontró. Verifica el código.</div>';

  list.classList.add('show');
}

function pickOrig(codigo, nombreProyecto) {
  state.origPresupuesto = { codigo, nombreProyecto };
  document.getElementById('origInput').value = codigo;
  document.getElementById('origList').classList.remove('show');
  document.getElementById('origHint').innerHTML = `Adicional de: <strong>${escHtml(nombreProyecto || codigo)}</strong>`;
  document.getElementById('step2bNext').disabled = false;
  // Pre-poblar cliente desde el código original
  const m = codigo.match(/^(\d{3})-/);
  if (m && cacheGeneral) {
    const cli = cacheGeneral.find(c => c.codigo === m[1]);
    if (cli) state.cliente = { codigo: cli.codigo, nombre: cli.nombre, rut: cli.rut, isNew: false };
  }
}

// ============================================================
// STEP 3 — INGENIERO + NOMBRE
// ============================================================
function buildIngenieroPills() {
  document.getElementById('ingenieroPills').innerHTML =
    CONFIG.INGENIEROS.map(ing => `
      <button type="button" class="pill" data-ini="${ing.iniciales}" onclick="selectIngeniero('${ing.iniciales}')">
        ${ing.iniciales} · ${ing.nombre.split(' ')[0]}
      </button>`).join('');
}

function selectIngeniero(ini) {
  state.ingeniero = CONFIG.INGENIEROS.find(i => i.iniciales === ini);
  document.querySelectorAll('#ingenieroPills .pill').forEach(p =>
    p.classList.toggle('selected', p.dataset.ini === ini));
  validateStep3();
}

function validateStep3() {
  document.getElementById('step3Next').disabled =
    !(state.ingeniero && state.nombreProyecto.trim().length > 2);
}

// ============================================================
// GENERACIÓN PRINCIPAL
// ============================================================
async function ejecutarGeneracion() {
  showLoading('Calculando correlativo…');
  try {
    // 1) Calcular código
    const codigoFinal = calcularCodigo();

    // 2) Guardar en Sheets
    showLoading('Guardando en planilla…');
    await guardarEnSheets(codigoFinal);

    // 3) Crear carpetas en Drive (con feedback visual)
    goStep(4);
    renderResultBase(codigoFinal);
    hideLoading();

    await crearCarpetasDrive(codigoFinal);

    todayHistory.unshift({
      codigo: codigoFinal,
      proyecto: state.nombreProyecto,
      hora: new Date().toLocaleTimeString('es-CL', { hour:'2-digit', minute:'2-digit' }),
    });

    toast('Código y carpetas creados correctamente ✓');
  } catch(e) {
    console.error(e);
    hideLoading();
    toast('Error: ' + e.message, true);
  }
}

function calcularCodigo() {
  if (state.tipo === 'O') {
    const corr = nextCorrelativoOriginal(state.cliente.codigo, anioActual);
    return `${state.cliente.codigo}-${corr}-O${anioSufijo}-${state.ingeniero.iniciales}`;
  } else {
    const prefijo = state.origPresupuesto.codigo.split('-').slice(0,2).join('-');
    const corr    = nextCorrelativoAdicional(state.origPresupuesto.codigo);
    return `${prefijo}-A${anioSufijo}-${state.ingeniero.iniciales}-${corr}`;
  }
}

function nextCorrelativoOriginal(clienteCod, anio) {
  const suf = String(anio).slice(-2);
  let max = 0;
  for (const p of (cacheCentroCostos || [])) {
    const m = p.id.match(new RegExp(`^${clienteCod}-(\\d{3})-O${suf}-`));
    if (m) max = Math.max(max, +m[1]);
  }
  return String(max + 1).padStart(3, '0');
}

function nextCorrelativoAdicional(codigoOriginal) {
  const base = codigoOriginal.split('-').slice(0,2).join('-');
  let max = 0;
  for (const p of (cacheCentroCostos || [])) {
    const m = p.id.match(new RegExp(`^${base}-A\\d{2}-[A-Z]{2,3}-(\\d{3})$`));
    if (m) max = Math.max(max, +m[1]);
  }
  return String(max + 1).padStart(3, '0');
}

async function guardarEnSheets(codigoFinal) {
  if (state.cliente?.isNew) {
    await sheetsAppend(CONFIG.SHEET_GENERAL, [
      '','','',
      `${state.cliente.codigo} ${state.cliente.nombre}`,
      state.cliente.rut || '', '', '', '', '', '', '', '', '',
      `Pendiente validación ${CONFIG.VALIDADOR}`, '', '',
    ]);
    cacheGeneral.push({ codigo: state.cliente.codigo, nombre: state.cliente.nombre, rut: '' });
  }

  const fecha = formatFecha(new Date());
  await sheetsAppend(CONFIG.SHEET_CENTRO_COSTOS, [
    codigoFinal,
    state.nombreProyecto,
    `${codigoFinal} ${state.nombreProyecto}`,
    `${state.cliente.codigo} ${state.cliente.nombre}`,
    state.ingeniero.nombre,
    fecha,
    `Pendiente validación ${CONFIG.VALIDADOR}`,
    '','','',
    state.ingeniero.nombre,
    anioActual,
  ]);

  cacheCentroCostos.push({
    id: codigoFinal, nombreProyecto: state.nombreProyecto,
    clienteCodigo: state.cliente.codigo, clienteNombre: state.cliente.nombre,
    responsable: state.ingeniero.nombre, fecha, anio: String(anioActual),
  });
}

// ============================================================
// DRIVE: CREACIÓN DE CARPETAS CON FEEDBACK VISUAL
// ============================================================
let driveRows = [];   // lista de { label, status, id }

function addDriveRow(label) {
  const idx = driveRows.length;
  driveRows.push({ label, status: 'spin', id: null });
  renderDriveProgress();
  return idx;
}
function updateDriveRow(idx, status, id) {
  driveRows[idx].status = status;
  driveRows[idx].id = id;
  renderDriveProgress();
}
function renderDriveProgress() {
  document.getElementById('driveProgress').innerHTML = driveRows.map(r => `
    <div class="dp-row">
      <span class="dp-icon">${r.status === 'ok' ? '📁' : r.status === 'err' ? '❌' : '⏳'}</span>
      <span class="dp-label">${escHtml(r.label)}</span>
      <span class="dp-status ${r.status}">${r.status === 'ok' ? 'Creada' : r.status === 'err' ? 'Error' : 'Creando…'}</span>
      ${r.id ? `<a class="dp-link" href="${driveFolderUrl(r.id)}" target="_blank">Abrir ↗</a>` : ''}
    </div>`).join('');
}

async function crearCarpetasDrive(codigoFinal) {
  driveRows = [];

  try {
    // ── Carpeta del año ────────────────────────────────────────
    const idxAnio = addDriveRow(`📅 ${anioActual}`);
    const anioId  = await driveEnsureFolder(String(anioActual), CONFIG.DRIVE_OBRAS_ROOT);
    updateDriveRow(idxAnio, 'ok', anioId);

    // ── Carpeta del cliente ────────────────────────────────────
    const nombreCliente = `${state.cliente.codigo} ${state.cliente.nombre}`;
    const idxCli  = addDriveRow(`🏢 ${nombreCliente}`);
    const cliId   = await driveEnsureFolder(nombreCliente, anioId);
    updateDriveRow(idxCli, 'ok', cliId);

    if (state.tipo === 'O') {
      // ── Original: carpeta del presupuesto + estructura completa
      await crearEstructuraCompleta(cliId, codigoFinal);
    } else {
      // ── Adicional: buscar carpeta del original → Ejecución → 04 ADICIONALES
      const codOrig      = state.origPresupuesto.codigo;
      const idxOrigFold  = addDriveRow(`🔗 Ubicando original: ${codOrig}`);
      const origRootId   = await driveEnsureFolder(codOrig, cliId);
      updateDriveRow(idxOrigFold, 'ok', origRootId);

      const idxEjec = addDriveRow('📂 02 - EJECUCIÓN PROYECTO');
      const ejecId  = await driveEnsureFolder('02 - EJECUCIÓN PROYECTO', origRootId);
      updateDriveRow(idxEjec, 'ok', ejecId);

      const idxAdics = addDriveRow('📂 04 - ADICIONALES');
      const adicsId  = await driveEnsureFolder('04 - ADICIONALES', ejecId);
      updateDriveRow(idxAdics, 'ok', adicsId);

      // Carpeta del adicional con su propia estructura Estudio + Ejecución
      await crearEstructuraCompleta(adicsId, codigoFinal);
    }
  } catch(e) {
    console.error('Error Drive:', e);
    toast('Código guardado, pero hubo un error creando algunas carpetas en Drive.', true);
  }
}

async function crearEstructuraCompleta(parentId, codigoPpto) {
  // Carpeta raíz del presupuesto
  const idxRoot = addDriveRow(`📁 ${codigoPpto}`);
  const rootId  = await driveEnsureFolder(codigoPpto, parentId);
  updateDriveRow(idxRoot, 'ok', rootId);

  // 01 - ESTUDIO PROYECTO
  const idxEst = addDriveRow('📂 01 - ESTUDIO PROYECTO');
  const estId  = await driveEnsureFolder('01 - ESTUDIO PROYECTO', rootId);
  updateDriveRow(idxEst, 'ok', estId);
  for (const sub of CONFIG.SUBCARPETAS_ESTUDIO) {
    const idx = addDriveRow(`   └ ${sub}`);
    const id  = await driveEnsureFolder(sub, estId);
    updateDriveRow(idx, 'ok', id);
  }

  // 02 - EJECUCIÓN PROYECTO
  const idxEjec = addDriveRow('📂 02 - EJECUCIÓN PROYECTO');
  const ejecId  = await driveEnsureFolder('02 - EJECUCIÓN PROYECTO', rootId);
  updateDriveRow(idxEjec, 'ok', ejecId);
  for (const sub of CONFIG.SUBCARPETAS_EJECUCION) {
    const idx = addDriveRow(`   └ ${sub}`);
    const id  = await driveEnsureFolder(sub, ejecId);
    updateDriveRow(idx, 'ok', id);
  }
}

// ============================================================
// RESULTADO VISUAL
// ============================================================
function renderResultBase(codigo) {
  document.getElementById('resultCodeText').textContent = codigo;

  const isNuevo = state.cliente?.isNew;
  document.getElementById('newClientBadgeWrap').innerHTML = isNuevo
    ? `<div style="margin-bottom:10px;"><span class="badge badge-warn">⚠ Cliente nuevo · pendiente validación de ${CONFIG.VALIDADOR}</span></div>`
    : `<div style="margin-bottom:10px;"><span class="badge badge-good">✓ Guardado en planilla · pendiente validación CB</span></div>`;

  const bd = state.tipo === 'O'
    ? [
        ['Cliente', `${state.cliente.codigo} · ${state.cliente.nombre}`],
        ['Tipo', `Original (O${anioSufijo})`],
        ['Ingeniero', `${state.ingeniero.iniciales} · ${state.ingeniero.nombre}`],
        ['Año', anioActual],
      ]
    : [
        ['Presupuesto original', state.origPresupuesto.codigo],
        ['Cliente', `${state.cliente?.codigo} · ${state.cliente?.nombre}`],
        ['Tipo', `Adicional (A${anioSufijo})`],
        ['Ingeniero', `${state.ingeniero.iniciales} · ${state.ingeniero.nombre}`],
      ];

  document.getElementById('breakdownWrap').innerHTML =
    bd.map(([k,v]) => `<div class="bd-row"><span class="k">${escHtml(k)}</span><span class="v">${escHtml(String(v))}</span></div>`).join('');
}

function copyCode() {
  const text = document.getElementById('resultCodeText').textContent;
  navigator.clipboard.writeText(text)
    .then(() => toast('Código copiado ✓'))
    .catch(() => toast('Selecciónalo manualmente para copiarlo.', true));
}

function resetFlow() {
  state = { tipo:null, cliente:null, origPresupuesto:null, ingeniero:null, nombreProyecto:'' };
  driveRows = [];
  ['clienteInput','origInput','nombreProyecto'].forEach(id => { const el = document.getElementById(id); if(el) el.value=''; });
  ['clienteHint','origHint'].forEach(id => { const el = document.getElementById(id); if(el) el.innerHTML=''; });
  ['btnOriginal','btnAdicional'].forEach(id => document.getElementById(id)?.classList.remove('selected'));
  document.querySelectorAll('#ingenieroPills .pill').forEach(p => p.classList.remove('selected'));
  document.getElementById('step2Next').disabled  = true;
  document.getElementById('step2bNext').disabled = true;
  document.getElementById('step3Next').disabled  = true;
  goStep(1);
}

// ============================================================
// HISTORIAL
// ============================================================
function openHistory() {
  const list = document.getElementById('historyList');
  list.innerHTML = todayHistory.length
    ? todayHistory.map(h => `
        <div class="hist-item">
          <div><div class="code">${escHtml(h.codigo)}</div><div class="meta">${escHtml(h.proyecto)}</div></div>
          <div class="meta">${h.hora}</div>
        </div>`).join('')
    : '<div class="ac-empty">Aún no has generado códigos en esta sesión.</div>';
  document.getElementById('historyModal').classList.add('show');
}
function closeHistory() { document.getElementById('historyModal').classList.remove('show'); }

// ============================================================
// UTILS
// ============================================================
function formatFecha(d) { return `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`; }
function escHtml(s) {
  return String(s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function esc(s) { return String(s||'').replace(/'/g,"\\'"); }
