{
  // ---------------------------------------------------------------
  // Impasto oil — thousands of loaded strokes along a swirling flow field,
  // each one raised off the canvas (height map) and lit for 3-D paint relief
  // ---------------------------------------------------------------
  const C = (r, g, b) => [r, g, b];
  const jit = (c, r, a) => [c[0] + r.gauss() * a, c[1] + r.gauss() * a, c[2] + r.gauss() * a];
  const mixc = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const css = (c) => `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;

  // region ids painted into a flat map
  const ID = { sky: 1, ground: 2, dome: 3, body: 4, slit: 5, person: 6, screen: 7, cypress: 8, text: 9, moon: 10, star: 11 };


  // =================================================================
  // EXPLAINER — "How does AI learn?" painted across one long canvas the camera travels along.
  // Background: a swirling night sky built once with the full lit-stroke engine; the story is laid on top in
  // fat, lit daubs (shadow edge, body, highlight ridge) — arrows, labels and numbers included.
  // =================================================================
  const IXW = 3400;
  let IXC = null;
  const lerpI = (a, b, u) => a + (b - a) * u;
  const clI = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const ezI = (u) => H.ease.inOut(clI(u));
  const winI = (t, a, b) => clI((t - a) / (b - a));
  const CREAM = C(244, 232, 196), CHROMEY = C(244, 206, 72), OCH = C(214, 150, 60), VERMI = C(214, 70, 46), PRUS = C(24, 44, 100), SKYL = C(110, 160, 210);

  function impBackground() {
    const W = IXW, Hh = 720, nz = H.makeNoise(77);
    const hill = (x) => 560 + 26 * Math.sin(x * 0.0042 + 0.5) + 14 * Math.sin(x * 0.011 + 2);
    const vort = [[420, 160, 1.6, 95], [1300, 140, -1.4, 85], [1900, 190, 1.8, 105], [2700, 150, -1.5, 95], [3200, 230, 1.4, 90]];
    const psiRaw = (x, y) => { let v = y * 0.9 + 14 * Math.sin(x * 0.006 + y * 0.004) + nz.fbm2(x * 0.004, y * 0.004, 2) * 24; for (const [cx, cy, s, R] of vort) { const d2 = (x - cx) ** 2 + (y - cy) ** 2; v += s * R * 1.6 * Math.exp(-d2 / (2 * R * R)); } return v; };
    const GS = 6, GW = Math.ceil(W / GS) + 2, GH = Math.ceil(Hh / GS) + 2, PG = new Float32Array(GW * GH);
    for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) PG[j * GW + i] = psiRaw(i * GS, j * GS);
    const bil = (x, y) => { const fx = H.clamp(x / GS, 0, GW - 1.001), fy = H.clamp(y / GS, 0, GH - 1.001), i = fx | 0, j = fy | 0, u = fx - i, v = fy - j, k = j * GW + i; return (PG[k] * (1 - u) + PG[k + 1] * u) * (1 - v) + (PG[k + GW] * (1 - u) + PG[k + GW + 1] * u) * v; };
    const dir = (x, y) => { if (y > hill(x)) { const d = (hill(x + 4) - hill(x - 4)) / 8; return Math.atan(d) + nz.n2(x * 0.01, y * 0.02) * 0.3; } const gx = (bil(x + 3, y) - bil(x - 3, y)) / 6, gy = (bil(x, y + 3) - bil(x, y - 3)) / 6; return Math.atan2(-gx, gy); };
    const SKY_D = C(18, 34, 96), SKY_M = C(40, 78, 158), SKY_L = C(86, 140, 196), PALE = C(190, 214, 214);
    const colAt = (x, y, r) => {
      const hy = hill(x);
      if (y > hy) { const dp = y - hy, b = Math.sin(dp * 0.07 + nz.n2(x * 0.006, y * 0.01) * 3); let c = mixc(C(24, 52, 60), C(16, 30, 52), H.clamp(dp / 160)); if (b > 0.4) c = mixc(c, C(64, 98, 66), 0.6); return c; }
      let c = mixc(SKY_D, SKY_M, H.clamp(y / hy)); const band = Math.sin(bil(x, y) * 0.085);
      let sw = 0; for (const [cx, cy, , R] of vort) sw = Math.max(sw, Math.exp(-((x - cx) ** 2 + (y - cy) ** 2) / (2 * (R * 1.3) ** 2)));
      if (band > 0.35) c = mixc(c, SKY_L, 0.45 + 0.3 * sw); if (band > 0.75 && sw > 0.3) c = mixc(c, PALE, 0.5 * sw); if (band < -0.6) c = mixc(c, SKY_D, 0.5);
      if (y > hy - 60) c = mixc(c, C(100, 140, 165), H.clamp((y - (hy - 60)) / 60) * 0.5);
      return c;
    };
    const COL = H.layer(W, Hh), cx_ = COL.getContext('2d'), HT = H.layer(W, Hh), hx = HT.getContext('2d');
    { const UP = H.layer(Math.ceil(W / 8), 90), ux = UP.getContext('2d'), r = H.rng(3); for (let y = 0; y < 90; y++) for (let x = 0; x < UP.width; x++) { ux.fillStyle = css(colAt(x * 8 + 4, y * 8 + 4, r)); ux.fillRect(x, y, 1, 1); } cx_.filter = 'blur(4px)'; cx_.drawImage(UP, -8, -8, W + 16, Hh + 16); cx_.filter = 'none'; }
    hx.fillStyle = '#3a3a3a'; hx.fillRect(0, 0, W, Hh);
    cx_.lineCap = hx.lineCap = 'round'; cx_.lineJoin = hx.lineJoin = 'round';
    const r1 = H.rng(78), cells = [];
    for (let y = 0; y < Hh + 6; y += 8.5) for (let x = 0; x < W + 6; x += 10) cells.push([x + r1.range(-4, 4), y + r1.range(-3, 3)]);
    for (let i = cells.length - 1; i > 0; i--) { const j = Math.floor(r1() * (i + 1)); [cells[i], cells[j]] = [cells[j], cells[i]]; }
    for (const [x, y] of cells) {
      const gnd = y > hill(x), longS = r1() < 0.13;
      const len = gnd ? r1.range(20, 32) : longS ? r1.range(28, 40) : r1.range(14, 24), w = longS ? r1.range(6.5, 8.5) : r1.range(5.5, 8), a0 = dir(x, y), pts = [[x, y]];
      let fx = x, fy = y, bx = x, by = y;
      for (let i = 0; i < 3; i++) { const af = dir(fx, fy), ab = dir(bx, by); fx += Math.cos(af) * len / 6; fy += Math.sin(af) * len / 6; bx -= Math.cos(ab) * len / 6; by -= Math.sin(ab) * len / 6; pts.push([fx, fy]); pts.unshift([bx, by]); }
      const col = jit(colAt(x, y, r1), r1, 9), col2 = mixc(col, r1.chance(0.5) ? C(240, 236, 210) : C(10, 20, 60), 0.25);
      const path = (c, o = 0, ox = 0, oy = 0) => { c.beginPath(); c.moveTo(pts[o][0] + ox, pts[o][1] + oy); for (let i = o + 1; i < pts.length - o; i++) c.lineTo(pts[i][0] + ox, pts[i][1] + oy); };
      cx_.lineWidth = w; cx_.strokeStyle = css(col); path(cx_); cx_.stroke();
      const nx = -Math.sin(a0), ny = Math.cos(a0), off = (r1() - 0.5) * w * 0.5;
      cx_.lineWidth = w * 0.3; cx_.strokeStyle = css(col2); path(cx_, 1, nx * off, ny * off); cx_.stroke();
      const base = 110 + r1() * 60; hx.lineWidth = w; hx.strokeStyle = `rgb(${base | 0},${base | 0},${base | 0})`; path(hx); hx.stroke();
      const top = base + 50 + r1() * 40; hx.lineWidth = w * 0.42; hx.strokeStyle = `rgb(${top | 0},${top | 0},${top | 0})`; path(hx, 1, nx * off * 0.5, ny * off * 0.5); hx.stroke();
    }
    // light the relief once
    const img = cx_.getImageData(0, 0, W, Hh), d = img.data;
    hx.filter = 'blur(0.7px)'; hx.drawImage(HT, 0, 0); hx.filter = 'none';
    const hd = hx.getImageData(0, 0, W, Hh).data;
    for (let y = 1; y < Hh - 1; y++) for (let x = 1; x < W - 1; x++) {
      const i = (y * W + x) * 4, gx = hd[i + 4] - hd[i - 4], gy = hd[i + W * 4] - hd[i - W * 4];
      const lam = (gx * 0.7 + gy * 0.7) * 0.0078, sh = 1 + lam, spec = lam > 0.25 ? (lam - 0.25) * 140 : 0;
      for (let c = 0; c < 3; c++) d[i + c] = d[i + c] * sh + spec;
    }
    cx_.putImageData(img, 0, 0);
    return { canvas: COL, hill };
  }

  // one fat daub of paint: shadowed edge, body, a broken-colour streak and a lit ridge
  function daub(c, pts, w, col, r) {
    if (pts.length < 2) return;
    const path = (ox, oy, s = 0) => { c.beginPath(); c.moveTo(pts[s][0] + ox, pts[s][1] + oy); for (let i = s + 1; i < pts.length - s; i++) c.lineTo(pts[i][0] + ox, pts[i][1] + oy); };
    c.lineCap = 'round'; c.lineJoin = 'round';
    c.lineWidth = w; c.strokeStyle = css(mixc(col, C(5, 8, 25), 0.55)); path(w * 0.16 + 0.6, w * 0.2 + 0.8); c.stroke();
    c.strokeStyle = css(col); path(0, 0); c.stroke();
    c.lineWidth = Math.max(1, w * 0.22); c.strokeStyle = css(mixc(col, r() < 0.5 ? C(255, 250, 230) : C(30, 30, 70), 0.22)); path(w * 0.18, -w * 0.05); c.stroke();
    c.lineWidth = Math.max(1, w * 0.3); c.strokeStyle = css(mixc(col, C(255, 252, 240), 0.5)); path(-w * 0.18, -w * 0.22, pts.length > 3 ? 1 : 0); c.stroke();
  }
  // fill a shape (given as a mask canvas) with short daubs running along `ang(x,y)`
  function paintMask(mask, colFn, ang, { step = 5, len = 10, w = 5, seed = 1 } = {}) {
    const mw = mask.width, mh = mask.height, md = mask.getContext('2d').getImageData(0, 0, mw, mh).data;
    const out = H.layer(mw + 16, mh + 16), oc = out.getContext('2d'), r = H.rng(seed);
    oc.translate(8, 8);
    for (let y = 0; y < mh; y += step * 0.8) for (let x = 0; x < mw; x += step) {
      const xx = x + r.range(-1.5, 1.5), yy = y + r.range(-1.5, 1.5), k = ((yy | 0) * mw + (xx | 0)) * 4 + 3;
      if (xx < 0 || yy < 0 || xx >= mw || yy >= mh || md[k] < 128) continue;
      const a = ang(xx, yy) + r.gauss() * 0.15, l = len * (0.7 + r() * 0.6);
      daub(oc, [[xx - Math.cos(a) * l / 2, yy - Math.sin(a) * l / 2], [xx, yy], [xx + Math.cos(a) * l / 2, yy + Math.sin(a) * l / 2]], w * (0.8 + r() * 0.4), jit(colFn(xx, yy), r, 10), r);
    }
    return out;
  }

 window.Impasto={impBackground,daub,paintMask,C,CREAM,CHROMEY,VERMI,PRUS,SKYL};
}
