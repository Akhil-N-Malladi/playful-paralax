(() => {
'use strict';
const $=id=>document.getElementById(id), reduced=matchMedia('(prefers-reduced-motion: reduce)');
const nodes=[
['club',0,0,'Grade 7','The first math team','Selected for the middle-school math competition club.'],
['amc8',0,1,'Grade 8','AMC 8 · 17','The beginning of a competition-math foundation.'],
['amc10',0,2,'Grades 9–10','AMC 10 → AIME','From an AMC 10 score of 72 in grade 9 to 99 and AIME qualification in grade 10.'],
['amc12',0,3,'Grade 11','AMC 12 · 123 / AIME · 8','Competition preparation developed creative reasoning and persistence.','major'],
['study',0,4,'Independent study','Beyond the syllabus','Linear algebra, discrete mathematics, real analysis and calculus, supported by the books on this site.'],
['sumac',0,5,'Summer study','Stanford SUMaC','Track I: abstract algebra. Advanced study builds on competition mathematics.'],
['usamo',0,6,'Future goal','USAMO qualification','An ambition for grade 12; not yet achieved.','future'],
['java',1,0,'Grade 9','Learning Java','School coursework introduced programming and algorithmic problem solving.'],
['python',1,1,'Grade 10','Java → Python','Applied programming skills to machine learning and severe-weather prediction.'],
['weather',1,2,'Project','Severe weather AI','Weather prediction project and Presidential AI Challenge participation.'],
['cac',1,3,'Congressional App Challenge','Weather, made visible','The weather project extended into an interactive app. See the live project and its map above.','major'],
['scrape',1,4,'Summer after grade 10','Small tools, useful answers','Grade scraping, Google Sheets analysis and social-post research.'],
['usaco',1,5,'Algorithms','USACO Silver','Logical and creative thinking from mathematics carries into programming.'],
['quant',1,6,'Currently building','A healthcare quant pipeline','An ensemble of models exploring healthcare, biomedical and pharmaceutical stocks.'],
['unt',2,2,'Research internship','University of North Texas','Machine learning and biology research, building on programming and mathematical reasoning.'],
['papers',2,3,'Computational epidemiology','Dataset → analysis → action','Three research strands: a documented dataset, disease-spread analysis and recommendations for public action.'],
['txsef',2,4,'Texas Science & Engineering Fair','1st place · TXSEF','Category winner in computational epidemiology.','major'],
['upenn',2,5,'Research','UPenn · Game theory','Research connecting mathematical thinking with strategic decisions.'],
['deca10',3,1,'Grade 10','DECA · 33 / 1,700+','First Stock Market Game season developed experience with markets and team decisions.'],
['deca11',3,2,'Grade 11','DECA · 12 / 1,600+','A subsequent season brought ICDC qualification and reported portfolio growth of 114%.'],
['icdc',3,3,'International competition','DECA ICDC · 14 / 100','Stock Market Game team finish at ICDC.','major'],
['wharton',3,4,'Wharton Global Youth','Wharton semifinalist','Team leadership, client-focused risk constraints, research and quantitative strategy.','major'],
['models',3,5,'Research & risk','Models meet judgment','Markov chains, hidden Markov models, Monte Carlo, Granger analysis and XGBoost inform research.']
];
const edges=[['club','amc8'],['amc8','amc10'],['amc10','amc12'],['amc12','study'],['study','sumac'],['amc12','usamo'],['java','python'],['python','weather'],['weather','cac'],['java','scrape'],['amc12','usaco'],['java','usaco'],['amc10','unt'],['weather','unt'],['unt','papers'],['papers','txsef'],['unt','upenn'],['amc12','upenn'],['study','upenn'],['deca10','deca11'],['deca11','icdc'],['deca11','wharton'],['scrape','wharton'],['amc12','wharton'],['wharton','models'],['models','quant'],['scrape','quant'],['papers','quant'],['upenn','quant']];
const wrap=$('journey-nodes'),svg=$('journey-edges');
nodes.forEach(([id,col,row,era,title,desc,type])=>{const b=document.createElement('button');b.type='button';b.className='journey-node '+(type||'');b.id='j-'+id;b.style.left=(col*275+24)+'px';b.style.top=(row*137+80)+'px';b.innerHTML=`<span>${era}</span><strong>${title}</strong><small>${type==='future'?'Future ambition':type==='major'?'Selected achievement':'Explore connections'} ↗</small>`;b.setAttribute('aria-pressed','false');b.addEventListener('click',()=>select(id));wrap.appendChild(b);});
const ns='http://www.w3.org/2000/svg';
edges.forEach(([a,b])=>{const n=nodes.find(n=>n[0]===a),m=nodes.find(n=>n[0]===b),p=document.createElementNS(ns,'path');let x=n[1]*275+139,y=n[2]*137+179,X=m[1]*275+139,Y=m[2]*137+80;
if(n[1]!==m[1]){x=n[1]*275+(m[1]>n[1]?254:24);X=m[1]*275+(m[1]>n[1]?24:254);y=n[2]*137+130;Y=m[2]*137+130;}
p.setAttribute('d',`M ${x} ${y} C ${x} ${(y+Y)/2}, ${X} ${(y+Y)/2}, ${X} ${Y}`);p.dataset.a=a;p.dataset.b=b;if(m[6]==='future')p.classList.add('future');svg.appendChild(p);});
function select(id){const linked=new Set([id]);edges.forEach(([a,b])=>{if(a===id)linked.add(b);if(b===id)linked.add(a);});nodes.forEach(n=>{const e=$('j-'+n[0]);e.classList.toggle('dim',!linked.has(n[0]));e.classList.toggle('selected',n[0]===id);e.setAttribute('aria-pressed',String(n[0]===id));});svg.querySelectorAll('path').forEach(p=>{const active=p.dataset.a===id||p.dataset.b===id;p.classList.toggle('active',active);p.classList.toggle('dim',!active);});const n=nodes.find(n=>n[0]===id);$('journey-detail').textContent=n[4]+' — '+n[5];}
$('journey-reset').onclick=()=>{wrap.querySelectorAll('button').forEach(n=>{n.classList.remove('dim','selected');n.setAttribute('aria-pressed','false');});svg.querySelectorAll('path').forEach(p=>p.classList.remove('dim','active'));$('journey-detail').textContent='Select any milestone. Solid lines connect experiences; dashed lines lead to future goals.';};
// A projected parametric knot: one continuous thread, many connections.
const canvas=$('sculpture'),ctx=canvas.getContext('2d');let angle=.3,paused=reduced.matches,visible=true,frame=0;
function draw(){const w=canvas.clientWidth,h=canvas.clientHeight,dpr=Math.min(devicePixelRatio||1,2);canvas.width=w*dpr;canvas.height=h*dpr;ctx.scale(dpr,dpr);const dark=document.documentElement.dataset.theme==='dark';ctx.clearRect(0,0,w,h);const points=[];for(let i=0;i<=420;i++){const t=i/420*Math.PI*2,x=(2+Math.cos(3*t))*Math.cos(2*t),y=(2+Math.cos(3*t))*Math.sin(2*t),z=Math.sin(3*t),X=x*Math.cos(angle)-z*Math.sin(angle),Z=x*Math.sin(angle)+z*Math.cos(angle);points.push([w/2+X*w*.115,h/2+(y*.72+Z*.5)*w*.115,Z]);}
for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i];ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.strokeStyle=`hsla(${155+(b[2]+3)*9},${dark?35:27}%,${dark?62:33}%,${.35+(b[2]+3)/9})`;ctx.lineWidth=2.5+(b[2]+3)*.65;ctx.stroke();}
for(let i=0;i<points.length;i+=35){const a=points[i];ctx.beginPath();ctx.arc(a[0],a[1],4,0,Math.PI*2);ctx.fillStyle=dark?'#efa28b':'#b74e36';ctx.fill();}
}
function loop(){frame=0;if(paused||!visible||document.hidden)return;angle+=.003;draw();frame=requestAnimationFrame(loop);}
function start(){if(!frame&&!paused&&visible&&!document.hidden)frame=requestAnimationFrame(loop);}
function sync(){const b=$('orbit-toggle');b.textContent=paused?'Resume motion ▷':'Pause motion Ⅱ';b.setAttribute('aria-pressed',String(paused));if(paused){cancelAnimationFrame(frame);frame=0;}else start();}
$('orbit-toggle').onclick=()=>{paused=!paused;sync();};reduced.addEventListener('change',()=>{paused=reduced.matches;sync();});new ResizeObserver(draw).observe(canvas);new IntersectionObserver(e=>{visible=e[0].isIntersecting;if(visible)start();}).observe(canvas);document.addEventListener('visibilitychange',start);window.addEventListener('themechange',draw);draw();sync();
})();
