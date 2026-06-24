<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="theme-color" content="#003B49">
<title>Generador de Códigos · SENERCOM</title>
<style>
  :root {
    --primary: #003B49;
    --accent: #CF4520;
    --accent-light: #E85D2A;
    --bg: #F0F4F5;
    --surface: #FFFFFF;
    --surface2: #EBF1F3;
    --border: #C8D8DC;
    --text: #0D1E22;
    --text-muted: #5A7880;
    --success: #1A7A4A;
    --success-bg: #E6F4EC;
    --warn: #B45309;
    --warn-bg: #FEF3C7;
    --danger: #991B1B;
    --danger-bg: #FEE2E2;
    --radius: 10px;
    --shadow: 0 2px 12px rgba(0,59,73,0.10);
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', system-ui, sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; }
 
  /* HEADER */
  header {
    background: var(--primary); color: white;
    padding: 18px 24px 16px;
    display: flex; align-items: center; gap: 14px;
    position: sticky; top: 0; z-index: 100;
    box-shadow: 0 2px 10px rgba(0,0,0,0.25);
  }
  .logo-badge {
    background: var(--accent); width: 38px; height: 38px;
    border-radius: 8px; display: flex; align-items: center;
    justify-content: center; font-weight: 800; font-size: 14px;
    letter-spacing: -0.5px; flex-shrink: 0;
  }
  header h1 { font-size: 18px; font-weight: 600; line-height: 1.2; }
  header p  { font-size: 12px; opacity: 0.65; margin-top: 1px; }
  .header-spacer { flex: 1; }
  #btn-admin-access {
    background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.25);
    color: white; border-radius: 7px; padding: 7px 12px;
    font-size: 12px; font-weight: 600; cursor: pointer;
    transition: background 0.15s; white-space: nowrap;
  }
  #btn-admin-access:hover { background: rgba(255,255,255,0.22); }
 
  /* MAIN */
  main { max-width: 680px; margin: 0 auto; padding: 24px 16px 60px; }
 
  /* CARD */
  .card {
    background: var(--surface); border-radius: var(--radius);
    box-shadow: var(--shadow); padding: 22px; margin-bottom: 16px;
  }
  .card-title {
    font-size: 13px; font-weight: 700; letter-spacing: 0.06em;
    text-transform: uppercase; color: var(--primary);
    margin-bottom: 16px; display: flex; align-items: center; gap: 8px;
  }
  .card-title span.dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--accent); display: inline-block;
  }
 
  /* FORM */
  .field { margin-bottom: 16px; }
  .field:last-child { margin-bottom: 0; }
  label { display: block; font-size: 13px; font-weight: 600; color: var(--text-muted); margin-bottom: 6px; }
  select, input[type="text"], input[type="password"] {
    width: 100%; padding: 10px 12px; border: 1.5px solid var(--border);
    border-radius: 8px; font-size: 15px; color: var(--text);
    background: var(--surface); appearance: none; -webkit-appearance: none;
    transition: border-color 0.15s; font-family: inherit;
  }
  select:focus, input:focus { outline: none; border-color: var(--primary); }
  .select-wrap { position: relative; }
  .select-wrap::after {
    content: '▾'; position: absolute; right: 12px; top: 50%;
    transform: translateY(-50%); color: var(--text-muted);
    pointer-events: none; font-size: 14px;
  }
 
  /* TIPO TOGGLE */
  .tipo-toggle { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .tipo-btn {
    padding: 11px; border-radius: 8px; border: 2px solid var(--border);
    background: var(--surface); font-size: 14px; font-weight: 600;
    cursor: pointer; transition: all 0.15s; text-align: center; color: var(--text-muted);
  }
  .tipo-btn.active-o { border-color: var(--primary); background: var(--primary); color: white; }
  .tipo-btn.active-a { border-color: var(--accent); background: var(--accent); color: white; }
 
  /* RESULTADO */
  .result-box {
    background: linear-gradient(135deg, var(--primary) 0%, #005570 100%);
    border-radius: var(--radius); padding: 24px 22px; margin-bottom: 16px; display: none;
  }
  .result-box.visible { display: block; }
  .result-label { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.55); margin-bottom: 10px; }
  .result-code { font-size: 28px; font-weight: 800; color: white; letter-spacing: 2px; word-break: break-all; }
  .result-meta { margin-top: 12px; font-size: 13px; color: rgba(255,255,255,0.70); line-height: 1.6; }
  .result-meta strong { color: white; }
 
  /* BOTONES */
  .btn-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 14px; }
  .btn {
    padding: 12px; border-radius: 8px; border: none; font-size: 14px;
    font-weight: 600; cursor: pointer; transition: all 0.15s; font-family: inherit;
  }
  .btn-primary { background: var(--accent); color: white; grid-column: 1 / -1; padding: 14px; font-size: 15px; }
  .btn-primary:hover { background: var(--accent-light); }
  .btn-secondary { background: var(--surface2); color: var(--primary); border: 1.5px solid var(--border); }
  .btn-secondary:hover { background: var(--border); }
  .btn-confirm { background: var(--success-bg); color: var(--success); border: 1.5px solid #86EFAC; font-weight: 700; }
  .btn-confirm:hover { background: #D1FAE5; }
  .btn-danger { background: var(--danger-bg); color: var(--danger); border: 1.5px solid #FCA5A5; font-weight: 700; }
  .btn-danger:hover { background: #FECACA; }
  .btn:disabled { opacity: 0.45; cursor: not-allowed; }
  .btn-full { width: 100%; }
 
  /* ALERTAS */
  .alert {
    border-radius: var(--radius); padding: 12px 14px;
    font-size: 13px; margin-top: 12px; display: none; line-height: 1.5;
  }
  .alert.visible { display: block; }
  .alert-warn { background: var(--warn-bg); border-left: 4px solid var(--warn); color: var(--warn); border-radius: 0 8px 8px 0; }
  .alert-danger { background: var(--danger-bg); border-left: 4px solid #EF4444; color: var(--danger); border-radius: 0 8px 8px 0; }
 
  /* NUEVO CLIENTE */
  .new-client-panel {
    background: var(--warn-bg); border: 1.5px solid #FCD34D;
    border-radius: var(--radius); padding: 16px; margin-top: 12px; display: none;
  }
  .new-client-panel.visible { display: block; }
  .new-client-panel > p { font-size: 13px; color: var(--warn); font-weight: 600; margin-bottom: 12px; }
 
  /* HISTORIAL */
  .history-list { list-style: none; }
  .history-item {
    display: flex; align-items: flex-start; gap: 12px;
    padding: 12px 0; border-bottom: 1px solid var(--surface2);
  }
  .history-item:last-child { border-bottom: none; }
  .hist-code {
    font-size: 12px; font-weight: 700; font-family: 'Courier New', monospace;
    color: var(--primary); background: var(--surface2);
    padding: 4px 8px; border-radius: 5px; white-space: nowrap; flex-shrink: 0;
  }
  .hist-detail { font-size: 12px; color: var(--text-muted); line-height: 1.5; }
  .badge-pending {
    display: inline-block; font-size: 10px; font-weight: 700;
    background: var(--warn-bg); color: var(--warn);
    padding: 2px 6px; border-radius: 4px; margin-top: 3px;
  }
 
  /* ── PANEL ADMIN ── */
  #admin-panel { display: none; }
  #admin-panel.visible { display: block; }
  .admin-card {
    background: var(--surface); border-radius: var(--radius);
    box-shadow: var(--shadow); padding: 22px; margin-bottom: 16px;
    border-top: 3px solid var(--primary);
  }
  .admin-title {
    font-size: 13px; font-weight: 700; letter-spacing: 0.06em;
    text-transform: uppercase; color: var(--primary); margin-bottom: 4px;
  }
  .admin-subtitle { font-size: 12px; color: var(--text-muted); margin-bottom: 18px; }
  .engineer-list { list-style: none; margin-bottom: 16px; }
  .engineer-row {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: 8px; background: var(--surface2);
    margin-bottom: 8px; transition: background 0.1s;
  }
  .engineer-row:last-child { margin-bottom: 0; }
  .eng-badge {
    background: var(--primary); color: white; border-radius: 5px;
    font-size: 13px; font-weight: 800; padding: 4px 9px;
    font-family: 'Courier New', monospace; flex-shrink: 0;
  }
  .eng-name { font-size: 14px; font-weight: 600; flex: 1; }
  .eng-email { font-size: 11px; color: var(--text-muted); }
  .btn-remove-eng {
    background: none; border: none; cursor: pointer;
    color: #EF4444; font-size: 18px; padding: 2px 6px;
    border-radius: 5px; transition: background 0.1s; line-height: 1;
  }
  .btn-remove-eng:hover { background: var(--danger-bg); }
  .add-eng-form {
    display: grid; grid-template-columns: 90px 1fr;
    gap: 10px; margin-bottom: 10px;
  }
  .add-eng-form input { margin: 0; }
 
  /* MODAL PIN */
  #pin-modal {
    display: none; position: fixed; inset: 0;
    background: rgba(0,0,0,0.55); z-index: 200;
    align-items: center; justify-content: center; padding: 20px;
  }
  #pin-modal.visible { display: flex; }
  .pin-box {
    background: white; border-radius: 14px; padding: 28px 24px;
    width: 100%; max-width: 340px; box-shadow: 0 8px 40px rgba(0,0,0,0.25);
  }
  .pin-title { font-size: 16px; font-weight: 700; color: var(--primary); margin-bottom: 6px; }
  .pin-sub { font-size: 13px; color: var(--text-muted); margin-bottom: 18px; }
  .pin-error { font-size: 13px; color: var(--danger); margin-top: 8px; display: none; }
  .pin-error.visible { display: block; }
  .pin-btns { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 14px; }
 
  /* SEARCH */
  .search-wrap { position: relative; margin-bottom: 10px; }
  .search-wrap input { padding-left: 34px; }
  .search-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 15px; }
 
  /* LOADING */
  #loading-overlay {
    display: none; position: fixed; inset: 0;
    background: rgba(0,0,0,0.45); z-index: 999;
    align-items: center; justify-content: center; flex-direction: column; gap: 14px;
  }
  #loading-overlay.visible { display: flex; }
  .spinner {
    width: 40px; height: 40px; border: 4px solid rgba(255,255,255,0.25);
    border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  #loading-overlay p { color: white; font-size: 14px; font-weight: 600; }
 
  /* TOAST */
  #toast {
    position: fixed; bottom: 24px; left: 50%;
    transform: translateX(-50%) translateY(80px); background: var(--text);
    color: white; padding: 12px 20px; border-radius: 30px;
    font-size: 14px; font-weight: 600; transition: transform 0.3s ease;
    z-index: 9999; white-space: nowrap;
  }
  #toast.show { transform: translateX(-50%) translateY(0); }
</style>
</head>
<body>
 
<header>
  <div class="logo-badge">SN</div>
  <div>
    <h1>Generador de Códigos</h1>
    <p>Centro de Costos · SENERCOM</p>
  </div>
  <div class="header-spacer"></div>
  <button id="btn-admin-access" onclick="abrirAdmin()">⚙️ Admin</button>
</header>
 
<main>
 
  <div id="status-bar" style="display:none; background:var(--warn-bg); border:1.5px solid #FCD34D; border-radius:var(--radius); padding:12px 16px; margin-bottom:16px; font-size:13px; color:var(--warn); font-weight:600;"></div>
 
  <!-- ══════ FORMULARIO PRINCIPAL ══════ -->
  <div id="main-form">
 
    <!-- PASO 1: INGENIERO -->
    <div class="card">
      <div class="card-title"><span class="dot"></span>1 · ¿Quién genera el código?</div>
      <div class="field">
        <label>Ingeniero responsable</label>
        <div class="select-wrap">
          <select id="sel-engineer"></select>
        </div>
      </div>
    </div>
 
    <!-- PASO 2: TIPO -->
    <div class="card">
      <div class="card-title"><span class="dot"></span>2 · Tipo de presupuesto</div>
      <div class="tipo-toggle">
        <button class="tipo-btn active-o" id="btn-original" onclick="setTipo('O')">📄 Original</button>
        <button class="tipo-btn" id="btn-adicional" onclick="setTipo('A')">➕ Adicional</button>
      </div>
      <div id="parent-field" class="field" style="display:none; margin-top:16px;">
        <label>Presupuesto original del que se desprende</label>
        <div class="search-wrap">
          <span class="search-icon">🔍</span>
          <input type="text" id="input-parent-search" placeholder="Buscar por código o descripción…" oninput="filterParents()">
        </div>
        <div class="select-wrap">
          <select id="sel-parent"><option value="">— Cargando… —</option></select>
        </div>
      </div>
    </div>
 
    <!-- PASO 3: CLIENTE -->
    <div class="card">
      <div class="card-title"><span class="dot"></span>3 · Cliente</div>
      <div class="field">
        <div class="search-wrap">
          <span class="search-icon">🔍</span>
          <input type="text" id="input-client-search" placeholder="Buscar por nombre o código…" oninput="filterClients()">
        </div>
        <div class="select-wrap" id="client-select-wrap">
          <select id="sel-client"><option value="">— Cargando clientes… —</option></select>
        </div>
      </div>
      <button class="btn btn-secondary btn-full" style="font-size:13px;" onclick="toggleNewClient()">+ Registrar cliente nuevo</button>
      <div class="new-client-panel" id="new-client-panel">
        <p>⚠️ Este cliente quedará marcado como "Pendiente validación CB"</p>
        <div class="field">
          <label>Nombre de la empresa <span style="color:var(--accent)">*</span></label>
          <input type="text" id="input-new-name" placeholder="Ej: CONSTRUCTORA EXAMPLE" style="text-transform:uppercase;">
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
          <div class="field">
            <label>RUT <span style="color:var(--accent)">*</span></label>
            <input type="text" id="input-new-rut" placeholder="Ej: 76.123.456-7">
          </div>
          <div class="field">
            <label>Giro</label>
            <input type="text" id="input-new-giro" placeholder="Ej: CONSTRUCTORA">
          </div>
        </div>
        <div class="field">
          <label>Dirección</label>
          <input type="text" id="input-new-dir" placeholder="Ej: Av. Principal 123">
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
          <div class="field">
            <label>Teléfono</label>
            <input type="text" id="input-new-tel" placeholder="Ej: 612226628">
          </div>
          <div class="field">
            <label>Nombre contacto</label>
            <input type="text" id="input-new-contacto" placeholder="Ej: JUAN PÉREZ">
          </div>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
          <div class="field">
            <label>Cargo contacto</label>
            <input type="text" id="input-new-cargo" placeholder="Ej: GERENTE">
          </div>
          <div class="field">
            <label>Celular</label>
            <input type="text" id="input-new-cel" placeholder="Ej: 56912345678">
          </div>
        </div>
        <div class="field">
          <label>Email contacto</label>
          <input type="text" id="input-new-email" placeholder="Ej: contacto@empresa.cl">
        </div>
      </div>
    </div>
 
    <!-- PASO 4: DESCRIPCIÓN -->
    <div class="card">
      <div class="card-title"><span class="dot"></span>4 · Descripción del proyecto</div>
      <div class="field">
        <input type="text" id="input-desc" placeholder="Ej: INSTALACION ELECTRICA BODEGA NORTE" style="text-transform:uppercase;">
      </div>
      <button class="btn btn-primary" onclick="generarCodigo()">⚡ Generar código</button>
    </div>
 
    <!-- RESULTADO -->
    <div class="result-box" id="result-box">
      <div class="result-label">Código generado</div>
      <div class="result-code" id="result-code">—</div>
      <div class="result-meta" id="result-meta"></div>
      <div class="alert alert-warn" id="validation-note">
        ⚠️ Este registro quedará marcado para <strong>validación de Carlos Braun</strong> antes de ser incorporado definitivamente a la planilla.
      </div>
      <div class="btn-row">
        <button class="btn btn-secondary" onclick="copiarCodigo()">📋 Copiar</button>
        <button class="btn btn-confirm" id="btn-confirm" onclick="confirmarGuardar()">✅ Guardar en planilla</button>
      </div>
    </div>
 
    <!-- HISTORIAL SESIÓN -->
    <div class="card" id="history-card" style="display:none;">
      <div class="card-title"><span class="dot"></span>Generados en esta sesión</div>
      <ul class="history-list" id="history-list"></ul>
    </div>
 
  </div><!-- /main-form -->
 
  <!-- ══════ PANEL ADMIN ══════ -->
  <div id="admin-panel">
 
    <div class="admin-card">
      <div class="admin-title">⚙️ Administración de Ingenieros</div>
      <div class="admin-subtitle">Solo Carlos Braun puede agregar o eliminar ingenieros. Los cambios se guardan en la planilla maestra.</div>
 
      <ul class="engineer-list" id="engineer-list">
        <li style="text-align:center; padding:16px; color:var(--text-muted); font-size:13px;">Cargando…</li>
      </ul>
 
      <div style="border-top:1px solid var(--border); padding-top:16px; margin-top:4px;">
        <label style="margin-bottom:10px;">Agregar nuevo ingeniero</label>
        <div class="add-eng-form">
          <input type="text" id="input-eng-initials" placeholder="Ej: JG" maxlength="3" style="text-transform:uppercase; font-weight:700; text-align:center;">
          <input type="text" id="input-eng-name" placeholder="Nombre completo">
        </div>
        <button class="btn btn-confirm btn-full" onclick="agregarIngeniero()">+ Agregar ingeniero</button>
      </div>
 
      <div class="alert alert-warn visible" style="margin-top:14px;">
        ℹ️ Las iniciales deben ser únicas (2–3 letras). Una vez eliminado un ingeniero sus códigos anteriores quedan intactos en la planilla, solo deja de aparecer como opción para nuevos presupuestos.
      </div>
    </div>
 
    <button class="btn btn-secondary btn-full" style="margin-bottom:16px;" onclick="cerrarAdmin()">← Volver al generador</button>
 
  </div><!-- /admin-panel -->
 
</main>
 
<!-- MODAL PIN -->
<div id="pin-modal">
  <div class="pin-box">
    <div class="pin-title">🔐 Acceso administrador</div>
    <div class="pin-sub">Esta sección es exclusiva de Carlos Braun.<br>Ingresa tu contraseña para continuar.</div>
    <div class="field">
      <input type="password" id="input-pin" placeholder="Contraseña" onkeydown="if(event.key==='Enter')verificarPin()">
    </div>
    <div class="pin-error" id="pin-error">Contraseña incorrecta. Inténtalo de nuevo.</div>
    <div class="pin-btns">
      <button class="btn btn-secondary" onclick="cerrarPin()">Cancelar</button>
      <button class="btn btn-primary" style="grid-column:auto;" onclick="verificarPin()">Entrar</button>
    </div>
  </div>
</div>
 
<!-- LOADING -->
<div id="loading-overlay">
  <div class="spinner"></div>
  <p id="loading-msg">Conectando con planilla…</p>
</div>
 
<!-- TOAST -->
<div id="toast"></div>
 
<script>
// ═══════════════════════════════════════════════════════
//  CONFIG
// ═══════════════════════════════════════════════════════
const SHEET_ID      = '1N6BmSf_3pjdmUmIcIl_BVknBi9sdvQBDKSgkxoCjIV0';
const CLIENT_ID_GIS = '72369192874-rgv4vqjl243p39fv0dntkl5a4m13s8k6.apps.googleusercontent.com';
const SCOPES        = 'https://www.googleapis.com/auth/spreadsheets';
 
const GENERAL_RANGE   = 'General!A2:E2000';
const CC_RANGE        = 'Centros de Costos!A4:F3000';
const ENG_RANGE       = 'Ingenieros!A2:B50';   // col A = iniciales, col B = nombre
const ENG_SHEET_NAME  = 'Ingenieros';
 
// PIN de admin (SHA-256 del texto "CB2024sener" — cámbialo si quieres)
// Para cambiar: genera el hash en: https://emn178.github.io/online-tools/sha256.html
// El valor por defecto corresponde a la contraseña:  senerCB26
const ADMIN_PIN_HASH  = '569656c588fa8c8871f918ca6921896fbe82336f67e0702f49d22521f4d0deae';
 
// ═══════════════════════════════════════════════════════
//  ESTADO
// ═══════════════════════════════════════════════════════
let tokenClient    = null;
let accessToken    = null;
let allClients     = [];
let allCC          = [];
let allParents     = [];
let engineers      = [];   // [{initials:'CB', name:'Carlos Braun'}]
let currentTipo    = 'O';
let generatedCode  = null;
let generatedMeta  = null;
let sessionHistory = [];
let newClientMode  = false;
let adminUnlocked  = false;
 
// ═══════════════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════════════
window.onload = () => {
  const s = document.createElement('script');
  s.src = 'https://accounts.google.com/gsi/client';
  s.onload = initAuth;
  document.head.appendChild(s);
};
 
function initAuth() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID_GIS,
    scope: SCOPES,
    callback: async (resp) => {
      hideLoading();
      if (resp.error) { showStatus('Error de autenticación: ' + resp.error, true); return; }
      accessToken = resp.access_token;
      showStatus('');
      await loadData();
    }
  });
  showLoading('Iniciando sesión…');
  tokenClient.requestAccessToken({ prompt: 'consent' });
}
 
// ═══════════════════════════════════════════════════════
//  DATA LOADING
// ═══════════════════════════════════════════════════════
async function loadData() {
  showLoading('Cargando datos…');
  try {
    const [genData, ccData, engData] = await Promise.all([
      fetchRange(GENERAL_RANGE),
      fetchRange(CC_RANGE),
      fetchRange(ENG_RANGE).catch(() => [])  // graceful fallback si la pestaña no existe aún
    ]);
    processGeneral(genData);
    processCC(ccData);
    processEngineers(engData);
    hideLoading();
    toast('✅ Planilla cargada correctamente');
  } catch(e) {
    hideLoading();
    showStatus('Error al cargar datos. Recarga la página.', true);
    console.error(e);
  }
}
 
async function fetchRange(range) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(range)}`;
  const r = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const j = await r.json();
  return j.values || [];
}
 
function processGeneral(rows) {
  const seen = new Set();
  allClients = [];
  rows.forEach(row => {
    const raw = (row[3] || '').trim();
    if (!raw || seen.has(raw)) return;
    seen.add(raw);
    const parts = raw.match(/^(\d{3})\s+(.+)$/);
    if (!parts) return;
    allClients.push({ code: parts[1], name: parts[2], fullLabel: raw, rut: (row[4]||'').trim() });
  });
  allClients.sort((a,b) => parseInt(a.code) - parseInt(b.code));
  populateClientSelect(allClients);
}
 
function processCC(rows) {
  allCC = rows.map(r => ({
    code:     (r[0]||'').replace(/\s+/g,'').trim(),
    desc:     (r[1]||'').trim(),
    client:   (r[2]||'').trim(),
    engineer: (r[3]||'').trim(),
    date:     (r[4]||'').trim(),
    amount:   (r[5]||'').trim(),
  })).filter(r => r.code);
  allParents = allCC.filter(r => r.code.match(/\d{3}-\d{3}-O/i));
  populateParentSelect(allParents);
}
 
function processEngineers(rows) {
  if (rows.length === 0) {
    // Primera vez: pestaña no existe o está vacía → usar lista por defecto
    engineers = [
      { initials:'CB', name:'Carlos Braun' },
      { initials:'OG', name:'Oscar Gallo' },
      { initials:'MA', name:'Manuel Aro' },
      { initials:'PS', name:'Pablo Salas' },
      { initials:'CR', name:'Cristian Raddatz' },
      { initials:'DV', name:'Dario Valdivia' },
      { initials:'PM', name:'Pablo Muñoz' },
    ];
  } else {
    engineers = rows
      .filter(r => r[0] && r[0].trim())
      .map(r => ({ initials: r[0].trim().toUpperCase(), name: (r[1]||'').trim() }));
  }
  populateEngineerSelect();
  renderEngineerList();
}
 
// ═══════════════════════════════════════════════════════
//  SELECTS
// ═══════════════════════════════════════════════════════
function populateEngineerSelect() {
  const sel = document.getElementById('sel-engineer');
  sel.innerHTML = '<option value="">— Selecciona ingeniero —</option>';
  engineers.forEach(e => {
    const o = document.createElement('option');
    o.value = e.initials;
    o.textContent = `${e.initials} · ${e.name}`;
    sel.appendChild(o);
  });
}
 
function populateClientSelect(clients) {
  const sel = document.getElementById('sel-client');
  sel.innerHTML = '<option value="">— Selecciona cliente —</option>';
  clients.forEach(c => {
    const o = document.createElement('option');
    o.value = c.code;
    o.textContent = `${c.code} · ${c.name}` + (c.rut ? ` (${c.rut})` : '');
    sel.appendChild(o);
  });
}
 
function populateParentSelect(parents) {
  const sel = document.getElementById('sel-parent');
  sel.innerHTML = '<option value="">— Selecciona presupuesto original —</option>';
  parents.forEach(p => {
    const o = document.createElement('option');
    o.value = p.code;
    o.textContent = `${p.code} · ${p.desc||'(sin descripción)'} [${p.client}]`;
    sel.appendChild(o);
  });
}
 
function filterClients() {
  const q = document.getElementById('input-client-search').value.toLowerCase();
  populateClientSelect(allClients.filter(c => c.fullLabel.toLowerCase().includes(q) || c.rut.toLowerCase().includes(q)));
}
function filterParents() {
  const q = document.getElementById('input-parent-search').value.toLowerCase();
  populateParentSelect(allParents.filter(p => p.code.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q) || p.client.toLowerCase().includes(q)));
}
 
// ═══════════════════════════════════════════════════════
//  TIPO TOGGLE
// ═══════════════════════════════════════════════════════
function setTipo(t) {
  currentTipo = t;
  document.getElementById('btn-original').className  = 'tipo-btn' + (t==='O'?' active-o':'');
  document.getElementById('btn-adicional').className = 'tipo-btn' + (t==='A'?' active-a':'');
  document.getElementById('parent-field').style.display = t==='A'?'block':'none';
  hideResult();
}
 
// ═══════════════════════════════════════════════════════
//  NUEVO CLIENTE
// ═══════════════════════════════════════════════════════
function toggleNewClient() {
  newClientMode = !newClientMode;
  document.getElementById('new-client-panel').className = 'new-client-panel'+(newClientMode?' visible':'');
  document.getElementById('sel-client').disabled = newClientMode;
  document.getElementById('input-client-search').disabled = newClientMode;
  document.getElementById('client-select-wrap').style.opacity = newClientMode?'0.4':'1';
  hideResult();
}
 
// ═══════════════════════════════════════════════════════
//  GENERAR CÓDIGO
// ═══════════════════════════════════════════════════════
function generarCodigo() {
  const engineer = document.getElementById('sel-engineer').value;
  if (!engineer) { toast('⚠️ Selecciona el ingeniero responsable'); return; }
  const desc = document.getElementById('input-desc').value.trim().toUpperCase();
  if (!desc) { toast('⚠️ Ingresa una descripción del proyecto'); return; }
  const year = String(new Date().getFullYear()).slice(-2);
 
  let clientCode, clientLabel, isNewClient = false, newRut = '';
 
  if (newClientMode) {
    const newName = document.getElementById('input-new-name').value.trim().toUpperCase();
    newRut = document.getElementById('input-new-rut').value.trim();
    if (!newName) { toast('⚠️ Ingresa el nombre del cliente nuevo'); return; }
    const maxNum = allClients.length > 0 ? Math.max(...allClients.map(c=>parseInt(c.code))) : 0;
    clientCode  = String(maxNum+1).padStart(3,'0');
    clientLabel = `${clientCode} ${newName}`;
    isNewClient = true;
  } else {
    clientCode = document.getElementById('sel-client').value;
    if (!clientCode) { toast('⚠️ Selecciona un cliente'); return; }
    const cl = allClients.find(c=>c.code===clientCode);
    clientLabel = cl ? cl.fullLabel : clientCode;
  }
 
  let finalCode, addCorrelative = null;
 
  if (currentTipo === 'O') {
    const originals = allCC.filter(r => { const m=r.code.match(/^(\d{3})-(\d{3})-O/); return m && m[1]===clientCode; });
    const maxCorr   = originals.length > 0 ? Math.max(...originals.map(r=>parseInt(r.code.split('-')[1]||'0'))) : 0;
    finalCode = `${clientCode}-${String(maxCorr+1).padStart(3,'0')}-O${year}-${engineer}`;
  } else {
    const parentCode = document.getElementById('sel-parent').value;
    if (!parentCode) { toast('⚠️ Selecciona el presupuesto original'); return; }
    const pm = parentCode.match(/^(\d{3})-(\d{3})-O(\d{2})-(.{2})$/);
    if (!pm) { toast('⚠️ Código original no reconocido'); return; }
    const [, parentClient, parentCorr] = pm;
    const adicionales = allCC.filter(r => { const am=r.code.match(/^(\d{3})-(\d{3})-A(\d{2})/); return am && am[1]===parentClient && am[2]===parentCorr; });
    const maxAdd = adicionales.length > 0
      ? Math.max(...adicionales.map(r => { const parts=r.code.split('-'); return parseInt(parts[parts.length-1])||0; }))
      : 0;
    addCorrelative = String(maxAdd+1).padStart(3,'0');
    finalCode = `${parentClient}-${parentCorr}-A${year}-${engineer}-${addCorrelative}`;
    clientCode  = parentClient;
    const cl = allClients.find(c=>c.code===clientCode);
    clientLabel = cl ? cl.fullLabel : clientCode;
  }
 
  generatedCode = finalCode;
  generatedMeta = { clientLabel, desc, engineer, isNewClient, newRut, clientCode };
 
  document.getElementById('result-code').textContent = finalCode;
  document.getElementById('result-meta').innerHTML =
    `<strong>Cliente:</strong> ${clientLabel}<br><strong>Descripción:</strong> ${desc}<br><strong>Ingeniero:</strong> ${engineer}` +
    (addCorrelative ? `<br><strong>Adicional N°:</strong> ${addCorrelative}` : '');
 
  document.getElementById('validation-note').className = 'alert alert-warn'+(isNewClient?' visible':'');
  document.getElementById('result-box').className = 'result-box visible';
  document.getElementById('result-box').scrollIntoView({ behavior:'smooth', block:'nearest' });
}
 
// ═══════════════════════════════════════════════════════
//  COPIAR / GUARDAR
// ═══════════════════════════════════════════════════════
function copiarCodigo() {
  if (!generatedCode) return;
  navigator.clipboard.writeText(generatedCode).then(()=>toast('📋 Código copiado'));
}
 
async function confirmarGuardar() {
  if (!generatedCode || !generatedMeta) return;
  if (!accessToken) { toast('⚠️ Sesión expirada. Recarga.'); return; }
  const btn = document.getElementById('btn-confirm');
  btn.disabled = true;
  showLoading('Guardando en planilla…');
  try {
    const today = new Date().toLocaleDateString('es-CL');
    const { clientLabel, desc, engineer, isNewClient, newRut, clientCode } = generatedMeta;
 
    if (isNewClient) {
      const newName = document.getElementById('input-new-name').value.trim().toUpperCase();
      const newGiro     = document.getElementById('input-new-giro').value.trim();
      const newDir      = document.getElementById('input-new-dir').value.trim();
      const newTel      = document.getElementById('input-new-tel').value.trim();
      const newContacto = document.getElementById('input-new-contacto').value.trim();
      const newCargo    = document.getElementById('input-new-cargo').value.trim();
      const newCel      = document.getElementById('input-new-cel').value.trim();
      const newEmail    = document.getElementById('input-new-email').value.trim();
      // Find first empty row in col D, then write directly to that row
      const colDData = await fetchRange('General!D:D');
      const firstEmptyRow = colDData.length + 1; // next row after last data in col D
      // Write directly to specific row: A-C empty, D=Cliente, E=RUT, F=Giro, G=Dir, H=Tel, I=Contacto, J=Cargo, K=Cel, L=Email, M=FechaLey, N=Pendiente, O=Ing
      await writeRow('General', firstEmptyRow, ['','','',`${clientCode} ${newName}`,newRut||'',newGiro,newDir,newTel,newContacto,newCargo,newCel,newEmail,today,'Pendiente validación CB',engineer]);
      allClients.push({ code:clientCode, name:newName, fullLabel:`${clientCode} ${newName}`, rut:newRut });
      allClients.sort((a,b)=>parseInt(a.code)-parseInt(b.code));
      populateClientSelect(allClients);
    }
 
    const pendTag = isNewClient ? ' [Pendiente validación CB - cliente nuevo]' : '';
    await appendRow('Centros de Costos', [generatedCode, desc+pendTag, clientLabel, engineer, today, '']);
 
    allCC.push({ code:generatedCode, desc, client:clientLabel, engineer, date:today, amount:'' });
    if (currentTipo==='O') { allParents.push({ code:generatedCode, desc, client:clientLabel, engineer }); populateParentSelect(allParents); }
 
    hideLoading();
    toast('✅ Código guardado en la planilla');
    addToHistory(generatedCode, desc, clientLabel, engineer, isNewClient);
    resetForm();
  } catch(e) {
    hideLoading();
    toast('❌ Error al guardar. Intenta de nuevo.');
    console.error(e);
    btn.disabled = false;
  }
}
 
async function writeRow(sheetName, rowNumber, row) {
  // Write to a specific row number starting at column A
  const range = `${sheetName}!A${rowNumber}`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`;
  const r = await fetch(url, { method:'PUT', headers:{ Authorization:`Bearer ${accessToken}`, 'Content-Type':'application/json' }, body:JSON.stringify({ values:[row] }) });
  if (!r.ok) { const e=await r.json(); throw new Error(e.error?.message||`HTTP ${r.status}`); }
}
 
async function appendRow(sheetName, row) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(sheetName)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;
  const r = await fetch(url, { method:'POST', headers:{ Authorization:`Bearer ${accessToken}`, 'Content-Type':'application/json' }, body:JSON.stringify({ values:[row] }) });
  if (!r.ok) { const e=await r.json(); throw new Error(e.error?.message||`HTTP ${r.status}`); }
}
 
// ═══════════════════════════════════════════════════════
//  HISTORIAL
// ═══════════════════════════════════════════════════════
function addToHistory(code, desc, client, eng, pending) {
  sessionHistory.unshift({ code, desc, client, eng, pending });
  const card = document.getElementById('history-card');
  const list = document.getElementById('history-list');
  card.style.display = 'block';
  list.innerHTML = sessionHistory.map(h=>`
    <li class="history-item">
      <span class="hist-code">${h.code}</span>
      <div class="hist-detail">
        ${h.desc||'(sin descripción)'}<br>${h.client} · ${h.eng}
        ${h.pending?'<span class="badge-pending">⚠️ Pendiente validación CB</span>':''}
      </div>
    </li>`).join('');
}
 
// ═══════════════════════════════════════════════════════
//  RESET
// ═══════════════════════════════════════════════════════
function resetForm() {
  generatedCode = null; generatedMeta = null;
  ['input-desc','input-client-search','input-parent-search','input-new-name','input-new-rut','input-new-giro','input-new-dir','input-new-tel','input-new-contacto','input-new-cargo','input-new-cel','input-new-email']
    .forEach(id => { const el=document.getElementById(id); if(el) el.value=''; });
  document.getElementById('sel-client').value = '';
  document.getElementById('sel-parent').value = '';
  if (newClientMode) toggleNewClient();
  hideResult();
}
 
function hideResult() {
  document.getElementById('result-box').className = 'result-box';
  document.getElementById('btn-confirm').disabled = false;
  generatedCode = null; generatedMeta = null;
}
 
// ═══════════════════════════════════════════════════════
//  ADMIN – PIN
// ═══════════════════════════════════════════════════════
function abrirAdmin() {
  if (adminUnlocked) { mostrarPanelAdmin(); return; }
  document.getElementById('input-pin').value = '';
  document.getElementById('pin-error').className = 'pin-error';
  document.getElementById('pin-modal').className = 'visible';
  setTimeout(()=>document.getElementById('input-pin').focus(), 100);
}
function cerrarPin() {
  document.getElementById('pin-modal').className = '';
}
async function verificarPin() {
  const pin = document.getElementById('input-pin').value;
  const hash = await sha256(pin);
  if (hash === ADMIN_PIN_HASH) {
    adminUnlocked = true;
    cerrarPin();
    mostrarPanelAdmin();
  } else {
    document.getElementById('pin-error').className = 'pin-error visible';
    document.getElementById('input-pin').value = '';
    document.getElementById('input-pin').focus();
  }
}
async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
}
 
// ═══════════════════════════════════════════════════════
//  ADMIN – PANEL
// ═══════════════════════════════════════════════════════
function mostrarPanelAdmin() {
  document.getElementById('main-form').style.display  = 'none';
  document.getElementById('admin-panel').className    = 'visible';
  renderEngineerList();
}
function cerrarAdmin() {
  document.getElementById('main-form').style.display  = 'block';
  document.getElementById('admin-panel').className    = '';
}
 
function renderEngineerList() {
  const ul = document.getElementById('engineer-list');
  if (engineers.length === 0) {
    ul.innerHTML = '<li style="text-align:center;padding:16px;color:var(--text-muted);font-size:13px;">Sin ingenieros registrados.</li>';
    return;
  }
  ul.innerHTML = engineers.map((e,i) => `
    <li class="engineer-row">
      <span class="eng-badge">${e.initials}</span>
      <div style="flex:1;">
        <div class="eng-name">${e.name}</div>
      </div>
      ${e.initials==='CB'
        ? '<span style="font-size:12px;color:var(--text-muted);padding:4px 8px;">Admin</span>'
        : `<button class="btn-remove-eng" onclick="confirmarEliminar(${i})" title="Eliminar">✕</button>`}
    </li>`).join('');
}
 
function confirmarEliminar(i) {
  const eng = engineers[i];
  if (!confirm(`¿Eliminar a ${eng.name} (${eng.initials}) de la lista de ingenieros activos?\n\nSus códigos previos en la planilla no se modificarán.`)) return;
  eliminarIngeniero(i);
}
 
async function eliminarIngeniero(i) {
  engineers.splice(i, 1);
  renderEngineerList();
  populateEngineerSelect();
  await guardarIngenieros();
  toast(`✅ Ingeniero eliminado`);
}
 
async function agregarIngeniero() {
  const initials = document.getElementById('input-eng-initials').value.trim().toUpperCase();
  const name     = document.getElementById('input-eng-name').value.trim();
  if (!initials || initials.length < 2) { toast('⚠️ Las iniciales deben tener 2–3 letras'); return; }
  if (!name)     { toast('⚠️ Ingresa el nombre del ingeniero'); return; }
  if (engineers.find(e=>e.initials===initials)) { toast(`⚠️ Las iniciales "${initials}" ya existen`); return; }
  engineers.push({ initials, name });
  document.getElementById('input-eng-initials').value = '';
  document.getElementById('input-eng-name').value     = '';
  renderEngineerList();
  populateEngineerSelect();
  await guardarIngenieros();
  toast(`✅ ${name} (${initials}) agregado`);
}
 
async function guardarIngenieros() {
  if (!accessToken) return;
  showLoading('Guardando ingenieros…');
  try {
    // Clear + rewrite the Ingenieros sheet
    // First clear existing data
    const clearUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(ENG_RANGE)}:clear`;
    await fetch(clearUrl, { method:'POST', headers:{ Authorization:`Bearer ${accessToken}`, 'Content-Type':'application/json' } });
    // Then write all engineers
    const values = engineers.map(e=>[e.initials, e.name]);
    const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(ENG_RANGE)}?valueInputOption=USER_ENTERED`;
    await fetch(updateUrl, { method:'PUT', headers:{ Authorization:`Bearer ${accessToken}`, 'Content-Type':'application/json' }, body:JSON.stringify({ values }) });
    hideLoading();
  } catch(e) {
    hideLoading();
    toast('❌ Error al guardar en planilla'); console.error(e);
  }
}
 
// ═══════════════════════════════════════════════════════
//  UI HELPERS
// ═══════════════════════════════════════════════════════
function showLoading(msg) { document.getElementById('loading-msg').textContent=msg||'Cargando…'; document.getElementById('loading-overlay').className='visible'; }
function hideLoading()    { document.getElementById('loading-overlay').className=''; }
function showStatus(msg, isError) {
  const el=document.getElementById('status-bar');
  if (!msg) { el.style.display='none'; return; }
  el.style.display='block';
  el.style.background=isError?'#FEE2E2':'var(--warn-bg)';
  el.style.borderColor=isError?'#FCA5A5':'#FCD34D';
  el.style.color=isError?'#991B1B':'var(--warn)';
  el.textContent=msg;
}
function toast(msg) {
  const el=document.getElementById('toast');
  el.textContent=msg; el.className='show';
  clearTimeout(el._t); el._t=setTimeout(()=>el.className='',3000);
}
</script>
<script src="https://accounts.google.com/gsi/client" async defer></script>
</body>
</html>
