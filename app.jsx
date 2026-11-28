const { useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo } = React;

const W = 1280, H = 720;
const GHOST = [0.35, 0.5, 0.42, 0.6, 0.45, 0.55, 0.4, 0.52, 0.48];

/* 4 model slide: bukan hanya beda warna, bentuk header, kartu, bar, hiasan latar, dan penanda sampul juga berbeda */
const SLIDE_THEMES = {
  langit: { name: 'Langit', paper: '#e8f1f8', ink: '#13243a', muted: '#5d7288', grid: '#cfdeeb', axis: '#a9bfd3', header: '#dbe7f1', headerFg: '#13243a', headerSub: '#5d7288', cover: '#e8f1f8', coverFg: '#13243a', coverSub: '#2f6fed', coverMuted: '#5d7288', accent: '#2f6fed', bars: ['#a9c4f7', '#2f6fed', '#a9c4f7'], target: '#e08a1e', targetText: '#b3690d', card: '#ffffff', deco: 'orbs', hdrLine: 'none', cardR: 16, cardBorder: null, cardTop: null, barR: '5px 5px 0 0', coverBar: [96, 8, 0] },
  morph: { name: 'Morph', font: "'Montserrat', 'Inter', system-ui, sans-serif", headFont: "'Montserrat', 'Inter', system-ui, sans-serif", paper: '#8b6cf0', bgImage: 'linear-gradient(135deg, #6ec6ee 0%, #9b8cf3 36%, #b45cf0 66%, #4a5fd0 100%)', ink: '#ffffff', muted: 'rgba(255,255,255,0.8)', grid: 'rgba(255,255,255,0.3)', axis: 'rgba(255,255,255,0.5)', header: 'transparent', headerFg: '#ffffff', headerSub: 'rgba(255,255,255,0.88)', cover: '#8b6cf0', coverFg: '#ffffff', coverSub: '#ffffff', coverMuted: 'rgba(255,255,255,0.82)', accent: '#ffffff', bars: ['#e9c9ff', '#ffffff', '#e9c9ff'], barFill: 'linear-gradient(180deg, #ffe3ff 0%, #c9a6ff 100%)', sem: { good: '#8dffcf', warn: '#ffe66d', bad: '#ffb3c0' }, orbs: ['#e2b8ff', '#a27cff', '#7fd3f7', '#c06bf5'], target: '#ffe66d', targetText: '#ffe66d', card: 'rgba(255,255,255,0.16)', deco: 'orbs', hdrLine: 'none', cardR: 24, cardBorder: '1.5px solid rgba(255,255,255,0.6)', cardTop: null, barR: '8px 8px 0 0', coverBar: [120, 6, 6] },
  glass: { name: 'Glass', font: "'Manrope', 'Inter', system-ui, sans-serif", headFont: "'Manrope', 'Inter', system-ui, sans-serif", hw: 400, nw: 500, blur: 14, orbBoost: 0.2, paper: '#0b2e26', bgImage: 'linear-gradient(125deg, #0f5c45 0%, #0b3329 34%, #07130f 68%, #1b0d07 100%)', ink: '#f4f0ea', muted: 'rgba(244,240,234,0.62)', grid: 'rgba(255,255,255,0.14)', axis: 'rgba(255,255,255,0.3)', header: 'transparent', headerFg: '#f7f3ee', headerSub: 'rgba(247,243,238,0.66)', cover: '#0b2e26', coverFg: '#f7f3ee', coverSub: '#ff7a3d', coverMuted: 'rgba(247,243,238,0.62)', accent: '#ff6a2a', bars: ['#ff9a62', '#ff6a2a', '#ff9a62'], barFill: 'linear-gradient(180deg, #ff8a4c 0%, #e5420f 100%)', sem: { good: '#5fe0b0', warn: '#ffc15e', bad: '#ff8274' }, orbs: ['#ff7a3d', '#e8400f', '#ff9d5c', '#2fae85'], target: '#7fe3c1', targetText: '#7fe3c1', card: 'rgba(255,255,255,0.07)', deco: 'orbs', hdrLine: 'none', cardR: 22, cardBorder: '1px solid rgba(255,255,255,0.2)', cardTop: null, barR: '8px 8px 0 0', coverBar: [64, 3, 3] },
  korporat: { name: 'Korporat', paper: '#f4f6fa', ink: '#14213a', muted: '#5a6785', grid: '#dde2ec', axis: '#aeb7c8', header: '#12263f', headerFg: '#ffffff', headerSub: '#9FE1CB', cover: '#12263f', coverFg: '#ffffff', coverSub: '#9FE1CB', coverMuted: '#b4b8c4', accent: '#1D9E75', bars: ['#9FE1CB', '#1D9E75', '#0F6E56'], target: '#e0861c', targetText: '#b3690d', card: '#ffffff', deco: 'squares', hdrLine: '6px solid #1D9E75', cardR: 4, cardBorder: null, cardTop: '5px solid #1D9E75', barR: '0', coverBar: [14, 72, 0] },
  malam: { name: 'Malam neon', paper: '#17152e', ink: '#eeecfb', muted: '#9a96c4', grid: '#34305a', axis: '#4a4580', header: 'transparent', headerFg: '#ffffff', headerSub: '#b9a9ff', cover: '#17152e', coverFg: '#ffffff', coverSub: '#b9a9ff', coverMuted: '#9a96c4', accent: '#a995ff', bars: ['#5b4fb0', '#a995ff', '#5b4fb0'], target: '#ffb84d', targetText: '#ffb84d', card: 'rgba(255,255,255,0.06)', deco: 'rings', hdrLine: '3px solid #a995ff', cardR: 28, cardBorder: '1px solid #4a4580', cardTop: null, barR: '12px 12px 0 0', coverBar: [96, 4, 4] },
  pasir: { name: 'Editorial', paper: '#f4ece1', ink: '#2b2a28', muted: '#7d7468', grid: '#d9c9b3', axis: '#b9a68d', header: '#ebe0d0', headerFg: '#2b2a28', headerSub: '#7d7468', cover: '#f4ece1', coverFg: '#2b2a28', coverSub: '#c2603a', coverMuted: '#7d7468', accent: '#c2603a', bars: ['#e6b49c', '#c2603a', '#e6b49c'], target: '#2f6f8f', targetText: '#2f6f8f', card: '#fffaf3', deco: 'flat', hdrLine: '3px solid #2b2a28', cardR: 0, cardBorder: '2px solid #2b2a28', cardTop: null, barR: '0', coverBar: [140, 6, 0] },
  neumorph: { name: 'Neumorph', font: "'Manrope', 'Inter', system-ui, sans-serif", headFont: "'Manrope', 'Inter', system-ui, sans-serif", hw: 700, nw: 700, neu: true, paper: '#dcebea', ink: '#0a6b66', muted: '#3f918b', grid: '#c3d9d7', axis: '#8fbdb9', header: 'transparent', headerFg: '#0a6b66', headerSub: '#3f918b', cover: '#dcebea', coverFg: '#0a6b66', coverSub: '#0d9488', coverMuted: '#3f918b', accent: '#0d9488', bars: ['#8fe3d8', '#14b8a6', '#8fe3d8'], barFill: 'linear-gradient(180deg, #2dd4bf 0%, #0d9488 100%)', sem: { good: '#0d9488', warn: '#b7791f', bad: '#d1453b' }, target: '#d97706', targetText: '#b45309', card: '#dcebea', shadow: '9px 9px 20px rgba(120,160,157,0.55), -9px -9px 20px rgba(255,255,255,0.95)', deco: 'none', hdrLine: 'none', cardR: 26, cardBorder: 'none', cardTop: null, barR: '8px 8px 0 0', coverBar: [96, 8, 4] },
};
/* nama tema lama dipetakan ke 4 model baru */
const THEME_ALIAS = {  navy: 'langit', terang: 'langit', lautan: 'malam', remotion: 'malam', ungu: 'malam', navyteal: 'korporat', senja: 'pasir' };
const themeOf = (deck) => SLIDE_THEMES[THEME_ALIAS[deck.slideTheme] || deck.slideTheme] || SLIDE_THEMES.langit;

const uid = () => Math.random().toString(36).slice(2, 9);
const digits = (v) => String(v == null ? '' : v).replace(/\D/g, '');
const dot = (s) => s.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const rp = (v) => { const d = digits(v); return d ? 'Rp ' + dot(d.replace(/^0+(?=\d)/, '')) : ''; };
const toNum = (v) => { const d = digits(v); return d === '' ? null : Number(d); };
const fmt1 = (x) => String(Math.round(x * 10) / 10).replace('.', ',');
const fmtCompact = (n) => (n >= 1e9 ? fmt1(n / 1e9) + ' M' : n >= 1e6 ? fmt1(n / 1e6) + ' jt' : n >= 1e3 ? fmt1(n / 1e3) + ' rb' : String(n));
const niceStep = (x) => { if (x <= 0) return 0; const p = Math.pow(10, Math.floor(Math.log10(x))); const n = x / p; const m = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10; return m * p; };
const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const BULAN_PENDEK = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const MAX_BULAN = 6;
const YEARS = [2024, 2025, 2026, 2027, 2028, 2029, 2030];
const mkKey = (y, m) => y + '-' + String(m + 1).padStart(2, '0');
const parseKey = (k) => { const [y, m] = String(k).split('-').map(Number); return { y, m: m - 1 }; };
const idxOf = (k) => { const { y, m } = parseKey(k); return y * 12 + m; };
const keyOfIdx = (i) => mkKey(Math.floor(i / 12), i % 12);
const MONTH_OPTIONS = YEARS.flatMap((y) => BULAN.map((n, m) => ({ key: y + '-' + String(m + 1).padStart(2, '0'), label: `${n} ${y}` })));
const prevKey = (k) => keyOfIdx(idxOf(k) - 1);
const monthsOf = (deck) => {
  const a = idxOf(deck.range.from), b = Math.min(idxOf(deck.range.to), a + MAX_BULAN - 1);
  const out = [];
  for (let i = a; i <= b; i++) out.push(keyOfIdx(i));
  return out.length ? out : [deck.range.from];
};
const shortRange = (deck) => {
  const ms = monthsOf(deck), a = parseKey(ms[0]), b = parseKey(ms[ms.length - 1]);
  if (ms.length === 1) return `${BULAN_PENDEK[a.m]} ${a.y}`;
  return a.y === b.y ? `${BULAN_PENDEK[a.m]} – ${BULAN_PENDEK[b.m]} ${b.y}` : `${BULAN_PENDEK[a.m]} ${a.y} – ${BULAN_PENDEK[b.m]} ${b.y}`;
};
const rangeText = (deck) => {
  const ms = monthsOf(deck), a = parseKey(ms[0]), b = parseKey(ms[ms.length - 1]);
  if (ms.length === 1) return `${BULAN[a.m]} ${a.y}`;
  return a.y === b.y ? `${BULAN[a.m]} – ${BULAN[b.m]} ${b.y}` : `${BULAN[a.m]} ${a.y} – ${BULAN[b.m]} ${b.y}`;
};
const periodOf = (deck) => (deck.cover.period != null ? deck.cover.period : rangeText(deck));
const sublineOf = (deck) => (deck.subline != null ? deck.subline : shortRange(deck));

const mkBrand = (name) => ({ id: uid(), name });
const mkSales = (name) => ({ id: uid(), name, brands: [mkBrand('BRAND A'), mkBrand('BRAND B'), mkBrand('BRAND C')], data: {}, note: '' });
const cellOf = (sales, key, bid) => (sales.data && sales.data[key] && sales.data[key][bid]) || { total: '', target: '' };
function statsOf(sales, key, bid, keys) {
  const c = cellOf(sales, key, bid);
  const hasPrev = !!keys && keys.includes(prevKey(key));
  const total = toNum(c.total), target = total != null ? toNum(c.target) : null, prev = hasPrev ? toNum(cellOf(sales, prevKey(key), bid).total) : null;
  return {
    total, target,
    pct: total != null && target ? (total / target) * 100 : null,
    trend: total != null && prev ? ((total - prev) / prev) * 100 : null,
  };
}

const DEFAULT = {
  version: 3,
  slideTheme: 'langit',
  range: { from: '2026-10', to: '2026-12' },
  cover: { title: 'Laporan Penjualan', sub: 'Rancangan, angka menyusul', audience: 'Disajikan untuk HRD dan Manager' },
  closing: { title: 'Terima kasih', sub: 'Sesi tanya jawab' },
  sales: ['Toni', 'Mia', 'Isti', 'Yoga', 'Fuad', 'Tita'].map(mkSales),
};

/* Mengubah data versi lama (3 kolom bulan berupa teks, angka per produk) ke bentuk baru. */
/* Nama brand selalu huruf besar semua */
function migrate(d) {
  const r = migrateRaw(d);
  return r && { ...r, slideTheme: THEME_ALIAS[r.slideTheme] || r.slideTheme, sales: r.sales.map((x) => ({ ...x, brands: (x.brands || []).map((b) => ({ ...b, name: String(b.name || '').toUpperCase() })) })) };
}
function migrateRaw(d) {
  if (!d || !Array.isArray(d.sales) || !d.cover || !d.closing) return null;
  if (d.version === 3 && d.range && d.range.from && d.range.to) return d.slideTheme === 'navy' ? { ...d, slideTheme: 'langit' } : d;
  const names = Array.isArray(d.months) ? d.months : [];
  const idxs = names.map((n) => BULAN.findIndex((b) => b.toLowerCase() === String(n || '').trim().toLowerCase()));
  const year = new Date().getFullYear();
  let keys = [mkKey(year, 9), mkKey(year, 10), mkKey(year, 11)];
  if (idxs.length === 3 && idxs.every((i) => i >= 0)) {
    let y = year, prev = -1;
    keys = idxs.map((m, i) => { if (i > 0 && m < prev) y++; prev = m; return mkKey(y, m); });
  }
  return {
    version: 3,
    slideTheme: !d.slideTheme || d.slideTheme === 'navy' ? 'langit' : d.slideTheme,
    range: { from: keys[0], to: keys[keys.length - 1] },
    subline: d.subline != null && !/^Laporan penjualan/.test(d.subline) ? d.subline : null,
    cover: d.cover,
    closing: d.closing,
    sales: d.sales.map((s) => {
      const olds = s.products || s.brands || [];
      const data = {};
      if (s.products) keys.forEach((k, i) => { data[k] = {}; olds.forEach((p) => { data[k][p.id] = { total: (p.values && p.values[i]) || '', target: p.target || '' }; }); });
      return { id: s.id, name: s.name, note: s.note || '', brands: olds.map((p) => ({ id: p.id, name: p.name })), data: s.products ? data : (s.data || {}) };
    }),
  };
}

function load() {
  try {
    const raw = localStorage.getItem('laporan-penjualan-v2');
    if (raw) { const m = migrate(JSON.parse(raw)); if (m) return m; }
  } catch (e) {}
  return DEFAULT;
}

/* Database dan login (Supabase). Kunci publishable memang dirancang untuk dipakai di browser.
   Admin: login Supabase Auth (email + password), hanya email di tabel lp_admin yang boleh membaca/menulis tabel lp_deck.
   Sales: fungsi database lp_sales_* yang memeriksa password di server dan hanya mengubah slide milik sales itu. */
const SB_BASE = 'https://lebwxqkbpjqqszzvmnas.supabase.co';
const SB_URL = SB_BASE + '/rest/v1/lp_deck';
const SB_KEY = 'sb_publishable_-ZI4t9ZuLF9LuIee8W_7Fg_EUrgXFat';
const sbHead = (tok) => ({ apikey: SB_KEY, 'Content-Type': 'application/json', ...(tok ? { Authorization: 'Bearer ' + tok } : {}) });
const SESSION_KEY = 'lp-session';
const readSession = () => { try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch (e) { return null; } };
const writeSession = (v) => { try { v ? localStorage.setItem(SESSION_KEY, JSON.stringify(v)) : localStorage.removeItem(SESSION_KEY); } catch (e) {} };
const sameName = (a, b) => String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase();

async function dbLoad(tok) {
  const r = await fetch(SB_URL + '?id=eq.utama&select=data', { headers: sbHead(tok) });
  if (r.status === 401 || r.status === 403) throw new Error('auth');
  if (!r.ok) throw new Error('load ' + r.status);
  const rows = await r.json();
  return rows.length ? rows[0].data : null;
}
async function dbSave(data, tok) {
  const r = await fetch(SB_URL + '?on_conflict=id', {
    method: 'POST',
    headers: { ...sbHead(tok), Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({ id: 'utama', data, updated_at: new Date().toISOString() }),
  });
  if (r.status === 401 || r.status === 403) throw new Error('auth');
  if (!r.ok) throw new Error('save ' + r.status);
}
const rpc = async (fn, body, tok) => {
  const r = await fetch(SB_BASE + '/rest/v1/rpc/' + fn, { method: 'POST', headers: sbHead(tok), body: JSON.stringify(body || {}) });
  if (!r.ok) throw new Error('rpc ' + fn + ' ' + r.status);
  return r.json();
};
const salesNames = () => rpc('lp_sales_names');
const salesLogin = (name, pass) => rpc('lp_sales_login', { p_name: name, p_pass: pass });
const salesSave = (name, pass, slide) => rpc('lp_sales_save', { p_name: name, p_pass: pass, p_sales: slide });
const salesLog = (name, pass, action) => rpc('lp_sales_log', { p_name: name, p_pass: pass, p_action: action }).catch(() => false);
/* Canvasing: admin lewat tabel (JWT), sales lewat fungsi database yang memeriksa password */
const CANVAS_URL = SB_BASE + '/rest/v1/lp_canvas';
async function canvasList(session, tok) {
  if (session.role === 'admin') {
    const r = await fetch(CANVAS_URL + '?select=*&order=created_at.asc', { headers: sbHead(tok) });
    if (!r.ok) throw new Error('cv ' + r.status);
    return r.json();
  }
  return rpc('lp_canvas_list', { p_name: session.name, p_pass: session.pass });
}
async function canvasSave(session, tok, f, who) {
  const row = { kontraktor: f.kontraktor, produk: f.produk, catatan: f.catatan, foto: f.foto || null };
  if (session.role === 'admin') {
    const r = f.id
      ? await fetch(CANVAS_URL + '?id=eq.' + encodeURIComponent(f.id), { method: 'PATCH', headers: { ...sbHead(tok), Prefer: 'return=minimal' }, body: JSON.stringify({ ...row, updated_at: new Date().toISOString() }) })
      : await fetch(CANVAS_URL, { method: 'POST', headers: { ...sbHead(tok), Prefer: 'return=minimal' }, body: JSON.stringify({ ...row, sales: who }) });
    if (!r.ok) throw new Error('cv ' + r.status);
    return true;
  }
  const r = await rpc('lp_canvas_save', { p_name: session.name, p_pass: session.pass, p_id: f.id || null, p_kontraktor: row.kontraktor, p_produk: row.produk, p_catatan: row.catatan, p_foto: row.foto });
  if (!r) throw new Error('cv');
  return true;
}
async function canvasDelete(session, tok, id) {
  if (session.role === 'admin') {
    const r = await fetch(CANVAS_URL + '?id=eq.' + encodeURIComponent(id), { method: 'DELETE', headers: { ...sbHead(tok), Prefer: 'return=minimal' } });
    if (!r.ok) throw new Error('cv ' + r.status);
    return true;
  }
  return rpc('lp_canvas_delete', { p_name: session.name, p_pass: session.pass, p_id: id });
}
/* Riwayat hanya mencatat sales (admin tidak ditampilkan) dan yang terbaru di paling atas */
const onlySales = (rows) => (Array.isArray(rows) ? rows : [])
  .filter((r) => !ADMIN_USERS[adminKey(r.actor)])
  .sort((a, b) => new Date(b.last_at || b.at) - new Date(a.last_at || a.at));
async function loadActivity(tok) {
  const r = await fetch(SB_BASE + '/rest/v1/lp_activity?select=*&order=last_at.desc&limit=200', { headers: sbHead(tok) });
  if (!r.ok) throw new Error('act ' + r.status);
  return r.json();
}

const tokenToSession = (j, email) => ({ role: 'admin', email: email || (j.user && j.user.email) || '', access: j.access_token, refresh: j.refresh_token, exp: Date.now() + (j.expires_in || 3600) * 1000 });
/* Admin masuk dengan username (mis. Toni); Supabase Auth tetap memakai email di belakang layar */
const ADMIN_USERS = { toni: 'toniimam87@gmail.com' };
const adminKey = (v) => String(v || '').trim().toLowerCase().replace(/\s+/g, '');
const adminEmail = (v) => ADMIN_USERS[adminKey(v)] || String(v || '').trim();
const adminLabel = (email) => { const k = Object.keys(ADMIN_USERS).find((u) => ADMIN_USERS[u] === email); return k ? k.charAt(0).toUpperCase() + k.slice(1) : email; };
async function adminLogin(user, password) {
  const email = adminEmail(user);
  const r = await fetch(SB_BASE + '/auth/v1/token?grant_type=password', { method: 'POST', headers: sbHead(), body: JSON.stringify({ email, password }) });
  if (!r.ok) throw new Error('Username atau password salah');
  const sess = tokenToSession(await r.json(), email);
  let ok = false;
  try { ok = (await rpc('lp_is_admin', {}, sess.access)) === true; } catch (e) {}
  if (!ok) throw new Error('Akun ini bukan admin');
  return sess;
}
async function adminRefresh(sess) {
  const r = await fetch(SB_BASE + '/auth/v1/token?grant_type=refresh_token', { method: 'POST', headers: sbHead(), body: JSON.stringify({ refresh_token: sess.refresh }) });
  if (!r.ok) throw new Error('auth');
  return tokenToSession(await r.json(), sess.email);
}

function Fit({ children }) {
  const ref = useRef(null);
  const [s, setS] = useState(0.4);
  useLayoutEffect(() => {
    const el = ref.current;
    const calc = () => { const r = el.getBoundingClientRect(); if (r.width && r.height) setS(Math.min(r.width / W, r.height / H)); };
    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={ref} className="w-full h-full flex items-center justify-center">
      <div style={{ width: W * s, height: H * s }} className="relative overflow-hidden shrink-0">
        <div style={{ width: W, height: H, transform: `scale(${s})`, transformOrigin: 'top left' }}>{children}</div>
      </div>
    </div>
  );
}

function Ed({ value, onChange, ro, money, style, placeholder, label }) {
  const shown = money ? rp(value) : value;
  if (ro) return <span style={{ display: 'block', ...style }}>{shown === '' || shown == null ? (placeholder || '\u00a0') : shown}</span>;
  return (
    <input className="ed" style={style} value={shown} placeholder={placeholder} aria-label={label}
      inputMode={money ? 'numeric' : 'text'}
      onChange={(e) => onChange(money ? digits(e.target.value) : e.target.value)} />
  );
}

const headFont = "'Space Grotesk', system-ui, sans-serif";

const lum = (hex) => { const h = hex.replace('#', ''); const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.substr(i, 2), 16)); return (0.299 * r + 0.587 * g + 0.114 * b) / 255; };
const semBase = (T) => (T.sem ? { ...T.sem, card: T.card } : lum(T.paper) < 0.5
  ? { good: '#4fd1a5', warn: '#f5b942', bad: '#ff8a7a', card: T.card || 'rgba(255,255,255,0.07)' }
  : { good: '#0f8a64', warn: '#b7791f', bad: '#d1453b', card: T.card || 'rgba(255,255,255,0.74)' });
const semOf = (T) => ({ ...semBase(T), dk: lum(T.paper) < 0.5 });
/* Warna persen 0-100%: gradasi merah, oranye, hijau; setiap besaran persen punya warna sendiri */
const pcol = (v, sem) => {
  const p = Math.max(0, Math.min(100, v)), h = p <= 50 ? (p / 50) * 30 : 30 + ((p - 50) / 50) * 105;
  const sat = 78 / 100, l = (sem && sem.dk ? 62 : 37) / 100, a = sat * Math.min(l, 1 - l);
  const f = (n) => { const k = (n + h / 30) % 12, c = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)); return Math.round(255 * c).toString(16).padStart(2, '0'); };
  return '#' + f(0) + f(8) + f(4);
};
const blurOf = (T) => (T.shadow ? { boxShadow: T.shadow } : T.blur ? { backdropFilter: `blur(${T.blur}px)`, WebkitBackdropFilter: `blur(${T.blur}px)`, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 10px 28px -12px rgba(0,0,0,0.55)' } : {});
const NEU_IN = { border: 'none', boxShadow: 'inset 4px 4px 8px rgba(120,160,157,0.5), inset -4px -4px 8px rgba(255,255,255,0.95)' };
const GLASS = { boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5), 0 4px 10px -6px rgba(10,30,70,0.35)' };

/* Hiasan latar: bola 3D di belakang kartu kaca. Posisi, ukuran, dan warnanya acak per slide
   (di-seed dari id slide, jadi stabil di editor, presentasi, dan export). Ditandai data-m supaya ikut berpindah saat Morph. */
const hashStr = (str) => { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
const rng = (seed) => { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
function orbSpots(T, kind, seed) {
  const r = rng(hashStr(kind + ':' + seed));
  const between = (lo, hi) => lo + (hi - lo) * r();
  const pal = (T.orbs || [T.accent, ...(T.bars || [])]).filter(Boolean);
  const pick = () => pal[Math.floor(r() * pal.length)];
  const spots = [];
  if (kind === 'sales') {
    const left = r() < 0.5;
    [[140, 330, 170, 260], [360, 520, 140, 230]].forEach(([y0, y1, s0, s1], i) => {
      const sz = between(s0, s1), vis = between(36, 120), onLeft = i === 0 ? left : !left;
      spots.push({ x: onLeft ? -sz + vis : 1280 - vis, y: between(y0, y1), s: sz });
    });
  } else {
    /* sampul dan penutup: bola di sisi kanan supaya teks di kiri tetap terbaca; tinggi dan ukurannya acak */
    const cover = kind === 'cover', big = between(300, 440), small = between(130, 230);
    spots.push({ x: between(900, 1020), y: cover ? between(-90, 160) : between(150, 380), s: big });
    spots.push({ x: between(780, 1010), y: cover ? between(430, 560) : between(-60, 100), s: small });
  }
  return spots.map((o) => { const c1 = pick(); let c2 = pick(); if (c2 === c1 && pal.length > 1) c2 = pal[(pal.indexOf(c1) + 1) % pal.length]; return { ...o, c1, c2, op: Math.min(0.95, between(0.5, 0.78) + (T.orbBoost || 0)), lx: between(24, 38), ly: between(20, 32) }; });
}
function Deco({ T, kind, seed }) {
  const model = T.deco || 'orbs';
  if (model === 'none') return null;
  return orbSpots(T, kind, seed).map((o, i) => {
    const base = { position: 'absolute', left: Math.round(o.x), top: Math.round(o.y), width: Math.round(o.s), height: Math.round(o.s), zIndex: -1, pointerEvents: 'none' };
    let st;
    if (model === 'rings') st = { ...base, borderRadius: Math.round(o.s / 2), border: `${Math.max(5, Math.round(o.s / 22))}px solid ${o.c1}`, opacity: Math.min(o.op, 0.7) * (kind === 'sales' ? 0.7 : 1) };
    else if (model === 'squares') st = { ...base, borderRadius: Math.round(o.s / 10), background: o.c1, opacity: (kind === 'sales' ? 0.16 : 0.3) + (i ? 0.06 : 0) };
    else if (model === 'flat') st = { ...base, borderRadius: Math.round(o.s / 2), background: o.c1, opacity: kind === 'sales' ? 0.2 : 0.3 };
    else st = { ...base, borderRadius: Math.round(o.s / 2), opacity: kind === 'sales' && !T.orbBoost ? Math.min(o.op, 0.6) : o.op,
      background: `radial-gradient(circle at ${o.lx.toFixed(0)}% ${o.ly.toFixed(0)}%, rgba(255,255,255,0.85) 0, rgba(255,255,255,0) 24%), radial-gradient(circle at ${(o.lx + 6).toFixed(0)}% ${(o.ly + 6).toFixed(0)}%, ${o.c1}, ${o.c2})`,
      boxShadow: `inset -${Math.round(o.s / 14)}px -${Math.round(o.s / 11)}px ${Math.round(o.s / 6)}px rgba(0,0,0,0.2)` };
    return <div key={i} aria-hidden="true" data-m={`orb${i}`} style={st} />;
  });
}

function Pct({ v, sem, muted, small }) {
  if (v == null) return <span style={{ color: muted }}>–</span>;
  const c = pcol(v, sem);
  return <span style={{ color: c, background: c + '26', borderRadius: 999, padding: small ? '1px 5px' : '2px 10px', fontWeight: 600, fontSize: small ? '0.86em' : undefined }}>{Math.round(v)}%</span>;
}
/* Capaian target: angka persen dengan bar progres tipis di bawahnya (penuh = 100% target; warna mengikuti ambang 80/100) */
function BigPct({ x, sem, muted, fs = 22 }) {
  if (x.pct == null) return <div style={{ fontSize: 12, fontWeight: 600, color: muted, marginTop: 2, whiteSpace: 'nowrap' }}>{x.total > 0 ? 'Tanpa target' : '–'}</div>;
  const c = pcol(x.pct, sem);
  return <div style={{ fontSize: fs, fontWeight: 800, color: c, marginTop: 2, letterSpacing: '-0.02em' }}>{Math.round(x.pct)}%</div>;
}
function PctBar({ v, sem, muted, small }) {
  if (v == null) return <span style={{ color: muted }}>–</span>;
  const c = pcol(v, sem);
  return (
    <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: small ? 2 : 3 }}>
      <span style={{ color: c, fontWeight: 700, fontSize: small ? '0.9em' : undefined, lineHeight: 1.1, textAlign: 'right' }}>{Math.round(v)}%</span>
      <span style={{ display: 'block', height: small ? 4 : 5, borderRadius: 3, background: c + '2E', overflow: 'hidden' }}>
        <span style={{ display: 'block', height: '100%', width: Math.max(4, Math.min(100, v)) + '%', background: c, borderRadius: 3 }} />
      </span>
    </span>
  );
}
function Trend({ v, sem, muted, small }) {
  if (v == null) return <span style={{ color: muted }}>–</span>;
  const up = v > 0.05, down = v < -0.05;
  return <span style={{ color: up ? sem.good : down ? sem.bad : muted, fontWeight: 600, whiteSpace: 'nowrap', fontSize: small ? '0.9em' : undefined }}>{up ? (small ? '▲' : '▲ ') : down ? (small ? '▼' : '▼ ') : ''}{small ? Math.round(Math.abs(v)) : fmt1(Math.abs(v))}%</span>;
}

const BRAND_LOGOS = { dekkson: 'logos/dekkson.png', bellezza: 'logos/bellezza.png', bellezzah: 'logos/bellezza.png', solid: 'logos/solid.png', hemmen: 'logos/hemmen.png', smco: 'logos/smco.png', rinoks: 'logos/rinoks.png' };
const MONO_LOGOS = Object.fromEntries(['dekkson', 'bellezza', 'solid', 'hemmen', 'smco', 'rinoks', 'ina'].map((n) => [n, { d: `logos/${n}-d.png`, l: `logos/${n}-l.png` }]));
MONO_LOGOS.inacloset = MONO_LOGOS.ina; MONO_LOGOS.bellezzah = MONO_LOGOS.bellezza;
const SALES_PHOTOS = Object.fromEntries(['toni', 'indah', 'rifa', 'yeni', 'waida', 'tita', 'ardi', 'tyas', 'yoga', 'fuad', 'masr'].map((n) => [n, `photos/${n}.png`]));
const photoOf = (sales, deck) => (deck && deck.photoOn === false) ? null : ((deck && deck.photos && deck.photos[sales.id]) || SALES_PHOTOS[String(sales.name || '').toLowerCase().replace(/[^a-z0-9]/g, '')] || null);
const brandKey = (name) => String(name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const monoOf = (name, deck) => { const k = brandKey(name); if (deck && deck.logos && deck.logos[k]) return (deck.logosMono && deck.logosMono[k]) || null; return MONO_LOGOS[k] || null; };
const logoOf = (name, deck) => { const k = brandKey(name); return (deck && deck.logos && deck.logos[k]) || BRAND_LOGOS[k] || null; };
function Hit({ pick, target, style, label, children, m, mt }) {
  if (!pick) return <div data-m={m} data-mt={mt} style={style}>{children}</div>;
  return (
    <div className="hit" data-m={m} data-mt={mt} role="button" tabIndex={0} aria-label={label} style={style} onClick={() => pick(target)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(target); } }}>{children}</div>
  );
}

/* Tampilan padat untuk banyak brand: grid kartu kecil tanpa grafik, ukuran menyesuaikan jumlah brand dan bulan. */
/* Tabung kaca transparan: tinggi tabung = 100% target, isi cairan = capaian (tanpa garis ukur) */
const isDarkT = (T) => { const m = /^#?([0-9a-f]{6})/i.exec(T.paper || ''); if (!m) return false; const n = parseInt(m[1], 16); return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) < 110; };
function Glass({ T, pct, h, total }) {
  /* candle bergaya kaca: tabung kaca transparan = 0-100% target (atas terbuka), cairan = omzet, >100% menembus tepi atas; label Rp di atas */
  const noTarget = pct == null && total > 0, dk = isDarkT(T);
  const base = h * 0.72, cap = 120;
  const p = noTarget ? 60 : pct == null ? 0 : Math.max(0, Math.min(cap, pct));
  const bodyH = p > 0 ? Math.max(3, (base * p) / 100) : 0;
  const w = (a) => `rgba(255,255,255,${a})`;
  const edge = dk ? w(0.4) : 'rgba(90,120,165,0.35)';
  const fill = T.barFill || T.bars[1];
  const trackH = pct != null || noTarget ? base : 0;
  return (
    <div style={{ position: 'relative', width: '100%', height: h }}>
      {trackH > 0 && (
        <div style={{ position: 'absolute', left: '14%', right: '14%', bottom: 0, height: trackH, boxSizing: 'border-box', ...(T.neu ? { border: 'none', background: 'transparent', boxShadow: 'inset 4px 4px 8px rgba(120,160,157,0.6), inset -4px -4px 8px rgba(255,255,255,0.95)' } : { border: `1.5px solid ${edge}`, borderTop: 'none', background: dk ? `linear-gradient(90deg, ${w(0.22)}, ${w(0.04)} 30%, ${w(0.02)} 70%, ${w(0.15)})` : `linear-gradient(90deg, ${w(0.75)}, ${w(0.2)} 30%, ${w(0.1)} 70%, ${w(0.55)})`, boxShadow: dk ? 'inset 0 0 14px rgba(255,255,255,0.18), 0 12px 20px -8px rgba(0,0,0,0.6)' : 'inset 0 0 14px rgba(255,255,255,0.7), 0 10px 18px -8px rgba(20,50,90,0.35)' }) }} />
      )}
      {bodyH > 0 && (
        <div style={{ position: 'absolute', left: 'calc(14% + 2px)', right: 'calc(14% + 2px)', bottom: 1.5, height: bodyH - 1.5, background: fill, opacity: noTarget ? 0.7 : 0.94, boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.35)' }} />
      )}
      {trackH > 0 && !T.neu && <div style={{ position: 'absolute', left: 'calc(14% + 6px)', width: 5, bottom: 8, height: Math.max(0, trackH - 16), borderRadius: 5, background: `linear-gradient(180deg, ${w(0.85)}, ${w(0.1)})` }} />}
    </div>
  );
}
function MiniChart({ T, keys, st, h, short, pick, bid, bname, w }) {
  return (
    <div style={{ width: w, flex: 'none' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: h }}>
        {st.map((x, i) => (
          <Hit key={keys[i]} pick={pick} target={{ month: keys[i], id: `v-${bid}-${keys[i]}` }} label={`Isi ${bname} ${BULAN[parseKey(keys[i]).m]}`} style={{ flex: 1, minWidth: 0, height: h }}>
            <Glass T={T} pct={x.pct} total={x.total} h={h} />
          </Hit>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 4, fontSize: 12, color: T.muted }}>
        {keys.map((k) => <div key={k} style={{ flex: 1, minWidth: 0, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden' }}>{short(k)}</div>)}
      </div>
      <div style={{ display: 'flex', gap: 6, fontSize: 12, fontWeight: 700, color: T.ink, letterSpacing: '-0.03em' }}>
        {st.map((x, i) => <div key={keys[i]} style={{ flex: 1, minWidth: 0, textAlign: 'center', whiteSpace: 'nowrap' }}>{x.total == null ? '–' : fmtCompact(x.total)}</div>)}
      </div>
    </div>
  );
}
function DenseGrid({ sales, keys, T, sem, pick, short, labW }) {
  const nb = sales.brands.length;
  const gap = 12, availH = 470;
  const layout = (cols) => {
    const rowsN = Math.ceil(nb / cols);
    const cardH = Math.floor((availH - gap * (rowsN - 1)) / rowsN);
    return { cols, rowsN, cardH, raw: Math.floor((cardH - (cols <= 3 ? 70 : 54) - 4) / keys.length) };
  };
  let L = layout(nb <= 6 ? 3 : nb <= 8 ? 4 : 5);
  const ultra = L.raw < 15;
  if (ultra && nb > 20) L = layout(6);
  const { cols, rowsN, cardH } = L;
  const roomy = cols <= 3;
  const rowH = Math.max(15, Math.min(roomy ? 46 : 34, L.raw));
  const fs = Math.max(12, Math.min(roomy ? 18 : 15, Math.floor(rowH * 0.62)));
  const nameFs = ultra ? 16 : roomy ? 26 : rowsN >= 3 ? 19 : 22;
  const nameH = ultra ? 22 : roomy ? 34 : 26;
  const pctW = roomy ? 58 : 44, trW = roomy ? 64 : 46;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gridAutoRows: cardH, gap }}>
      {sales.brands.map((b, bi) => {
        const st = keys.map((k) => statsOf(sales, k, b.id, keys));
        return (
          <div key={b.id} data-m={`card-${bi}`} style={{ ...GLASS, ...blurOf(T), background: sem.card, border: T.cardBorder || `1px solid ${T.grid}`, ...(T.cardTop ? { borderTop: T.cardTop } : {}), borderRadius: Math.round(T.cardR * 0.75), padding: ultra ? '8px 10px' : roomy ? '16px 22px' : '12px 14px', minWidth: 0, overflow: 'hidden' }}>
            <Hit pick={pick} target={{ id: `bn-${b.id}` }} label={`Ubah nama ${b.name}`}
              style={{ fontFamily: T.headFont || headFont, fontWeight: T.nw || 600, fontSize: nameFs, height: nameH, lineHeight: nameH + 'px', textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 4 }}>
              {b.name || 'Nama brand'}
            </Hit>
            {ultra ? (
              <div style={{ display: 'flex', gap: 2 }}>
                {keys.map((k, i) => {
                  const c = st[i].pct == null ? T.muted : pcol(st[i].pct, sem);
                  const tr = st[i].trend, tc = tr == null ? T.muted : tr > 0.05 ? sem.good : tr < -0.05 ? sem.bad : T.muted;
                  return (
                    <Hit key={k} pick={pick} target={{ month: k, id: `v-${b.id}-${k}` }} label={`Isi ${b.name} ${BULAN[parseKey(k).m]}`}
                      style={{ flex: 1, minWidth: 0, textAlign: 'center', lineHeight: 1.25, borderRadius: 4 }}>
                      <div style={{ fontSize: 11, color: T.muted, height: 14, overflow: 'hidden' }}>{BULAN_PENDEK[parseKey(k).m]}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: c, height: 17, whiteSpace: 'nowrap', letterSpacing: '-0.02em' }}>{st[i].pct == null ? '–' : Math.round(st[i].pct)}</div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: tc, height: 14, whiteSpace: 'nowrap' }}>{i === 0 || tr == null ? '' : (tr > 0.05 ? '▲' : tr < -0.05 ? '▼' : '') + Math.round(Math.abs(tr))}</div>
                    </Hit>
                  );
                })}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: roomy ? 12 : 8, alignItems: 'flex-start' }}>
                <MiniChart T={T} keys={keys} st={st} h={Math.max(44, rowH * keys.length - 36)} short={short} pick={pick} bid={b.id} bname={b.name} w={roomy ? 126 : 84} />
                <div style={{ flex: 1, minWidth: 0 }}>
                {keys.map((k, i) => [k, i]).reverse().map(([k, i], pos) => (
              <Hit key={k} pick={pick} target={{ month: k, id: `v-${b.id}-${k}` }} label={`Isi ${b.name} ${BULAN[parseKey(k).m]}`}
                style={{ display: 'flex', alignItems: 'center', gap: roomy ? 6 : 6, height: rowH, fontSize: fs, borderTop: pos ? `1px solid ${T.grid}` : 'none' }}>
                <span style={{ width: roomy ? labW + 8 : labW, flex: 'none', color: T.muted }}>{short(k)}</span>
                <span style={{ flex: 1 }} />
                <span style={{ width: pctW, flex: 'none', textAlign: 'right' }}>{rowH >= 26 ? <PctBar small v={st[i].pct} sem={sem} muted={T.muted} /> : <Pct small v={st[i].pct} sem={sem} muted={T.muted} />}</span>
                <span style={{ width: trW, flex: 'none', textAlign: 'right' }}>{i === 0 ? null : <Trend v={st[i].trend} sem={sem} muted={T.muted} />}</span>
              </Hit>
            ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function SalesSlide({ sales, deck, n, total, pick, page = 0, pages = 1, combined = false, showNote = true }) {
  const T = themeOf(deck);
  const sem = semOf(T);
  const keys = monthsOf(deck);
  const nb = sales.brands.length;
  const compact = nb > 3 || combined;
  const crossYear = parseKey(keys[0]).y !== parseKey(keys[keys.length - 1]).y;
  const dense = false;
  const photo = photoOf(sales, deck);
  const chartH = keys.length <= 3 ? 215 : keys.length <= 4 ? 175 : 140;
  const rowH = keys.length <= 3 ? 42 : keys.length <= 4 ? 38 : 33;
  const rowFs = nb > 4 ? 14 : nb > 3 ? 15 : compact ? 16 : 17;
  const labW = (nb > 4 ? 28 : compact ? 38 : 48) + (crossYear ? 18 : 0);
  const short = (k) => BULAN_PENDEK[parseKey(k).m] + (crossYear ? ' ' + String(parseKey(k).y).slice(2) : '');
  return (
    <div data-m="bg" style={{ width: W, height: H, background: T.bgImage || T.paper, color: T.ink, fontFamily: T.font || "'Inter', system-ui, sans-serif", position: 'relative', overflow: 'hidden', isolation: 'isolate' }}>
      <Deco T={T} kind="sales" seed={sales.id} />
      <div style={{ height: 100, position: 'relative', zIndex: photo ? 3 : 0, color: T.headerFg, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 48px', gap: 32 }}>
        <div data-m="hdr" style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: 100, boxSizing: 'border-box', background: T.header, borderBottom: T.hdrLine, zIndex: -1 }} />
        {photo
          ? <span style={{ flex: 'none', position: 'relative', width: 112, height: 54 }}><img src={photo} alt={sales.name} style={{ position: 'absolute', left: 0, top: -23, height: 140, width: 'auto', maxWidth: 150, pointerEvents: 'none', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }} /></span>
          : <LogoMark h={54} style={{ flex: 'none' }} />}
        <Hit m="title" mt="l" pick={pick} target={{ id: 's-name' }} label="Ubah nama sales" style={{ flex: 1, minWidth: 0, fontFamily: T.headFont || headFont, fontWeight: T.hw || 700, fontSize: 54, letterSpacing: '-0.02em' }}>
          {sales.name || 'Nama sales'}
        </Hit>
        <Hit m="sub" mt="r" pick={pick} target={{ id: 'g-sub' }} label="Ubah keterangan periode" style={{ width: 560, flex: 'none', textAlign: 'right', fontSize: 22, color: T.headerSub, }}>
          {sublineOf(deck)}
        </Hit>
      </div>

      <div style={{ padding: '22px 48px 0' }}>
        <div style={combined ? { display: 'flex', gap: 16, alignItems: 'stretch' } : undefined}>
        <div style={combined ? { flex: '1 1 0', minWidth: 0 } : undefined}>
        {dense ? <DenseGrid sales={sales} keys={keys} T={T} sem={sem} pick={pick} short={short} labW={crossYear ? 52 : 32} /> : (
        <div style={{ display: 'flex', gap: nb > 3 ? 10 : 16 }}>
          {sales.brands.map((b, bi) => {
            const st = keys.map((k) => statsOf(sales, k, b.id, keys));
            return (
              <div key={b.id} data-m={`card-${bi}`} style={{ ...GLASS, ...blurOf(T), flex: 1, minWidth: 0, background: sem.card, border: T.cardBorder || `1px solid ${T.grid}`, ...(T.cardTop ? { borderTop: T.cardTop } : {}), borderRadius: T.cardR, padding: nb > 3 ? '16px 12px' : '16px 18px' }}>
                {(() => {
                  const mo = deck && deck.logoOn === false ? null : monoOf(b.name, deck);
                  const lg = deck && deck.logoOn === false ? null : mo ? (sem.dk ? mo.l : mo.d) : logoOf(b.name, deck);
                  return lg ? (
                    <div role="img" aria-label={b.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10, minHeight: 48 }}>
                      {mo
                        ? <img src={lg} alt={b.name} style={{ width: 'auto', height: 'auto', maxHeight: 48, maxWidth: '80%', objectFit: 'contain', display: 'block', filter: sem.dk ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.35))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.18))' }} />
                        : <span style={{ maxWidth: '80%', boxSizing: 'border-box', background: '#ffffff', borderRadius: 10, padding: '4px 8px', display: 'flex', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.18)' }}><img src={lg} alt={b.name} style={{ width: 'auto', height: 'auto', maxHeight: 40, maxWidth: '100%', objectFit: 'contain', display: 'block' }} /></span>}
                    </div>
                  ) : (
                    <Hit pick={pick} target={{ id: `bn-${b.id}` }} label={`Ubah nama ${b.name}`} style={{ fontFamily: T.headFont || headFont, fontWeight: T.nw || 600, fontSize: nb > 4 ? 22 : 28, marginBottom: 10, minHeight: 48, textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {b.name || 'Nama brand'}
                    </Hit>
                  );
                })()}
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 10, height: chartH }}>
                  {st.map((x, i) => (
                    <Hit key={keys[i]} pick={pick} target={{ month: keys[i], id: `v-${b.id}-${keys[i]}` }} label={`Isi ${b.name} ${BULAN[parseKey(keys[i]).m]}`}
                      style={{ flex: 1, maxWidth: 76, height: chartH }}>
                      <Glass T={T} pct={x.pct} total={x.total} h={chartH} />
                    </Hit>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 6, fontSize: 15, color: T.muted }}>
                  {keys.map((k) => <div key={k} style={{ flex: 1, maxWidth: 76, textAlign: 'center', lineHeight: 1.15 }}>{short(k)}</div>)}
                </div>
                <div style={{ marginTop: 10 }}>
                  {keys.map((k, i) => [k, i]).reverse().map(([k, i], pos) => (
                    <Hit key={k} pick={pick} target={{ month: k, id: `v-${b.id}-${k}` }} label={`Isi ${b.name} ${BULAN[parseKey(k).m]}`}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, height: rowH, fontSize: rowFs, borderTop: pos ? `1px solid ${T.grid}` : 'none' }}>
                      <span style={{ width: labW, flex: 'none', color: T.muted }}>{short(k)}</span>
                      <span style={{ flex: 1, minWidth: 0, fontWeight: 700, whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}><span style={{ fontSize: '0.8em', fontWeight: 500, color: T.muted, marginRight: 3 }}>Rp</span>{st[i].total == null ? '–' : dot(String(Math.round(st[i].total)))}</span>
                      <span style={{ flex: 'none', textAlign: 'right' }}>{i === 0 ? null : <Trend v={st[i].trend} sem={sem} muted={T.muted} />}</span>
                    </Hit>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        )}
        </div>
        {combined && <CombinedSummary sales={sales} keys={keys} T={T} sem={sem} />}
        </div>
        <div data-m="legend" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px 28px', marginTop: 10, fontSize: 15, color: T.muted }}>
          <span>Tinggi gelas = capaian dari target</span>
          <span>▲ ▼ = dibanding bulan sebelumnya</span>
        </div>
      </div>

      {showNote ? (
      <div data-m="note" style={{ position: 'absolute', left: 48, right: 48, bottom: 22, display: 'flex', alignItems: 'center', gap: 16, fontSize: 21, borderTop: `1px solid ${T.grid}`, paddingTop: 10 }}>
        <Hit pick={pick} target={{ id: 's-note' }} label="Ubah catatan" style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.3 }}>
            <span style={{ color: T.muted }}>Catatan dari </span>
            <span style={{ fontWeight: 600 }}>{sales.name || 'sales'}</span>
            <span style={{ color: T.muted }}>: </span>
            {sales.note ? <span>“{sales.note}”</span> : <span style={{ color: T.muted, fontStyle: 'italic' }}>belum ada catatan</span>}
          </div>
        </Hit>
        <span style={{ color: T.muted, flex: 'none', fontSize: 18 }}>{n} / {total}</span>
      </div>
      ) : (
        <div data-m="note" style={{ position: 'absolute', left: 48, right: 48, bottom: 22, display: 'flex', justifyContent: 'flex-end', fontSize: 18, color: T.muted, borderTop: `1px solid ${T.grid}`, paddingTop: 10 }}>{n} / {total}</div>
      )}
    </div>
  );
}

function CoverSlide({ deck, ro, api }) {
  const T = themeOf(deck);
  return (
    <div data-m="bg" style={{ width: W, height: H, background: T.bgImage || T.cover, color: T.coverFg, fontFamily: T.font || "'Inter', system-ui, sans-serif", padding: '0 96px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden', isolation: 'isolate' }}>
      <Deco T={T} kind="cover" seed="cover" />
      <LogoMark h={92} style={{ position: 'absolute', left: 96, top: 64 }} />
      <div data-m="hdr" style={{ width: T.coverBar[0], height: T.coverBar[1], borderRadius: T.coverBar[2], background: T.accent, marginBottom: 40 }} />
      <div data-m="title" data-mt="l" style={{ fontFamily: T.headFont || headFont, fontWeight: T.hw || 700, fontSize: 96, letterSpacing: '-0.02em', lineHeight: 1.05 }}>
        <Ed ro={ro} value={deck.cover.title} label="Judul" onChange={(v) => api.setCover({ title: v })} />
      </div>
      <div data-m="sub" data-mt="l" style={{ fontSize: 36, color: T.coverSub, marginTop: 28 }}>
        <Ed ro={ro} value={periodOf(deck)} label="Periode" onChange={(v) => api.setCover({ period: v })} />
      </div>
      <div data-m="sub2" data-mt="l" style={{ fontSize: 28, color: T.coverMuted, marginTop: 12 }}>
        <Ed ro={ro} value={deck.cover.sub} label="Subjudul" onChange={(v) => api.setCover({ sub: v })} />
      </div>
      <div data-m="aud" data-mt="l" style={{ position: 'absolute', left: 96, right: 96, bottom: 56, fontSize: 24, color: T.coverMuted }}>
        <Ed ro={ro} value={deck.cover.audience} label="Untuk siapa" onChange={(v) => api.setCover({ audience: v })} />
      </div>
    </div>
  );
}

function ClosingSlide({ deck, ro, api }) {
  const T = themeOf(deck);
  return (
    <div data-m="bg" style={{ width: W, height: H, background: T.bgImage || T.cover, color: T.coverFg, fontFamily: T.font || "'Inter', system-ui, sans-serif", padding: '0 96px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden', isolation: 'isolate' }}>
      <Deco T={T} kind="closing" seed="closing" />
      <LogoMark h={92} style={{ position: 'absolute', left: 96, top: 64 }} />
      <div data-m="hdr" style={{ width: T.coverBar[0], height: T.coverBar[1], borderRadius: T.coverBar[2], background: T.accent, marginBottom: 40 }} />
      <div data-m="title" data-mt="l" style={{ fontFamily: T.headFont || headFont, fontWeight: T.hw || 700, fontSize: 96, letterSpacing: '-0.02em', lineHeight: 1.05 }}>
        <Ed ro={ro} value={deck.closing.title} label="Judul penutup" onChange={(v) => api.setClosing({ title: v })} />
      </div>
      <div data-m="sub" data-mt="l" style={{ fontSize: 36, color: T.coverSub, marginTop: 28 }}>
        <Ed ro={ro} value={deck.closing.sub} label="Subjudul penutup" onChange={(v) => api.setClosing({ sub: v })} />
      </div>
    </div>
  );
}

/* ===== Slide kesimpulan per sales: total semua brand per bulan, capaian, tren, brand terbaik / perlu perhatian ===== */
function summaryOf(sales, keys) {
  const months = keys.map((k) => {
    let t = 0, g = 0, has = false, hasT = false;
    sales.brands.forEach((b) => { const c = cellOf(sales, k, b.id), tv = toNum(c.total), gv = toNum(c.target); if (tv != null) { t += tv; has = true; if (gv != null) { g += gv; hasT = true; } } });
    return { k, total: has ? t : null, target: hasT ? g : null };
  });
  const sum = (a) => a.reduce((x, y) => x + (y || 0), 0);
  const total = sum(months.map((m) => m.total)), target = sum(months.map((m) => m.target));
  const filled = months.filter((m) => m.total != null);
  const last = filled[filled.length - 1], prev = filled.length > 1 ? filled[filled.length - 2] : null;
  const trend = last && prev && prev.total ? ((last.total - prev.total) / prev.total) * 100 : null;
  const brands = sales.brands.map((b) => {
    let t = 0, g = 0;
    keys.forEach((k) => { const c = cellOf(sales, k, b.id), tv = toNum(c.total), gv = toNum(c.target); if (tv != null) { t += tv; if (gv != null) g += gv; } });
    return { id: b.id, name: b.name || 'Brand', total: t, target: g, pct: g ? (t / g) * 100 : null };
  });
  const ranked = brands.filter((b) => b.pct != null).sort((a, b) => b.pct - a.pct);
  return { months, total, target, pct: target ? (total / target) * 100 : null, trend, last, prev, brands, ranked, any: filled.length > 0 };
}
function summaryLines(S) {
  const lines = [];
  if (!S.any) lines.push('Belum ada data penjualan yang diisi.');
  else {
    lines.push(S.pct != null ? `Total penjualan ${fmtCompact(S.total)} dari target ${fmtCompact(S.target)}, tercapai ${Math.round(S.pct)}%.` : `Total penjualan ${fmtCompact(S.total)} (target belum diisi).`);
    if (S.trend != null) lines.push(Math.abs(S.trend) < 0.05 ? `${BULAN[parseKey(S.last.k).m]} sama dengan ${BULAN[parseKey(S.prev.k).m]}.` : `${BULAN[parseKey(S.last.k).m]} ${S.trend > 0 ? 'naik' : 'turun'} ${fmt1(Math.abs(S.trend))}% dibanding ${BULAN[parseKey(S.prev.k).m]}.`);
  }
  return lines;
}
function SumList({ T, sem, title, rows, mk }) {
  return (
    <div data-m={mk} style={{ marginTop: 6 }}>
      <div style={{ fontSize: 15, color: T.muted, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>{title}</div>
      {rows.map((b, i) => (
        <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 12, height: 28, fontSize: 18, borderTop: i ? `1px solid ${T.grid}` : 'none' }}>
          <span style={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: T.nw || 600 }}>{b.name}</span>
          <span style={{ color: T.muted, whiteSpace: 'nowrap', fontSize: 17, width: 76, flex: 'none', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{fmtCompact(b.total)}</span>
          <span style={{ width: 70, flex: 'none' }}><PctBar small v={b.pct} sem={sem} muted={T.muted} /></span>
        </div>
      ))}
    </div>
  );
}
function CombinedSummary({ sales, keys, T, sem }) {
  const S = summaryOf(sales, keys), pc = (v) => (v == null ? T.muted : pcol(v, sem));
  const lines = summaryLines(S);
  return (
    <div data-m="card-1" style={{ ...GLASS, ...blurOf(T), flex: '0 0 400px', boxSizing: 'border-box', background: sem.card, border: T.cardBorder || `1px solid ${T.grid}`, ...(T.cardTop ? { borderTop: T.cardTop } : {}), borderRadius: T.cardR, padding: '16px 20px' }}>
      <div style={{ fontFamily: T.headFont || headFont, fontWeight: T.nw || 600, fontSize: 24, marginBottom: 8 }}>Kesimpulan</div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        {[['Total', S.any ? fmtCompact(S.total) : '–', T.ink], ['Capaian', S.pct == null ? '–' : Math.round(S.pct) + '%', pc(S.pct)], ['Tren', S.trend == null ? '–' : (Math.abs(S.trend) < 0.05 ? '' : S.trend > 0 ? '▲ ' : '▼ ') + fmt1(Math.abs(S.trend)) + '%', S.trend == null ? T.muted : S.trend >= 0 ? sem.good : sem.bad]].map(([l, v, c]) => (
          <div key={l} style={{ flex: l === 'Capaian' ? 0.5 : 1.25, minWidth: 0, ...(T.neu ? NEU_IN : { border: `1px solid ${T.grid}` }), borderRadius: Math.round(T.cardR * 0.6), padding: '6px 10px' }}>
            <div style={{ fontSize: 13, color: T.muted }}>{l}</div>
            <div style={{ fontFamily: T.headFont || headFont, fontWeight: T.nw || 600, fontSize: 24, color: c, whiteSpace: 'nowrap' }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 18, lineHeight: 1.4 }}>{lines.map((l, i) => <div key={i} style={{ marginBottom: 4 }}>{l}</div>)}</div>
      {S.ranked.length > 0 && <SumList T={T} sem={sem} mk="sum-best" title="Capaian per brand" rows={S.ranked} />}
    </div>
  );
}
function SummarySlide({ sales, deck, n, total, pick }) {
  const T = themeOf(deck), sem = semOf(T), keys = monthsOf(deck);
  const crossYear = parseKey(keys[0]).y !== parseKey(keys[keys.length - 1]).y;
  const short = (k) => BULAN_PENDEK[parseKey(k).m] + (crossYear ? ' ' + String(parseKey(k).y).slice(2) : '');
  const S = summaryOf(sales, keys);
  const chartH = 190;
  const pc = (v) => (v == null ? T.muted : pcol(v, sem));
  const best = S.ranked.slice(0, 3);
  const lines = summaryLines(S);
  const card = { ...GLASS, ...blurOf(T), background: sem.card, border: T.cardBorder || `1px solid ${T.grid}`, ...(T.cardTop ? { borderTop: T.cardTop } : {}), borderRadius: T.cardR, padding: '18px 22px', boxSizing: 'border-box' };
  return (
    <div data-m="bg" style={{ width: W, height: H, background: T.bgImage || T.paper, color: T.ink, fontFamily: T.font || "'Inter', system-ui, sans-serif", position: 'relative', overflow: 'hidden', isolation: 'isolate' }}>
      <Deco T={T} kind="sales" seed={sales.id + 'k'} />
      <div style={{ height: 100, position: 'relative', zIndex: 0, color: T.headerFg, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 48px', gap: 32 }}>
        <div data-m="hdr" style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: 100, boxSizing: 'border-box', background: T.header, borderBottom: T.hdrLine, zIndex: -1 }} />
        <LogoMark h={54} style={{ flex: 'none' }} />
        <Hit m="title" mt="l" pick={pick} target={{ id: 's-name' }} label="Ubah nama sales" style={{ flex: 1, minWidth: 0, fontFamily: T.headFont || headFont, fontWeight: T.hw || 700, fontSize: 54, letterSpacing: '-0.02em' }}>
          {sales.name || 'Nama sales'}
        </Hit>
        <Hit m="sub" mt="r" pick={pick} target={{ id: 'g-sub' }} label="Ubah keterangan periode" style={{ width: 700, flex: 'none', textAlign: 'right', fontSize: 22, color: T.headerSub }}>
          {sublineOf(deck)}
        </Hit>
      </div>

      <div style={{ padding: '22px 48px 0', display: 'flex', gap: 16, alignItems: 'stretch' }}>
        <div data-m="card-0" style={{ ...card, flex: '0 0 560px', height: 480 }}>
          <div style={{ fontFamily: T.headFont || headFont, fontWeight: T.nw || 600, fontSize: 24, marginBottom: 12 }}>Target dan pencapaian per bulan</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: chartH }}>
            {S.months.map((m) => (
              <div key={m.k} style={{ flex: 1, minWidth: 0, display: 'flex', justifyContent: 'center', height: chartH }}>
                <div style={{ width: '100%', maxWidth: 90 }}><Glass T={T} pct={m.target ? ((m.total || 0) / m.target) * 100 : null} total={m.total} h={chartH} /></div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            {S.months.map((m, i) => {
              const mp = m.target ? ((m.total || 0) / m.target) * 100 : null, pv = i > 0 ? S.months[i - 1] : null;
              const tr = m.total != null && pv && pv.total ? ((m.total - pv.total) / pv.total) * 100 : null;
              const rpFs = S.months.length > 4 ? 11 : S.months.length > 3 ? 14 : 16;
              const lab = { fontSize: 11, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 6 };
              const num = (v) => (v == null ? '–' : <><span style={{ fontSize: '0.8em', fontWeight: 500, color: T.muted, marginRight: 2 }}>Rp</span>{dot(String(Math.round(v)))}</>);
              return (
                <div key={m.k} style={{ flex: 1, minWidth: 0, textAlign: 'center', lineHeight: 1.2 }}>
                  <div style={{ fontSize: 16, color: T.muted }}>{short(m.k)}</div>
                  <div style={{ fontFamily: T.headFont || headFont, fontWeight: 800, fontSize: S.months.length > 4 ? 22 : 30, color: pc(mp), letterSpacing: '-0.02em', margin: '2px 0 4px', whiteSpace: 'nowrap' }}>{mp == null ? '–' : fmt1(mp) + '%'}</div>
                  <div style={lab}>Pencapaian</div>
                  <div style={{ fontSize: rpFs, fontWeight: 700, whiteSpace: 'nowrap' }}>{num(m.total)}</div>
                  <div style={lab}>Target</div>
                  <div style={{ fontSize: rpFs - 1, color: T.muted, whiteSpace: 'nowrap' }}>{num(m.target)}</div>
                  <div style={{ marginTop: 6, height: 20 }}>{tr != null && Math.abs(tr) >= 0.05 ? <Trend v={tr} sem={sem} muted={T.muted} /> : null}</div>
                </div>
              );
            })}
          </div>
        </div>
        <div data-m="card-1" style={{ ...card, flex: 1, minWidth: 0, height: 480 }}>
          <div style={{ fontFamily: T.headFont || headFont, fontWeight: T.nw || 600, fontSize: 24, marginBottom: 10 }}>Kesimpulan</div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
            {[['Total pencapaian', S.any ? rp(String(Math.round(S.total))) : '–', T.ink, 18], ['Total target', S.target ? rp(String(Math.round(S.target))) : '–', T.ink, 18], ['Capaian', S.pct == null ? '–' : Math.round(S.pct) + '%', pc(S.pct), 26]].map(([l, v, c, f]) => (
              <div key={l} style={{ flex: 1, minWidth: 0, ...(T.neu ? NEU_IN : { border: `1px solid ${T.grid}` }), borderRadius: Math.round(T.cardR * 0.6), padding: '6px 10px' }}>
                <div style={{ fontSize: 13, color: T.muted, whiteSpace: 'nowrap' }}>{l}</div>
                <div style={{ fontFamily: T.headFont || headFont, fontWeight: T.nw || 600, fontSize: f, color: c, whiteSpace: 'nowrap' }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 19, lineHeight: 1.4 }}>{(S.any ? lines.slice(1) : lines).map((l, i) => <div key={i} style={{ marginBottom: 4 }}>{l}</div>)}</div>
          {best.length > 0 && <SumList T={T} sem={sem} mk="sum-best" title="Capaian tertinggi" rows={best} />}
        </div>
      </div>

      <div data-m="note" style={{ position: 'absolute', left: 48, right: 48, bottom: 22, display: 'flex', alignItems: 'center', gap: 16, fontSize: 21, borderTop: `1px solid ${T.grid}`, paddingTop: 10 }}>
        <Hit pick={pick} target={{ id: 's-note' }} label="Ubah catatan" style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.3 }}>
            <span style={{ color: T.muted }}>Catatan dari </span>
            <span style={{ fontWeight: 600 }}>{sales.name || 'sales'}</span>
            <span style={{ color: T.muted }}>: </span>
            {sales.note ? <span>“{sales.note}”</span> : <span style={{ color: T.muted, fontStyle: 'italic' }}>belum ada catatan</span>}
          </div>
        </Hit>
        <span style={{ color: T.muted, flex: 'none', fontSize: 18 }}>{n} / {total}</span>
      </div>
    </div>
  );
}

/* ===== Canvasing: slide hasil kunjungan, 4 kartu per halaman ===== */
const CANVAS_PER_PAGE = 4, CANVAS_MAX = 250;
const BRANDS_PER_SLIDE = 5;
const salesPages = (s) => {
  const n = Math.max(1, Math.ceil(s.brands.length / BRANDS_PER_SLIDE)), base = Math.floor(s.brands.length / n), rem = s.brands.length % n;
  const pg = Array.from({ length: n }, (_, p) => ({ kind: 'sales', sales: s, key: p ? s.id + '-p' + p : s.id, page: p, pages: n, brands: s.brands.slice(Math.min(p, rem) * (base + 1) + Math.max(0, p - rem) * base, Math.min(p, rem) * (base + 1) + Math.max(0, p - rem) * base + base + (p < rem ? 1 : 0)) }));
  if (s.brands.length <= 2) return pg.map((x) => ({ ...x, combined: true }));
  return [...pg, { kind: 'sales', summary: true, sales: s, key: s.id + '-sum', page: n, pages: n, brands: [] }];
};
const itemIndexOf = (deck, sid) => { let i = 1; for (const x of deck.sales) { if (x.id === sid) return i; i += salesPages(x).length; } return 1; };
const canvasPages = (list) => {
  const n = Math.max(1, Math.ceil(list.length / CANVAS_PER_PAGE));
  return Array.from({ length: n }, (_, p) => ({ kind: 'canvas', key: p ? 'canvas-' + p : 'canvas', page: p, pages: n, count: list.length, entries: list.slice(p * CANVAS_PER_PAGE, (p + 1) * CANVAS_PER_PAGE) }));
};
function CanvasSlide({ item, deck, n, total }) {
  const T = themeOf(deck), sem = semOf(T);
  const sub = `${item.count} hasil kunjungan` + (item.pages > 1 ? ` · halaman ${item.page + 1}/${item.pages}` : '');
  return (
    <div data-m="bg" style={{ width: W, height: H, background: T.bgImage || T.paper, color: T.ink, fontFamily: T.font || "'Inter', system-ui, sans-serif", position: 'relative', overflow: 'hidden', isolation: 'isolate' }}>
      <Deco T={T} kind="sales" seed="canvas" />
      <div style={{ height: 100, position: 'relative', zIndex: 0, color: T.headerFg, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 48px', gap: 32 }}>
        <div data-m="hdr" style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: 100, boxSizing: 'border-box', background: T.header, borderBottom: T.hdrLine, zIndex: -1 }} />
        <LogoMark h={54} style={{ flex: 'none' }} />
        <div data-m="title" data-mt="l" style={{ flex: 1, minWidth: 0, fontFamily: T.headFont || headFont, fontWeight: T.hw || 700, fontSize: 54, letterSpacing: '-0.02em' }}>Canvasing</div>
        <div data-m="sub" data-mt="r" style={{ width: 560, flex: 'none', textAlign: 'right', fontSize: 22, color: T.headerSub }}>{sub}</div>
      </div>
      <div style={{ padding: '22px 48px 0', display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gridAutoRows: 232, gap: 18 }}>
        {item.entries.length === 0 && (
          <div style={{ gridColumn: '1 / -1', height: 232, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.muted, fontSize: 24 }}>Belum ada hasil canvasing</div>
        )}
        {item.entries.map((e, i) => (
          <div key={e.id} data-m={`card-${i}`} style={{ ...GLASS, ...blurOf(T), background: sem.card, border: T.cardBorder || `1px solid ${T.grid}`, ...(T.cardTop ? { borderTop: T.cardTop } : {}), borderRadius: T.cardR, padding: 16, boxSizing: 'border-box', display: 'flex', gap: 18, minWidth: 0, overflow: 'hidden' }}>
            {e.foto
              ? <img src={e.foto} alt={'Foto canvasing ' + e.kontraktor} style={{ width: 196, height: 196, objectFit: 'cover', borderRadius: Math.min(T.cardR, 14), flex: 'none' }} />
              : <div style={{ width: 196, height: 196, flex: 'none', borderRadius: Math.min(T.cardR, 14), border: `2px dashed ${T.axis}`, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.muted, fontSize: 16 }}>Tanpa foto</div>}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ fontFamily: T.headFont || headFont, fontWeight: T.hw || 700, fontSize: 22, lineHeight: '28px', height: 28, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.kontraktor || 'Tanpa nama'}</div>
              <div style={{ fontSize: 15, fontWeight: 600, lineHeight: '20px', height: 20, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: T.targetText }}>{e.produk}</div>
              <div style={{ flex: 1, minHeight: 0, fontSize: 15, lineHeight: '20px', color: T.ink, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 6, WebkitBoxOrient: 'vertical', wordBreak: 'break-word' }}>{e.catatan}</div>
              <div style={{ fontSize: 14, lineHeight: '18px', height: 18, color: T.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Oleh {e.sales}</div>
            </div>
          </div>
        ))}
      </div>
      <div data-m="note" style={{ position: 'absolute', left: 48, right: 48, bottom: 22, display: 'flex', justifyContent: 'flex-end', fontSize: 18, color: T.muted, borderTop: `1px solid ${T.grid}`, paddingTop: 10 }}>{n} / {total}</div>
    </div>
  );
}

function SlideView({ item, deck, n, total, ro, api, pick }) {
  if (item.kind === 'canvas') return <CanvasSlide item={item} deck={deck} n={n} total={total} />;
  if (item.kind === 'cover') return <CoverSlide deck={deck} ro={ro} api={api} />;
  if (item.kind === 'closing') return <ClosingSlide deck={deck} ro={ro} api={api} />;
  if (item.summary) return <SummarySlide sales={item.sales} deck={deck} n={n} total={total} pick={pick} />;
  return <SalesSlide sales={{ ...item.sales, brands: item.brands || item.sales.brands }} page={item.page || 0} pages={item.pages || 1} combined={!!item.combined} showNote={!!item.combined} deck={deck} n={n} total={total} pick={pick} />;
}


const LOGO_SRC = 'logo.png', LOGO_RATIO = 639 / 454;
/* Logo perusahaan: ikut berpindah posisi/ukuran saat Morph (data-m="logo") */
const LogoMark = ({ h, style }) => <img data-m="logo" src={LOGO_SRC} alt="Logo Dhouse" height={h} width={Math.round(h * LOGO_RATIO)} style={{ height: h, width: Math.round(h * LOGO_RATIO), objectFit: 'contain', display: 'block', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.18))', ...style }} />;

/* Transisi Morph (seperti PowerPoint): elemen ber-nama sama (data-m) berpindah posisi, ukuran, dan warna dari slide sebelumnya ke slide berikutnya.
   Elemen tanpa pasangan memudar keluar atau masuk. */
const MORPH_MS = 700, MORPH_EASE = 'cubic-bezier(.65,0,.35,1)';
function morphMeasure(stage, scope) {
  const sr = stage.getBoundingClientRect(); const sc = sr.width / W || 1; const info = {};
  scope.querySelectorAll('[data-m]').forEach((el) => {
    const r = el.getBoundingClientRect(); const cs = getComputedStyle(el);
    info[el.dataset.m] = { x: (r.left - sr.left) / sc, y: (r.top - sr.top) / sc, w: r.width / sc, h: r.height / sc, fs: parseFloat(cs.fontSize) || 16, bg: cs.backgroundColor, color: cs.color, t: el.dataset.mt || null };
  });
  return info;
}
/* Transformasi agar elemen E (di rect sendiri) tampak seperti berada di rect C */
function morphTf(E, C) {
  if (E.t) {
    const r = E.t === 'r', sc = (C.fs / E.fs) || 1;
    const dx = r ? (C.x + C.w) - (E.x + E.w) : C.x - E.x;
    return { tf: `translate(${dx}px,${C.y - E.y}px) scale(${sc})`, org: r ? 'right top' : 'left top' };
  }
  return { tf: `translate(${C.x - E.x}px,${C.y - E.y}px) scale(${(C.w / E.w) || 1},${(C.h / E.h) || 1})`, org: 'left top' };
}
function useMorph(stageRef, slideRef, ovRef, depKey) {
  const snap = useRef(null);
  useLayoutEffect(() => {
    const stage = stageRef.current, slide = slideRef.current, ov = ovRef.current;
    if (!stage || !slide || !ov) return;
    try { slide.getAnimations({ subtree: true }).forEach((a) => a.cancel()); } catch (e) {}
    ov.innerHTML = '';
    const root = slide.firstElementChild;
    const cur = morphMeasure(stage, slide);
    const prev = snap.current;
    snap.current = { node: root.cloneNode(true), info: cur };
    let reduce = false; try { reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
    if (!prev || reduce || !root.animate) return;
    const old = prev.node; old.style.position = 'absolute'; old.style.left = '0'; old.style.top = '0'; old.style.background = 'transparent';
    ov.appendChild(old);
    const D = MORPH_MS;
    if (prev.info.bg && cur.bg) root.animate([{ backgroundColor: prev.info.bg.bg }, { backgroundColor: cur.bg.bg }], { duration: D, easing: MORPH_EASE });
    old.querySelectorAll('[data-m]').forEach((oe) => {
      const k = oe.dataset.m; if (k === 'bg') return;
      const o = prev.info[k], n = cur[k];
      if (!n) { oe.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, easing: 'ease-out', fill: 'forwards' }); return; }
      const ne = slide.querySelector(`[data-m="${k}"]`); if (!ne) return;
      const same = oe.innerHTML === ne.innerHTML;
      const a = morphTf(n, o), b = morphTf(o, n);
      ne.style.transformOrigin = a.org; oe.style.transformOrigin = b.org;
      ne.animate([{ transform: a.tf, backgroundColor: o.bg, color: o.color }, { transform: 'none', backgroundColor: n.bg, color: n.color }], { duration: D, easing: MORPH_EASE });
      if (same) { oe.style.visibility = 'hidden'; return; }
      oe.animate([{ transform: 'none', backgroundColor: o.bg, color: o.color, opacity: 1 }, { transform: b.tf, backgroundColor: n.bg, color: n.color, opacity: 0 }], { duration: D, easing: MORPH_EASE, fill: 'forwards' });
      ne.animate([{ opacity: 0 }, { opacity: 0, offset: 0.35 }, { opacity: 1 }], { duration: D, easing: 'linear' });
    });
    slide.querySelectorAll('[data-m]').forEach((ne) => {
      if (ne.dataset.m === 'bg' || prev.info[ne.dataset.m]) return;
      ne.animate([{ opacity: 0 }, { opacity: 0, offset: 0.45 }, { opacity: 1 }], { duration: D, easing: 'ease-out' });
    });
    const t = setTimeout(() => { ov.innerHTML = ''; }, D + 80);
    return () => clearTimeout(t);
  }, [depKey]);
}

const fmtTime = (sec) => String(Math.floor(sec / 60)).padStart(2, '0') + ':' + String(sec % 60).padStart(2, '0');

function Present({ items, deck, index, setIndex, onExit, api }) {
  const [elapsed, setElapsed] = useState(0);
  const total = items.length;
  const go = useCallback((fn) => setIndex((c) => Math.max(0, Math.min(total - 1, fn(c)))), [total, setIndex]);
  useEffect(() => {
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    document.body.classList.add('presenting');
    try { document.documentElement.requestFullscreen && document.documentElement.requestFullscreen().catch(() => {}); } catch (e) {}
    const onFs = () => { if (!document.fullscreenElement) onExit(); };
    document.addEventListener('fullscreenchange', onFs);
    return () => { clearInterval(id); document.body.classList.remove('presenting'); document.removeEventListener('fullscreenchange', onFs); try { if (document.fullscreenElement) document.exitFullscreen(); } catch (e) {} };
  }, []);
  useEffect(() => {
    const onKey = (e) => {
      if (['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter'].includes(e.key)) { e.preventDefault(); go((c) => c + 1); }
      else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].includes(e.key)) { e.preventDefault(); go((c) => c - 1); }
      else if (e.key === 'Escape') onExit();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, onExit]);
  const it = items[index];
  const T = themeOf(deck);
  const stageRef = useRef(null), slideRef = useRef(null), ovRef = useRef(null);
  useMorph(stageRef, slideRef, ovRef, it.key);
  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#000' }}>
      <div style={{ height: 3, background: '#222' }}><div style={{ height: 3, width: `${((index + 1) / total) * 100}%`, background: T.accent, transition: 'width .25s' }} /></div>
      <div className="flex-1 min-h-0 cursor-pointer" onClick={() => go((c) => c + 1)}>
        <Fit>
          <div ref={stageRef} style={{ position: 'relative', width: W, height: H }}>
            <div ref={slideRef} key={it.key}><SlideView item={it} deck={deck} n={index + 1} total={total} ro api={api} /></div>
            <div ref={ovRef} data-morph-overlay="1" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }} />
          </div>
        </Fit>
      </div>
      <div className="flex items-center justify-between gap-3 px-4 py-2 text-sm" style={{ background: '#0a0d13', color: '#c5cce0', paddingBottom: 'max(8px, env(safe-area-inset-bottom, 0px))' }}>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 rounded border border-[#2a3142] disabled:opacity-40" disabled={index === 0} onClick={() => go((c) => c - 1)}>Sebelumnya</button>
          <button className="px-3 py-1 rounded border border-[#2a3142] disabled:opacity-40" disabled={index === total - 1} onClick={() => go((c) => c + 1)}>Berikutnya</button>
        </div>
        <div className="tabular-nums">{index + 1} / {total} · {fmtTime(elapsed)}</div>
        <button className="px-3 py-1 rounded" style={{ background: T.accent, color: '#04130d', fontWeight: 600 }} onClick={onExit}>Keluar (Esc)</button>
      </div>
    </div>
  );
}

/* Dropdown kustom (pengganti <select> bawaan browser): bisa dipakai dengan keyboard, daftar tampil lewat portal supaya tidak terpotong. */
function Select({ id, value, options, onChange, disabled, placeholder, className }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null);
  const [act, setAct] = useState(0);
  const btn = useRef(null), list = useRef(null);
  const cur = options.find((o) => o.key === value);
  const close = () => setOpen(false);
  const openIt = () => {
    if (disabled || !btn.current) return;
    const r = btn.current.getBoundingClientRect();
    const vw = document.documentElement.clientWidth, vh = window.innerHeight;
    const w = Math.min(Math.max(r.width, 170), vw - 16);
    const left = Math.min(Math.max(8, r.left), vw - w - 8);
    const below = vh - r.bottom - 12, above = r.top - 12;
    const up = below < 220 && above > below;
    setPos({ left, w, maxH: Math.max(120, Math.min(300, up ? above : below)), top: up ? undefined : r.bottom + 6, bottom: up ? vh - r.top + 6 : undefined });
    setAct(Math.max(0, options.findIndex((o) => o.key === value)));
    setOpen(true);
  };
  useEffect(() => {
    if (!open) return;
    const inside = (e) => (list.current && list.current.contains(e.target)) || (btn.current && btn.current.contains(e.target));
    const down = (e) => { if (!inside(e)) close(); };
    const scr = (e) => { if (!(list.current && list.current.contains(e.target))) close(); };
    document.addEventListener('mousedown', down); document.addEventListener('touchstart', down, { passive: true });
    window.addEventListener('resize', close); window.addEventListener('scroll', scr, true);
    return () => { document.removeEventListener('mousedown', down); document.removeEventListener('touchstart', down); window.removeEventListener('resize', close); window.removeEventListener('scroll', scr, true); };
  }, [open]);
  useEffect(() => { if (open && list.current && list.current.children[act]) list.current.children[act].scrollIntoView({ block: 'nearest' }); }, [open, act]);
  const choose = (i) => { const o = options[i]; if (o) onChange(o.key); close(); if (btn.current) btn.current.focus(); };
  const onKey = (e) => {
    if (!open) { if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) { e.preventDefault(); openIt(); } return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setAct((a) => Math.min(options.length - 1, a + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setAct((a) => Math.max(0, a - 1)); }
    else if (e.key === 'Home') { e.preventDefault(); setAct(0); }
    else if (e.key === 'End') { e.preventDefault(); setAct(options.length - 1); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(act); }
    else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); }
    else if (e.key === 'Tab') close();
  };
  const popup = open && pos && ReactDOM.createPortal(
    <ul ref={list} role="listbox" className="pop-glass" style={{ position: 'fixed', zIndex: 80, left: pos.left, width: pos.w, maxHeight: pos.maxH, top: pos.top, bottom: pos.bottom, overflowY: 'auto', margin: 0, padding: 4, listStyle: 'none' }}>
      {options.map((o, i) => (
        <li key={o.key} role="option" aria-selected={o.key === value}
          onMouseDown={(e) => e.preventDefault()} onClick={() => choose(i)} onMouseEnter={() => setAct(i)}
          className="flex cursor-pointer items-center justify-between gap-2 rounded-md px-3 py-2 text-sm"
          style={{ background: i === act ? 'var(--soft)' : 'transparent', fontWeight: o.key === value || o.color ? 600 : 400, color: o.color || 'var(--fg)' }}>
          <span className="truncate">{o.label}</span>
          {o.key === value && <svg className="h-4 w-4 shrink-0 text-[var(--accent)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>}
        </li>
      ))}
    </ul>, document.body);
  return (
    <>
      <button ref={btn} id={id} type="button" role="combobox" aria-haspopup="listbox" aria-expanded={open} disabled={disabled}
        onClick={() => (open ? close() : openIt())} onKeyDown={onKey}
        className={'field flex items-center justify-between gap-2 text-left ' + (disabled ? 'opacity-60 cursor-default ' : 'cursor-pointer ') + (className || '')}>
        <span className={'truncate ' + (cur ? '' : 'text-[var(--muted)]')} style={cur && cur.color ? { color: cur.color, fontWeight: 600 } : undefined}>{cur ? cur.label : (placeholder || 'Pilih')}</span>
        <Chevron />
      </button>
      {popup}
    </>
  );
}


function shrinkImage(file, max = 900) {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file), im = new Image();
    im.onload = () => {
      const k = Math.min(1, max / Math.max(im.naturalWidth, im.naturalHeight)), cv = document.createElement('canvas');
      cv.width = Math.max(1, Math.round(im.naturalWidth * k)); cv.height = Math.max(1, Math.round(im.naturalHeight * k));
      const c = cv.getContext('2d'); c.fillStyle = '#fff'; c.fillRect(0, 0, cv.width, cv.height); c.drawImage(im, 0, 0, cv.width, cv.height);
      URL.revokeObjectURL(url); res(cv.toDataURL('image/jpeg', 0.75));
    };
    im.onerror = () => { URL.revokeObjectURL(url); rej(new Error('img')); };
    im.src = url;
  });
}
function CanvasPanel({ cv, ask }) {
  const blank = { id: null, kontraktor: '', produk: '', catatan: '', foto: null };
  const [f, setF] = useState(blank);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const onFile = async (e) => {
    const file = e.target.files && e.target.files[0]; e.target.value = '';
    if (!file) return;
    if (!/^image\//.test(file.type)) { setErr('File harus berupa gambar'); return; }
    try { const foto = await shrinkImage(file); setF((x) => ({ ...x, foto })); setErr(''); } catch (ex) { setErr('Foto tidak bisa dibaca'); }
  };
  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    if (!f.kontraktor.trim()) { setErr('Isi nama kontraktor/konsumen'); return; }
    if (!f.produk.trim()) { setErr('Isi produk yang ditawarkan'); return; }
    setBusy(true); setErr('');
    const ok = await cv.save({ ...f, kontraktor: f.kontraktor.trim(), produk: f.produk.trim(), catatan: f.catatan.trim().slice(0, CANVAS_MAX) });
    setBusy(false);
    if (ok) setF(blank);
  };
  return (
    <>
      <form onSubmit={submit} className="flex flex-col gap-3">
        {f.id && <div className="rounded-md bg-[var(--soft)] px-3 py-2 text-sm font-medium">Mengubah data canvasing yang sudah ada</div>}
        <div><label className="lbl" htmlFor="cv-kontraktor">Nama kontraktor / konsumen</label><input id="cv-kontraktor" className="field" maxLength={120} value={f.kontraktor} onChange={(e) => setF({ ...f, kontraktor: e.target.value })} /></div>
        <div><label className="lbl" htmlFor="cv-produk">Produk yang ditawarkan</label><input id="cv-produk" className="field" maxLength={160} value={f.produk} onChange={(e) => setF({ ...f, produk: e.target.value })} /></div>
        <div>
          <div className="flex items-end justify-between"><label className="lbl" htmlFor="cv-catatan">Catatan</label><span className="mb-1 text-xs text-[var(--muted)]" aria-live="polite">{f.catatan.length}/{CANVAS_MAX}</span></div>
          <textarea id="cv-catatan" className="field" rows={4} maxLength={CANVAS_MAX} value={f.catatan} onChange={(e) => setF({ ...f, catatan: e.target.value.slice(0, CANVAS_MAX) })} />
        </div>
        <div>
          <span className="lbl">Foto hasil canvasing</span>
          <div className="flex items-center gap-3">
            {f.foto ? <img src={f.foto} alt="Pratinjau foto" className="h-16 w-16 shrink-0 rounded-lg border border-[var(--line)] object-cover" /> : <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-dashed border-[var(--line)] text-xs text-[var(--muted)]">Belum ada</span>}
            <div className="flex min-w-0 flex-col gap-1.5">
              <label htmlFor="cv-foto" className="btn cursor-pointer text-sm">{f.foto ? 'Ganti foto' : 'Pilih foto'}</label>
              <input id="cv-foto" type="file" accept="image/*" className="sr-only" onChange={onFile} />
              {f.foto && <button type="button" className="text-left text-xs font-medium text-[var(--danger)]" onClick={() => setF({ ...f, foto: null })}>Hapus foto</button>}
            </div>
          </div>
        </div>
        {err && <div role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{err}</div>}
        <div className={'grid gap-2 ' + (f.id ? 'grid-cols-2' : 'grid-cols-1')}>
          <button type="submit" disabled={busy} className="btn btn-green">{busy ? 'Menyimpan…' : f.id ? 'Simpan perubahan' : 'Tambah canvasing'}</button>
          {f.id && <button type="button" className="btn" onClick={() => { setF(blank); setErr(''); }}>Batal</button>}
        </div>
      </form>
      <div className="border-t border-[var(--line)] pt-3">
        <div className="head mb-2 font-semibold">Daftar canvasing <span className="text-sm font-normal text-[var(--muted)]">({cv.list.length})</span></div>
        {cv.list.length === 0 && <p className="m-0 text-sm text-[var(--muted)]">Belum ada hasil canvasing.</p>}
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {cv.list.map((e, i) => (
            <li key={e.id} style={tintOf(i)} className="flex items-center gap-2 rounded-lg border p-2">
              {e.foto ? <img src={e.foto} alt="" className="h-11 w-11 shrink-0 rounded-md object-cover" /> : <span className="h-11 w-11 shrink-0 rounded-md bg-[var(--soft)]" />}
              <div className="min-w-0 flex-1 text-sm"><div className="truncate font-semibold">{e.kontraktor}</div><div className="truncate text-xs text-[var(--muted)]">{e.produk} · {e.sales}</div></div>
              {cv.canManage(e) && (
                <div className="flex shrink-0 gap-1">
                  <button type="button" className="btn px-3 py-1 text-xs" onClick={() => { setF({ id: e.id, kontraktor: e.kontraktor, produk: e.produk, catatan: e.catatan, foto: e.foto || null }); setErr(''); }}>Ubah</button>
                  <button type="button" className="btn btn-danger px-3 py-1 text-xs" onClick={() => ask({ title: 'Hapus canvasing?', body: `Data canvasing ${e.kontraktor} beserta fotonya akan dihapus.`, confirm: 'Hapus', onConfirm: () => cv.del(e.id) })}>Hapus</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

function Panel({ item, deck, api, idx, count, onMove, onDelete, mk, setMk, onSave, ask, perm, cv }) {
  const ro = item.kind === 'canvas' ? false : !perm.edit, adm = perm.admin;
  return (
    <aside className="shrink-0 rounded-lg border border-[var(--line)] bg-[var(--panel)] p-3 flex flex-col gap-3 lg:w-[22rem] lg:overflow-y-auto">
      <div className="head font-semibold text-base">{item.kind === 'canvas' ? 'Form canvasing' : 'Isi data'}</div>
      {ro && <div className="rounded-md bg-[var(--soft)] px-3 py-2 text-xs text-[var(--muted)]">{item.kind === 'sales' ? `Slide ini milik ${item.sales.name || 'sales lain'}. Kamu hanya bisa melihatnya.` : 'Bagian ini hanya bisa diubah admin.'}</div>}

      {item.kind === 'canvas' && <CanvasPanel cv={cv} ask={ask} />}
      {item.kind === 'cover' && (
        <>
          <div><label className="lbl" htmlFor="c-title">Judul</label><input disabled={ro} id="c-title" className="field" value={deck.cover.title} onChange={(e) => api.setCover({ title: e.target.value })} /></div>
          <div><label className="lbl" htmlFor="c-per">Periode</label><input disabled={ro} id="c-per" className="field" value={periodOf(deck)} onChange={(e) => api.setCover({ period: e.target.value })} /></div>
          <div><label className="lbl" htmlFor="c-sub">Subjudul</label><input disabled={ro} id="c-sub" className="field" value={deck.cover.sub} onChange={(e) => api.setCover({ sub: e.target.value })} /></div>
          <div><label className="lbl" htmlFor="c-aud">Untuk siapa</label><input disabled={ro} id="c-aud" className="field" value={deck.cover.audience} onChange={(e) => api.setCover({ audience: e.target.value })} /></div>
        </>
      )}
      {item.kind === 'closing' && (
        <>
          <div><label className="lbl" htmlFor="x-title">Judul</label><input disabled={ro} id="x-title" className="field" value={deck.closing.title} onChange={(e) => api.setClosing({ title: e.target.value })} /></div>
          <div><label className="lbl" htmlFor="x-sub">Subjudul</label><input disabled={ro} id="x-sub" className="field" value={deck.closing.sub} onChange={(e) => api.setClosing({ sub: e.target.value })} /></div>
        </>
      )}

      {item.kind === 'sales' && (() => {
        const s = item.sales;
        const keys = monthsOf(deck);
        const ck = keys.includes(mk) ? mk : keys[0];
        const mName = BULAN[parseKey(ck).m];
        const multiYear = parseKey(keys[0]).y !== parseKey(keys[keys.length - 1]).y;
        return (
          <>
            <div className="-mt-2 text-sm text-[var(--muted)]">Slide <b className="text-[var(--fg)]">{s.name || 'tanpa nama'}</b></div>

            <section className="flex flex-col gap-2" aria-labelledby="sec-bulan">
              <h3 id="sec-bulan" className="m-0 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">1. Pilih bulan</h3>
              <div role="radiogroup" aria-label="Bulan" className="flex flex-wrap gap-1.5">
                {keys.map((k) => (
                  <button key={k} type="button" role="radio" aria-checked={k === ck} onClick={() => setMk(k)}
                    className={'rounded-lg border px-3.5 py-1.5 text-sm font-medium transition-colors ' + (k === ck ? 'border-[#101828] bg-[#101828] text-white' : 'border-[var(--line)] bg-white text-[var(--fg)] hover:bg-[var(--soft)]')}>
                    {BULAN_PENDEK[parseKey(k).m]}{multiYear ? ' ' + String(parseKey(k).y).slice(2) : ''}
                  </button>
                ))}
              </div>
            </section>

            <section className="flex flex-col gap-2" aria-labelledby="sec-angka">
              <h3 id="sec-angka" className="m-0 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">2. Angka {mName} {parseKey(ck).y}</h3>
              {s.brands.map((b, bi) => {
                const c = cellOf(s, ck, b.id);
                const st = statsOf(s, ck, b.id, keys);
                const pct = st.pct == null ? null : Math.round(st.pct);
                return (
                  <div key={b.id} style={tintOf(bi)} className="rounded-xl border p-3 flex flex-col gap-3">
                    <input disabled={ro} id={`bn-${b.id}`} aria-label="Nama brand" className="field font-semibold" value={b.name} onChange={(e) => api.setBrand(s.id, b.id, e.target.value)} />
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="lbl" htmlFor={`v-${b.id}-${ck}`}>Total penjualan</label>
                        <input disabled={ro} id={`v-${b.id}-${ck}`} className="field" inputMode="numeric" placeholder="Rp 0" value={rp(c.total)} onChange={(e) => api.setCell(s.id, ck, b.id, { total: digits(e.target.value) })} />
                      </div>
                      <div>
                        <label className="lbl" htmlFor={`t-${b.id}-${ck}`}>Target</label>
                        <input disabled={ro} id={`t-${b.id}-${ck}`} className="field" inputMode="numeric" placeholder="Rp 0" value={rp(c.target)} onChange={(e) => api.setCell(s.id, ck, b.id, { target: digits(e.target.value) })} onBlur={() => api.fillTarget(s.id, ck, b.id, keys)} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[var(--muted)]" aria-live="polite">
                      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/10"><span className="block h-full rounded-full" style={{ width: Math.min(100, pct || 0) + '%', background: pcol(pct || 0, null) }} /></span>
                      <span className="w-40 shrink-0 text-right">{pct != null ? <>Capaian <b style={{ color: pcol(pct, null) }}>{pct}%</b> dari target</> : 'Isi total dan target'}</span>
                    </div>
                    {!ro && (
                      <div className="flex items-center gap-2 border-t border-black/10 pt-3">
                        <button type="button" className="btn flex-1 !rounded-lg !px-3 !py-1.5 text-xs" disabled={!!c.skip}
                          onClick={() => ask({ title: `Hapus ${mName} untuk ${b.name || 'brand ini'}?`, body: `Total dan target ${mName} ${parseKey(ck).y} pada slide ${s.name || 'ini'} akan dihapus. Bulan lain dan brand tetap.`, confirm: 'Hapus bulan ini', onConfirm: () => api.clearCell(s.id, ck, b.id) })}><svg className="h-4 w-4 sm:hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M8 2v4M16 2v4M3 10h18M10 14l4 4M14 14l-4 4" /></svg><span className="hidden sm:inline">Hapus bulan ini</span><span className="sr-only sm:hidden">Hapus bulan ini</span></button>
                        <button type="button" className="btn btn-danger flex-1 !rounded-lg !px-3 !py-1.5 text-xs" disabled={s.brands.length === 1}
                          onClick={() => ask({ title: `Hapus brand ${b.name || 'ini'}?`, body: `Brand ini dan angkanya di semua bulan pada slide ${s.name || 'ini'} akan dihapus.`, confirm: 'Hapus brand', onConfirm: () => api.delBrand(s.id, b.id) })}><svg className="h-4 w-4 sm:hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2M6 6l1 14a2 2 0 002 2h6a2 2 0 002-2l1-14M10 11v6M14 11v6" /></svg><span className="hidden sm:inline">Hapus brand</span><span className="sr-only sm:hidden">Hapus brand</span></button>
                      </div>
                    )}
                  </div>
                );
              })}
              {s.brands.length > BRANDS_PER_SLIDE && <p className="m-0 text-xs text-[var(--muted)]">{`Brand dibagi rata ke ${Math.ceil(s.brands.length / BRANDS_PER_SLIDE)} slide.`}</p>}
              {!ro && api.undoDel && api.undoDel.sid === s.id && (
                <button type="button" onClick={api.undoDelBrand} aria-label="Batal hapus brand" className="btn mx-auto !rounded-lg !px-3 !py-1.5 text-xs">
                  <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 14 4 9l5-5" /><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" /></svg>
                  <span className="sr-only sm:not-sr-only">Batal hapus{api.undoDel.brand && api.undoDel.brand.name ? ` ${api.undoDel.brand.name}` : ''}</span>
                </button>
              )}
              <button type="button" disabled={ro} onClick={() => api.addBrand(s.id)} className="mx-auto h-10 w-2/5 rounded-xl border border-gray-100 bg-white text-sm font-bold text-black shadow-md transition hover:shadow-lg active:scale-[0.98] disabled:opacity-50">+ Brand</button>
              {!ro && <button type="button" className="btn btn-primary" onClick={onSave}>Simpan</button>}
            </section>

            <section className="flex flex-col gap-2 border-t border-[var(--line)] pt-3" aria-labelledby="sec-cat">
              <h3 id="sec-cat" className="m-0 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">3. Catatan slide</h3>
              <textarea disabled={ro} id="s-note" aria-label="Catatan" rows={3} className="field" placeholder="Tulis catatan yang tampil di slide" value={s.note} onChange={(e) => api.setSales(s.id, { note: e.target.value })} />
            </section>

            {adm && (
              <section className="flex flex-col gap-2 rounded-xl border border-dashed border-[var(--line)] p-3" aria-labelledby="sec-adm">
                <h3 id="sec-adm" className="m-0 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Pengaturan admin</h3>
                <div><label className="lbl" htmlFor="s-name">Nama sales</label><input id="s-name" className="field" value={s.name} onChange={(e) => api.setSales(s.id, { name: e.target.value })} /></div>
                <div><label className="lbl" htmlFor="g-sub">Keterangan di bawah nama</label><input id="g-sub" className="field" value={sublineOf(deck)} onChange={(e) => api.setSubline(e.target.value)} /></div>
                <div className="grid grid-cols-[auto_1fr] gap-2 items-center">
                  <label className="lbl" style={{ margin: 0 }} htmlFor="r-from">Dari</label>
                  <Select id="r-from" value={deck.range.from} onChange={(v) => api.setRange('from', v)} options={MONTH_OPTIONS} />
                  <label className="lbl" style={{ margin: 0 }} htmlFor="r-to">Sampai</label>
                  <Select id="r-to" value={keys[keys.length - 1]} onChange={(v) => api.setRange('to', v)} options={MONTH_OPTIONS} />
                </div>
                <div className="text-[11px] text-[var(--muted)]">Rentang bulan berlaku untuk semua slide sales (maksimal {MAX_BULAN} bulan).</div>
                <div className="grid grid-cols-3 gap-2">
                  <button className="btn" onClick={() => onMove(-1)} disabled={idx <= 1}>Naik</button>
                  <button className="btn" onClick={() => onMove(1)} disabled={idx >= deck.sales.length}>Turun</button>
                  <button className="btn btn-danger" onClick={onDelete} disabled={deck.sales.length === 1}>Hapus</button>
                </div>
              </section>
            )}
          </>
        );
      })()}
    </aside>
  );
}

const TOP_BTN = 'inline-flex items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--panel)] px-3 py-2 text-sm font-medium text-[var(--fg)] shadow-sm transition hover:bg-[var(--soft)] active:scale-[.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]';
const Chevron = ({ cls }) => <svg className={cls || 'h-4 w-4 text-[var(--muted)]'} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>;
const ChevronRight = () => <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>;
const PlayIcon = () => <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a1 1 0 001.5.86l11-6.5a1 1 0 000-1.72l-11-6.5A1 1 0 008 5.5z" /></svg>;
const MenuIcon = () => <svg className="h-4 w-4 text-[var(--muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" /></svg>;
const Swatch = ({ T }) => <span className="inline-block h-4 w-4 shrink-0 rounded-full ring-1 ring-black/15" style={{ background: `linear-gradient(135deg, ${T.paper} 50%, ${T.accent} 50%)` }} />;

function Menu({ icon, label, children, width }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null);
  const ref = useRef(null);
  const btn = useRef(null);
  const wantW = width || 240;
  const toggle = () => {
    if (!open && btn.current) {
      const r = btn.current.getBoundingClientRect();
      const vw = document.documentElement.clientWidth;
      const w = Math.min(wantW, vw - 16);
      setPos({ left: Math.max(8, Math.min(r.right - w, vw - w - 8)), top: r.bottom + 8, w });
    }
    setOpen((o) => !o);
  };
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const down = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const key = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', down);
    document.addEventListener('keydown', key);
    window.addEventListener('resize', close);
    window.addEventListener('scroll', close, true);
    return () => { document.removeEventListener('mousedown', down); document.removeEventListener('keydown', key); window.removeEventListener('resize', close); window.removeEventListener('scroll', close, true); };
  }, [open]);
  return (
    <div ref={ref} className="relative">
      <button ref={btn} type="button" aria-haspopup="menu" aria-expanded={open} onClick={toggle} className={TOP_BTN}>
        {icon}<span>{label}</span><span className="hidden sm:inline-flex"><Chevron /></span>
      </button>
      {open && pos && (
        <div role="menu" onClick={() => setOpen(false)} style={{ position: 'fixed', left: pos.left, top: pos.top, width: pos.w }}
          className="z-50 rounded-xl border border-[var(--line)] bg-[var(--panel)] p-1.5 shadow-lg ring-1 ring-black/5">
          {children}
        </div>
      )}
    </div>
  );
}
function MenuItem({ onClick, icon, title, hint, danger, active }) {
  return (
    <button type="button" role="menuitem" onClick={onClick} className={'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition hover:bg-[var(--soft)] focus-visible:outline-none focus-visible:bg-[var(--soft)] ' + (danger ? 'text-[var(--danger)]' : '')}>
      {icon}
      <span className="min-w-0 flex-1">
        <span className={'block font-medium ' + (active ? 'text-[var(--accent)]' : '')}>{title}</span>
        {hint && <span className="block text-xs font-normal text-[var(--muted)]">{hint}</span>}
      </span>
      {active && <svg className="h-4 w-4 text-[var(--accent)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10" /></svg>}
    </button>
  );
}

function ConfirmDialog({ dlg, onClose }) {
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.focus(); }, []);
  useEffect(() => {
    const k = (e) => { if (e.key === 'Escape') { e.stopPropagation(); onClose(); } };
    window.addEventListener('keydown', k, true);
    return () => window.removeEventListener('keydown', k, true);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/40 p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div role="alertdialog" aria-modal="true" aria-labelledby="dlg-t" aria-describedby="dlg-b" className="w-full max-w-sm rounded-2xl bg-[var(--panel)] p-5 shadow-xl ring-1 ring-black/5">
        <h2 id="dlg-t" className="head m-0 text-base font-semibold">{dlg.title}</h2>
        <p id="dlg-b" className="mb-0 mt-2 text-sm text-[var(--muted)]">{dlg.body}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button ref={ref} type="button" className={TOP_BTN} onClick={onClose}>Batal</button>
          <button type="button" className={'inline-flex items-center rounded-lg px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition active:scale-[.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ' + (dlg.tone === 'neutral' ? 'bg-[var(--accent)] hover:brightness-110 focus-visible:ring-[var(--accent)]' : 'bg-red-600 hover:bg-red-700 focus-visible:ring-red-500')}
            onClick={() => { onClose(); dlg.onConfirm(); }}>{dlg.confirm || 'Ya, hapus'}</button>
        </div>
      </div>
    </div>
  );
}

/* Riwayat aktivitas sales dan progres pengisian (khusus admin) */
const fmtWaktu = (iso) => { try { return new Date(iso).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }); } catch (e) { return ''; } };
function describeChange(key, v) {
  const [dari, ke, label] = v; const p = key.split('|'); const q = (t) => (t ? '“' + t + '”' : 'kosong');
  if (key === 'catatan') return `Catatan: ${q(dari)} → ${q(ke)}`;
  if (p[0] === 'nilai') { const { y, m } = parseKey(p[1]); return `${BULAN_PENDEK[m]} ${y} · ${label || 'Brand'} · ${p[3] === 'target' ? 'Target' : 'Total'}: ${rp(dari) || 'kosong'} → ${rp(ke) || 'kosong'}`; }
  if (p[0] === 'brand') return p[2] === 'baru' ? `Brand baru: ${ke}` : p[2] === 'hapus' ? `Brand dihapus: ${dari}` : `Nama brand: ${dari} → ${ke}`;
  return key;
}
function progressOf(deck) {
  const keys = monthsOf(deck);
  return deck.sales.map((s) => {
    let cells = 0, om = 0, tg = 0;
    const perMonth = keys.map((k) => {
      let o = 0, t = 0;
      s.brands.forEach((b) => { const v = cellOf(s, k, b.id); cells++; if (v.skip || digits(v.total) !== '') { o++; om++; } if (v.skip || digits(v.target) !== '') { t++; tg++; } });
      return { k, c: s.brands.length, o, t };
    });
    return { s, cells, om, tg, perMonth };
  });
}
function Bar({ label, n, of }) {
  const pc = of ? Math.round((n / of) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs text-[var(--muted)]"><span>{label}</span><span className="font-semibold text-[var(--fg)]">{n}/{of} · {pc}%</span></div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-[var(--soft)]"><div className="h-full rounded-full" style={{ width: pc + '%', background: pc === 100 ? '#12a37a' : 'var(--accent)' }} /></div>
    </div>
  );
}
function ActivityModal({ deck, getToken, onClose }) {
  const [rows, setRows] = useState(null);
  const [err, setErr] = useState('');
  const load = () => { setErr(''); getToken().then(loadActivity).then((r) => setRows(onlySales(r))).catch(() => setErr('Riwayat belum bisa dimuat.')); };
  useEffect(() => { load(); const t = setInterval(load, 20000); return () => clearInterval(t); }, []);
  useEffect(() => {
    const k = (e) => { if (e.key === 'Escape') { e.stopPropagation(); onClose(); } };
    window.addEventListener('keydown', k, true);
    return () => window.removeEventListener('keydown', k, true);
  }, [onClose]);
  const prog = progressOf(deck);
  const lastOf = (name, action) => { const r = (rows || []).find((x) => sameName(x.actor, name) && x.action === action); return r ? fmtWaktu(r.last_at || r.at) : '–'; };
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-900/40 p-0 sm:items-center sm:p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div role="dialog" aria-modal="true" aria-label="Riwayat dan progres" className="flex max-h-[92vh] w-full max-w-3xl flex-col rounded-t-2xl bg-white shadow-xl ring-1 ring-black/5 sm:rounded-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--line)] px-5 py-3">
          <h2 className="head m-0 text-base font-semibold">Riwayat dan progres</h2>
          <div className="flex gap-2"><button type="button" className="btn" onClick={load}>Muat ulang</button><button type="button" className="btn" onClick={onClose} autoFocus>Tutup</button></div>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <h3 className="head m-0 mb-2 text-sm font-semibold">Aktivitas terbaru</h3>
          {err && <div role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>}
          {!rows && !err && <div className="text-sm text-[var(--muted)]">Memuat…</div>}
          {rows && rows.length === 0 && <div className="text-sm text-[var(--muted)]">Belum ada aktivitas sales.</div>}
          <ul className="m-0 grid list-none gap-2 p-0">
            {(rows || []).map((r) => {
              const ch = r.action === 'edit' ? Object.entries((r.detail && r.detail.changes) || {}) : [];
              return (
                <li key={r.id} className="rounded-xl border border-[var(--line)] bg-white px-3 py-2">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="w-28 text-xs text-[var(--muted)]">{fmtWaktu(r.last_at || r.at)}</span>
                    <b>{r.actor}</b>
                    <span className={'rounded-full px-2 py-0.5 text-[11px] font-semibold ' + (r.action === 'masuk' ? 'bg-emerald-100 text-emerald-800' : r.action === 'edit' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700')}>{r.action === 'masuk' ? 'Masuk' : r.action === 'keluar' ? 'Keluar' : 'Edit'}</span>
                    {ch.length > 0 && <span className="text-xs text-[var(--muted)]">{ch.length} perubahan</span>}
                  </div>
                  {ch.length > 0 && (
                    <ul className="mb-0 mt-1 list-disc pl-[7.5rem] text-xs text-[var(--fg)]">
                      {ch.slice(0, 8).map(([k, v]) => <li key={k} className="break-words">{describeChange(k, v)}</li>)}
                      {ch.length > 8 && <li className="list-none text-[var(--muted)]">+{ch.length - 8} perubahan lainnya</li>}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
          <h3 className="head mb-2 mt-5 text-sm font-semibold">Progres pengisian ({rangeText(deck)})</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {prog.map(({ s, cells, om, tg, perMonth }) => (
              <div key={s.id} className="rounded-xl border border-[var(--line)] bg-white p-3">
                <div className="flex items-baseline justify-between gap-2"><span className="font-semibold">{s.name || 'Tanpa nama'}</span><span className="text-xs text-[var(--muted)]">{s.brands.length} brand</span></div>
                <div className="mt-2 grid gap-2"><Bar label="Omzet terisi" n={om} of={cells} /><Bar label="Target terisi" n={tg} of={cells} /></div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {perMonth.map((m) => <span key={m.k} className="rounded-full bg-[var(--soft)] px-2 py-0.5 text-[11px] text-[var(--muted)]">{BULAN_PENDEK[parseKey(m.k).m]} {m.o}/{m.c} · {m.t}/{m.c}</span>)}
                </div>
                <div className="mt-2 text-xs text-[var(--muted)]">Masuk terakhir: <b className="text-[var(--fg)]">{lastOf(s.name, 'masuk')}</b> · Edit terakhir: <b className="text-[var(--fg)]">{lastOf(s.name, 'edit')}</b></div>
              </div>
            ))}
          </div>
          <p className="mb-0 mt-1 text-[11px] text-[var(--muted)]">Per bulan: omzet terisi · target terisi, dari jumlah brand.</p>
        </div>
      </div>
    </div>
  );
}

/* Atur urutan sales: tombol naik/turun atau seret. Hanya mengubah urutan data; Morph tidak terpengaruh karena dicocokkan per elemen, bukan per posisi slide. */
function OrderModal({ deck, onReorder, onClose }) {
  const [drag, setDrag] = useState(null);
  const [over, setOver] = useState(null);
  useEffect(() => {
    const k = (e) => { if (e.key === 'Escape') { e.stopPropagation(); onClose(); } };
    window.addEventListener('keydown', k, true);
    return () => window.removeEventListener('keydown', k, true);
  }, [onClose]);
  const n = deck.sales.length;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/40 p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div role="dialog" aria-modal="true" aria-label="Atur urutan sales" className="flex max-h-[90vh] w-full max-w-md flex-col rounded-2xl bg-white shadow-xl ring-1 ring-black/5">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--line)] px-5 py-3">
          <div><h2 className="head m-0 text-base font-semibold">Atur urutan sales</h2><p className="m-0 text-xs text-[var(--muted)]">Seret baris atau pakai tombol panah. Urutan ini dipakai di slide dan export.</p></div>
          <button type="button" className="btn" onClick={onClose} autoFocus>Selesai</button>
        </div>
        <ol className="m-0 grid list-none gap-2 overflow-y-auto p-4">
          {deck.sales.map((x, i) => (
            <li key={x.id} draggable onDragStart={(e) => { setDrag(i); e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', String(i)); } catch (er) {} }}
              onDragOver={(e) => { e.preventDefault(); setOver(i); }} onDragEnd={() => { setDrag(null); setOver(null); }}
              onDrop={(e) => { e.preventDefault(); if (drag != null) onReorder(drag, i); setDrag(null); setOver(null); }}
              className="flex items-center gap-3 rounded-xl border bg-white px-3 py-2"
              style={{ borderColor: over === i && drag !== i ? 'var(--accent)' : 'var(--line)', opacity: drag === i ? 0.5 : 1, cursor: 'grab' }}>
              <span aria-hidden="true" className="select-none text-[var(--muted)]">⋮⋮</span>
              <span className="w-5 text-sm text-[var(--muted)]">{i + 1}</span>
              <span className="min-w-0 flex-1 truncate font-medium">{x.name || 'Tanpa nama'}</span>
              <span className="text-xs text-[var(--muted)]">{x.brands.length} brand</span>
              <button type="button" className="btn px-2 py-1" aria-label={`Naikkan ${x.name}`} disabled={i === 0} onClick={() => onReorder(i, i - 1)}>↑</button>
              <button type="button" className="btn px-2 py-1" aria-label={`Turunkan ${x.name}`} disabled={i === n - 1} onClick={() => onReorder(i, i + 1)}>↓</button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

/* Foto sales: hanya admin. Latar dihapus (jika belum transparan), badan dimiringkan sedikit, dipangkas dan disimpan di deck.photos[idSales]. */
function cutoutPhoto(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file), img = new Image();
    img.onload = () => {
      try {
        const sc0 = Math.min(1, 720 / Math.max(img.naturalWidth, img.naturalHeight));
        const w = Math.max(1, Math.round(img.naturalWidth * sc0)), h = Math.max(1, Math.round(img.naturalHeight * sc0));
        const c = document.createElement('canvas'); c.width = w; c.height = h;
        const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(img, 0, 0, w, h);
        const id = x.getImageData(0, 0, w, h), d = id.data;
        let hasAlpha = false; for (let i = 3; i < d.length; i += 4) if (d[i] < 250) { hasAlpha = true; break; }
        if (!hasAlpha) {
          const bg = new Uint8Array(w * h), q = [];
          const edge = (y, x0) => { let r = 0, g = 0, bl = 0; for (let i = 0; i < 3; i++) { const o = (y * w + x0 + i) * 4; r += d[o]; g += d[o + 1]; bl += d[o + 2]; } return [r / 3, g / 3, bl / 3]; };
          const L = [], R = []; for (let y = 0; y < h; y++) { L.push(edge(y, 0)); R.push(edge(y, w - 3)); }
          const near = (p) => { const y = (p / w) | 0, m = (p % w) < w / 2 ? L[y] : R[y], o = p * 4; return Math.abs(d[o] - m[0]) + Math.abs(d[o + 1] - m[1]) + Math.abs(d[o + 2] - m[2]) < 75; };
          const push = (p) => { if (!bg[p] && near(p)) { bg[p] = 1; q.push(p); } };
          for (let i = 0; i < w; i++) { push(i); push((h - 1) * w + i); }
          for (let j = 0; j < h; j++) { push(j * w); push(j * w + w - 1); }
          for (let k = 0; k < q.length; k++) { const p = q[k], px = p % w, py = (p / w) | 0; if (px > 0) push(p - 1); if (px < w - 1) push(p + 1); if (py > 0) push(p - w); if (py < h - 1) push(p + w); }
          for (let p = 0; p < w * h; p++) if (bg[p]) d[p * 4 + 3] = 0;
          x.putImageData(id, 0, 0);
        }
        let x0 = w, y0 = h, x1 = -1, y1 = -1; const d2 = x.getImageData(0, 0, w, h).data;
        for (let y = 0; y < h; y++) for (let xx = 0; xx < w; xx++) if (d2[(y * w + xx) * 4 + 3] > 40) { if (xx < x0) x0 = xx; if (xx > x1) x1 = xx; if (y < y0) y0 = y; if (y > y1) y1 = y; }
        if (x1 < 0) throw new Error('kosong');
        const cw = x1 - x0 + 1, ch = y1 - y0 + 1, ang = 0;
        const ow = Math.ceil(cw * Math.cos(ang) + ch * Math.sin(ang)), oh = Math.ceil(ch * Math.cos(ang) + cw * Math.sin(ang));
        const o = document.createElement('canvas'); o.width = ow; o.height = oh; const ox = o.getContext('2d');
        ox.translate(ow / 2, oh / 2); ox.rotate(-ang); ox.drawImage(c, x0, y0, cw, ch, -cw / 2, -ch / 2, cw, ch);
        const f = Math.min(1, 440 / oh), fw = Math.round(ow * f), fh = Math.round(oh * f);
        const e = document.createElement('canvas'); e.width = fw; e.height = fh; const ex = e.getContext('2d'); ex.drawImage(o, 0, 0, fw, fh);
        const g = ex.createLinearGradient(0, fh * 0.8, 0, fh); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
        ex.globalCompositeOperation = 'destination-in'; ex.fillStyle = g; ex.fillRect(0, 0, fw, fh);
        resolve(e.toDataURL('image/png'));
      } catch (er) { reject(er); } finally { URL.revokeObjectURL(url); }
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('img')); };
    img.src = url;
  });
}

function PhotoModal({ deck, api, notify, onClose }) {
  useEffect(() => {
    const k = (e) => { if (e.key === 'Escape' && !document.querySelector('[role="listbox"]')) { e.stopPropagation(); onClose(); } };
    window.addEventListener('keydown', k, true);
    return () => window.removeEventListener('keydown', k, true);
  }, [onClose]);
  const [sel, setSel] = useState(deck.sales[0] ? deck.sales[0].id : '');
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);
  const on = { ...deck, photoOn: true };
  const cur = deck.sales.find((s) => s.id === sel);
  const custom = deck.photos && deck.photos[sel];
  const shown = cur ? photoOf(cur, on) : null;
  const options = deck.sales.map((s) => ({ key: s.id, label: (photoOf(s, on) ? '✓ ' : '') + s.name }));
  const onFile = async (e) => {
    const f = e.target.files && e.target.files[0]; e.target.value = '';
    if (!f || !cur) return;
    if (!/^image\//.test(f.type)) { notify('File harus berupa gambar', 'err'); return; }
    if (f.size > 12 * 1024 * 1024) { notify('Gambar terlalu besar (maksimal 12 MB)', 'err'); return; }
    setBusy(true);
    try { api.setPhoto(cur.id, await cutoutPhoto(f)); notify('Foto ' + cur.name + ' disimpan'); } catch (er) { notify('Foto tidak bisa diproses', 'err'); }
    setBusy(false);
  };
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/40 p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div role="dialog" aria-modal="true" aria-label="Foto sales" className="flex max-h-[92vh] w-full max-w-md flex-col rounded-2xl bg-white shadow-xl ring-1 ring-black/5">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--line)] px-5 py-3">
          <div><h2 className="head m-0 text-base font-semibold">Foto sales</h2><p className="m-0 text-xs text-[var(--muted)]">Tampil di kiri atas slide sales, menggantikan logo perusahaan</p></div>
          <button type="button" className="btn" onClick={onClose} autoFocus>Selesai</button>
        </div>
        <div className="overflow-y-auto p-5">
          <div className="mb-4 rounded-xl border border-[var(--line)] px-3 py-1">
            <Switch on={deck.photoOn !== false} onChange={(v) => api.setLogoOpt({ photoOn: v })} label="Tampilkan foto" hint="Matikan untuk menyembunyikan semua foto sales" />
          </div>
          <label className="lbl" htmlFor="ph-sales">Nama sales</label>
          <Select id="ph-sales" value={sel} onChange={setSel} options={options} />
          <div className="mt-3 flex h-44 items-center justify-center rounded-xl border border-dashed border-[var(--line)] bg-slate-700 p-3">
            {shown ? <img src={shown} alt={cur.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} /> : <span className="text-sm text-slate-300">Belum ada foto untuk {cur && cur.name}</span>}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
            <button type="button" className="btn btn-primary" disabled={busy} onClick={() => fileRef.current && fileRef.current.click()}>{busy ? 'Memproses…' : shown ? 'Ganti foto' : 'Upload foto'}</button>
            {custom && <button type="button" className="btn btn-danger" onClick={() => { api.setPhoto(sel, null); notify('Foto kustom dihapus'); }}>Hapus foto</button>}
          </div>
          <p className="mb-0 mt-3 text-xs text-[var(--muted)]">Latar dihapus otomatis dan foto dipangkas. Hasil terbaik dari foto berlatar polos atau PNG yang sudah transparan.</p>
        </div>
      </div>
    </div>
  );
}

/* Logo brand: hanya admin. Gambar diperkecil dan dipangkas di browser, disimpan di data deck per nama brand (deck.logos). */
function trimLogo(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file), img = new Image();
    img.onload = () => {
      try {
        const w0 = img.naturalWidth, h0 = img.naturalHeight, sc0 = Math.min(1, 1200 / Math.max(w0, h0));
        const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w0 * sc0)); c.height = Math.max(1, Math.round(h0 * sc0));
        const x = c.getContext('2d', { willReadFrequently: true }); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(img, 0, 0, c.width, c.height);
        const d = x.getImageData(0, 0, c.width, c.height).data;
        let x0 = c.width, y0 = c.height, x1 = -1, y1 = -1;
        for (let y = 0; y < c.height; y++) for (let xx = 0; xx < c.width; xx++) { const i = (y * c.width + xx) * 4; if (Math.min(d[i], d[i + 1], d[i + 2]) < 225) { if (xx < x0) x0 = xx; if (xx > x1) x1 = xx; if (y < y0) y0 = y; if (y > y1) y1 = y; } }
        if (x1 < 0) { x0 = 0; y0 = 0; x1 = c.width - 1; y1 = c.height - 1; }
        const p = 4; x0 = Math.max(0, x0 - p); y0 = Math.max(0, y0 - p); x1 = Math.min(c.width - 1, x1 + p); y1 = Math.min(c.height - 1, y1 + p);
        const cw = x1 - x0 + 1, ch = y1 - y0 + 1, sc = Math.min(1, 480 / Math.max(cw, ch));
        const o = document.createElement('canvas'); o.width = Math.max(1, Math.round(cw * sc)); o.height = Math.max(1, Math.round(ch * sc));
        const ox = o.getContext('2d'); ox.fillStyle = '#fff'; ox.fillRect(0, 0, o.width, o.height); ox.drawImage(c, x0, y0, cw, ch, 0, 0, o.width, o.height);
        const od = ox.getImageData(0, 0, o.width, o.height), px = od.data;
        let any = false;
        for (let i = 0; i < px.length; i += 4) if (Math.min(px[i], px[i + 1], px[i + 2]) < 225) { any = true; break; }
        let mo = null;
        if (any) {
          const mk = (col) => { const t = document.createElement('canvas'); t.width = o.width; t.height = o.height; const tx = t.getContext('2d'), id = tx.createImageData(o.width, o.height); for (let i = 0; i < px.length; i += 4) { const lum = 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2]; id.data[i] = id.data[i + 1] = id.data[i + 2] = col; id.data[i + 3] = Math.max(0, Math.min(255, Math.round((235 - lum) * 2.6))); } tx.putImageData(id, 0, 0); return t.toDataURL('image/png'); };
          mo = { d: mk(0), l: mk(255) };
        }
        resolve({ url: o.toDataURL('image/png'), mono: mo });
      } catch (e) { reject(e); } finally { URL.revokeObjectURL(url); }
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('img')); };
    img.src = url;
  });
}

function Switch({ on, onChange, label, hint }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={() => onChange(!on)} className="flex w-full items-center gap-3 rounded-lg px-1 py-2 text-left">
      <span className="min-w-0 flex-1"><span className="block text-sm font-medium">{label}</span>{hint && <span className="block text-xs text-[var(--muted)]">{hint}</span>}</span>
      <span className={'relative inline-block h-6 w-11 shrink-0 rounded-full transition ' + (on ? 'bg-slate-900' : 'bg-slate-300')}><span className={'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ' + (on ? 'left-[22px]' : 'left-0.5')} /></span>
    </button>
  );
}

function LogoModal({ deck, api, notify, onClose }) {
  useEffect(() => {
    const k = (e) => { if (e.key === 'Escape' && !document.querySelector('[role="listbox"]')) { e.stopPropagation(); onClose(); } };
    window.addEventListener('keydown', k, true);
    return () => window.removeEventListener('keydown', k, true);
  }, [onClose]);
  const brands = useMemo(() => {
    const m = new Map();
    deck.sales.forEach((s) => s.brands.forEach((b) => { const k = brandKey(b.name); if (!k) return; if (!m.has(k)) m.set(k, { key: k, name: String(b.name).trim(), sales: [] }); const e = m.get(k); if (!e.sales.includes(s.name)) e.sales.push(s.name); }));
    return [...m.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [deck.sales]);
  const [sel, setSel] = useState(brands[0] ? brands[0].key : '');
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);
  const cur = brands.find((b) => b.key === sel);
  const custom = deck.logos && deck.logos[sel];
  const shown = cur ? (monoOf(cur.name, deck) ? monoOf(cur.name, deck).d : logoOf(cur.name, deck)) : null;
  const options = brands.map((b) => ({ key: b.key, label: (logoOf(b.name, deck) || monoOf(b.name, deck) ? '✓ ' : '') + b.name + ' · ' + b.sales.join(', ') }));
  const onFile = async (e) => {
    const f = e.target.files && e.target.files[0]; e.target.value = '';
    if (!f || !cur) return;
    if (!/^image\//.test(f.type)) { notify('File harus berupa gambar', 'err'); return; }
    if (f.size > 8 * 1024 * 1024) { notify('Gambar terlalu besar (maksimal 8 MB)', 'err'); return; }
    setBusy(true);
    try { const r = await trimLogo(f); api.setLogo(cur.key, r.url, r.mono); notify('Logo ' + cur.name + ' disimpan'); } catch (er) { notify('Gambar tidak bisa dibaca', 'err'); }
    setBusy(false);
  };
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/40 p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div role="dialog" aria-modal="true" aria-label="Logo brand" className="flex max-h-[92vh] w-full max-w-md flex-col rounded-2xl bg-white shadow-xl ring-1 ring-black/5">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--line)] px-5 py-3">
          <div><h2 className="head m-0 text-base font-semibold">Logo brand</h2><p className="m-0 text-xs text-[var(--muted)]">Logo tampil di kartu brand pada slide dan export</p></div>
          <button type="button" className="btn" onClick={onClose} autoFocus>Selesai</button>
        </div>
        <div className="overflow-y-auto p-5">
          <div className="mb-4 rounded-xl border border-[var(--line)] px-3 py-1">
            <Switch on={deck.logoOn !== false} onChange={(v) => api.setLogoOpt({ logoOn: v })} label="Tampilkan logo" hint="Brand yang punya logo menampilkan logo saja (nama disembunyikan). Matikan untuk menampilkan nama." />
          </div>
          {brands.length === 0 ? <div className="text-sm text-[var(--muted)]">Belum ada brand.</div> : (
            <>
              <label className="lbl" htmlFor="lg-brand">Nama brand</label>
              <Select id="lg-brand" value={sel} onChange={setSel} options={options} />
              <div className="mt-3 flex h-24 items-center justify-center rounded-xl border border-dashed border-[var(--line)] bg-slate-100 p-3">
                {shown ? <span className="flex max-w-full items-center rounded-[10px] bg-white px-3 py-2 shadow"><img src={shown} alt={cur.name} style={{ maxHeight: 56, maxWidth: '100%', objectFit: 'contain' }} /></span> : <span className="text-sm text-[var(--muted)]">Belum ada logo untuk {cur && cur.name}</span>}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
                <button type="button" className="btn btn-primary" disabled={busy} onClick={() => fileRef.current && fileRef.current.click()}>{busy ? 'Memproses…' : shown ? 'Ganti logo' : 'Upload logo'}</button>
                {custom && <button type="button" className="btn btn-danger" onClick={() => { api.setLogo(sel, null); notify('Logo kustom dihapus'); }}>Hapus logo</button>}
              </div>
              <p className="mb-0 mt-3 text-xs text-[var(--muted)]">Gambar dipangkas otomatis dari ruang putih di tepinya dan diperkecil. Disarankan PNG/JPG dengan latar putih atau transparan.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* Rentang bulan: hanya admin. Perubahan langsung dipakai semua slide sales, ringkasan, dan export. */
function RangeModal({ deck, api, onClose }) {
  useEffect(() => {
    const k = (e) => { if (e.key === 'Escape' && !document.querySelector('[role="listbox"]')) { e.stopPropagation(); onClose(); } };
    window.addEventListener('keydown', k, true);
    return () => window.removeEventListener('keydown', k, true);
  }, [onClose]);
  const keys = monthsOf(deck);
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/40 p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div role="dialog" aria-modal="true" aria-label="Rentang bulan" className="w-full max-w-sm rounded-2xl bg-white shadow-xl ring-1 ring-black/5">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--line)] px-5 py-3">
          <div><h2 className="head m-0 text-base font-semibold">Rentang bulan</h2><p className="m-0 text-xs text-[var(--muted)]">Berlaku untuk semua slide sales (maksimal {MAX_BULAN} bulan)</p></div>
          <button type="button" className="btn" onClick={onClose} autoFocus>Selesai</button>
        </div>
        <div className="grid grid-cols-[auto_1fr] items-center gap-3 p-5">
          <label className="lbl" style={{ margin: 0 }} htmlFor="rm-from">Dari</label>
          <Select id="rm-from" value={deck.range.from} onChange={(v) => api.setRange('from', v)} options={MONTH_OPTIONS} />
          <label className="lbl" style={{ margin: 0 }} htmlFor="rm-to">Sampai</label>
          <Select id="rm-to" value={keys[keys.length - 1]} onChange={(v) => api.setRange('to', v)} options={MONTH_OPTIONS} />
        </div>
        <div className="border-t border-[var(--line)] px-5 py-3 text-sm text-[var(--muted)]">{keys.length} bulan: {rangeText(deck)}</div>
      </div>
    </div>
  );
}

function Toast({ toast }) {
  if (!toast) return null;
  return (
        <div role="status" aria-live="polite" className="toast-wrap pointer-events-none fixed inset-x-0 z-[60] flex justify-center px-4" style={{ bottom: 'max(20px, env(safe-area-inset-bottom, 0px))' }}>
          <div className={'toast-in flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white shadow-md ' + (toast.kind === 'err' ? 'bg-red-600' : 'bg-slate-900')}>
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{toast.kind === 'err' ? <path d="M12 8v5M12 17h.01M10.3 3.9L2.4 18a2 2 0 001.7 3h15.8a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" /> : <path d="M5 12l5 5 9-10" />}</svg>
            {toast.msg}
          </div>
        </div>
  );
}

/* ===== Export PPTX =====
   Tiap slide dirender dari komponen yang sama dengan tampilan web (SlideView), lalu posisi dan gaya setiap elemen dibaca dari browser
   dan dibuat ulang sebagai objek asli PowerPoint (teks, bentuk, bar, logo) di pptx-export.js. Semua bisa diedit.
   Objek diberi nama konsisten antar slide (!!title, !!card-0, ...) agar transisi Morph PowerPoint bisa diterapkan manual. */
const LIB_PPTX = 'https://unpkg.com/pptxgenjs@4.0.1/dist/pptxgen.bundle.js';
const LIB_ZIP = 'https://unpkg.com/jszip@3.10.1/dist/jszip.min.js';
const LIB_CONV = 'pptx-export.js';
const libCache = {};
const loadLib = (src) => (libCache[src] = libCache[src] || new Promise((res, rej) => {
  const el = document.createElement('script');
  el.src = src; el.async = true; el.onload = res;
  el.onerror = () => { delete libCache[src]; rej(new Error('Pustaka export gagal dimuat. Periksa koneksi internet.')); };
  document.head.appendChild(el);
}));
async function convertSlide(item, deck, n, total, api, slide, pptx, ctx) {
  const host = document.createElement('div');
  host.style.cssText = `position:fixed;left:-20000px;top:0;width:${W}px;height:${H}px;pointer-events:none`;
  document.body.appendChild(host);
  const root = ReactDOM.createRoot(host);
  try {
    ReactDOM.flushSync(() => root.render(<SlideView item={item} deck={deck} n={n} total={total} ro api={api} />));
    try { await document.fonts.ready; } catch (e) {}
    await Promise.all(Array.from(host.querySelectorAll('img')).map((im) => (im.complete ? 0 : new Promise((r) => { im.onload = im.onerror = r; }))));
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    await window.DhouseExport.convert(host.firstElementChild, slide, pptx, ctx);
  } finally { root.unmount(); host.remove(); }
}
function slideNotes(it, deck) {
  if (it.kind === 'cover') return [deck.cover.title, deck.cover.sub, periodOf(deck), deck.cover.audience].filter(Boolean).join('\n');
  if (it.kind === 'closing') return [deck.closing.title, deck.closing.sub].filter(Boolean).join('\n');
  if (it.kind === 'canvas') return it.entries.map((e) => `${e.kontraktor} (${e.sales}) - ${e.produk}: ${e.catatan}`).join('\n') || 'Belum ada hasil canvasing';
  if (it.summary) { const S = summaryOf(it.sales, monthsOf(deck)); return [`${it.sales.name} · Kesimpulan · ${rangeText(deck)}`, S.any ? `Total penjualan ${rp(String(S.total))}${S.pct != null ? `, capaian ${Math.round(S.pct)}% dari target` : ''}` : 'Belum ada data', ...S.brands.map((b) => `${b.name}: ${rp(String(b.total))}${b.pct != null ? ' (' + Math.round(b.pct) + '%)' : ''}`)].join('\n'); }
  const s = it.sales, keys = monthsOf(deck), out = [`${s.name} · ${sublineOf(deck)}`];
  (it.brands || s.brands).forEach((b) => {
    out.push(`${b.name}:`);
    keys.forEach((k) => {
      const c = cellOf(s, k, b.id), st = statsOf(s, k, b.id, keys);
      out.push(`  ${BULAN[parseKey(k).m]} ${parseKey(k).y}: total ${rp(c.total) || '-'}, target ${rp(c.target) || '-'}${st.pct == null ? '' : ', capaian ' + Math.round(st.pct) + '%'}`);
    });
  });
  if (s.note) out.push(`Catatan dari ${s.name}: “${s.note}”`);
  return out.join('\n');
}
const labelOfItem = (it) => it.kind === 'cover' ? 'Sampul' : it.kind === 'closing' ? 'Penutup' : it.kind === 'canvas' ? 'Canvasing' + (it.pages > 1 ? ' ' + (it.page + 1) : '') : (it.sales.name || 'Tanpa nama') + (it.summary ? ' · Kesimpulan' : it.pages > 1 ? ' ' + (it.page + 1) + '/' + it.pages : '');
async function exportPptx(items, deck, api, onProgress) {
  await Promise.all([loadLib(LIB_PPTX), loadLib(LIB_ZIP), loadLib(LIB_CONV)]);
  onProgress(0, items.length);
  const pptx = new window.PptxGenJS();
  pptx.defineLayout({ name: 'DHOUSE', width: 13.333, height: 7.5 });
  pptx.layout = 'DHOUSE'; pptx.title = 'Presentasi Dhouse'; pptx.company = 'Dhouse';
  const ctx = { orbs: [], grads: [], slideIndex: 0 };
  for (let i = 0; i < items.length; i++) {
    onProgress(i, items.length);
    ctx.slideIndex = i;
    const sl = pptx.addSlide();
    await convertSlide(items[i], deck, i + 1, items.length, api, sl, pptx, ctx);
    sl.addNotes(slideNotes(items[i], deck));
  }
  onProgress(items.length, items.length);
  const buf = await window.DhouseExport.embedFonts(await window.DhouseExport.patchGrads(await window.DhouseExport.patchOrbs(await pptx.write({ outputType: 'arraybuffer' }), ctx.orbs, window.JSZip), ctx.grads, window.JSZip), window.JSZip, new URL('.', location.href).href);
  const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = `Presentasi-Dhouse-${new Date().toISOString().slice(0, 10)}.pptx`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

function Editor({ session, getToken, initialDeck, onLogout, notify }) {
  const isAdmin = session.role === 'admin';
  const mineOf = (d) => d.sales.find((x) => sameName(x.name, session.name));
  const [deck, setDeckRaw] = useState(() => (isAdmin ? load() : (migrate(initialDeck) || DEFAULT)));
  /* Sales: apa pun yang diubah selain slide miliknya langsung dibatalkan, sehingga tidak ada perubahan yang tampil tetapi tidak tersimpan */
  const setDeck = (fn) => setDeckRaw((d) => {
    const n = typeof fn === 'function' ? fn(d) : fn;
    if (isAdmin) return n;
    const mine = mineOf(d), nm = mine && n.sales.find((x) => x.id === mine.id);
    if (!mine || !nm) return d;
    return { ...d, sales: d.sales.map((x) => (x.id === mine.id ? { ...nm, id: mine.id, name: mine.name } : x)) };
  });
  const [idx, setIdx] = useState(() => { if (isAdmin) return 1; const m = deck.sales.find((x) => sameName(x.name, session.name)); return m ? itemIndexOf(deck, m.id) : 1; });
  const [presenting, setPresenting] = useState(false);

  const [sync, setSync] = useState(isAdmin ? 'memuat' : 'tersimpan');
  const [dlg, setDlg] = useState(null);
  const [undoDel, setUndoDel] = useState(null);
  const [showAct, setShowAct] = useState(false);
  const [showOrder, setShowOrder] = useState(false);
  const [showRange, setShowRange] = useState(false);
  const [showLogo, setShowLogo] = useState(false);
  const [showPhoto, setShowPhoto] = useState(false);
  const [exporting, setExporting] = useState(null);
  const doExport = async () => {
    if (exporting) return;
    setExporting({ i: 0, n: items.length });
    try {
      await exportPptx(items, deck, api, (i, n) => setExporting({ i, n }));
      notify('File PPTX berhasil dibuat');
    } catch (e) { notify('Export gagal: ' + (e && e.message ? e.message : 'coba lagi'), 'err'); }
    setExporting(null);
  };
  const [canvas, setCanvas] = useState([]);
  const who = isAdmin ? adminLabel(session.email) : session.name;
  const loadCanvas = () => getToken().then((t) => canvasList(session, t)).then((l) => { if (Array.isArray(l)) setCanvas(l); }).catch(() => {});
  useEffect(() => {
    loadCanvas();
    const t = setInterval(loadCanvas, 30000);
    return () => clearInterval(t);
  }, []);
  const cv = {
    list: canvas,
    canManage: (e) => isAdmin || sameName(e.sales, session.name),
    save: async (f) => {
      try { await canvasSave(session, await getToken(), f, who); await loadCanvas(); notify(f.id ? 'Canvasing diperbarui' : 'Canvasing ditambahkan'); return true; }
      catch (e) { notify('Gagal menyimpan canvasing. Coba lagi.', 'err'); return false; }
    },
    del: async (id) => {
      try { await canvasDelete(session, await getToken(), id); await loadCanvas(); notify('Canvasing dihapus'); }
      catch (e) { notify('Gagal menghapus canvasing', 'err'); }
    },
  };
  const [mk, setMk] = useState(null);
  const [focusReq, setFocusReq] = useState(null);
  const [moreRail, setMoreRail] = useState(false);
  const loaded = useRef(!isAdmin);
  const lastOwn = useRef(null);
  if (lastOwn.current === null && !isAdmin) lastOwn.current = JSON.stringify(mineOf(deck) || null);
  const deckRef = useRef(deck);
  deckRef.current = deck;
  const saveTimer = useRef(null);
  const lastFail = useRef(false);
  const railRef = useRef(null);

  useEffect(() => { if (isAdmin) { try { localStorage.setItem('laporan-penjualan-v2', JSON.stringify(deck)); } catch (e) {} } }, [deck]);

  const retryTimer = useRef(null);
  const doSave = (manual) => (isAdmin
    ? getToken().then((t) => dbSave(deckRef.current, t))
    : (() => {
        const me = mineOf(deckRef.current), snap = JSON.stringify(me || null);
        if (!me) return Promise.reject(new Error('save'));
        return salesSave(session.name, session.pass, me).then((ok) => { if (!ok) throw new Error('save'); lastOwn.current = snap; });
      })())
    .then(() => { clearTimeout(retryTimer.current); lastFail.current = false; setSync('tersimpan'); if (manual) notify('Tersimpan di database'); })
    .catch((err) => { if (err && err.message === 'auth') { onLogout('Sesi habis. Masuk lagi.'); return; } setSync('gagal'); if (manual || !lastFail.current) notify('Gagal menyimpan ke database. Mencoba lagi otomatis.', 'err'); lastFail.current = true; clearTimeout(retryTimer.current); retryTimer.current = setTimeout(() => doSave(false), 6000); });
  const syncRef = useRef(sync); syncRef.current = sync;
  useEffect(() => {
    const h = (e) => { if (syncRef.current === 'gagal' || syncRef.current === 'menyimpan') { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', h);
    return () => { window.removeEventListener('beforeunload', h); clearTimeout(retryTimer.current); };
  }, []);
  const saveNow = () => {
    if (!loaded.current) { notify('Belum terhubung ke database. Muat ulang halaman.', 'err'); return; }
    clearTimeout(saveTimer.current);
    setSync('menyimpan');
    doSave(true);
  };

  useEffect(() => {
    if (!isAdmin) return;
    getToken().then((t) => dbLoad(t)).then((remote) => {
      const m = migrate(remote);
      if (m) setDeck(m);
      loaded.current = true;
      setSync(m ? 'tersimpan' : 'menyimpan');
      if (!m) setDeck((d) => ({ ...d }));
    }).catch((err) => { if (err && err.message === 'auth') onLogout('Sesi habis. Masuk lagi.'); else setSync('gagal'); });
  }, []);

  /* Sales: ambil perubahan slide lain secara berkala; slide milik sendiri tidak ditimpa */
  useEffect(() => {
    if (isAdmin) return;
    const pull = () => salesLogin(session.name, session.pass).then((remote) => {
      if (!remote) { onLogout('Sesi berakhir. Masuk lagi.'); return; }
      const m = migrate(remote); if (!m) return;
      setDeckRaw((d) => { const mine = mineOf(d); return { ...m, sales: m.sales.map((x) => (mine && x.id === mine.id ? mine : x)) }; });
    }).catch(() => {});
    const t = setInterval(pull, 30000);
    const onVis = () => { if (document.visibilityState === 'visible') pull(); };
    document.addEventListener('visibilitychange', onVis);
    return () => { clearInterval(t); document.removeEventListener('visibilitychange', onVis); };
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    if (!isAdmin) { const me = mineOf(deck); if (!me || JSON.stringify(me) === lastOwn.current) return; }
    setSync('menyimpan');
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => doSave(false), 600);
    return () => clearTimeout(saveTimer.current);
  }, [deck]);

  const items = [{ kind: 'cover', key: 'cover' }, ...deck.sales.flatMap(salesPages), ...canvasPages(canvas), { kind: 'closing', key: 'closing' }];
  const safeIdx = Math.min(idx, items.length - 1);
  const cur = items[safeIdx];

  const mapSales = (id, fn) => setDeck((d) => ({ ...d, sales: d.sales.map((s) => (s.id === id ? fn(s) : s)) }));
  const api = {
    setSubline: (v) => setDeck((d) => ({ ...d, subline: v })),
    setSlideTheme: (v) => setDeck((d) => ({ ...d, slideTheme: v })),
    setRange: (which, key) => setDeck((d) => {
      let a = idxOf(d.range.from), b = idxOf(d.range.to), k = idxOf(key);
      if (which === 'from') { a = k; if (b < a) b = a; if (b - a >= MAX_BULAN) b = a + MAX_BULAN - 1; }
      else { b = k; if (b < a) a = b; if (b - a >= MAX_BULAN) a = b - MAX_BULAN + 1; }
      /* teks periode (keterangan slide sales dan periode sampul) ikut rentang baru, bukan teks lama */
      const { subline, ...rest } = d, { period, ...cover } = rest.cover;
      return { ...rest, cover, range: { from: keyOfIdx(a), to: keyOfIdx(b) } };
    }),
    setCover: (p) => setDeck((d) => ({ ...d, cover: { ...d.cover, ...p } })),
    setClosing: (p) => setDeck((d) => ({ ...d, closing: { ...d.closing, ...p } })),
    setPhoto: (sid, url) => setDeck((d) => { const photos = { ...(d.photos || {}) }; if (url) photos[sid] = url; else delete photos[sid]; return { ...d, photos }; }),
    setLogoOpt: (p) => setDeck((d) => ({ ...d, ...p })),
    setLogo: (key, url, mono) => setDeck((d) => { const logos = { ...(d.logos || {}) }, lm = { ...(d.logosMono || {}) }; if (url) { logos[key] = url; if (mono) lm[key] = mono; else delete lm[key]; } else { delete logos[key]; delete lm[key]; } return { ...d, logos, logosMono: lm }; }),
    setSales: (id, p) => mapSales(id, (s) => ({ ...s, ...p })),
    setBrand: (sid, bid, name) => mapSales(sid, (s) => ({ ...s, brands: s.brands.map((x) => (x.id === bid ? { ...x, name: name.toUpperCase() } : x)) })),
    setCell: (sid, key, bid, p) => mapSales(sid, (s) => ({ ...s, data: { ...s.data, [key]: { ...(s.data[key] || {}), [bid]: { ...cellOf(s, key, bid), ...p, skip: false } } } })),
    fillTarget: (sid, key, bid, keys) => mapSales(sid, (s) => {
      const t = digits(cellOf(s, key, bid).target); if (t === '') return s;
      const data = { ...s.data };
      keys.forEach((k) => { const c = cellOf(s, k, bid); if (k !== key && !c.skip && digits(c.target) === '') data[k] = { ...(data[k] || {}), [bid]: { ...c, target: t } }; });
      return { ...s, data };
    }),
    addBrand: (sid) => mapSales(sid, (s) => ({ ...s, brands: [...s.brands, mkBrand('BRAND ' + String.fromCharCode(65 + (s.brands.length % 26)))] })),
    clearCell: (sid, key, bid) => mapSales(sid, (s) => ({ ...s, data: { ...s.data, [key]: { ...(s.data[key] || {}), [bid]: { total: '', target: '', skip: true } } } })),
    undoDel,
    delBrand: (sid, bid) => {
      const s0 = deck.sales.find((x) => x.id === sid);
      if (!s0 || s0.brands.length <= 1) return;
      const cells = {};
      Object.keys(s0.data || {}).forEach((k) => { if (s0.data[k] && s0.data[k][bid]) cells[k] = s0.data[k][bid]; });
      setUndoDel({ sid, brand: s0.brands.find((x) => x.id === bid), index: s0.brands.findIndex((x) => x.id === bid), cells });
      mapSales(sid, (s) => {
        const data = {};
        Object.keys(s.data || {}).forEach((k) => { const { [bid]: _x, ...rest } = s.data[k]; data[k] = rest; });
        return { ...s, brands: s.brands.filter((x) => x.id !== bid), data };
      });
    },
    undoDelBrand: () => {
      const u = undoDel; if (!u) return;
      mapSales(u.sid, (s) => {
        if (s.brands.some((x) => x.id === u.brand.id)) return s;
        const brands = [...s.brands]; brands.splice(Math.min(u.index, brands.length), 0, u.brand);
        const data = { ...s.data };
        Object.keys(u.cells).forEach((k) => { data[k] = { ...(data[k] || {}), [u.brand.id]: u.cells[k] }; });
        return { ...s, brands, data };
      });
      setUndoDel(null);
    },
  };

  const addSales = () => {
    const at = cur.kind === 'sales' ? deck.sales.findIndex((x) => x.id === cur.sales.id) : deck.sales.length;
    const ns = mkSales('Sales baru');
    const nd = { ...deck, sales: [...deck.sales.slice(0, at), ns, ...deck.sales.slice(at)] };
    setDeck(nd);
    setIdx(itemIndexOf(nd, ns.id));
  };
  const delSales = () => {
    if (cur.kind !== 'sales' || deck.sales.length === 1) return;
    setDeck((d) => ({ ...d, sales: d.sales.filter((s) => s.id !== cur.sales.id) }));
    setIdx(Math.max(1, safeIdx - 1));
  };
  const moveSales = (dir) => {
    if (cur.kind !== 'sales') return;
    const a = deck.sales.findIndex((x) => x.id === cur.sales.id), b = a + dir;
    if (a < 0 || b < 0 || b >= deck.sales.length) return;
    const arr = [...deck.sales]; [arr[a], arr[b]] = [arr[b], arr[a]];
    setDeck((d) => ({ ...d, sales: arr }));
    setIdx(itemIndexOf({ sales: arr }, cur.sales.id));
  };
  const reorderSales = (a, b) => {
    if (a === b || a < 0 || b < 0 || a >= deck.sales.length || b >= deck.sales.length) return;
    const arr = [...deck.sales]; const [m] = arr.splice(a, 1); arr.splice(b, 0, m);
    if (cur.kind === 'sales') setIdx(itemIndexOf({ sales: arr }, cur.sales.id));
    setDeck((d) => ({ ...d, sales: arr }));
  };

  useEffect(() => {
    if (presenting) return;
    const onKey = (e) => {
      const tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.getAttribute('role') === 'combobox') return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') setIdx((i) => Math.min(items.length - 1, i + 1));
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') setIdx((i) => Math.max(0, i - 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [presenting, items.length]);

  const ask = (o) => setDlg(o);
  const canEdit = (it) => isAdmin || (it.kind === 'sales' && sameName(it.sales.name, session.name));
  const pick = (t) => { if (!isAdmin && (t.id === 's-name' || t.id === 'g-sub')) return; if (t.month) setMk(t.month); setFocusReq({ id: t.id, n: Date.now() }); };
  useEffect(() => {
    if (!focusReq) return;
    let el = document.getElementById(focusReq.id);
    if (!el) {
      const btn = document.getElementById(focusReq.id + '-btn');
      if (btn) { btn.click(); setTimeout(() => { const i2 = document.getElementById(focusReq.id); if (i2) { i2.focus({ preventScroll: true }); i2.select && i2.select(); i2.scrollIntoView({ block: 'center', behavior: 'smooth' }); } }, 60); }
      return;
    }
    try { el.focus({ preventScroll: true }); } catch (e) {}
    if (el.select) el.select();
    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [focusReq]);

  const vertical = () => window.matchMedia('(min-width: 1024px)').matches;
  const updRail = () => {
    const el = railRef.current;
    if (!el) return;
    const left = vertical() ? el.scrollHeight - el.scrollTop - el.clientHeight : el.scrollWidth - el.scrollLeft - el.clientWidth;
    setMoreRail(left > 6);
  };
  const scrollRail = () => { const el = railRef.current; if (el) el.scrollBy(vertical() ? { top: 260, behavior: 'smooth' } : { left: 240, behavior: 'smooth' }); };
  useEffect(() => {
    updRail();
    const el = railRef.current;
    const ro = new ResizeObserver(updRail);
    if (el) ro.observe(el);
    window.addEventListener('resize', updRail);
    return () => { ro.disconnect(); window.removeEventListener('resize', updRail); };
  }, [items.length]);
  useEffect(() => {
    const el = railRef.current;
    const b = el && el.children[safeIdx];
    if (b && b.scrollIntoView) b.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
  }, [safeIdx]);

  const syncDot = sync === 'tersimpan' ? 'bg-emerald-500' : sync === 'menyimpan' ? 'bg-amber-500' : sync === 'gagal' ? 'bg-red-500' : 'bg-slate-400';
  const syncText = sync === 'tersimpan' ? 'Tersimpan di database' : sync === 'menyimpan' ? 'Menyimpan…' : sync === 'gagal' ? 'Belum tersambung ke database' : 'Memuat…';
  const curTheme = themeOf(deck);

  const leave = () => ask({
    title: 'Keluar dari akun?',
    body: 'Perubahan yang belum tersimpan akan disimpan dulu, lalu kamu kembali ke halaman login.',
    confirm: 'Ya, keluar', tone: 'neutral', onConfirm: doLeave,
  });
  const doLeave = async () => {
    clearTimeout(saveTimer.current);
    if (loaded.current && (isAdmin || JSON.stringify(mineOf(deckRef.current) || null) !== lastOwn.current)) { try { await doSave(false); } catch (e) {} }
    if (!isAdmin) await salesLog(session.name, session.pass, 'keluar');
    onLogout('', 'Berhasil keluar');
  };
  const isMine = (it) => it.kind === 'sales' && sameName(it.sales.name, session.name);
  const labelOf = labelOfItem;

  return (
    <div className="flex flex-col gap-3 min-h-full lg:h-full">
      <header className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <div className="flex min-w-0 items-center gap-3">
          <img src={LOGO_SRC} alt="" width="38" height="27" className="h-[27px] w-[38px] shrink-0 object-contain" />
          <h1 className="head m-0 whitespace-nowrap text-lg font-bold">Presentasi Dhouse</h1>
          <span role="status" className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[var(--soft)] px-2.5 py-1 text-xs font-medium text-[var(--muted)]">
            <span className={'h-1.5 w-1.5 shrink-0 rounded-full ' + syncDot} /><span className="whitespace-nowrap"><span className="sr-only sm:not-sr-only">{syncText}</span><span aria-hidden="true" className="max-[359px]:hidden sm:hidden">{syncText.replace(' di database', '')}</span></span>
          </span>
          <span className="hidden max-w-[16rem] items-center truncate rounded-full border border-[var(--line)] bg-[var(--panel)] px-2.5 py-1 text-xs font-medium text-[var(--fg)] md:inline-flex">
            {isAdmin ? 'Admin · ' + adminLabel(session.email) : 'Sales · ' + session.name}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isAdmin && <Menu icon={<Swatch T={curTheme} />} label={<><span className="sr-only sm:not-sr-only">Tema</span><span className="hidden sm:inline">: {curTheme.name}</span></>} width={240}>
            {Object.entries(SLIDE_THEMES).map(([k, t]) => (
              <MenuItem key={k} icon={<Swatch T={t} />} title={t.name} active={k === (THEME_ALIAS[deck.slideTheme] || deck.slideTheme)} onClick={() => api.setSlideTheme(k)} />
            ))}
          </Menu>}
          {isAdmin && <Menu icon={<MenuIcon />} label={<span className="sr-only sm:not-sr-only">Menu</span>} width={288}>
            <MenuItem title="Rentang bulan" hint={`${rangeText(deck)} · berlaku untuk semua slide`} onClick={() => setShowRange(true)} />
            <MenuItem title="Foto sales" hint="Upload foto per sales, tampil/sembunyikan" onClick={() => setShowPhoto(true)} />
            <MenuItem title="Logo brand" hint="Upload logo per brand, tampil/sembunyikan logo dan nama" onClick={() => setShowLogo(true)} />
            <MenuItem title="Atur urutan sales" hint="Ubah urutan slide sales dengan seret atau panah" onClick={() => setShowOrder(true)} />
            <MenuItem title="Riwayat dan progres" hint="Siapa yang masuk, apa yang diedit, dan progres omzet/target" onClick={() => setShowAct(true)} />
          </Menu>}
          {isAdmin && (
          <button type="button" className={TOP_BTN} onClick={doExport} disabled={!!exporting} title="Download semua slide sebagai file PowerPoint (.pptx)">
            <svg className="h-4 w-4 text-[var(--muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3v12m0 0l-4.5-4.5M12 15l4.5-4.5M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" /></svg><span className="sr-only sm:not-sr-only">Download</span>
          </button>
          )}
          <button type="button" onClick={() => setPresenting(true)}
            className="btn btn-primary" title="Lihat presentasi">
            <PlayIcon /><span className="sr-only sm:not-sr-only">Lihat Presentasi</span>
          </button>
          <button type="button" className={TOP_BTN} onClick={leave} title="Keluar dari akun">
            <svg className="h-4 w-4 text-[var(--muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></svg><span className="sr-only sm:not-sr-only">Keluar</span>
          </button>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-3 flex-1 min-h-0">
        <div className="relative min-w-0 shrink-0 lg:w-44">
          <nav ref={railRef} onScroll={updRail} aria-label="Daftar slide" className="flex gap-2 overflow-x-auto pb-2 lg:absolute lg:inset-0 lg:flex-col lg:overflow-x-hidden lg:overflow-y-auto lg:pb-0">
            {items.map((it, i) => (
              <button key={it.key} onClick={() => setIdx(i)} aria-current={i === safeIdx}
                className={'shrink-0 w-36 lg:w-full text-left rounded-md p-1 border-2 ' + (i === safeIdx ? 'border-[var(--accent)] bg-[var(--soft)]' : 'border-transparent hover:bg-[var(--soft)]') + (!isAdmin && !isMine(it) && it.kind !== 'canvas' ? ' opacity-60 hover:opacity-100' : '')}>
                <div className="aspect-video rounded-sm overflow-hidden border border-[var(--line)] pointer-events-none"><Fit><SlideView item={it} deck={deck} n={i + 1} total={items.length} ro api={api} /></Fit></div>
                <div className="text-xs mt-1 truncate text-[var(--muted)]">{i + 1}. {labelOf(it)}{!isAdmin && isMine(it) && <span className="ml-1 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">Saya</span>}</div>
              </button>
            ))}
            {isAdmin && <button className="btn shrink-0 lg:w-full" onClick={addSales} title="Tambah sales" aria-label="Tambah sales"><svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg><span className="hidden sm:inline">Sales</span></button>}
            {!isAdmin && <button className="btn shrink-0 w-28 lg:w-full" onClick={() => { const i = items.findIndex(isMine); if (i >= 0) setIdx(i); }}>Slide saya</button>}
          </nav>
          {moreRail && (
            <>
              <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-16 lg:hidden" style={{ background: 'linear-gradient(to left, var(--bg) 20%, transparent)' }} />
              <button type="button" aria-label="Lihat slide berikutnya" onClick={scrollRail}
                className="absolute right-1 top-[42%] flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--panel)] text-[var(--fg)] shadow-md transition hover:bg-[var(--soft)] lg:hidden"><ChevronRight /></button>
              <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-16 lg:block" style={{ background: 'linear-gradient(to top, var(--bg) 20%, transparent)' }} />
              <button type="button" onClick={scrollRail}
                className="absolute bottom-2 left-1/2 hidden -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full border border-[var(--line)] bg-[var(--panel)] px-3 py-1 text-xs font-medium text-[var(--muted)] shadow-md transition hover:bg-[var(--soft)] lg:inline-flex">Slide lainnya <Chevron cls="h-3.5 w-3.5" /></button>
              <p className="m-0 pt-0.5 text-xs text-[var(--muted)] lg:hidden">Geser ke kanan, masih ada slide lainnya →</p>
            </>
          )}
        </div>

        <main className="flex-1 min-w-0 flex flex-col gap-2">
          <div className="w-full aspect-video lg:aspect-auto lg:flex-1 lg:min-h-0 rounded-lg border border-[var(--line)] bg-[var(--panel)] p-2">
            <Fit><SlideView item={cur} deck={deck} n={safeIdx + 1} total={items.length} ro={false} api={api} pick={cur.kind === 'sales' && canEdit(cur) ? pick : undefined} /></Fit>
          </div>
        </main>

        <Panel perm={{ edit: canEdit(cur), admin: isAdmin }} item={cur} deck={deck} api={api} idx={cur.kind === 'sales' ? deck.sales.findIndex((x) => x.id === cur.sales.id) + 1 : 0} count={items.length} onMove={moveSales} mk={mk} setMk={setMk} onSave={saveNow} ask={ask} cv={cv} cv={cv}
          onDelete={() => ask({ title: `Hapus slide ${cur.kind === 'sales' ? (cur.sales.name || 'ini') : ''}?`.replace('  ', ' '), body: 'Semua brand, angka, dan catatan pada slide ini ikut terhapus.', confirm: 'Hapus slide', onConfirm: delSales })} />
      </div>

      {presenting && <Present items={items} deck={deck} index={safeIdx} setIndex={setIdx} onExit={() => setPresenting(false)} api={api} />}
      {dlg && <ConfirmDialog dlg={dlg} onClose={() => setDlg(null)} />}
      {exporting && (
        <div role="alertdialog" aria-modal="true" aria-label="Menyiapkan PPTX" className="fixed inset-0 z-[75] flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-xs rounded-2xl bg-white p-5 shadow-xl ring-1 ring-black/5">
            <div className="head text-base font-semibold">Menyiapkan PPTX…</div>
            <p className="mb-3 mt-1 text-sm text-[var(--muted)]">{exporting.i >= exporting.n ? 'Menyusun file…' : `Slide ${exporting.i + 1} dari ${exporting.n}`}</p>
            <div className="h-2 overflow-hidden rounded-full bg-[var(--soft)]"><div className="h-full rounded-full bg-[var(--accent)] transition-all" style={{ width: Math.round((exporting.i / Math.max(1, exporting.n)) * 100) + '%' }} /></div>
          </div>
        </div>
      )}
      {showPhoto && <PhotoModal deck={deck} api={api} notify={notify} onClose={() => setShowPhoto(false)} />}
      {showLogo && <LogoModal deck={deck} api={api} notify={notify} onClose={() => setShowLogo(false)} />}
      {showRange && <RangeModal deck={deck} api={api} onClose={() => setShowRange(false)} />}
      {showOrder && <OrderModal deck={deck} onReorder={reorderSales} onClose={() => setShowOrder(false)} />}
      {showAct && <ActivityModal deck={deck} getToken={getToken} onClose={() => setShowAct(false)} />}
    </div>
  );
}

/* Kartu isi data: belang zebra, baris genap abu-abu dan baris ganjil putih */
const tintOf = (i) => ({ background: i % 2 ? '#f1f2f5' : '#ffffff', borderColor: '#e1e4ea', boxShadow: '0 1px 2px rgba(16,24,40,.06)' });

/* Latar belakang polos (tanpa bola) */
function Backdrop() {
  return (
    <div aria-hidden="true" className="backdrop">
    </div>
  );
}

const ADMIN_PICK = '__admin__';
function LoginScreen({ onLogin, notice, notify }) {
  const [names, setNames] = useState(null);
  const [name, setName] = useState('');
  const [pass, setPass] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(notice || '');
  useEffect(() => { salesNames().then((n) => setNames(Array.isArray(n) ? n.filter((x) => !ADMIN_USERS[adminKey(x)]) : [])).catch(() => setNames([])); }, []);
  const adminUser = Object.keys(ADMIN_USERS)[0];
  const isAdminPick = name === ADMIN_PICK;
  /* satu daftar nama: admin di paling atas (merah), lalu semua sales */
  const options = [{ key: ADMIN_PICK, label: adminUser.charAt(0).toUpperCase() + adminUser.slice(1) + ' (Admin)', color: '#d92d20' }, ...(names || []).map((n) => ({ key: n, label: n }))];
  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    if (busy) return;
    setBusy(true);
    try {
      if (!name) throw new Error('Pilih nama dulu');
      if (isAdminPick) {
        if (!pass) throw new Error('Isi password');
        const sess = await adminLogin(adminUser, pass);
        onLogin(sess, null);
      } else {
        const d = await salesLogin(name, pass.trim());
        if (!d) throw new Error('Password salah');
        salesLog(name, pass.trim(), 'masuk');
        onLogin({ role: 'sales', name, pass: pass.trim() }, d);
      }
    } catch (ex) { const m = ex.message || 'Gagal masuk. Coba lagi.'; setErr(m); notify('Gagal masuk: ' + m, 'err'); setBusy(false); }
  };
  return (
    <div className="login-bg">
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 py-8">
      <form onSubmit={submit} className="login-glass w-full max-w-sm p-6 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="logo-glow" aria-hidden="true"><img src={LOGO_SRC} alt="" width="64" height="45" /></span>
          <div><h1 className="head m-0 text-xl font-bold leading-tight">Presentasi Dhouse</h1><p className="m-0 text-xs" style={{ color: 'rgba(255,255,255,0.85)' }}>Masuk untuk melihat dan mengisi laporan</p></div>
        </div>
        <div><label className="lbl" htmlFor="l-name">Nama</label>
          <Select id="l-name" value={name} onChange={(v) => { setName(v); setPass(''); setErr(''); }} placeholder={names === null ? 'Memuat daftar…' : 'Pilih nama'} options={options} /></div>
        <div><label className="lbl" htmlFor="l-pass">Password</label>
          <div className="relative">
            <input id="l-pass" className="field pr-16" type={show ? 'text' : 'password'} autoComplete={isAdminPick ? 'current-password' : 'off'} autoCapitalize="none" value={pass} onChange={(e) => setPass(e.target.value)} />
            <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-medium text-[var(--muted)] hover:bg-[var(--soft)]">{show ? 'Sembunyi' : 'Lihat'}</button>
          </div></div>
        {err && <div role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{err}</div>}
        <button type="submit" disabled={busy} className="btn btn-primary btn-gloss w-full py-2.5 text-base font-semibold">{busy ? 'Masuk…' : 'Masuk'}</button>
      </form>
      <p className="m-0 text-center text-xs text-white/85">Copyright by Toni 2026</p>
      </div>
    </div>
  );
}

function App() {
  useEffect(() => { document.title = 'Presentasi Dhouse'; }, []);
  const [sess, setSess] = useState(null);
  const [initialDeck, setInitialDeck] = useState(null);
  const [boot, setBoot] = useState(true);
  const [notice, setNotice] = useState('');
  const [toast, setToast] = useState(null);
  const sessRef = useRef(null);
  const notify = (msg, kind) => setToast({ id: Date.now() + Math.random(), msg, kind: kind || 'ok' });
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast((x) => (x && x.id === toast.id ? null : x)), 2600);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    const st = readSession();
    (async () => {
      try {
        if (st && st.role === 'sales') { const d = await salesLogin(st.name, st.pass); if (d) { sessRef.current = st; setInitialDeck(d); setSess(st); } else writeSession(null); }
        else if (st && st.role === 'admin') { let x = st; if (x.exp - Date.now() < 60000) x = await adminRefresh(x); writeSession(x); sessRef.current = x; setSess(x); }
      } catch (e) { writeSession(null); }
      setBoot(false);
    })();
  }, []);
  const getToken = async () => {
    let x = sessRef.current;
    if (!x) throw new Error('auth');
    if (x.exp - Date.now() < 60000) { x = await adminRefresh(x); sessRef.current = x; writeSession(x); }
    return x.access;
  };
  const onLogin = (s, d) => { writeSession(s); sessRef.current = s; setInitialDeck(d); setNotice(''); setSess(s); notify(s.role === 'sales' ? `Selamat datang, ${s.name}!` : 'Berhasil masuk sebagai admin'); };
  const onLogout = (msg, ok) => {
    writeSession(null); sessRef.current = null;
    try { localStorage.removeItem('laporan-penjualan-v2'); } catch (e) {}
    setNotice(typeof msg === 'string' ? msg : ''); setSess(null); setInitialDeck(null);
    if (ok) notify(ok); else if (msg) notify(msg, 'err');
  };
  return (
    <>
      <Backdrop />
      {boot ? <div className="flex min-h-[60vh] items-center justify-center text-sm text-[var(--muted)]" role="status">Memuat…</div>
        : sess ? <Editor key={sess.role + (sess.name || sess.email)} session={sess} getToken={getToken} initialDeck={initialDeck} onLogout={onLogout} notify={notify} />
        : <LoginScreen onLogin={onLogin} notice={notice} notify={notify} />}
      <Toast toast={toast} />
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
