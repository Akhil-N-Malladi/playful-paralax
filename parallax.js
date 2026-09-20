(() => {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const $ = id => document.getElementById(id);
  const clamp = n => Math.max(0, Math.min(1, n));
  const local = (p, start, end) => clamp((p - start) / Math.max(.001, end - start));

  // Keep sticky background elements aligned exactly beneath the real site header.
  const siteHeader = document.querySelector('.site-header');
  function syncHeaderHeight(){
    const height = Math.max(0, Math.round(siteHeader?.getBoundingClientRect().height || 84));
    document.documentElement.style.setProperty('--site-header-height', `${height}px`);
  }
  syncHeaderHeight();
  if ('ResizeObserver' in window && siteHeader) new ResizeObserver(syncHeaderHeight).observe(siteHeader);
  addEventListener('resize', syncHeaderHeight);

  /* ------------------------------------------------------------------
     MATH: journal paper + 2016 AIME I #15 geometry construction.
     The SVG is a faithful incidence sketch of the problem/solution setup:
     omega_1 and omega_2 tangent to AB at A/B, intersections X/Y,
     omega through A/B meeting the first circles again at D/C,
     C-Y-D collinear, and radical-center lines meeting at Z with M on AB.
  ------------------------------------------------------------------ */
  const math = $('math');
  let mathLayer = null;
  if (math) {
    mathLayer = document.createElement('div');
    mathLayer.className = 'parallax-layer math-parallax';
    mathLayer.setAttribute('aria-hidden','true');
    mathLayer.innerHTML = `
      <div class="journal-sheet">
        <div class="journal-meta">geometry notebook / AIME I 2016 #15</div>
        <svg class="aime-geometry" viewBox="0 0 900 780" preserveAspectRatio="xMidYMid meet">
          <g class="geo-ink">
            <line class="geo-draw tangent" data-start="0.02" data-end="0.15" pathLength="1" x1="80" y1="430" x2="820" y2="430"/>

            <circle class="geo-draw circle-main" data-start="0.10" data-end="0.30" pathLength="1" cx="300" cy="262" r="168"/>
            <circle class="geo-draw circle-main" data-start="0.18" data-end="0.38" pathLength="1" cx="552" cy="220" r="210"/>

            <line class="geo-draw radical-axis" data-start="0.29" data-end="0.45" pathLength="1" x1="494" y1="760" x2="365" y2="65"/>

            <circle class="geo-draw circle-third" data-start="0.36" data-end="0.58" pathLength="1" cx="426" cy="191" r="270"/>

            <line class="geo-draw chord-line" data-start="0.52" data-end="0.66" pathLength="1" x1="132" y1="167" x2="690" y2="31"/>
            <line class="geo-draw construction" data-start="0.61" data-end="0.78" pathLength="1" x1="150" y1="163" x2="486" y2="765"/>
            <line class="geo-draw construction" data-start="0.67" data-end="0.84" pathLength="1" x1="648" y1="24" x2="472" y2="765"/>

            <line class="geo-draw midpoint-mark" data-start="0.78" data-end="0.90" pathLength="1" x1="426" y1="421" x2="426" y2="439"/>

            <g class="geo-point" data-start="0.08" data-end="0.16"><circle cx="300" cy="430" r="5"/><text x="282" y="454">A</text></g>
            <g class="geo-point" data-start="0.08" data-end="0.16"><circle cx="552" cy="430" r="5"/><text x="562" y="454">B</text></g>
            <g class="geo-point" data-start="0.28" data-end="0.42"><circle cx="418" cy="382" r="5"/><text x="428" y="377">X</text></g>
            <g class="geo-point" data-start="0.31" data-end="0.45"><circle cx="373" cy="111" r="5"/><text x="383" y="106">Y</text></g>
            <g class="geo-point" data-start="0.50" data-end="0.66"><circle cx="157" cy="175" r="5"/><text x="136" y="168">D</text></g>
            <g class="geo-point" data-start="0.50" data-end="0.66"><circle cx="643" cy="31" r="5"/><text x="654" y="38">C</text></g>
            <g class="geo-point accent-point" data-start="0.74" data-end="0.88"><circle cx="479" cy="749" r="6"/><text x="490" y="747">Z</text></g>
            <g class="geo-point accent-point" data-start="0.82" data-end="0.95"><circle cx="426" cy="430" r="5"/><text x="436" y="421">M</text></g>

            <text class="geo-label" data-start="0.18" data-end="0.32" x="181" y="278">ω₁</text>
            <text class="geo-label" data-start="0.25" data-end="0.39" x="721" y="226">ω₂</text>
            <text class="geo-label" data-start="0.45" data-end="0.60" x="690" y="352">ω</text>
            <text class="geo-label line-label" data-start="0.05" data-end="0.16" x="785" y="417">ℓ</text>
          </g>
        </svg>
        <div class="journal-note note-one">radical axes → Z</div>
        <div class="journal-note note-two">M = AB ∩ XY</div>
      </div>`;
    math.insertBefore(mathLayer, math.children[1] || null);
  }

  /* ------------------------------------------------------------------
     CS: full terminal surface + scroll-typed Dijkstra implementation.
  ------------------------------------------------------------------ */
  const cs = $('cs');
  const algorithm = `from heapq import heappush, heappop\n\ndef dijkstra(graph, start):\n    dist = {v: float("inf") for v in graph}\n    dist[start] = 0\n    pq = [(0, start)]\n\n    while pq:\n        cost, node = heappop(pq)\n        if cost != dist[node]:\n            continue\n\n        for nxt, weight in graph[node]:\n            candidate = cost + weight\n            if candidate < dist[nxt]:\n                dist[nxt] = candidate\n                heappush(pq, (candidate, nxt))\n\n    return dist\n\n# shortest paths, built one relaxation at a time`;
  let codeText = null;
  let terminalProgress = null;
  if (cs) {
    const layer = document.createElement('div');
    layer.className = 'parallax-layer cs-parallax';
    layer.setAttribute('aria-hidden','true');
    layer.innerHTML = `
      <div class="terminal-screen">
        <div class="terminal-bar">
          <span class="terminal-dots"><i></i><i></i><i></i></span>
          <span>akhil@portfolio:~/algorithms/dijkstra.py</span>
          <span>PYTHON 3</span>
        </div>
        <div class="terminal-body">
          <div class="terminal-gutter" aria-hidden="true">01<br>02<br>03<br>04<br>05<br>06<br>07<br>08<br>09<br>10<br>11<br>12<br>13<br>14<br>15<br>16<br>17<br>18<br>19<br>20</div>
          <pre><span class="terminal-prompt">$ python dijkstra.py\n</span><span class="code-text"></span><span class="code-caret"></span></pre>
        </div>
        <div class="terminal-status"><span>SCROLL TO COMPILE</span><span class="terminal-progress"><i></i></span><span>O((V+E) log V)</span></div>
      </div>`;
    cs.insertBefore(layer, cs.children[1] || null);
    codeText = layer.querySelector('.code-text');
    terminalProgress = layer.querySelector('.terminal-progress i');
  }

  /* ------------------------------------------------------------------
     FINANCE: scroll-built JNJ candlestick study with amplified swings.
     The OHLC sequence is deliberately stylized for visual storytelling,
     not presented as literal historical JNJ market data.
  ------------------------------------------------------------------ */
  const finance = $('finance');
  let financeLayer = null;
  let financeCandles = [];
  let financeVolumes = [];
  const financeOHLC = [
    [166,171,163,168,31],[169,174,167,171,26],[172,173,164,166,38],[165,177,164,174,45],
    [175,176,167,169,33],[168,181,167,178,49],[179,180,171,173,35],[172,184,171,181,52],
    [182,183,174,176,41],[175,188,174,185,56],[186,187,177,179,47],[178,186,177,183,36],
    [184,185,172,175,58],[174,191,173,188,63],[189,190,179,182,46],[181,194,180,191,61],
    [192,193,183,185,43],[184,192,183,189,39],[190,191,177,180,66],[179,197,178,194,71],
    [195,196,184,187,54],[186,201,185,198,73],[199,201,189,192,51],[191,200,190,196,44],
    [197,198,185,188,68],[187,205,186,202,77],[203,204,192,195,59],[194,209,193,205,82]
  ];
  if (finance) {
    const w = 940, h = 430, padX = 52, padY = 52, volumeFloor = h - 20;
    const min = Math.min(...financeOHLC.map(d=>d[2])) - 4;
    const max = Math.max(...financeOHLC.map(d=>d[1])) + 4;
    const x = i => padX + i/(financeOHLC.length-1)*(w-padX*2);
    const y = v => h-padY - (v-min)/(max-min)*(h-padY*2-34);
    const bodyW = Math.max(9, Math.min(18,(w-padX*2)/financeOHLC.length*.56));
    const maxVol = Math.max(...financeOHLC.map(d=>d[4]));

    const candles = financeOHLC.map((d,i)=>{
      const [open,high,low,close] = d;
      const up = close >= open;
      const yyOpen=y(open), yyClose=y(close), yyHigh=y(high), yyLow=y(low);
      const top=Math.min(yyOpen,yyClose), bh=Math.max(3,Math.abs(yyClose-yyOpen));
      return `<g class="jnj-candle ${up?'up':'down'}" data-candle="${i}">
        <line class="wick" x1="${x(i).toFixed(1)}" y1="${yyHigh.toFixed(1)}" x2="${x(i).toFixed(1)}" y2="${yyLow.toFixed(1)}"/>
        <rect class="body" x="${(x(i)-bodyW/2).toFixed(1)}" y="${top.toFixed(1)}" width="${bodyW.toFixed(1)}" height="${bh.toFixed(1)}"/>
      </g>`;
    }).join('');

    const volumes = financeOHLC.map((d,i)=>{
      const up=d[3]>=d[0], bh=10 + d[4]/maxVol*42;
      return `<rect class="jnj-volume ${up?'up':'down'}" data-volume="${i}" x="${(x(i)-bodyW/2).toFixed(1)}" y="${(volumeFloor-bh).toFixed(1)}" width="${bodyW.toFixed(1)}" height="${bh.toFixed(1)}"/>`;
    }).join('');

    const ma = financeOHLC.map((d,i,arr)=>{
      const lo=Math.max(0,i-4); const chunk=arr.slice(lo,i+1); return chunk.reduce((sum,v)=>sum+v[3],0)/chunk.length;
    });
    const maPath=ma.map((v,i)=>`${i?'L':'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
    const ticks=[Math.ceil(min/10)*10,Math.ceil(min/10)*10+10,Math.ceil(min/10)*10+20,Math.ceil(min/10)*10+30,Math.ceil(min/10)*10+40].filter(v=>v<=max);

    financeLayer = document.createElement('div');
    financeLayer.className = 'parallax-layer finance-parallax';
    financeLayer.setAttribute('aria-hidden','true');
    financeLayer.innerHTML = `
      <div class="jnj-board">
        <div class="jnj-heading"><strong>JNJ</strong><span>Johnson & Johnson</span><span>28 sessions / volatility amplified</span></div>
        <svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
          <g class="jnj-grid">
            ${ticks.map(v=>`<line x1="${padX}" y1="${y(v)}" x2="${w-padX}" y2="${y(v)}"/><text x="4" y="${y(v)+4}">$${v}</text>`).join('')}
            ${[0,7,14,21,27].map(i=>`<line x1="${x(i)}" y1="${padY}" x2="${x(i)}" y2="${h-padY}"/>`).join('')}
          </g>
          <path class="jnj-ma" d="${maPath}"/>
          <g class="jnj-candles">${candles}</g>
          <g class="jnj-volumes">${volumes}</g>
          <circle class="jnj-cursor" r="5" cx="${x(0)}" cy="${y(financeOHLC[0][3])}"/>
          <g class="jnj-price-tag"><rect x="${w-82}" y="${y(financeOHLC[0][3])-11}" width="72" height="22" rx="2"/><text x="${w-46}" y="${y(financeOHLC[0][3])+4}" text-anchor="middle">$${financeOHLC[0][3]}</text></g>
        </svg>
        <div class="jnj-axis"><span>EARLY</span><span>STYLIZED JNJ STUDY / AMPLIFIED VOLATILITY</span><span>RECENT</span></div>
      </div>`;
    finance.insertBefore(financeLayer, finance.children[1] || null);
    financeCandles = Array.from(financeLayer.querySelectorAll('.jnj-candle'));
    financeVolumes = Array.from(financeLayer.querySelectorAll('.jnj-volume'));
  }

  function progress(section) {
    const r = section.getBoundingClientRect();
    const vh = innerHeight;
    return clamp((vh - r.top) / (r.height + vh * .25));
  }

  function updateGeometry(p) {
    if (!mathLayer) return;
    mathLayer.querySelectorAll('[data-start]').forEach(el => {
      const start = Number(el.dataset.start || 0);
      const end = Number(el.dataset.end || 1);
      const v = local(p,start,end);
      el.style.setProperty('--draw', v.toFixed(4));
      if (el.classList.contains('geo-draw')) el.style.strokeDashoffset = String(1 - v);
      else el.style.opacity = String(v);
    });
    mathLayer.style.setProperty('--math-p', p.toFixed(4));
  }

  function updateFinance(p) {
    if (!financeLayer) return;
    const q = clamp(p);
    financeLayer.style.setProperty('--fin-p', q.toFixed(4));
    const count = financeCandles.length;
    let lastVisible = -1;
    financeCandles.forEach((c,i)=>{
      const start = i / Math.max(1,count) * .9;
      const v = local(q,start,start+.09);
      c.style.opacity = String(v);
      c.style.transform = `translateY(${(1-v)*8}px) scaleY(${(.82+.18*v).toFixed(3)})`;
      if (v > .5) lastVisible = i;
    });
    financeVolumes.forEach((bar,i)=>{
      const start = i / Math.max(1,count) * .9;
      const v = local(q,start,start+.08);
      bar.style.opacity = String(v*.92);
      bar.style.transform = `scaleY(${(.18+.82*v).toFixed(3)})`;
    });
    const cursor = financeLayer.querySelector('.jnj-cursor');
    const tag = financeLayer.querySelector('.jnj-price-tag');
    if (lastVisible >= 0) {
      const candle = financeCandles[lastVisible];
      const body = candle.querySelector('.body');
      const x = Number(body.getAttribute('x')) + Number(body.getAttribute('width'))/2;
      const d = financeOHLC[lastVisible];
      const boardSvg = candle.ownerSVGElement;
      const h = 430, padY = 52;
      const min = Math.min(...financeOHLC.map(v=>v[2])) - 4;
      const max = Math.max(...financeOHLC.map(v=>v[1])) + 4;
      const yy = h-padY - (d[3]-min)/(max-min)*(h-padY*2-34);
      cursor?.setAttribute('cx', x.toFixed(2));
      cursor?.setAttribute('cy', yy.toFixed(2));
      if (cursor) cursor.style.opacity = String(Math.min(1,q*3));
      if (tag) {
        tag.style.opacity = String(Math.min(1,q*3));
        const rect=tag.querySelector('rect'), text=tag.querySelector('text');
        rect?.setAttribute('y',(yy-11).toFixed(2));
        text?.setAttribute('y',(yy+4).toFixed(2));
        if (text) text.textContent = `$${d[3].toFixed(2)}`;
      }
    }
  }

  let ticking = false;
  function draw() {
    ticking = false;
    const mp = math ? progress(math) : 0;
    const cp = cs ? progress(cs) : 0;
    const fp = finance ? progress(finance) : 0;

    updateGeometry(mp);

    if (codeText) {
      const typed = Math.round(algorithm.length * clamp(cp * 1.08));
      codeText.textContent = algorithm.slice(0, typed);
    }
    if (terminalProgress) terminalProgress.style.width = `${Math.round(cp*100)}%`;
    if (cs) cs.style.setProperty('--code-p', cp.toFixed(4));

    updateFinance(fp);
  }

  function request() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(draw);
    }
  }

  addEventListener('scroll', request, {passive:true});
  addEventListener('resize', request);
  addEventListener('themechange', request);
  request();

  if (reduced.matches) {
    updateGeometry(1);
    if (codeText) codeText.textContent = algorithm;
    if (terminalProgress) terminalProgress.style.width = '100%';
    updateFinance(1);
  }
})();
