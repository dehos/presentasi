const { useState, useEffect, useLayoutEffect, useRef, useCallback } = React;

const W = 1280, H = 720;
const APP_THEMES = [
  { id: 'remotion-gelap', name: 'Remotion gelap' },
  { id: 'remotion-terang', name: 'Remotion terang' },
  { id: 'ungu', name: 'Ungu' },
  { id: 'hijau', name: 'Hijau' },
];
const NAVY = '#12263f', TEAL = '#1D9E75', AMBER = '#EF9F27', PAPER = '#f7f9fc', INK = '#1f2a3d', MUTED = '#5b6680';
const MCOL = ['#9FE1CB', '#1D9E75', '#0F6E56'];
const GHOST = [0.35, 0.5, 0.42, 0.6, 0.45, 0.55, 0.4, 0.52, 0.48];
const uid = () => Math.random().toString(36).slice(2, 9);
const toNum = (v) => { if (v === '' || v == null) return null; const n = parseFloat(String(v).replace(',', '.')); return isNaN(n) ? null : n; };
const fmtNum = (v) => Number(v).toLocaleString('id-ID', { maximumFractionDigits: 1 });
const niceStep = (x) => { if (x <= 0) return 0; const p = Math.pow(10, Math.floor(Math.log10(x))); const n = x / p; const m = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10; return m * p; };

const mkProduct = (name) => ({ id: uid(), name, target: '', values: ['', '', ''] });
const mkSales = (name) => ({ id: uid(), name, products: [mkProduct('Produk A'), mkProduct('Produk B'), mkProduct('Produk C')], note: '' });

const DEFAULT = {
  unit: 'Rp juta',
  months: ['Oktober', 'November', 'Desember'],
  cover: { title: 'Laporan Penjualan', sub: 'Rancangan, angka menyusul', audience: 'Disajikan untuk HRD dan Manager' },
  closing: { title: 'Terima kasih', sub: 'Sesi tanya jawab' },
  sales: ['Toni', 'Mia', 'Isti', 'Yoga', 'Fuad', 'Tita'].map(mkSales),
};

function load() {
  try {
    const raw = localStorage.getItem('laporan-penjualan-v1');
    if (raw) { const d = JSON.parse(raw); if (d && Array.isArray(d.sales) && d.months) return d; }
  } catch (e) {}
  return DEFAULT;
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

function Ed({ value, onChange, ro, num, style, placeholder, label }) {
  if (ro) return <span style={{ display: 'block', ...style }}>{value === '' || value == null ? (placeholder || ' ') : value}</span>;
  return (
    <input className="ed" style={style} value={value} placeholder={placeholder} aria-label={label}
      inputMode={num ? 'decimal' : 'text'}
      onChange={(e) => onChange(num ? e.target.value.replace(/[^0-9.,]/g, '') : e.target.value)} />
  );
}

const headFont = "'Space Grotesk', system-ui, sans-serif";

function SalesSlide({ sales, deck, n, total, ro, api }) {
  const chartH = 270;
  const all = sales.products.flatMap((p) => [...p.values.map(toNum), toNum(p.target)]).filter((v) => v != null);
  const maxV = all.length ? Math.max(...all) : 0;
  const step = niceStep(maxV / 4);
  const top = step * 4;
  const ghost = maxV === 0;
  return (
    <div style={{ width: W, height: H, background: PAPER, color: INK, fontFamily: "'Inter', system-ui, sans-serif", position: 'relative', overflow: 'hidden' }}>
      <div style={{ height: 100, background: NAVY, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 48px', gap: 32 }}>
        <div style={{ flex: 1, minWidth: 0, fontFamily: headFont, fontWeight: 700, fontSize: 54, letterSpacing: '-0.02em' }}>
          <Ed ro={ro} value={sales.name} placeholder="Nama sales" label="Nama sales" onChange={(v) => api.setSales(sales.id, { name: v })} />
        </div>
        <div style={{ textAlign: 'right', fontSize: 22, color: '#9FE1CB', flex: 'none' }}>
          <div>Laporan penjualan · {deck.months[0]} – {deck.months[2]}</div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center', marginTop: 4 }}>
            <span>Satuan:</span>
            <div style={{ width: 130, textAlign: 'left', color: '#fff' }}><Ed ro={ro} value={deck.unit} label="Satuan" onChange={api.setUnit} /></div>
          </div>
        </div>
      </div>

      <div style={{ padding: '24px 48px 0' }}>
        <div style={{ display: 'flex' }}>
          <div style={{ width: 84, position: 'relative', height: chartH, flex: 'none' }}>
            {!ghost && [0, 1, 2, 3, 4].map((i) => (
              <div key={i} style={{ position: 'absolute', right: 12, bottom: (i * chartH) / 4, transform: 'translateY(50%)', fontSize: 18, color: MUTED }}>{fmtNum(step * i)}</div>
            ))}
          </div>
          <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} style={{ position: 'absolute', left: 0, right: 0, top: chartH - (i * chartH) / 4, borderTop: i === 0 ? '2px solid #b4b2a9' : '1px solid #dfe3ea' }} />
            ))}
            <div style={{ display: 'flex' }}>
              {sales.products.map((p, pi) => {
                const t = toNum(p.target);
                return (
                  <div key={p.id} style={{ flex: 1, minWidth: 0, padding: '0 10px' }}>
                    <div style={{ position: 'relative', height: chartH, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 8 }}>
                      {p.values.map((v, mi) => {
                        const nv = toNum(v);
                        let hgt = 0;
                        if (nv != null && top > 0) hgt = (nv / top) * chartH;
                        else if (ghost) hgt = GHOST[(pi * 3 + mi) % 9] * chartH;
                        return (
                          <div key={mi} style={{ flex: 1, maxWidth: 70, height: chartH, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center' }}>
                            {nv != null && <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>{fmtNum(nv)}</div>}
                            <div style={{ width: '100%', height: hgt, background: ghost ? 'transparent' : MCOL[mi], border: ghost ? `2px dashed ${MCOL[mi]}` : 'none', borderBottom: 'none', borderRadius: '4px 4px 0 0' }} />
                          </div>
                        );
                      })}
                      {t != null && top > 0 && (
                        <div style={{ position: 'absolute', left: 0, right: 0, bottom: (t / top) * chartH, borderTop: `3px dashed ${AMBER}` }} />
                      )}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 8 }}>
                      {p.values.map((v, mi) => (
                        <div key={mi} style={{ flex: 1, maxWidth: 70, fontSize: 20, textAlign: 'center' }}>
                          <Ed ro={ro} num value={v} placeholder="0" label={`${p.name} ${deck.months[mi]}`} onChange={(x) => api.setValue(sales.id, p.id, mi, x)} />
                        </div>
                      ))}
                    </div>
                    <div style={{ fontFamily: headFont, fontWeight: 600, fontSize: 28, textAlign: 'center', marginTop: 10 }}>
                      <Ed ro={ro} value={p.name} placeholder="Nama produk" label="Nama produk" onChange={(x) => api.setProduct(sales.id, p.id, { name: x })} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 6, fontSize: 20, color: '#a86a0a' }}>
                      <span>Target</span>
                      <div style={{ width: 90, textAlign: 'center', fontWeight: 600 }}><Ed ro={ro} num value={p.target} placeholder="0" label={`Target ${p.name}`} onChange={(x) => api.setProduct(sales.id, p.id, { target: x })} /></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 28, marginTop: 14, paddingLeft: 84, fontSize: 22 }}>
          {deck.months.map((m, mi) => (
            <div key={mi} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 20, height: 20, background: MCOL[mi], borderRadius: 3 }} />
              <div style={{ width: 150 }}><Ed ro={ro} value={m} label={`Nama bulan ${mi + 1}`} onChange={(x) => api.setMonth(mi, x)} /></div>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: MUTED }}>
            <span style={{ width: 30, borderTop: `3px dashed ${AMBER}` }} /> Target
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', left: 48, right: 48, bottom: 26, display: 'flex', alignItems: 'center', gap: 16, fontSize: 22, borderTop: '1px solid #dfe3ea', paddingTop: 12 }}>
        <span style={{ color: MUTED, flex: 'none' }}>Catatan</span>
        <div style={{ flex: 1, minWidth: 0 }}><Ed ro={ro} value={sales.note} placeholder="Kendala atau rencana tindak lanjut" label="Catatan" onChange={(v) => api.setSales(sales.id, { note: v })} /></div>
        <span style={{ color: MUTED, flex: 'none', fontSize: 18 }}>{n} / {total}</span>
      </div>
    </div>
  );
}

function CoverSlide({ deck, ro, api }) {
  return (
    <div style={{ width: W, height: H, background: NAVY, color: '#fff', fontFamily: "'Inter', system-ui, sans-serif", padding: '0 96px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
      <div style={{ width: 96, height: 8, background: TEAL, marginBottom: 40 }} />
      <div style={{ fontFamily: headFont, fontWeight: 700, fontSize: 96, letterSpacing: '-0.02em', lineHeight: 1.05 }}>
        <Ed ro={ro} value={deck.cover.title} label="Judul" onChange={(v) => api.setCover({ title: v })} />
      </div>
      <div style={{ fontSize: 36, color: '#9FE1CB', marginTop: 28 }}>{deck.months[0]} – {deck.months[2]}</div>
      <div style={{ fontSize: 28, color: '#b4b8c4', marginTop: 12 }}>
        <Ed ro={ro} value={deck.cover.sub} label="Subjudul" onChange={(v) => api.setCover({ sub: v })} />
      </div>
      <div style={{ position: 'absolute', left: 96, right: 96, bottom: 56, fontSize: 24, color: '#b4b8c4' }}>
        <Ed ro={ro} value={deck.cover.audience} label="Untuk siapa" onChange={(v) => api.setCover({ audience: v })} />
      </div>
    </div>
  );
}

function ClosingSlide({ deck, ro, api }) {
  return (
    <div style={{ width: W, height: H, background: NAVY, color: '#fff', fontFamily: "'Inter', system-ui, sans-serif", padding: '0 96px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ width: 96, height: 8, background: TEAL, marginBottom: 40 }} />
      <div style={{ fontFamily: headFont, fontWeight: 700, fontSize: 96, letterSpacing: '-0.02em', lineHeight: 1.05 }}>
        <Ed ro={ro} value={deck.closing.title} label="Judul penutup" onChange={(v) => api.setClosing({ title: v })} />
      </div>
      <div style={{ fontSize: 36, color: '#9FE1CB', marginTop: 28 }}>
        <Ed ro={ro} value={deck.closing.sub} label="Subjudul penutup" onChange={(v) => api.setClosing({ sub: v })} />
      </div>
    </div>
  );
}

function SlideView({ item, deck, n, total, ro, api }) {
  if (item.kind === 'cover') return <CoverSlide deck={deck} ro={ro} api={api} />;
  if (item.kind === 'closing') return <ClosingSlide deck={deck} ro={ro} api={api} />;
  return <SalesSlide sales={item.sales} deck={deck} n={n} total={total} ro={ro} api={api} />;
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
  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#000' }}>
      <div style={{ height: 3, background: '#222' }}><div style={{ height: 3, width: `${((index + 1) / total) * 100}%`, background: TEAL, transition: 'width .25s' }} /></div>
      <div className="flex-1 min-h-0 cursor-pointer" onClick={() => go((c) => c + 1)}>
        <Fit><div key={it.key} className="slide-in"><SlideView item={it} deck={deck} n={index + 1} total={total} ro api={api} /></div></Fit>
      </div>
      <div className="flex items-center justify-between gap-3 px-4 py-2 text-sm" style={{ background: '#0a0d13', color: '#c5cce0', paddingBottom: 'max(8px, env(safe-area-inset-bottom, 0px))' }}>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 rounded border border-[#2a3142] disabled:opacity-40" disabled={index === 0} onClick={() => go((c) => c - 1)}>Sebelumnya</button>
          <button className="px-3 py-1 rounded border border-[#2a3142] disabled:opacity-40" disabled={index === total - 1} onClick={() => go((c) => c + 1)}>Berikutnya</button>
        </div>
        <div className="tabular-nums">{index + 1} / {total} · {fmtTime(elapsed)}</div>
        <button className="px-3 py-1 rounded" style={{ background: TEAL, color: '#04130d', fontWeight: 600 }} onClick={onExit}>Keluar (Esc)</button>
      </div>
    </div>
  );
}

function Panel({ item, deck, api, idx, count, onMove, onDelete }) {
  return (
    <aside className="lg:w-80 shrink-0 rounded-lg border border-[var(--line)] bg-[var(--panel)] p-3 flex flex-col gap-3 lg:overflow-y-auto">
      <div className="head font-semibold text-base">Isi data</div>

      {item.kind === 'cover' && (
        <>
          <div><label className="lbl" htmlFor="c-title">Judul</label><input id="c-title" className="field" value={deck.cover.title} onChange={(e) => api.setCover({ title: e.target.value })} /></div>
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
        return (
          <>
            <div><label className="lbl" htmlFor="s-name">Nama sales</label><input id="s-name" className="field" value={s.name} onChange={(e) => api.setSales(s.id, { name: e.target.value })} /></div>
            {s.products.map((p, pi) => (
              <div key={p.id} className="rounded-md border border-[var(--line)] p-2 flex flex-col gap-2">
                <div className="flex gap-2">
                  <input aria-label="Nama produk" className="field" value={p.name} onChange={(e) => api.setProduct(s.id, p.id, { name: e.target.value })} />
                  <button className="btn btn-danger" aria-label={`Hapus ${p.name}`} disabled={s.products.length === 1} onClick={() => api.delProduct(s.id, p.id)}>Hapus</button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {deck.months.map((m, mi) => (
                    <div key={mi}>
                      <label className="lbl" htmlFor={`v-${p.id}-${mi}`}>{m || `Bulan ${mi + 1}`}</label>
                      <input id={`v-${p.id}-${mi}`} className="field" inputMode="decimal" value={p.values[mi]} onChange={(e) => api.setValue(s.id, p.id, mi, e.target.value.replace(/[^0-9.,]/g, ''))} />
                    </div>
                  ))}
                  <div>
                    <label className="lbl" htmlFor={`t-${p.id}`}>Target</label>
                    <input id={`t-${p.id}`} className="field" inputMode="decimal" value={p.target} onChange={(e) => api.setProduct(s.id, p.id, { target: e.target.value.replace(/[^0-9.,]/g, '') })} />
                  </div>
                </div>
              </div>
            ))}
            <button className="btn" onClick={() => api.addProduct(s.id)}>+ Produk</button>
            <div><label className="lbl" htmlFor="s-note">Catatan</label><textarea id="s-note" rows={3} className="field" value={s.note} onChange={(e) => api.setSales(s.id, { note: e.target.value })} /></div>
            <div className="border-t border-[var(--line)] pt-3 flex flex-col gap-2">
              <div className="text-xs text-[var(--muted)]">Berlaku untuk semua slide sales</div>
              <div><label className="lbl" htmlFor="g-unit">Satuan</label><input id="g-unit" className="field" value={deck.unit} onChange={(e) => api.setUnit(e.target.value)} /></div>
              <div className="grid grid-cols-3 gap-2">
                {deck.months.map((m, mi) => (
                  <div key={mi}><label className="lbl" htmlFor={`m-${mi}`}>Bulan {mi + 1}</label><input id={`m-${mi}`} className="field" value={m} onChange={(e) => api.setMonth(mi, e.target.value)} /></div>
                ))}
              </div>
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

function App() {
  const [deck, setDeck] = useState(load);
  const [idx, setIdx] = useState(1);
  const [presenting, setPresenting] = useState(false);

  useEffect(() => { try { localStorage.setItem('laporan-penjualan-v1', JSON.stringify(deck)); } catch (e) {} }, [deck]);

  const [theme, setTheme] = useState(() => {
    const cur = document.documentElement.getAttribute('data-theme');
    return APP_THEMES.some((t) => t.id === cur) ? cur : APP_THEMES[0].id;
  });
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('presentasi-theme', theme); } catch (e) {}
  }, [theme]);

  const items = [{ kind: 'cover', key: 'cover' }, ...deck.sales.map((s) => ({ kind: 'sales', sales: s, key: s.id })), { kind: 'closing', key: 'closing' }];
  const safeIdx = Math.min(idx, items.length - 1);
  const cur = items[safeIdx];

  const mapSales = (id, fn) => setDeck((d) => ({ ...d, sales: d.sales.map((s) => (s.id === id ? fn(s) : s)) }));
  const api = {
    setUnit: (v) => setDeck((d) => ({ ...d, unit: v })),
    setMonth: (i, v) => setDeck((d) => ({ ...d, months: d.months.map((m, j) => (j === i ? v : m)) })),
    setCover: (p) => setDeck((d) => ({ ...d, cover: { ...d.cover, ...p } })),
    setClosing: (p) => setDeck((d) => ({ ...d, closing: { ...d.closing, ...p } })),
    setSales: (id, p) => mapSales(id, (s) => ({ ...s, ...p })),
    setProduct: (sid, pid, p) => mapSales(sid, (s) => ({ ...s, products: s.products.map((x) => (x.id === pid ? { ...x, ...p } : x)) })),
    setValue: (sid, pid, mi, v) => mapSales(sid, (s) => ({ ...s, products: s.products.map((x) => (x.id === pid ? { ...x, values: x.values.map((y, j) => (j === mi ? v : y)) } : x)) })),
    addProduct: (sid) => mapSales(sid, (s) => ({ ...s, products: [...s.products, mkProduct('Produk ' + String.fromCharCode(65 + s.products.length))] })),
    delProduct: (sid, pid) => mapSales(sid, (s) => (s.products.length > 1 ? { ...s, products: s.products.filter((x) => x.id !== pid) } : s)),
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
  const fillSample = () => setDeck((d) => ({ ...d, sales: d.sales.map((s) => ({ ...s, products: s.products.map((p) => {
    const base = 40 + Math.round(Math.random() * 50);
    return { ...p, target: String(Math.round(base * 1.15 / 5) * 5), values: [0, 1, 2].map(() => String(Math.max(10, base + Math.round((Math.random() - 0.4) * 30)))) };
  }) })) }));
  const clearNums = () => setDeck((d) => ({ ...d, sales: d.sales.map((s) => ({ ...s, products: s.products.map((p) => ({ ...p, target: '', values: ['', '', ''] })) })) }));
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

  const labelOf = (it) => it.kind === 'cover' ? 'Sampul' : it.kind === 'closing' ? 'Penutup' : (it.sales.name || 'Tanpa nama');

  return (
    <div className="flex flex-col gap-3 min-h-full lg:h-full">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="head text-lg font-bold m-0">Laporan Penjualan</h1>
        <div className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="app-theme">Tema aplikasi</label>
          <select id="app-theme" className="field" style={{ width: 'auto' }} value={theme} onChange={(e) => setTheme(e.target.value)}>
            {APP_THEMES.map((t) => <option key={t.id} value={t.id}>Tema {t.name}</option>)}
          </select>
          <button className="btn" onClick={fillSample}>Isi data contoh</button>
          <button className="btn" onClick={clearNums}>Kosongkan angka</button>
          <button className="btn" onClick={resetAll}>Setel ulang</button>
          <button className="btn btn-primary" onClick={() => setPresenting(true)}>Mulai presentasi</button>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-3 flex-1 min-h-0">
        <nav aria-label="Daftar slide" className="lg:w-44 shrink-0 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-hidden lg:overflow-y-auto pb-1">
          {items.map((it, i) => (
            <button key={it.key} onClick={() => setIdx(i)} aria-current={i === safeIdx}
              className={'shrink-0 w-36 lg:w-full text-left rounded-md p-1 border-2 ' + (i === safeIdx ? 'border-[var(--accent)] bg-[var(--soft)]' : 'border-transparent hover:bg-[var(--soft)]')}>
              <div className="aspect-video rounded-sm overflow-hidden border border-[var(--line)] pointer-events-none"><Fit><SlideView item={it} deck={deck} n={i + 1} total={items.length} ro api={api} /></Fit></div>
              <div className="text-xs mt-1 truncate text-[var(--muted)]">{i + 1}. {labelOf(it)}</div>
            </button>
          ))}
          <button className="btn shrink-0 w-28 lg:w-full" onClick={addSales}>+ Sales</button>
        </nav>

        <main className="flex-1 min-w-0 flex flex-col gap-2">
          <div className="w-full aspect-video lg:aspect-auto lg:flex-1 lg:min-h-0 rounded-lg border border-[var(--line)] bg-[var(--panel)] p-2">
            <Fit><SlideView item={cur} deck={deck} n={safeIdx + 1} total={items.length} ro={false} api={api} /></Fit>
          </div>
          <p className="text-xs text-[var(--muted)] m-0">Klik nama, bulan, angka, atau target langsung di slide. Di layar kecil, isi lewat panel Isi data. Nama bulan dan satuan berlaku untuk semua slide.</p>
        </main>

        <Panel item={cur} deck={deck} api={api} idx={safeIdx} count={items.length} onMove={moveSales} onDelete={delSales} />
      </div>

      {presenting && <Present items={items} deck={deck} index={safeIdx} setIndex={setIdx} onExit={() => setPresenting(false)} api={api} />}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
