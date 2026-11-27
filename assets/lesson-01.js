/* 1강 시뮬레이터: map, base_link, camera 좌표계와 점 p의 변환 */
{
  const s = document.getElementById("svg1");
  const { store } = window.SLAM;
  const ids = ["rx", "ry", "yaw", "off", "dist"], el = {};
  ids.forEach(i => (el[i] = document.getElementById(i)));
  const def = { rx: 2, ry: 1, yaw: 90, off: 0.5, dist: 1 };
  const saved = store.get("slam.lab1", null);
  if (saved) ids.forEach(i => { if (saved[i] !== undefined) el[i].value = saved[i]; });
  const f2 = v => (Math.abs(v) < 0.005 ? 0 : v).toFixed(2);

  const arrow = (x1, y1, x2, y2, col, w) => {
    const a = Math.atan2(y2 - y1, x2 - x1), h = 9;
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>` +
      `<path d="M${x2} ${y2} L${x2 - h * Math.cos(a - 0.45)} ${y2 - h * Math.sin(a - 0.45)} L${x2 - h * Math.cos(a + 0.45)} ${y2 - h * Math.sin(a + 0.45)}Z" fill="${col}"/>`;
  };
  const mat = (sub, a) => `<div class="mat"><em>${sub}</em>${a.map(r => "[ " + r.map(x => f2(x).padStart(6)).join(" ") + " ]").join("\n")}</div>`;

  const draw = () => {
    const v = {}; ids.forEach(i => (v[i] = parseFloat(el[i].value)));
    store.set("slam.lab1", v);
    const th = v.yaw * Math.PI / 180, c = Math.cos(th), sn = Math.sin(th);
    const pbx = v.off + v.dist, pwx = c * pbx + v.rx, pwy = sn * pbx + v.ry;
    const cwx = c * v.off + v.rx, cwy = sn * v.off + v.ry;
    document.getElementById("rxo").textContent = v.rx.toFixed(1) + " m";
    document.getElementById("ryo").textContent = v.ry.toFixed(1) + " m";
    document.getElementById("yawo").textContent = v.yaw + "°";
    document.getElementById("offo").textContent = v.off.toFixed(2) + " m";
    document.getElementById("disto").textContent = v.dist.toFixed(1) + " m";
    document.getElementById("pw").innerHTML = `<i>(${f2(pwx)}, ${f2(pwy)})</i>`;
    document.getElementById("mats").innerHTML =
      mat("T_wb  base_link → map", [[c, -sn, v.rx], [sn, c, v.ry], [0, 0, 1]]) +
      mat("T_bc  camera → base_link", [[1, 0, v.off], [0, 1, 0], [0, 0, 1]]) +
      mat("p̃_c   p̃_b   p̃_w", [[v.dist, pbx, pwx], [0, 0, pwy], [1, 1, 1]]);

    const W = s.clientWidth, H = s.clientHeight, mg = W < 520 ? 26 : 38;
    const k = Math.min((W - 2 * mg) / 5, (H - 2 * mg) / 4), ox = (W - 5 * k) / 2, oy = H - (H - 4 * k) / 2;
    const X = x => ox + x * k, Y = y => oy - y * k;
    let g = "";
    for (let i = 0; i <= 5; i++) g += `<line x1="${X(i)}" y1="${Y(0)}" x2="${X(i)}" y2="${Y(4)}" stroke="var(--line)"/>` + ((W >= 520 || i % 2 === 0) ? `<text x="${X(i)}" y="${Y(0) + 18}" text-anchor="middle" fill="var(--mute)">${i}</text>` : "");
    for (let j = 0; j <= 4; j++) g += `<line x1="${X(0)}" y1="${Y(j)}" x2="${X(5)}" y2="${Y(j)}" stroke="var(--line)"/>` + (j > 0 ? `<text x="${X(0) - 8}" y="${Y(j) + 4}" text-anchor="end" fill="var(--mute)">${j}</text>` : "");
    g += arrow(X(0), Y(0), X(0.8), Y(0), "var(--xr)", 3) + arrow(X(0), Y(0), X(0), Y(0.8), "var(--yg)", 3) + `<text x="${X(0) + 6}" y="${Y(0) - 8}">map</text>`;
    g += `<line x1="${X(cwx)}" y1="${Y(cwy)}" x2="${X(pwx)}" y2="${Y(pwy)}" stroke="var(--ink)" stroke-width="1.5" stroke-dasharray="5 5"/>`;
    g += `<g transform="translate(${X(v.rx)} ${Y(v.ry)}) rotate(${-v.yaw})"><rect x="${-0.28 * k}" y="${-0.2 * k}" width="${0.56 * k}" height="${0.4 * k}" rx="${0.08 * k}" fill="var(--plane)" stroke="var(--ink)" stroke-width="1.5"/><rect x="${v.off * k - 0.07 * k}" y="${-0.06 * k}" width="${0.14 * k}" height="${0.12 * k}" fill="var(--ink)"/></g>`;
    const L = 0.6;
    g += arrow(X(v.rx), Y(v.ry), X(v.rx + c * L), Y(v.ry + sn * L), "var(--xr)", 3) + arrow(X(v.rx), Y(v.ry), X(v.rx - sn * L), Y(v.ry + c * L), "var(--yg)", 3);
    g += `<text x="${X(v.rx)}" y="${Y(v.ry) + 0.5 * k + 6}" text-anchor="middle">base_link</text>`;
    g += `<circle cx="${X(pwx)}" cy="${Y(pwy)}" r="9" fill="#ffe600" stroke="var(--ink)" stroke-width="2"/>`;
    const right = X(pwx) > W - 130, tx = right ? X(pwx) - 14 : X(pwx) + 14;
    g += `<text x="${tx}" y="${Y(pwy) - 12}" text-anchor="${right ? "end" : "start"}">p (${f2(pwx)}, ${f2(pwy)})</text>`;
    if (pwx < 0 || pwx > 5 || pwy < 0 || pwy > 4) g += `<text x="${W / 2}" y="20" text-anchor="middle" fill="var(--xr)">점이 그림 밖으로 나갔다</text>`;
    s.innerHTML = g;
  };
  ids.forEach(i => el[i].addEventListener("input", draw));
  document.getElementById("reset1").addEventListener("click", () => { ids.forEach(i => (el[i].value = def[i])); draw(); });
  const roLab1 = new ResizeObserver(draw);
  roLab1.observe(s);
  draw();
}
