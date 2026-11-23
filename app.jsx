const { useState, useEffect, useLayoutEffect, useRef, useCallback } = React;

const W = 1280, H = 720;
const GHOST = [0.35, 0.5, 0.42, 0.6, 0.45, 0.55, 0.4, 0.52, 0.48];

const SLIDE_THEMES = {
  langit: { name: 'Langit', paper: '#e8f1f8', ink: '#13243a', muted: '#5d7288', grid: '#cfdeeb', axis: '#a9bfd3', header: '#dbe7f1', headerFg: '#13243a', headerSub: '#5d7288', cover: '#e8f1f8', coverFg: '#13243a', coverSub: '#2f6fed', coverMuted: '#5d7288', accent: '#2f6fed', bars: ['#a9c4f7', '#2f6fed', '#a9c4f7'], target: '#e08a1e', targetText: '#b3690d', card: '#ffffff' },
  lautan: { name: 'Lautan', paper: '#0f2f3a', ink: '#eaf4f4', muted: '#8fb3b8', grid: '#25505e', axis: '#3b6a78', header: '#0a2630', headerFg: '#ffffff', headerSub: '#8fd8c4', cover: '#0f2f3a', coverFg: '#ffffff', coverSub: '#8fd8c4', coverMuted: '#8fb3b8', accent: '#5ad1b0', bars: ['#2e7f78', '#5ad1b0', '#2e7f78'], target: '#f2b45a', targetText: '#f2b45a', card: 'rgba(255,255,255,0.06)' },
  malam: { name: 'Malam ungu', paper: '#1c1a33', ink: '#eeecfb', muted: '#9a96c4', grid: '#34305a', axis: '#4a4580', header: '#15132a', headerFg: '#ffffff', headerSub: '#b9a9ff', cover: '#1c1a33', coverFg: '#ffffff', coverSub: '#b9a9ff', coverMuted: '#9a96c4', accent: '#a995ff', bars: ['#5b4fb0', '#a995ff', '#5b4fb0'], target: '#ffbe6b', targetText: '#ffbe6b', card: 'rgba(255,255,255,0.06)' },
  pasir: { name: 'Pasir', paper: '#f4ece1', ink: '#2b2a28', muted: '#7d7468', grid: '#e3d6c4', axis: '#c9b9a3', header: '#ebe0d0', headerFg: '#2b2a28', headerSub: '#7d7468', cover: '#f4ece1', coverFg: '#2b2a28', coverSub: '#c2603a', coverMuted: '#7d7468', accent: '#c2603a', bars: ['#e6b49c', '#c2603a', '#e6b49c'], target: '#2f6f8f', targetText: '#2f6f8f', card: '#fffaf3' },
  navyteal: { name: 'Navy dan teal', paper: '#f7f9fc', ink: '#1f2a3d', muted: '#5b6680', grid: '#dfe3ea', axis: '#b4b2a9', header: '#12263f', headerFg: '#ffffff', headerSub: '#9FE1CB', cover: '#12263f', coverFg: '#ffffff', coverSub: '#9FE1CB', coverMuted: '#b4b8c4', accent: '#1D9E75', bars: ['#9FE1CB', '#1D9E75', '#0F6E56'], target: '#EF9F27', targetText: '#a86a0a' },
  remotion: { name: 'Remotion gelap', paper: '#1b1f24', ink: '#f2f4f7', muted: '#9aa4b2', grid: '#2c3238', axis: '#4a525b', header: '#0b84f3', headerFg: '#ffffff', headerSub: '#d6e9fd', cover: '#16191d', coverFg: '#ffffff', coverSub: '#5fb0f8', coverMuted: '#9aa4b2', accent: '#0b84f3', bars: ['#9fd0fb', '#0b84f3', '#0a5bb0'], target: '#f5b942', targetText: '#f5b942' },
  terang: { name: 'Putih bersih', paper: '#ffffff', ink: '#111827', muted: '#6b7280', grid: '#e5e7eb', axis: '#9ca3af', header: '#eef2f7', headerFg: '#111827', headerSub: '#4b5563', cover: '#ffffff', coverFg: '#111827', coverSub: '#2563eb', coverMuted: '#6b7280', accent: '#2563eb', bars: ['#bfdbfe', '#60a5fa', '#1d4ed8'], target: '#f59e0b', targetText: '#b45309' },
  ungu: { name: 'Ungu', paper: '#f8f7fd', ink: '#241c45', muted: '#6a6490', grid: '#e4e0f5', axis: '#b5aedb', header: '#2a1f5c', headerFg: '#ffffff', headerSub: '#cbbffc', cover: '#2a1f5c', coverFg: '#ffffff', coverSub: '#cbbffc', coverMuted: '#a99fda', accent: '#8b6cf7', bars: ['#d4c8ff', '#8b6cf7', '#5a3fd0'], target: '#EF9F27', targetText: '#a86a0a' },
  senja: { name: 'Senja', paper: '#fdf8f5', ink: '#3a1f17', muted: '#8a6a5e', grid: '#f0e1da', axis: '#d3b8ab', header: '#5a2418', headerFg: '#ffffff', headerSub: '#f7c4a5', cover: '#5a2418', coverFg: '#ffffff', coverSub: '#f7c4a5', coverMuted: '#d9a994', accent: '#e4693b', bars: ['#f7c4a5', '#e4693b', '#a43a1a'], target: '#1d6fb8', targetText: '#1d6fb8' },
};
const themeOf = (deck) => SLIDE_THEMES[deck.slideTheme] || SLIDE_THEMES.langit;

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
const rangeText = (deck) => {
  const ms = monthsOf(deck), a = parseKey(ms[0]), b = parseKey(ms[ms.length - 1]);
  if (ms.length === 1) return `${BULAN[a.m]} ${a.y}`;
  return a.y === b.y ? `${BULAN[a.m]} – ${BULAN[b.m]} ${b.y}` : `${BULAN[a.m]} ${a.y} – ${BULAN[b.m]} ${b.y}`;
};
const periodOf = (deck) => (deck.cover.period != null ? deck.cover.period : rangeText(deck));
const sublineOf = (deck) => (deck.subline != null ? deck.subline : `Laporan penjualan · ${rangeText(deck)}`);

const mkBrand = (name) => ({ id: uid(), name });
const mkSales = (name) => ({ id: uid(), name, brands: [mkBrand('Brand A'), mkBrand('Brand B'), mkBrand('Brand C')], data: {}, note: '' });
const cellOf = (sales, key, bid) => (sales.data && sales.data[key] && sales.data[key][bid]) || { total: '', target: '' };
function statsOf(sales, key, bid, keys) {
  const c = cellOf(sales, key, bid);
  const hasPrev = !!keys && keys.includes(prevKey(key));
  const total = toNum(c.total), target = toNum(c.target), prev = hasPrev ? toNum(cellOf(sales, prevKey(key), bid).total) : null;
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
function migrate(d) {
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
    subline: d.subline != null ? d.subline : null,
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

/* Penyimpanan database (Supabase). Kunci publishable memang dirancang untuk dipakai di browser;
   akses dibatasi oleh aturan RLS pada tabel lp_deck (satu baris, id 'utama'). */
const SB_URL = 'https://lebwxqkbpjqqszzvmnas.supabase.co/rest/v1/lp_deck';
const SB_KEY = 'sb_publishable_-ZI4t9ZuLF9LuIee8W_7Fg_EUrgXFat';
const sbHead = { apikey: SB_KEY, 'Content-Type': 'application/json' };
async function dbLoad() {
  const r = await fetch(SB_URL + '?id=eq.utama&select=data', { headers: sbHead });
  if (!r.ok) throw new Error('load ' + r.status);
  const rows = await r.json();
  return rows.length ? rows[0].data : null;
}
async function dbSave(data) {
  const r = await fetch(SB_URL + '?on_conflict=id', {
    method: 'POST',
    headers: { ...sbHead, Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({ id: 'utama', data, updated_at: new Date().toISOString() }),
  });
  if (!r.ok) throw new Error('save ' + r.status);
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
const semOf = (T) => (lum(T.paper) < 0.5
  ? { good: '#4fd1a5', warn: '#f5b942', bad: '#ff8a7a', card: T.card || 'rgba(255,255,255,0.05)' }
  : { good: '#0f8a64', warn: '#b7791f', bad: '#d1453b', card: T.card || '#ffffff' });

function Pct({ v, sem, muted }) {
  if (v == null) return <span style={{ color: muted }}>–</span>;
  const c = v >= 100 ? sem.good : v >= 80 ? sem.warn : sem.bad;
  return <span style={{ color: c, background: c + '26', borderRadius: 999, padding: '2px 10px', fontWeight: 600 }}>{Math.round(v)}%</span>;
}
function Trend({ v, sem, muted }) {
  if (v == null) return <span style={{ color: muted }}>–</span>;
  const up = v > 0.05, down = v < -0.05;
  return <span style={{ color: up ? sem.good : down ? sem.bad : muted, fontWeight: 600, whiteSpace: 'nowrap' }}>{up ? '▲ ' : down ? '▼ ' : ''}{fmt1(Math.abs(v))}%</span>;
}

function Hit({ pick, target, style, label, children }) {
  if (!pick) return <div style={style}>{children}</div>;
  return (
    <div className="hit" role="button" tabIndex={0} aria-label={label} style={style} onClick={() => pick(target)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(target); } }}>{children}</div>
  );
}

function SalesSlide({ sales, deck, n, total, pick }) {
  const T = themeOf(deck);
  const sem = semOf(T);
  const keys = monthsOf(deck);
  const nb = sales.brands.length;
  const compact = nb > 3;
  const crossYear = parseKey(keys[0]).y !== parseKey(keys[keys.length - 1]).y;
  const chartH = keys.length <= 3 ? 215 : keys.length <= 4 ? 175 : 140;
  const rowH = keys.length <= 3 ? 42 : keys.length <= 4 ? 38 : 33;
  const rowFs = nb > 4 ? 15 : compact ? 16 : 17;
  const labW = (compact ? 38 : 48) + (crossYear ? 18 : 0);
  const short = (k) => BULAN_PENDEK[parseKey(k).m] + (crossYear ? ' ' + String(parseKey(k).y).slice(2) : '');
  return (
    <div style={{ width: W, height: H, background: T.paper, color: T.ink, fontFamily: "'Inter', system-ui, sans-serif", position: 'relative', overflow: 'hidden' }}>
      <div style={{ height: 100, background: T.header, color: T.headerFg, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 48px', gap: 32 }}>
        <Hit pick={pick} target={{ id: 's-name' }} label="Ubah nama sales" style={{ flex: 1, minWidth: 0, fontFamily: headFont, fontWeight: 700, fontSize: 54, letterSpacing: '-0.02em' }}>
          {sales.name || 'Nama sales'}
        </Hit>
        <Hit pick={pick} target={{ id: 'g-sub' }} label="Ubah keterangan periode" style={{ width: 560, flex: 'none', textAlign: 'right', fontSize: 22, color: T.headerSub }}>
          {sublineOf(deck)}
        </Hit>
      </div>

      <div style={{ padding: '22px 48px 0' }}>
        <div style={{ display: 'flex', gap: 16 }}>
          {sales.brands.map((b, bi) => {
            const st = keys.map((k) => statsOf(sales, k, b.id, keys));
            const maxV = Math.max(0, ...st.flatMap((x) => [x.total || 0, x.target || 0]));
            const ghost = maxV === 0;
            return (
              <div key={b.id} style={{ flex: 1, minWidth: 0, background: sem.card, border: `1px solid ${T.grid}`, borderRadius: 16, padding: '16px 18px' }}>
                <Hit pick={pick} target={{ id: `bn-${b.id}` }} label={`Ubah nama ${b.name}`} style={{ fontFamily: headFont, fontWeight: 600, fontSize: nb > 4 ? 22 : 28, marginBottom: 10 }}>
                  {b.name || 'Nama brand'}
                </Hit>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 10, height: chartH, borderBottom: `2px solid ${T.axis}` }}>
                  {st.map((x, i) => {
                    const h = ghost ? GHOST[(bi * 3 + i) % 9] * chartH * 0.8 : ((x.total || 0) / maxV) * (chartH - 10);
                    const th = !ghost && x.target ? (x.target / maxV) * (chartH - 10) : null;
                    return (
                      <Hit key={keys[i]} pick={pick} target={{ month: keys[i], id: `v-${b.id}-${keys[i]}` }} label={`Isi ${b.name} ${BULAN[parseKey(keys[i]).m]}`}
                        style={{ position: 'relative', flex: 1, maxWidth: 76, height: chartH, display: 'flex', alignItems: 'flex-end' }}>
                        <div style={{ width: '100%', height: h, background: ghost ? 'transparent' : T.bars[1], border: ghost ? `2px dashed ${T.axis}` : 'none', borderBottom: 'none', borderRadius: '5px 5px 0 0' }} />
                        {th != null && <div style={{ position: 'absolute', left: -4, right: -4, bottom: th, height: 3, background: T.target, borderRadius: 2 }} />}
                      </Hit>
                    );
                  })}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 6, fontSize: 15, color: T.muted }}>
                  {keys.map((k) => <div key={k} style={{ flex: 1, maxWidth: 76, textAlign: 'center' }}>{short(k)}</div>)}
                </div>
                <div style={{ marginTop: 10 }}>
                  {keys.map((k, i) => (
                    <Hit key={k} pick={pick} target={{ month: k, id: `v-${b.id}-${k}` }} label={`Isi ${b.name} ${BULAN[parseKey(k).m]}`}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, height: rowH, fontSize: rowFs, borderTop: i ? `1px solid ${T.grid}` : 'none' }}>
                      <span style={{ width: labW, flex: 'none', color: T.muted }}>{short(k)}</span>
                      <span style={{ flex: 1, minWidth: 0, textAlign: 'right', fontWeight: 600, whiteSpace: 'nowrap' }}>{st[i].total == null ? '–' : compact ? fmtCompact(st[i].total) : rp(st[i].total)}</span>
                      <span style={{ width: compact ? 54 : 64, flex: 'none', textAlign: 'right' }}><Pct v={st[i].pct} sem={sem} muted={T.muted} /></span>
                      <span style={{ width: compact ? 68 : 80, flex: 'none', textAlign: 'right' }}>{i === 0 ? null : <Trend v={st[i].trend} sem={sem} muted={T.muted} />}</span>
                    </Hit>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px 28px', marginTop: 10, fontSize: 15, color: T.muted }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 14, height: 14, borderRadius: 3, background: T.bars[1] }} />Total penjualan</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 22, height: 3, borderRadius: 2, background: T.target }} />Target</span>
          <span>% = capaian dari target</span>
          <span>▲ ▼ = dibanding bulan sebelumnya</span>
        </div>
      </div>

      <div style={{ position: 'absolute', left: 48, right: 48, bottom: 22, display: 'flex', alignItems: 'center', gap: 16, fontSize: 21, borderTop: `1px solid ${T.grid}`, paddingTop: 10 }}>
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

function CoverSlide({ deck, ro, api }) {
  const T = themeOf(deck);
  return (
    <div style={{ width: W, height: H, background: T.cover, color: T.coverFg, fontFamily: "'Inter', system-ui, sans-serif", padding: '0 96px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
      <div style={{ width: 96, height: 8, background: T.accent, marginBottom: 40 }} />
      <div style={{ fontFamily: headFont, fontWeight: 700, fontSize: 96, letterSpacing: '-0.02em', lineHeight: 1.05 }}>
        <Ed ro={ro} value={deck.cover.title} label="Judul" onChange={(v) => api.setCover({ title: v })} />
      </div>
      <div style={{ fontSize: 36, color: T.coverSub, marginTop: 28 }}>
        <Ed ro={ro} value={periodOf(deck)} label="Periode" onChange={(v) => api.setCover({ period: v })} />
      </div>
      <div style={{ fontSize: 28, color: T.coverMuted, marginTop: 12 }}>
        <Ed ro={ro} value={deck.cover.sub} label="Subjudul" onChange={(v) => api.setCover({ sub: v })} />
      </div>
      <div style={{ position: 'absolute', left: 96, right: 96, bottom: 56, fontSize: 24, color: T.coverMuted }}>
        <Ed ro={ro} value={deck.cover.audience} label="Untuk siapa" onChange={(v) => api.setCover({ audience: v })} />
      </div>
    </div>
  );
}

function ClosingSlide({ deck, ro, api }) {
  const T = themeOf(deck);
  return (
    <div style={{ width: W, height: H, background: T.cover, color: T.coverFg, fontFamily: "'Inter', system-ui, sans-serif", padding: '0 96px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ width: 96, height: 8, background: T.accent, marginBottom: 40 }} />
      <div style={{ fontFamily: headFont, fontWeight: 700, fontSize: 96, letterSpacing: '-0.02em', lineHeight: 1.05 }}>
        <Ed ro={ro} value={deck.closing.title} label="Judul penutup" onChange={(v) => api.setClosing({ title: v })} />
      </div>
      <div style={{ fontSize: 36, color: T.coverSub, marginTop: 28 }}>
        <Ed ro={ro} value={deck.closing.sub} label="Subjudul penutup" onChange={(v) => api.setClosing({ sub: v })} />
      </div>
    </div>
  );
}

function SlideView({ item, deck, n, total, ro, api, pick }) {
  if (item.kind === 'cover') return <CoverSlide deck={deck} ro={ro} api={api} />;
  if (item.kind === 'closing') return <ClosingSlide deck={deck} ro={ro} api={api} />;
  return <SalesSlide sales={item.sales} deck={deck} n={n} total={total} pick={pick} />;
}

const fmtTime = (sec) => String(Math.floor(sec / 60)).padStart(2, '0') + ':' + String(sec % 60).padStart(2, '0');

function Present({ items, deck, index, setIndex, onExit, api }) {
  const [elapsed, setElapsed] = useState(0);
  const total = items.length;
  const go = useCallback((fn) => setIndex((c) => Math.max(0, Math.min(total - 1, fn(c)))), [total, setIndex]);
  useEffect(() => {
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    try { document.documentElement.requestFullscreen && document.documentElement.requestFullscreen().catch(() => {}); } catch (e) {}
    const onFs = () => { if (!document.fullscreenElement) onExit(); };
    document.addEventListener('fullscreenchange', onFs);
    return () => { clearInterval(id); document.removeEventListener('fullscreenchange', onFs); try { if (document.fullscreenElement) document.exitFullscreen(); } catch (e) {} };
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
  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#000' }}>
      <div style={{ height: 3, background: '#222' }}><div style={{ height: 3, width: `${((index + 1) / total) * 100}%`, background: T.accent, transition: 'width .25s' }} /></div>
      <div className="flex-1 min-h-0 cursor-pointer" onClick={() => go((c) => c + 1)}>
        <Fit><div key={it.key} className="slide-in"><SlideView item={it} deck={deck} n={index + 1} total={total} ro api={api} /></div></Fit>
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

function Panel({ item, deck, api, idx, count, onMove, onDelete, mk, setMk, onSave, ask }) {
  return (
    <aside className="shrink-0 rounded-lg border border-[var(--line)] bg-[var(--panel)] p-3 flex flex-col gap-3 lg:w-[22rem] lg:overflow-y-auto">
      <div className="head font-semibold text-base">Isi data</div>

      {item.kind === 'cover' && (
        <>
          <div><label className="lbl" htmlFor="c-title">Judul</label><input id="c-title" className="field" value={deck.cover.title} onChange={(e) => api.setCover({ title: e.target.value })} /></div>
          <div><label className="lbl" htmlFor="c-per">Periode</label><input id="c-per" className="field" value={periodOf(deck)} onChange={(e) => api.setCover({ period: e.target.value })} /></div>
          <div><label className="lbl" htmlFor="c-sub">Subjudul</label><input id="c-sub" className="field" value={deck.cover.sub} onChange={(e) => api.setCover({ sub: e.target.value })} /></div>
          <div><label className="lbl" htmlFor="c-aud">Untuk siapa</label><input id="c-aud" className="field" value={deck.cover.audience} onChange={(e) => api.setCover({ audience: e.target.value })} /></div>
        </>
      )}
      {item.kind === 'closing' && (
        <>
          <div><label className="lbl" htmlFor="x-title">Judul</label><input id="x-title" className="field" value={deck.closing.title} onChange={(e) => api.setClosing({ title: e.target.value })} /></div>
          <div><label className="lbl" htmlFor="x-sub">Subjudul</label><input id="x-sub" className="field" value={deck.closing.sub} onChange={(e) => api.setClosing({ sub: e.target.value })} /></div>
        </>
      )}

      {item.kind === 'sales' && (() => {
        const s = item.sales;
        const keys = monthsOf(deck);
        const ck = keys.includes(mk) ? mk : keys[0];
        return (
          <>
            <div className="flex items-end gap-2">
              <div className="min-w-0 flex-1"><label className="lbl" htmlFor="s-name">Nama sales</label><input id="s-name" className="field" value={s.name} onChange={(e) => api.setSales(s.id, { name: e.target.value })} /></div>
              <div className="w-[7.25rem] shrink-0">
                <label className="lbl" htmlFor="s-month">Bulan</label>
                <select id="s-month" className="field" value={ck} onChange={(e) => setMk(e.target.value)}>
                  {keys.map((k) => <option key={k} value={k}>{BULAN[parseKey(k).m]}</option>)}
                </select>
              </div>
              <button type="button" className="btn btn-primary shrink-0" onClick={onSave}>Simpan</button>
            </div>

            <div className="head font-semibold">{BULAN[parseKey(ck).m]} {parseKey(ck).y}</div>
            {s.brands.map((b) => {
              const c = cellOf(s, ck, b.id);
              const st = statsOf(s, ck, b.id, keys);
              return (
                <div key={b.id} className="rounded-md border border-[var(--line)] p-2 flex flex-col gap-2">
                  <div className="flex gap-2">
                    <input id={`bn-${b.id}`} aria-label="Nama brand" className="field" value={b.name} onChange={(e) => api.setBrand(s.id, b.id, e.target.value)} />
                    <button className="btn btn-danger" aria-label={`Hapus ${b.name}`} disabled={s.brands.length === 1}
                      onClick={() => ask({ title: `Hapus ${b.name || 'brand ini'}?`, body: `Brand ini dan angkanya di semua bulan pada slide ${s.name || 'ini'} akan dihapus.`, confirm: 'Hapus brand', onConfirm: () => api.delBrand(s.id, b.id) })}>Hapus</button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="lbl" htmlFor={`v-${b.id}-${ck}`}>Total penjualan</label>
                      <input id={`v-${b.id}-${ck}`} className="field" inputMode="numeric" placeholder="Rp 0" value={rp(c.total)} onChange={(e) => api.setCell(s.id, ck, b.id, { total: digits(e.target.value) })} />
                    </div>
                    <div>
                      <label className="lbl" htmlFor={`t-${b.id}-${ck}`}>Target</label>
                      <input id={`t-${b.id}-${ck}`} className="field" inputMode="numeric" placeholder="Rp 0" value={rp(c.target)} onChange={(e) => api.setCell(s.id, ck, b.id, { target: digits(e.target.value) })} />
                    </div>
                  </div>
                  {st.pct != null && <div className="text-xs text-[var(--muted)]">Capaian {Math.round(st.pct)}% dari target</div>}
                </div>
              );
            })}
            <button className="btn" onClick={() => api.addBrand(s.id)}>+ Brand</button>
            <div><label className="lbl" htmlFor="s-note">Catatan</label><textarea id="s-note" rows={3} className="field" value={s.note} onChange={(e) => api.setSales(s.id, { note: e.target.value })} /></div>

            <div className="border-t border-[var(--line)] pt-3 flex flex-col gap-2">
              <div className="text-xs text-[var(--muted)]">Berlaku untuk semua slide sales (maksimal {MAX_BULAN} bulan)</div>
              <div className="grid grid-cols-[auto_1fr] gap-2 items-center">
                <label className="lbl" style={{ margin: 0 }} htmlFor="r-from">Dari</label>
                <select id="r-from" className="field" value={deck.range.from} onChange={(e) => api.setRange('from', e.target.value)}>{MONTH_OPTIONS.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}</select>
                <label className="lbl" style={{ margin: 0 }} htmlFor="r-to">Sampai</label>
                <select id="r-to" className="field" value={keys[keys.length - 1]} onChange={(e) => api.setRange('to', e.target.value)}>{MONTH_OPTIONS.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}</select>
              </div>
              <div><label className="lbl" htmlFor="g-sub">Keterangan di bawah nama</label><input id="g-sub" className="field" value={sublineOf(deck)} onChange={(e) => api.setSubline(e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button className="btn" onClick={() => onMove(-1)} disabled={idx <= 1}>Naik</button>
              <button className="btn" onClick={() => onMove(1)} disabled={idx >= count - 2}>Turun</button>
              <button className="btn btn-danger" onClick={onDelete} disabled={deck.sales.length === 1}>Hapus</button>
            </div>
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
const DataIcon = () => <svg className="h-4 w-4 text-[var(--muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><ellipse cx="12" cy="6" rx="8" ry="3" /><path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" /></svg>;
const Swatch = ({ T }) => <span className="inline-block h-4 w-4 shrink-0 rounded-full ring-1 ring-black/15" style={{ background: `linear-gradient(135deg, ${T.paper} 50%, ${T.accent} 50%)` }} />;

function Menu({ icon, label, children, width }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const down = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const key = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', down);
    document.addEventListener('keydown', key);
    return () => { document.removeEventListener('mousedown', down); document.removeEventListener('keydown', key); };
  }, [open]);
  return (
    <div ref={ref} className="relative">
      <button type="button" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)} className={TOP_BTN}>
        {icon}<span>{label}</span><Chevron />
      </button>
      {open && (
        <div role="menu" onClick={() => setOpen(false)} className={'absolute right-0 z-40 mt-2 origin-top-right rounded-xl border border-[var(--line)] bg-[var(--panel)] p-1.5 shadow-lg ring-1 ring-black/5 ' + (width || 'w-60')}>
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
          <button type="button" className="inline-flex items-center rounded-lg bg-red-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 active:scale-[.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
            onClick={() => { onClose(); dlg.onConfirm(); }}>{dlg.confirm || 'Ya, hapus'}</button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [deck, setDeck] = useState(load);
  const [idx, setIdx] = useState(1);
  const [presenting, setPresenting] = useState(false);

  const [sync, setSync] = useState('memuat');
  const [toast, setToast] = useState(null);
  const [dlg, setDlg] = useState(null);
  const [mk, setMk] = useState(null);
  const [focusReq, setFocusReq] = useState(null);
  const [moreRail, setMoreRail] = useState(false);
  const loaded = useRef(false);
  const deckRef = useRef(deck);
  deckRef.current = deck;
  const saveTimer = useRef(null);
  const lastFail = useRef(false);
  const railRef = useRef(null);

  useEffect(() => { try { localStorage.setItem('laporan-penjualan-v2', JSON.stringify(deck)); } catch (e) {} }, [deck]);

  const notify = (msg, kind) => setToast({ id: Date.now(), msg, kind: kind || 'ok' });
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast((x) => (x && x.id === toast.id ? null : x)), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const doSave = (manual) => dbSave(deckRef.current)
    .then(() => { lastFail.current = false; setSync('tersimpan'); if (manual) notify('Tersimpan di database'); })
    .catch(() => { setSync('gagal'); if (manual || !lastFail.current) notify('Gagal menyimpan ke database. Coba lagi.', 'err'); lastFail.current = true; });
  const saveNow = () => {
    if (!loaded.current) { notify('Belum terhubung ke database. Muat ulang halaman.', 'err'); return; }
    clearTimeout(saveTimer.current);
    setSync('menyimpan');
    doSave(true);
  };

  useEffect(() => {
    dbLoad().then((remote) => {
      const m = migrate(remote);
      if (m) setDeck(m);
      loaded.current = true;
      setSync(m ? 'tersimpan' : 'menyimpan');
      if (!m) setDeck((d) => ({ ...d }));
    }).catch(() => { setSync('gagal'); });
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    setSync('menyimpan');
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => doSave(false), 600);
    return () => clearTimeout(saveTimer.current);
  }, [deck]);

  const items = [{ kind: 'cover', key: 'cover' }, ...deck.sales.map((s) => ({ kind: 'sales', sales: s, key: s.id })), { kind: 'closing', key: 'closing' }];
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
      return { ...d, range: { from: keyOfIdx(a), to: keyOfIdx(b) } };
    }),
    setCover: (p) => setDeck((d) => ({ ...d, cover: { ...d.cover, ...p } })),
    setClosing: (p) => setDeck((d) => ({ ...d, closing: { ...d.closing, ...p } })),
    setSales: (id, p) => mapSales(id, (s) => ({ ...s, ...p })),
    setBrand: (sid, bid, name) => mapSales(sid, (s) => ({ ...s, brands: s.brands.map((x) => (x.id === bid ? { ...x, name } : x)) })),
    setCell: (sid, key, bid, p) => mapSales(sid, (s) => ({ ...s, data: { ...s.data, [key]: { ...(s.data[key] || {}), [bid]: { ...cellOf(s, key, bid), ...p } } } })),
    addBrand: (sid) => mapSales(sid, (s) => ({ ...s, brands: [...s.brands, mkBrand('Brand ' + String.fromCharCode(65 + (s.brands.length % 26)))] })),
    delBrand: (sid, bid) => mapSales(sid, (s) => {
      if (s.brands.length <= 1) return s;
      const data = {};
      Object.keys(s.data || {}).forEach((k) => { const { [bid]: _x, ...rest } = s.data[k]; data[k] = rest; });
      return { ...s, brands: s.brands.filter((x) => x.id !== bid), data };
    }),
  };

  const addSales = () => {
    const at = cur.kind === 'sales' ? safeIdx : deck.sales.length;
    const ns = mkSales('Sales baru');
    setDeck((d) => ({ ...d, sales: [...d.sales.slice(0, at), ns, ...d.sales.slice(at)] }));
    setIdx(at + 1);
  };
  const delSales = () => {
    if (cur.kind !== 'sales' || deck.sales.length === 1) return;
    setDeck((d) => ({ ...d, sales: d.sales.filter((s) => s.id !== cur.sales.id) }));
    setIdx(Math.max(1, safeIdx - 1));
  };
  const moveSales = (dir) => {
    const a = safeIdx - 1, b = a + dir;
    if (cur.kind !== 'sales' || b < 0 || b >= deck.sales.length) return;
    setDeck((d) => { const arr = [...d.sales]; [arr[a], arr[b]] = [arr[b], arr[a]]; return { ...d, sales: arr }; });
    setIdx(safeIdx + dir);
  };
  const fillSample = () => setDeck((d) => {
    const keys = monthsOf(d);
    return { ...d, sales: d.sales.map((s) => {
      const data = { ...(s.data || {}) };
      s.brands.forEach((b) => {
        const base = (20 + Math.round(Math.random() * 80)) * 100000;
        const target = Math.round((base * 1.1) / 500000) * 500000;
        keys.forEach((k) => {
          const total = Math.max(1000000, Math.round((base * (0.8 + Math.random() * 0.4)) / 100000) * 100000);
          data[k] = { ...(data[k] || {}), [b.id]: { total: String(total), target: String(target) } };
        });
      });
      return { ...s, data };
    }) };
  });
  const clearNums = () => setDeck((d) => ({ ...d, sales: d.sales.map((s) => ({ ...s, data: {} })) }));
  const resetAll = () => { setDeck(DEFAULT); setIdx(1); };

  useEffect(() => {
    if (presenting) return;
    const onKey = (e) => {
      const tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') setIdx((i) => Math.min(items.length - 1, i + 1));
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') setIdx((i) => Math.max(0, i - 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [presenting, items.length]);

  const ask = (o) => setDlg(o);
  const pick = (t) => { if (t.month) setMk(t.month); setFocusReq({ id: t.id, n: Date.now() }); };
  useEffect(() => {
    if (!focusReq) return;
    const el = document.getElementById(focusReq.id);
    if (!el) return;
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

  const hasData = deck.sales.some((s) => Object.keys(s.data || {}).length > 0);
  const syncDot = sync === 'tersimpan' ? 'bg-emerald-500' : sync === 'menyimpan' ? 'bg-amber-500' : sync === 'gagal' ? 'bg-red-500' : 'bg-slate-400';
  const syncText = sync === 'tersimpan' ? 'Tersimpan di database' : sync === 'menyimpan' ? 'Menyimpan…' : sync === 'gagal' ? 'Belum tersambung ke database' : 'Memuat…';
  const curTheme = SLIDE_THEMES[deck.slideTheme] || SLIDE_THEMES.langit;

  const labelOf = (it) => it.kind === 'cover' ? 'Sampul' : it.kind === 'closing' ? 'Penutup' : (it.sales.name || 'Tanpa nama');

  return (
    <div className="flex flex-col gap-3 min-h-full lg:h-full">
      <header className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <div className="flex min-w-0 items-center gap-3">
          <h1 className="head m-0 text-lg font-bold">Laporan Penjualan</h1>
          <span role="status" className="inline-flex items-center gap-1.5 rounded-full bg-[var(--soft)] px-2.5 py-1 text-xs font-medium text-[var(--muted)]">
            <span className={'h-1.5 w-1.5 rounded-full ' + syncDot} />{syncText}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Menu icon={<Swatch T={curTheme} />} label={<>Tema<span className="hidden sm:inline">: {curTheme.name}</span></>} width="w-60">
            {Object.entries(SLIDE_THEMES).map(([k, t]) => (
              <MenuItem key={k} icon={<Swatch T={t} />} title={t.name} active={k === deck.slideTheme} onClick={() => api.setSlideTheme(k)} />
            ))}
          </Menu>
          <Menu icon={<DataIcon />} label="Data" width="w-72">
            <MenuItem title="Isi data contoh" hint="Angka acak untuk melihat tampilan slide"
              onClick={() => (hasData ? ask({ title: 'Isi data contoh?', body: 'Total dan target yang sudah ada pada bulan di rentang ini akan diganti angka acak.', confirm: 'Isi data contoh', onConfirm: fillSample }) : fillSample())} />
            <MenuItem danger title="Kosongkan semua angka" hint="Hapus total dan target, nama tetap"
              onClick={() => ask({ title: 'Kosongkan semua angka?', body: 'Total dan target semua sales di semua bulan akan dihapus. Nama sales dan brand tetap.', confirm: 'Kosongkan', onConfirm: clearNums })} />
            <MenuItem danger title="Setel ulang" hint="Kembali ke data awal"
              onClick={() => ask({ title: 'Setel ulang semua data?', body: 'Semua sales, brand, angka, dan catatan kembali ke data awal.', confirm: 'Setel ulang', onConfirm: resetAll })} />
          </Menu>
          <button type="button" onClick={() => setPresenting(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 active:scale-[.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2">
            <PlayIcon /><span className="sm:hidden">Presentasi</span><span className="hidden sm:inline">Mulai presentasi</span>
          </button>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-3 flex-1 min-h-0">
        <div className="relative min-w-0 shrink-0 lg:w-44">
          <nav ref={railRef} onScroll={updRail} aria-label="Daftar slide" className="flex gap-2 overflow-x-auto pb-2 lg:absolute lg:inset-0 lg:flex-col lg:overflow-x-hidden lg:overflow-y-auto lg:pb-0">
            {items.map((it, i) => (
              <button key={it.key} onClick={() => setIdx(i)} aria-current={i === safeIdx}
                className={'shrink-0 w-36 lg:w-full text-left rounded-md p-1 border-2 ' + (i === safeIdx ? 'border-[var(--accent)] bg-[var(--soft)]' : 'border-transparent hover:bg-[var(--soft)]')}>
                <div className="aspect-video rounded-sm overflow-hidden border border-[var(--line)] pointer-events-none"><Fit><SlideView item={it} deck={deck} n={i + 1} total={items.length} ro api={api} /></Fit></div>
                <div className="text-xs mt-1 truncate text-[var(--muted)]">{i + 1}. {labelOf(it)}</div>
              </button>
            ))}
            <button className="btn shrink-0 w-28 lg:w-full" onClick={addSales}>+ Sales</button>
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
            <Fit><SlideView item={cur} deck={deck} n={safeIdx + 1} total={items.length} ro={false} api={api} pick={cur.kind === 'sales' ? pick : undefined} /></Fit>
          </div>
        </main>

        <Panel item={cur} deck={deck} api={api} idx={safeIdx} count={items.length} onMove={moveSales} mk={mk} setMk={setMk} onSave={saveNow} ask={ask}
          onDelete={() => ask({ title: `Hapus slide ${cur.kind === 'sales' ? (cur.sales.name || 'ini') : ''}?`.replace('  ', ' '), body: 'Semua brand, angka, dan catatan pada slide ini ikut terhapus.', confirm: 'Hapus slide', onConfirm: delSales })} />
      </div>

      {presenting && <Present items={items} deck={deck} index={safeIdx} setIndex={setIdx} onExit={() => setPresenting(false)} api={api} />}
      {dlg && <ConfirmDialog dlg={dlg} onClose={() => setDlg(null)} />}
      {toast && (
        <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 z-[60] flex justify-center px-4" style={{ bottom: 'max(20px, env(safe-area-inset-bottom, 0px))' }}>
          <div className={'toast-in flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white shadow-lg ' + (toast.kind === 'err' ? 'bg-red-600' : 'bg-slate-900')}>
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{toast.kind === 'err' ? <path d="M12 8v5M12 17h.01M10.3 3.9L2.4 18a2 2 0 001.7 3h15.8a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" /> : <path d="M5 12l5 5 9-10" />}</svg>
            {toast.msg}
          </div>
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
