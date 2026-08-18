// ============================================================
// APP.JS — Generador de Códigos SENERCOM
// ============================================================
const SHEETS_API = 'https://sheets.googleapis.com/v4/spreadsheets';
const DRIVE_API  = 'https://www.googleapis.com/drive/v3';

let tokenClient = null;
let accessToken = null;

let state = {
  tipo: null,
  cliente: null,
  origPresupuesto: null,
  ingeniero: null,
  nombreProyecto: '',
  fin: { materiales:0, manoObra:0, gg:0, co:0, utilidad:0, costoNeto:0, ggNeto:0 },
};

let cacheGeneral = null;
let cacheCentroCostos = null;
let todayHistory = [];
let driveRows = [];

const anioActual = new Date().getFullYear();
const anioSufijo = String(anioActual).slice(-2);

// ============================================================
// AUTH
// ============================================================
window.onload = () => { buildIngenieroPills(); initAuth(); };

function initAuth() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CONFIG.GOOGLE_CLIENT_ID,
    scope: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/userinfo.profile',
    ].join(' '),
    callback: async (resp) => {
      if (resp.error) { toast('Error al iniciar sesión: ' + resp.error, true); return; }
      accessToken = resp.access_token;
      await onSignedIn();
    },
  });

  document.getElementById('gSignInBtn').innerHTML = `
    <button id="btnEntrar" style="display:inline-flex;align-items:center;gap:12px;
      background:#fff;border:1.5px solid #DDE3E2;border-radius:999px;padding:13px 28px;
      cursor:pointer;font-family:'Montserrat',sans-serif;font-size:15px;font-weight:600;
      color:#1A1A1A;box-shadow:0 2px 8px rgba(0,0,0,0.10);">
      <svg width="20" height="20" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
      </svg>
      Continuar con Google
    </button>`;

  document.getElementById('btnEntrar').addEventListener('click', () =>
    tokenClient.requestAccessToken({ prompt: 'consent' }));
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
  } catch(e) {}
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
function showLoading(t) {
  document.getElementById('loadingText').textContent = t || 'Cargando…';
  document.getElementById('loadingOverlay').classList.add('show');
}
function hideLoading() { document.getElementById('loadingOverlay').classList.remove('show'); }
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
  if (!r.ok) throw new Error(`Sheets APPEND: ${r.status}`);
  return r.json();
}

async function sheetsBatchUpdate(requests) {
  const url = `${SHEETS_API}/${CONFIG.SPREADSHEET_ID}:batchUpdate`;
  const r = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ requests }),
  });
  if (!r.ok) throw new Error(`Sheets batchUpdate: ${r.status}`);
  return r.json();
}

async function sheetsGetSheetId(sheetName) {
  const url = `${SHEETS_API}/${CONFIG.SPREADSHEET_ID}?fields=sheets.properties`;
  const r = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  const data = await r.json();
  const sheet = data.sheets?.find(s => s.properties.title === sheetName);
  return sheet?.properties?.sheetId ?? null;
}

async function loadSheetData() {
  try {
    const [gRows, ccRows] = await Promise.all([
      sheetsGet(CONFIG.RANGE_GENERAL_READ),
      sheetsGet(CONFIG.RANGE_CC_READ),
    ]);
    cacheGeneral = parseGeneral(gRows);
    cacheCentroCostos = parseCentroCostos(ccRows);
  } catch(e) {
    console.error(e);
    toast('No se pudo cargar la planilla: ' + e.message, true);
  }
}

function parseGeneral(rows) {
  const seen = new Map();
  for (const row of rows) {
    const raw = (row[3] || '').trim();
    const rut = (row[4] || '').trim();
    if (!raw) continue;
    const m = raw.match(/^(\d{2,3})\s+(.+)$/);
    if (!m) continue;
    const cod = m[1].padStart(3,'0'), nom = m[2].trim();
    if (!seen.has(cod)) seen.set(cod, { codigo:cod, nombre:nom, rut });
    else if (rut && !seen.get(cod).rut) seen.get(cod).rut = rut;
  }
  return [...seen.values()].sort((a,b) => a.codigo.localeCompare(b.codigo));
}

function parseCentroCostos(rows) {
  return rows.filter(r => r[0]?.trim()).map(r => ({
    id: r[0].trim(),
    nombreProyecto: (r[1] || '').trim(),
    clienteCodigo: (() => { const m = (r[3]||'').match(/^(\d{2,3})\s/); return m ? m[1].padStart(3,'0') : ''; })(),
    clienteNombre: (r[3] || '').trim(),
    responsable: (r[4] || '').trim(),
    fecha: (r[5] || '').trim(),
    anio: (r[11] || '').trim(),
  }));
}

// ============================================================
// DRIVE API
// ============================================================
async function driveFindFolder(name, parentId) {
  const q = `name='${name.replace(/'/g,"\\'")}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`;
  const r = await fetch(`${DRIVE_API}/files?q=${encodeURIComponent(q)}&fields=files(id)&supportsAllDrives=true&includeItemsFromAllDrives=true`,
    { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!r.ok) throw new Error(`Drive buscar "${name}": ${r.status}`);
  return (await r.json()).files?.[0]?.id || null;
}

async function driveCreateFolder(name, parentId) {
  const r = await fetch(`${DRIVE_API}/files?supportsAllDrives=true`, {
    method:'POST',
    headers:{ Authorization:`Bearer ${accessToken}`, 'Content-Type':'application/json' },
    body: JSON.stringify({ name, mimeType:'application/vnd.google-apps.folder', parents:[parentId] }),
  });
  if (!r.ok) throw new Error(`Drive crear "${name}": ${r.status}`);
  return (await r.json()).id;
}

async function driveEnsureFolder(name, parentId) {
  return (await driveFindFolder(name, parentId)) || (await driveCreateFolder(name, parentId));
}

function driveFolderUrl(id) { return `https://drive.google.com/drive/folders/${id}`; }

// ============================================================
// NAVEGACIÓN
// ============================================================
function updateDots(n) {
  document.querySelectorAll('.step-dot').forEach(d => {
    const i = +d.dataset.step;
    d.classList.toggle('active', i===n);
    d.classList.toggle('done', i<n);
  });
}

function hideAll() {
  ['step1','step2','step2b','step3','step4','step5'].forEach(id =>
    document.getElementById(id).style.display = 'none');
}

function goStep(n) {
  hideAll();
  if (n===1) document.getElementById('step1').style.display='block';
  if (n===2) document.getElementById(state.tipo==='A'?'step2b':'step2').style.display='block';
  if (n===3) { document.getElementById('step3').style.display='block'; validateStep3(); }
  if (n===4) { document.getElementById('step4').style.display='block'; recalcFin(); }
  if (n===5) document.getElementById('step5').style.display='block';
  updateDots(n);
}

function goStepBack3() { goStep(2); }

// ============================================================
// PASO 1
// ============================================================
function selectTipo(tipo) {
  state.tipo = tipo;
  document.getElementById('btnOriginal').classList.toggle('selected', tipo==='O');
  document.getElementById('btnAdicional').classList.toggle('selected', tipo==='A');
  setTimeout(() => goStep(2), 180);
}

// ============================================================
// PASO 2 — CLIENTE / ORIGINAL
// ============================================================
document.addEventListener('input', e => {
  if (e.target.id==='clienteInput') renderClienteSugg(e.target.value);
  if (e.target.id==='origInput') renderOrigSugg(e.target.value);
  if (e.target.id==='nombreProyecto') { state.nombreProyecto=e.target.value; validateStep3(); }
  if (['fMateriales','fManoObra','fGG','fCO','fUtilidad'].includes(e.target.id)) recalcFin();
});
document.addEventListener('focus', e => {
  if (e.target.id==='clienteInput') renderClienteSugg(e.target.value);
  if (e.target.id==='origInput') renderOrigSugg(e.target.value);
}, true);
document.addEventListener('click', e => {
  if (!e.target.closest('.autocomplete-wrap'))
    document.querySelectorAll('.ac-list').forEach(l => l.classList.remove('show'));
});

function renderClienteSugg(q) {
  const list = document.getElementById('clienteList');
  const query = q.trim().toLowerCase();
  if (!cacheGeneral) { list.innerHTML='<div class="ac-empty">Cargando…</div>'; list.classList.add('show'); return; }
  let matches = query.length===0
    ? cacheGeneral.slice(-8).reverse()
    : cacheGeneral.filter(c =>
        c.nombre.toLowerCase().includes(query)||c.codigo.includes(query)||
        (c.rut&&c.rut.replace(/\./g,'').includes(query.replace(/\./g,'')))).slice(0,8);
  let html = matches.length
    ? matches.map(c=>`<div class="ac-item" onclick="pickCliente('${esc(c.codigo)}','${esc(c.nombre)}','${esc(c.rut)}',false)">
        <span>${escH(c.nombre)}</span><span class="ac-code">${c.codigo}</span></div>`).join('')
    : '<div class="ac-empty">No encontrado.</div>';
  if (query.length>=2) html+=`<div class="ac-new" onclick="crearNuevoCliente('${esc(q)}')">＋ Crear cliente: "${escH(q)}"</div>`;
  list.innerHTML=html; list.classList.add('show');
}

function pickCliente(codigo, nombre, rut, isNew) {
  state.cliente = { codigo, nombre, rut, isNew:!!isNew };
  document.getElementById('clienteInput').value = `${codigo} ${nombre}`;
  document.getElementById('clienteList').classList.remove('show');
  document.getElementById('clienteHint').innerHTML = isNew
    ? `<span class="badge badge-warn">⚠ Cliente nuevo · código ${codigo} pendiente validación</span>`
    : `Código: <strong>${codigo}</strong>`;
  document.getElementById('step2Next').disabled = false;
}

function crearNuevoCliente(nombreRaw) {
  if (!cacheGeneral) { toast('Aún cargando datos…',true); return; }
  const max = cacheGeneral.reduce((m,c)=>Math.max(m,+c.codigo||0),0);
  pickCliente(String(max+1).padStart(3,'0'), nombreRaw.trim(), '', true);
}

function renderOrigSugg(q) {
  const list = document.getElementById('origList');
  const query = q.trim().toLowerCase();
  if (!cacheCentroCostos) { list.innerHTML='<div class="ac-empty">Cargando…</div>'; list.classList.add('show'); return; }
  const originales = cacheCentroCostos.filter(p=>/-O\d{2}-/.test(p.id));
  let matches = query.length===0 ? originales.slice(-8).reverse()
    : originales.filter(p=>p.id.toLowerCase().includes(query)||p.nombreProyecto.toLowerCase().includes(query)||p.clienteNombre.toLowerCase().includes(query)).slice(0,8);
  list.innerHTML = matches.length
    ? matches.map(p=>`<div class="ac-item" onclick="pickOrig('${esc(p.id)}','${esc(p.nombreProyecto)}')">
        <span>${escH(p.nombreProyecto||'(sin nombre)')}</span><span class="ac-code">${escH(p.id)}</span></div>`).join('')
    : '<div class="ac-empty">No encontrado.</div>';
  list.classList.add('show');
}

function pickOrig(codigo, nombreProyecto) {
  state.origPresupuesto = { codigo, nombreProyecto };
  document.getElementById('origInput').value = codigo;
  document.getElementById('origList').classList.remove('show');
  document.getElementById('origHint').innerHTML = `Adicional de: <strong>${escH(nombreProyecto||codigo)}</strong>`;
  document.getElementById('step2bNext').disabled = false;
  const m = codigo.match(/^(\d{3})-/);
  if (m && cacheGeneral) {
    const cli = cacheGeneral.find(c=>c.codigo===m[1]);
    if (cli) state.cliente = { codigo:cli.codigo, nombre:cli.nombre, rut:cli.rut, isNew:false };
  }
}

// ============================================================
// PASO 3 — INGENIERO + NOMBRE
// ============================================================
function buildIngenieroPills() {
  document.getElementById('ingenieroPills').innerHTML =
    CONFIG.INGENIEROS.map(ing=>`<button type="button" class="pill" data-ini="${ing.iniciales}"
      onclick="selectIngeniero('${ing.iniciales}')">${ing.iniciales} · ${ing.nombre.split(' ')[0]}</button>`).join('');
}

function selectIngeniero(ini) {
  state.ingeniero = CONFIG.INGENIEROS.find(i=>i.iniciales===ini);
  document.querySelectorAll('#ingenieroPills .pill').forEach(p=>p.classList.toggle('selected',p.dataset.ini===ini));
  validateStep3();
}

function validateStep3() {
  document.getElementById('step3Next').disabled = !(state.ingeniero && state.nombreProyecto.trim().length>2);
}

// ============================================================
// PASO 4 — FINANCIERO
// ============================================================
function recalcFin() {
  const v = n => Math.max(0, parseFloat(document.getElementById(n)?.value)||0);
  const mat = v('fMateriales'), mo = v('fManoObra'), gg = v('fGG'),
        co = v('fCO'), util = v('fUtilidad');
  const ggNeto = Math.max(0, gg - co);
  const neto = mat + mo + ggNeto + co + util;
  document.getElementById('fCostoNeto').value = neto > 0 ? neto.toFixed(0) : '';
  state.fin = { materiales:mat, manoObra:mo, gg, co, utilidad:util, ggNeto, costoNeto:neto };

  const fmt = x => x > 0 ? '$' + x.toLocaleString('es-CL') : '—';
  const showRes = mat>0||mo>0||gg>0||co>0||util>0;
  document.getElementById('finResumen').style.display = showRes ? 'block' : 'none';
  if (showRes) {
    document.getElementById('rMat').textContent = fmt(mat);
    document.getElementById('rMO').textContent = fmt(mo);
    document.getElementById('rGG').textContent = fmt(ggNeto);
    document.getElementById('rCO').textContent = fmt(co);
    document.getElementById('rUtil').textContent = fmt(util);
    document.getElementById('rNeto').textContent = fmt(neto);
  }
  // Habilitar botón solo si todos los campos tienen valor > 0
  const allFilled = mat>0 && mo>0 && gg>0 && co>0 && util>0;
  document.getElementById('step4Next').disabled = !allFilled;
}

// ============================================================
// GENERACIÓN PRINCIPAL
// ============================================================
async function ejecutarGeneracion() {
  showLoading('Calculando correlativo…');
  try {
    const codigoFinal = calcularCodigo();
    if (!validarCodigo(codigoFinal)) throw new Error('Código con formato inesperado: ' + codigoFinal);

    showLoading('Guardando en planilla…');
    const rowIndex = await guardarEnSheets(codigoFinal);

    showLoading('Aplicando color de marcado…');
    await marcarFilaColor(rowIndex);

    goStep(5);
    renderResultado(codigoFinal);
    hideLoading();

    await crearCarpetasDrive(codigoFinal);

    todayHistory.unshift({
      codigo: codigoFinal,
      proyecto: state.nombreProyecto,
      hora: new Date().toLocaleTimeString('es-CL',{hour:'2-digit',minute:'2-digit'}),
    });
    toast('Código, planilla y carpetas creados ✓');
  } catch(e) {
    console.error(e);
    hideLoading();
    toast('Error: ' + e.message, true);
  }
}

function calcularCodigo() {
  if (state.tipo==='O') {
    const corr = nextCorrOriginal(state.cliente.codigo, anioActual);
    return `${state.cliente.codigo}-${corr}-O${anioSufijo}-${state.ingeniero.iniciales}`;
  } else {
    const prefijo = state.origPresupuesto.codigo.split('-').slice(0,2).join('-');
    const corr = nextCorrAdicional(state.origPresupuesto.codigo);
    return `${prefijo}-A${anioSufijo}-${state.ingeniero.iniciales}-${corr}`;
  }
}

function nextCorrOriginal(cli, anio) {
  const suf = String(anio).slice(-2);
  let max = 0;
  for (const p of (cacheCentroCostos||[])) {
    const m = p.id.match(new RegExp(`^${cli}-(\\d{3})-O${suf}-`));
    if (m) max = Math.max(max, +m[1]);
  }
  return String(max+1).padStart(3,'0');
}

function nextCorrAdicional(codOrig) {
  const base = codOrig.split('-').slice(0,2).join('-');
  let max = 0;
  for (const p of (cacheCentroCostos||[])) {
    const m = p.id.match(new RegExp(`^${base}-A\\d{2}-[A-Z]{2,3}-(\\d{3})$`));
    if (m) max = Math.max(max, +m[1]);
  }
  return String(max+1).padStart(3,'0');
}

function validarCodigo(c) {
  return /^\d{3}-\d{3}-[OA]\d{2}-[A-Z]{2,3}(-\d{3})?$/.test(c);
}

async function guardarEnSheets(codigoFinal) {
  // Si cliente nuevo, agregar a General
  if (state.cliente?.isNew) {
    await sheetsAppend(CONFIG.SHEET_GENERAL, [
      '','','',`${state.cliente.codigo} ${state.cliente.nombre}`,
      state.cliente.rut||'','','','','','','','','',
      `Pendiente validación ${CONFIG.VALIDADOR}`,'','',
    ]);
    cacheGeneral.push({ codigo:state.cliente.codigo, nombre:state.cliente.nombre, rut:'' });
  }

  const fecha = formatFecha(new Date());
  const f = state.fin;
  // Columnas A..T de Centro de Costos:
  // A=Id, B=NombreProyecto, C=NombreCompleto, D=Cliente, E=Responsable,
  // F=Fecha, G=Estado, H=TipoServicio, I=REV, J=ValorContrato,
  // K=Estudió, L=Año, M=Multiplicador, N=Mes,
  // O=Materiales, P=ManoObra, Q=GG(neto), R=CostoOficina, S=Utilidad, T=CostoNeto
  const row = [
    codigoFinal,                                    // A
    state.nombreProyecto,                           // B
    `${codigoFinal} ${state.nombreProyecto}`,       // C
    `${state.cliente.codigo} ${state.cliente.nombre}`, // D
    state.ingeniero.nombre,                         // E
    fecha,                                          // F
    `Pendiente validación ${CONFIG.VALIDADOR}`,     // G
    '',                                             // H TipoServicio
    '',                                             // I REV
    '',                                             // J ValorContrato
    state.ingeniero.nombre,                         // K Estudió
    anioActual,                                     // L Año
    '',                                             // M Multiplicador
    '',                                             // N Mes
    f.materiales||'',                               // O Materiales
    f.manoObra||'',                                 // P Mano de Obra
    f.ggNeto||'',                                   // Q GG neto
    f.co||'',                                       // R Costo Oficina
    f.utilidad||'',                                 // S Utilidad
    f.costoNeto||'',                                // T Costo Neto
  ];

  const result = await sheetsAppend(`${CONFIG.SHEET_CENTRO_COSTOS}!A:T`, row);
  cacheCentroCostos.push({
    id:codigoFinal, nombreProyecto:state.nombreProyecto,
    clienteCodigo:state.cliente.codigo, clienteNombre:state.cliente.nombre,
    responsable:state.ingeniero.nombre, fecha, anio:String(anioActual),
  });

  // Extraer el índice de fila donde se insertó (base 0)
  const updatedRange = result?.updates?.updatedRange || '';
  const m = updatedRange.match(/:([A-Z]+)(\d+)$/);
  return m ? parseInt(m[2],10)-1 : null;
}

async function marcarFilaColor(rowIndex) {
  if (rowIndex === null) return;
  try {
    const sheetId = await sheetsGetSheetId(CONFIG.SHEET_CENTRO_COSTOS);
    if (sheetId === null) return;
    await sheetsBatchUpdate([{
      repeatCell: {
        range: { sheetId, startRowIndex:rowIndex, endRowIndex:rowIndex+1, startColumnIndex:0, endColumnIndex:20 },
        cell: { userEnteredFormat: { backgroundColor: { red:1, green:0.949, blue:0.8 } } },
        fields: 'userEnteredFormat.backgroundColor',
      }
    }]);
  } catch(e) { console.warn('No se pudo marcar color:', e); }
}

// ============================================================
// DRIVE
// ============================================================
function addDriveRow(label) {
  const idx = driveRows.length;
  driveRows.push({ label, status:'spin', id:null });
  renderDrive(); return idx;
}
function updDriveRow(idx, status, id) {
  driveRows[idx].status=status; driveRows[idx].id=id; renderDrive();
}
function renderDrive() {
  document.getElementById('driveProgress').innerHTML = driveRows.map(r=>`
    <div class="dp-row">
      <span>${r.status==='ok'?'📁':r.status==='err'?'❌':'⏳'}</span>
      <span class="dp-label">${escH(r.label)}</span>
      <span class="dp-status ${r.status}">${r.status==='ok'?'Creada':r.status==='err'?'Error':'Creando…'}</span>
      ${r.id?`<a class="dp-link" href="${driveFolderUrl(r.id)}" target="_blank">Abrir ↗</a>`:''}
    </div>`).join('');
}

async function crearCarpetasDrive(codigoFinal) {
  driveRows = [];
  try {
    const idxAnio = addDriveRow(`📅 ${anioActual}`);
    const anioId = await driveEnsureFolder(String(anioActual), CONFIG.DRIVE_OBRAS_ROOT);
    updDriveRow(idxAnio,'ok',anioId);

    const nombreCli = `${state.cliente.codigo} ${state.cliente.nombre}`;
    const idxCli = addDriveRow(`🏢 ${nombreCli}`);
    const cliId = await driveEnsureFolder(nombreCli, anioId);
    updDriveRow(idxCli,'ok',cliId);

    if (state.tipo==='O') {
      await crearEstructuraCompleta(cliId, codigoFinal);
    } else {
      const codOrig = state.origPresupuesto.codigo;
      const idxO = addDriveRow(`🔗 Original: ${codOrig}`);
      const origId = await driveEnsureFolder(codOrig, cliId);
      updDriveRow(idxO,'ok',origId);
      const idxE = addDriveRow('📂 02 - EJECUCIÓN PROYECTO');
      const ejecId = await driveEnsureFolder('02 - EJECUCIÓN PROYECTO', origId);
      updDriveRow(idxE,'ok',ejecId);
      const idxA = addDriveRow('📂 04 - ADICIONALES');
      const adicsId = await driveEnsureFolder('04 - ADICIONALES', ejecId);
      updDriveRow(idxA,'ok',adicsId);
      await crearEstructuraCompleta(adicsId, codigoFinal);
    }
  } catch(e) {
    console.error('Drive error:', e);
    toast('Código guardado, pero hubo un error en Drive: ' + e.message, true);
  }
}

async function crearEstructuraCompleta(parentId, codigo) {
  const idxR = addDriveRow(`📁 ${codigo}`);
  const rootId = await driveEnsureFolder(codigo, parentId);
  updDriveRow(idxR,'ok',rootId);

  const idxEst = addDriveRow('📂 01 - ESTUDIO PROYECTO');
  const estId = await driveEnsureFolder('01 - ESTUDIO PROYECTO', rootId);
  updDriveRow(idxEst,'ok',estId);
  for (const sub of CONFIG.SUBCARPETAS_ESTUDIO) {
    const idx = addDriveRow(`   └ ${sub}`);
    updDriveRow(idx,'ok', await driveEnsureFolder(sub, estId));
  }

  const idxEjec = addDriveRow('📂 02 - EJECUCIÓN PROYECTO');
  const ejecId = await driveEnsureFolder('02 - EJECUCIÓN PROYECTO', rootId);
  updDriveRow(idxEjec,'ok',ejecId);
  for (const sub of CONFIG.SUBCARPETAS_EJECUCION) {
    const idx = addDriveRow(`   └ ${sub}`);
    updDriveRow(idx,'ok', await driveEnsureFolder(sub, ejecId));
  }
}

// ============================================================
// RESULTADO
// ============================================================
function renderResultado(codigo) {
  document.getElementById('resultCodeText').textContent = codigo;
  document.getElementById('badgeWrap').innerHTML = state.cliente?.isNew
    ? `<div style="margin-bottom:10px;"><span class="badge badge-warn">⚠ Cliente nuevo · pendiente validación ${CONFIG.VALIDADOR}</span></div>`
    : `<div style="margin-bottom:10px;"><span class="badge badge-good">✓ Guardado en planilla · fila marcada en amarillo</span></div>`;

  const f = state.fin;
  const fmt = x => '$' + (x||0).toLocaleString('es-CL');
  const bd = state.tipo==='O' ? [
    ['Cliente', `${state.cliente.codigo} · ${state.cliente.nombre}`],
    ['Tipo', `Original (O${anioSufijo})`],
    ['Ingeniero', `${state.ingeniero.iniciales} · ${state.ingeniero.nombre}`],
    ['Materiales', fmt(f.materiales)],
    ['Mano de Obra', fmt(f.manoObra)],
    ['GG neto', fmt(f.ggNeto)],
    ['Costo Oficina', fmt(f.co)],
    ['Utilidad', fmt(f.utilidad)],
    ['Costo Neto', fmt(f.costoNeto)],
  ] : [
    ['Original', state.origPresupuesto.codigo],
    ['Cliente', `${state.cliente?.codigo} · ${state.cliente?.nombre}`],
    ['Tipo', `Adicional (A${anioSufijo})`],
    ['Ingeniero', `${state.ingeniero.iniciales} · ${state.ingeniero.nombre}`],
    ['Costo Neto', fmt(f.costoNeto)],
  ];
  document.getElementById('breakdownWrap').innerHTML =
    bd.map(([k,v])=>`<div class="bd-row"><span class="k">${escH(k)}</span><span class="v">${escH(String(v))}</span></div>`).join('');
}

function copyCode() {
  const t = document.getElementById('resultCodeText').textContent;
  navigator.clipboard.writeText(t).then(()=>toast('Código copiado ✓')).catch(()=>toast('Selecciónalo manualmente',true));
}

function resetFlow() {
  state = { tipo:null,cliente:null,origPresupuesto:null,ingeniero:null,nombreProyecto:'',
    fin:{materiales:0,manoObra:0,gg:0,co:0,utilidad:0,costoNeto:0,ggNeto:0} };
  driveRows=[];
  ['clienteInput','origInput','nombreProyecto','fMateriales','fManoObra','fGG','fCO','fUtilidad','fCostoNeto']
    .forEach(id=>{ const el=document.getElementById(id); if(el) el.value=''; });
  ['clienteHint','origHint'].forEach(id=>{ const el=document.getElementById(id); if(el) el.innerHTML=''; });
  ['btnOriginal','btnAdicional'].forEach(id=>document.getElementById(id)?.classList.remove('selected'));
  document.querySelectorAll('#ingenieroPills .pill').forEach(p=>p.classList.remove('selected'));
  document.getElementById('step2Next').disabled=true;
  document.getElementById('step2bNext').disabled=true;
  document.getElementById('step3Next').disabled=true;
  document.getElementById('step4Next').disabled=true;
  document.getElementById('finResumen').style.display='none';
  goStep(1);
}

// ============================================================
// HISTORIAL
// ============================================================
function openHistory() {
  document.getElementById('historyList').innerHTML = todayHistory.length
    ? todayHistory.map(h=>`<div class="hist-item">
        <div><div class="hist-code">${escH(h.codigo)}</div><div class="hist-meta">${escH(h.proyecto)}</div></div>
        <div class="hist-meta">${h.hora}</div></div>`).join('')
    : '<div class="ac-empty">Sin códigos en esta sesión aún.</div>';
  document.getElementById('historyModal').classList.add('show');
}
function closeHistory() { document.getElementById('historyModal').classList.remove('show'); }

// ============================================================
// UTILS
// ============================================================
function formatFecha(d) { return `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`; }
function escH(s) { return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function esc(s) { return String(s||'').replace(/'/g,"\\'"); }
