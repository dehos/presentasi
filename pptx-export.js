/* Konversi slide (DOM) menjadi objek asli PowerPoint: bentuk, garis, teks, dan gambar logo yang bisa diedit.
   Posisi dan gaya dibaca dari hasil render browser (getBoundingClientRect + getComputedStyle), jadi tata letaknya mengikuti tampilan web.
   Setiap objek diberi nama konsisten antar slide dengan awalan "!!" (mis. !!title, !!card-0, !!card-0.3) supaya transisi Morph
   di PowerPoint bisa mencocokkan objek yang sama. */
(function () {
  const PX = 1 / 96;      // px -> inci
  const PT = 0.75;        // px -> pt
  const hex2 = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0').toUpperCase();

  function parseColor(str) {
    if (!str) return null;
    const m = String(str).match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(/[ ,\/]+/).filter(Boolean).map(parseFloat);
    if (p.length < 3 || p.some((v) => isNaN(v))) return null;
    return { hex: hex2(p[0]) + hex2(p[1]) + hex2(p[2]), a: p.length > 3 ? p[3] : 1 };
  }
  const transp = (a, op) => Math.round((1 - Math.max(0, Math.min(1, a * (op == null ? 1 : op)))) * 100);
  const px = (v) => parseFloat(v) || 0;
  const opacityOf = (el, root) => { let o = 1; for (let n = el; n && n.nodeType === 1; n = n.parentElement) { o *= parseFloat(getComputedStyle(n).opacity); if (n === root) break; } return isNaN(o) ? 1 : o; };

  function parseShadow(str) {
    if (!str || str === 'none') return null;
    const parts = str.split(/,(?![^(]*\))/).map((s) => s.trim()).filter((s) => s && !/\binset\b/.test(s));
    if (!parts.length) return null;
    const col = parseColor(parts[0]); if (!col) return null;
    const nums = parts[0].replace(/rgba?\([^)]*\)/, '').trim().split(/\s+/).map(parseFloat).filter((v) => !isNaN(v));
    const [x = 0, y = 0, blur = 0] = nums;
    return { type: 'outer', color: col.hex, opacity: Math.round(col.a * 45) / 100, blur: Math.round(blur * PT * 10) / 10, offset: Math.round(Math.hypot(x, y) * PT * 10) / 10, angle: Math.round((Math.atan2(y, x) * 180) / Math.PI + 360) % 360 };
  }

  function sides(cs) {
    return ['Top', 'Right', 'Bottom', 'Left'].map((s) => ({ side: s, w: px(cs['border' + s + 'Width']), style: cs['border' + s + 'Style'], c: parseColor(cs['border' + s + 'Color']) }))
      .map((b) => ({ ...b, on: b.w > 0 && b.style !== 'none' && b.style !== 'hidden' && b.c && b.c.a > 0 }));
  }
  function radii(cs) { return ['TopLeft', 'TopRight', 'BottomRight', 'BottomLeft'].map((c) => px(cs['border' + c + 'Radius'])); }

  const fontOf = (cs) => (cs.fontFamily.split(',')[0] || 'Inter').replace(/["']/g, '').trim();
  const xform = (t, cs) => (cs.textTransform === 'uppercase' ? t.toUpperCase() : cs.textTransform === 'lowercase' ? t.toLowerCase() : t);
  function runStyle(cs, op) {
    const col = parseColor(cs.color) || { hex: '000000', a: 1 };
    const ls = px(cs.letterSpacing);
    const o = { fontFace: fontOf(cs), fontSize: Math.round(px(cs.fontSize) * PT * 10) / 10, color: col.hex, bold: parseInt(cs.fontWeight, 10) >= 600, italic: cs.fontStyle === 'italic' };
    if (col.a * op < 0.99) o.transparency = transp(col.a, op);
    if (ls) o.charSpacing = Math.round(ls * PT * 10) / 10;
    return o;
  }

  const isBlank = (t) => !t || !t.replace(/[\s ]+/g, '');
  function hasBox(el) {
    const cs = getComputedStyle(el);
    const f = parseColor(cs.backgroundColor);
    return (f && f.a > 0) || sides(cs).some((b) => b.on) || (cs.backgroundImage && cs.backgroundImage !== 'none');
  }
  const isInlineish = (n) => n.nodeType === 3 || (n.nodeType === 1 && (n.tagName === 'BR' || (getComputedStyle(n).display === 'inline' && !hasBox(n))));

  function collectRuns(el, op, out) {
    el.childNodes.forEach((n) => {
      if (n.nodeType === 3) {
        const cs = getComputedStyle(el);
        const t = xform(n.nodeValue.replace(/\s+/g, ' '), cs);
        if (t) out.push({ text: t, options: runStyle(cs, op) });
      } else if (n.nodeType === 1) {
        if (n.tagName === 'BR') out.push({ text: '\n', options: {} });
        else collectRuns(n, op, out);
      }
    });
    return out;
  }
  function trimRuns(runs) {
    while (runs.length && !runs[0].text.replace(/ /g, '').trim()) runs.shift();
    while (runs.length && !runs[runs.length - 1].text.replace(/ /g, '').trim()) runs.pop();
    if (runs.length) { runs[0].text = runs[0].text.replace(/^\s+/, ''); runs[runs.length - 1].text = runs[runs.length - 1].text.replace(/\s+$/, ''); }
    return runs;
  }

  function textRects(node) {
    const r = document.createRange(); r.selectNodeContents(node);
    return Array.from(r.getClientRects()).filter((q) => q.width > 0.5 && q.height > 0.5);
  }
  function fitText(text, el, cs) {
    const c = fitText.cv || (fitText.cv = document.createElement('canvas').getContext('2d'));
    c.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    const max = el.clientWidth - px(cs.paddingLeft) - px(cs.paddingRight);
    if (c.measureText(text).width <= max) return text;
    let s = text; while (s.length > 1 && c.measureText(s + '…').width > max) s = s.slice(0, -1);
    return s.trimEnd() + '…';
  }

  async function imgData(img) {
    try {
      const cv = document.createElement('canvas'); cv.width = img.naturalWidth; cv.height = img.naturalHeight;
      cv.getContext('2d').drawImage(img, 0, 0); return cv.toDataURL('image/png');
    } catch (e) {
      const blob = await (await fetch(img.src)).blob();
      return new Promise((res) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.readAsDataURL(blob); });
    }
  }

  async function convert(root, slide, pptx, ctx) {
    const rr = root.getBoundingClientRect();
    const rel = (r) => ({ x: r.left - rr.left, y: r.top - rr.top, w: r.width, h: r.height });
    const counters = {}, used = {};
    const nameFor = (scope, first) => {
      let n;
      if (first) n = '!!' + scope; else { counters[scope] = (counters[scope] || 0) + 1; n = '!!' + scope + '.' + counters[scope]; }
      used[n] = (used[n] || 0) + 1;
      return used[n] > 1 ? n + '~' + used[n] : n;
    };
    const inch = (r) => ({ x: r.x * PX, y: r.y * PX, w: r.w * PX, h: r.h * PX });

    const bg = parseColor(getComputedStyle(root).backgroundColor);
    if (bg) slide.background = { color: bg.hex };

    // ---- bola 3D: lingkaran dengan gradasi radial (diisi gradasi pada tahap patchOrbs)
    root.querySelectorAll('[data-m^="orb"]').forEach((el) => {
      const cs = getComputedStyle(el), r = rel(el.getBoundingClientRect()), op = opacityOf(el, root);
      const grads = cs.backgroundImage.match(/radial-gradient\([^]*?\)(?=,\s*radial-gradient|$)/g) || [];
      const main = grads[grads.length - 1] || '', m = main.match(/at\s+([\d.]+)%\s+([\d.]+)%/);
      const cols = (main.match(/rgba?\([^)]+\)/g) || []).map(parseColor).filter(Boolean);
      if (cols.length < 2) return;
      const key = el.dataset.m, i = inch(r);
      slide.addShape(pptx.ShapeType.ellipse, { x: i.x, y: i.y, w: i.w, h: i.h, fill: { color: cols[1].hex }, line: { type: 'none' }, objectName: '!!' + key });
      ctx.orbs.push({ slide: ctx.slideIndex, name: '!!' + key, c1: cols[0].hex, c2: cols[cols.length - 1].hex, alpha: op, fx: m ? +m[1] : 36, fy: m ? +m[2] : 32, kind: 'orb' });
      const s = r.w, sh = { x: r.x + s * 0.30 - s * 0.26, y: r.y + s * 0.26 - s * 0.26, w: s * 0.52, h: s * 0.52 }, si = inch(sh);
      slide.addShape(pptx.ShapeType.ellipse, { x: si.x, y: si.y, w: si.w, h: si.h, fill: { color: 'FFFFFF' }, line: { type: 'none' }, objectName: '!!' + key + '.shine' });
      ctx.orbs.push({ slide: ctx.slideIndex, name: '!!' + key + '.shine', c1: 'FFFFFF', c2: 'FFFFFF', alpha: op, fx: 50, fy: 50, kind: 'shine' });
    });

    // ---- elemen biasa
    async function walk(el, scope) {
      if (el.nodeType !== 1) return;
      if (el.dataset && el.dataset.m && el.dataset.m.startsWith('orb')) return;
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') return;
      const rect = el.getBoundingClientRect();
      if (rect.width < 0.5 && rect.height < 0.5) return;
      const key = el.dataset && el.dataset.m && el.dataset.m !== 'bg' ? el.dataset.m : null;
      const myScope = key || scope;
      let firstOfKey = !!key;
      const r = rel(rect), i = inch(r), op = opacityOf(el, root);
      const name = () => { const n = nameFor(myScope, firstOfKey); firstOfKey = false; return n; };

      if (el.tagName === 'IMG') {
        slide.addImage({ data: await imgData(el), x: i.x, y: i.y, w: i.w, h: i.h, objectName: name(), altText: el.alt || '' });
        return;
      }

      const fill = parseColor(cs.backgroundColor), hasFill = fill && fill.a > 0;
      const bs = sides(cs), anyBorder = bs.some((b) => b.on), uniform = bs.every((b) => b.on) && bs.every((b) => b.w === bs[0].w && b.style === bs[0].style && b.c.hex === bs[0].c.hex);
      const rad = radii(cs), maxR = Math.max(...rad), same = rad.every((v) => v === rad[0]);
      const shadow = hasFill ? parseShadow(cs.boxShadow) : null;
      const isEllipse = maxR >= Math.min(r.w, r.h) / 2 - 0.5 && Math.abs(r.w - r.h) < 1.5 && maxR > 0;
      const shapeType = isEllipse ? pptx.ShapeType.ellipse : (same && maxR > 0) || (maxR > 0 && r.h <= 40) ? pptx.ShapeType.roundRect : pptx.ShapeType.rect;
      const rectRadius = shapeType === pptx.ShapeType.roundRect ? Math.min(maxR, Math.min(r.w, r.h) / 2) * PX : 0;
      const shapeOpts = () => {
        const o = { x: i.x, y: i.y, w: i.w, h: i.h };
        if (hasFill) o.fill = { color: fill.hex, transparency: transp(fill.a, op) }; else o.fill = { type: 'none' };
        if (uniform) { o.line = { color: bs[0].c.hex, width: bs[0].w * PT, dashType: /dash/.test(bs[0].style) ? 'dash' : 'solid', transparency: transp(bs[0].c.a, op) }; } else o.line = { type: 'none' };
        if (rectRadius) o.rectRadius = rectRadius;
        if (shadow) o.shadow = shadow;
        return o;
      };
      const needShape = hasFill || uniform;

      // teks sebagai daun (hanya teks / elemen inline)
      const kids = Array.from(el.childNodes);
      const textLeaf = kids.length > 0 && kids.every(isInlineish) && !isBlank(el.textContent);
      if (textLeaf) {
        let runs = trimRuns(collectRuns(el, op, []));
        if (!runs.length) { if (needShape) slide.addShape(shapeType, { ...shapeOpts(), objectName: name() }); return; }
        const ellipsis = cs.textOverflow === 'ellipsis' || (cs.overflow !== 'visible' && el.scrollWidth > el.clientWidth + 1);
        if (ellipsis && runs.length === 1) runs[0].text = fitText(runs[0].text, el, cs);
        const rects = textRects(el); if (!rects.length) return;
        const u = { l: Math.min(...rects.map((q) => q.left)), t: Math.min(...rects.map((q) => q.top)), r: Math.max(...rects.map((q) => q.right)), b: Math.max(...rects.map((q) => q.bottom)) };
        const lines = new Set(rects.map((q) => Math.round(q.top / 3))).size;
        const align0 = cs.textAlign, align = align0 === 'right' || align0 === 'end' ? 'right' : align0 === 'center' ? 'center' : 'left';
        const base = runs.length === 1 ? { ...runs[0].options } : {};
        const common = { margin: 0, fit: 'none', objectName: name(), ...base };
        let box, extra = Math.max(8, px(cs.fontSize) * 0.4);
        if (needShape) {
          // bentuk + teks dalam satu objek (mis. label persen)
          const cx = (u.l + u.r) / 2 - rr.left, mid = r.x + r.w / 2;
          const al = Math.abs(cx - mid) < 3 ? 'center' : align;
          slide.addText(runs.length === 1 ? runs[0].text : runs, { ...shapeOpts(), shape: shapeType, align: al, valign: 'middle', wrap: false, ...common });
          return;
        }
        if (lines > 1) {
          const lh = px(cs.lineHeight);
          box = { x: r.x + px(cs.paddingLeft), y: u.t - rr.top, w: r.w - px(cs.paddingLeft) - px(cs.paddingRight), h: u.b - u.t };
          if (lh) common.lineSpacing = Math.round(lh * PT * 10) / 10;
          Object.assign(common, { valign: 'top', wrap: true });
        } else {
          const w = u.r - u.l, x = u.l - rr.left, y = u.t - rr.top, h = u.b - u.t;
          box = align === 'right' ? { x: x - extra, y, w: w + extra, h } : align === 'center' ? { x: x - extra / 2, y, w: w + extra, h } : { x, y, w: w + extra, h };
          Object.assign(common, { valign: 'middle', wrap: true });
        }
        const bi = inch(box);
        slide.addText(runs.length === 1 ? runs[0].text : runs, { x: bi.x, y: bi.y, w: bi.w, h: bi.h, align, ...common });
        return;
      }

      // wadah: bentuk dulu, lalu anak-anaknya
      if (needShape) slide.addShape(shapeType, { ...shapeOpts(), objectName: name() });
      if (!uniform && anyBorder) {
        bs.filter((b) => b.on).forEach((b) => {
          const o = { line: { color: b.c.hex, width: b.w * PT, dashType: /dash/.test(b.style) ? 'dash' : 'solid', transparency: transp(b.c.a, op) }, objectName: name() };
          const y = b.side === 'Top' ? r.y + b.w / 2 : r.y + r.h - b.w / 2, x = b.side === 'Left' ? r.x + b.w / 2 : r.x + r.w - b.w / 2;
          if (b.side === 'Top' || b.side === 'Bottom') slide.addShape(pptx.ShapeType.line, { x: i.x, y: y * PX, w: i.w, h: 0, ...o });
          else slide.addShape(pptx.ShapeType.line, { x: x * PX, y: i.y, w: 0, h: i.h, ...o });
        });
      }
      for (const n of kids) {
        if (n.nodeType === 1) await walk(n, myScope);
        else if (n.nodeType === 3 && !isBlank(n.nodeValue)) {
          const rects = textRects(n); if (!rects.length) continue;
          const t = xform(n.nodeValue.replace(/\s+/g, ' ').trim(), cs);
          const l = Math.min(...rects.map((q) => q.left)), tp = Math.min(...rects.map((q) => q.top)), rt = Math.max(...rects.map((q) => q.right)), bt = Math.max(...rects.map((q) => q.bottom));
          const bi = inch({ x: l - rr.left, y: tp - rr.top, w: rt - l + 10, h: bt - tp });
          slide.addText(t, { x: bi.x, y: bi.y, w: bi.w, h: bi.h, margin: 0, wrap: true, fit: 'none', align: 'left', valign: 'middle', objectName: nameFor(myScope, false), ...runStyle(cs, op) });
        }
      }
    }
    for (const c of Array.from(root.children)) await walk(c, 'x');
  }

  /* Isi bola dengan gradasi radial (pptxgenjs hanya mendukung warna rata). Mengedit XML slide di dalam file .pptx. */
  async function patchOrbs(buf, orbs, JSZipLib) {
    const zip = await JSZipLib.loadAsync(buf);
    const bySlide = {};
    orbs.forEach((o) => { (bySlide[o.slide] = bySlide[o.slide] || []).push(o); });
    for (const k of Object.keys(bySlide)) {
      const path = `ppt/slides/slide${+k + 1}.xml`; let xml = await zip.file(path).async('string');
      for (const o of bySlide[k]) {
        const esc = o.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const re = new RegExp(`(<p:sp>(?:(?!</p:sp>)[\\s\\S])*?name="${esc}"[\\s\\S]*?<p:spPr>[\\s\\S]*?)<a:solidFill>[\\s\\S]*?</a:solidFill>`);
        const A = Math.round(o.alpha * (o.kind === 'shine' ? 55 : 100) * 1000), stop = (c, pos, a) => `<a:gs pos="${pos}"><a:srgbClr val="${c}"><a:alpha val="${a}"/></a:srgbClr></a:gs>`;
        const grad = o.kind === 'shine'
          ? `<a:gradFill rotWithShape="1"><a:gsLst>${stop('FFFFFF', 0, A)}${stop('FFFFFF', 100000, 0)}</a:gsLst><a:path path="circle"><a:fillToRect l="50000" t="50000" r="50000" b="50000"/></a:path></a:gradFill>`
          : `<a:gradFill rotWithShape="1"><a:gsLst>${stop(o.c1, 0, A)}${stop(o.c2, 100000, A)}</a:gsLst><a:path path="circle"><a:fillToRect l="${Math.round(o.fx * 1000)}" t="${Math.round(o.fy * 1000)}" r="${Math.round((100 - o.fx) * 1000)}" b="${Math.round((100 - o.fy) * 1000)}"/></a:path></a:gradFill>`;
        xml = xml.replace(re, `$1${grad}`);
      }
      zip.file(path, xml);
    }
    return zip.generateAsync({ type: 'arraybuffer', compression: 'DEFLATE' });
  }

  window.DhouseExport = { convert, patchOrbs };
})();
