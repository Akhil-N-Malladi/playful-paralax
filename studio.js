(() => {
  'use strict';

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const map = document.getElementById('journey-map');
  const wrap = document.getElementById('journey-nodes');
  const svg = document.getElementById('journey-edges');
  const edgeLayer = document.getElementById('journey-edge-layer');
  const travelerLayer = document.getElementById('journey-travelers');
  const resetButton = document.getElementById('journey-reset');
  const descriptor = document.getElementById('journey-descriptor');
  const descriptorEra = document.getElementById('journey-descriptor-era');
  const descriptorTitle = document.getElementById('journey-descriptor-title');
  const descriptorText = document.getElementById('journey-descriptor-text');
  if (!map || !wrap || !svg || !edgeLayer || !travelerLayer) return;

  const ns = 'http://www.w3.org/2000/svg';
  const rows = 8;
  const milestones = [
    {id:'club',cat:'math',col:0,row:0,era:'Grade 7',title:'Math competition club',section:'#math',desc:'I was one of 25 students selected from about 300 for my middle school math competition club.'},
    {id:'amc8',cat:'math',col:0,row:1,era:'Grade 8',title:'AMC 8 · 17',section:'#math',desc:'My first major competition result. I scored 17 on the AMC 8 and started building a stronger competition math foundation.'},
    {id:'amc10',cat:'math',col:0,row:2,era:'Grades 9-10',title:'AMC 10 · AIME qualifier',section:'#math',desc:'I moved from a 75 on the AMC 10 in grade 9 to a 99 in grade 10 and qualified for AIME.'},
    {id:'amc12',cat:'math',col:0,row:3,era:'Grade 11',title:'AMC 12 · 123',section:'#math',major:true,desc:'I scored 123 on the AMC 12. The result reflects several years of focused problem solving across algebra, geometry, counting, and number theory.'},
    {id:'aime',cat:'math',col:0,row:4,era:'Grade 11',title:'AIME · 8',section:'#math',major:true,desc:'I scored 8 on AIME after qualifying through the AMC 12. I finished among the top 15 percent of AIME scorers.'},
    {id:'study',cat:'math',col:0,row:5,era:'Independent study',title:'Beyond the syllabus',section:'#math',desc:'Outside school, I have studied multivariable calculus, discrete math, real analysis, linear algebra, and I am now learning abstract algebra.'},
    {id:'sumac',cat:'math',col:0,row:6,era:'Summer study',title:'Stanford SUMaC · Track 1',section:'#sumac-experience',stanford:true,desc:'I was accepted to Stanford SUMaC Track 1, focused on abstract algebra and proof-based mathematics.'},
    {id:'usamo',cat:'math',col:0,row:7,era:'Future goal',title:'USAMO qualification',section:'#math',future:true,desc:'USAMO qualification is a future goal. It is not listed as a completed achievement.'},

    {id:'java',cat:'code',col:1,row:1,era:'Grade 9',title:'Learning Java',section:'#cs',desc:'I learned Java in CSI at school, where I first built a foundation in programming and algorithmic problem solving.'},
    {id:'python',cat:'code',col:1,row:2,era:'Grade 10',title:'Java to Python',section:'#cs',desc:'I moved from Java into Python so I could build machine learning, automation, web scraping, and mathematical modeling projects.'},
    {id:'ai',cat:'code',col:1,row:3,era:'Presidential AI Challenge',title:'Presidential AI Challenge',section:'#weather-project',desc:'I participated in the Presidential AI Challenge with my severe weather prediction project. I later submitted the same project to the Congressional App Challenge.'},
    {id:'weather',cat:'code',col:1,row:4,era:'Project',title:'Severe weather prediction',section:'#weather-project',desc:'I built a severe weather prediction project that combined code, machine learning, and real weather data into a usable web experience.'},
    {id:'cac',cat:'code',col:1,row:5,era:'App challenge',title:'Congressional App Challenge',section:'#weather-project',major:true,desc:'I submitted the severe weather project to the Congressional App Challenge and turned it into an interactive web app for exploring weather risk.'},
    {id:'scrape',cat:'code',col:1,row:6,era:'Applied at school',title:'School data automation',section:'#cs',desc:'I built a grade scraper that collects school grade data, sends it to Google Sheets, and runs regression and other calculations so I can analyze performance without repetitive manual work.'},
    {id:'usaco',cat:'code',col:1,row:7,era:'Algorithms',title:'USACO Silver',section:'#cs',desc:'I reached USACO Silver, using Java and algorithmic problem solving to work through timed programming problems.'},

    {id:'unt',cat:'research',col:2,row:3,era:'Research internship',title:'University of North Texas',section:'#unt-experience',desc:'I worked on machine learning and biology research at UNT, including a cross-country study of factors that affect infectious disease outbreak spread.'},
    {id:'papers',cat:'research',col:2,row:4,era:'Computational epidemiology',title:'Dataset, analysis, action',section:'#research',desc:'The work is being published as three papers across Q2 journals: one documents the dataset, one analyzes disease spread with machine learning, and one develops public-action recommendations from the findings.'},
    {id:'txsef',cat:'research',col:2,row:5,era:'Texas science fair',title:'TXSEF · 1st place',section:'#research',major:true,desc:'My computational epidemiology research won 1st place in its category at the Texas Science and Engineering Fair.'},
    {id:'upenn',cat:'research',col:2,row:6,era:'Research',title:'UPenn · Game theory research',section:'#upenn-experience',desc:'I worked on game theory research through the University of Pennsylvania, connecting mathematical reasoning with strategic decision making.'},

    {id:'deca10',cat:'markets',col:3,row:2,era:'Grade 10',title:'DECA · 33 / 1,700+',section:'#finance',desc:'In my first DECA Stock Market Game season, my team finished 33rd out of more than 1,700 teams.'},
    {id:'deca11',cat:'markets',col:3,row:3,era:'Grade 11',title:'DECA · 12 / 1,600+',section:'#finance',desc:'The next season, my team finished 12th out of more than 1,600 teams and qualified for ICDC.'},
    {id:'icdc',cat:'markets',col:3,row:4,era:'International',title:'DECA ICDC · 14 / 100',section:'#finance',major:true,desc:'At ICDC, my team finished 14th out of 100 teams in the Stock Market Game.'},
    {id:'wharton',cat:'markets',col:3,row:5,era:'Wharton Global Youth',title:'Wharton semifinalist',section:'#wharton-experience',major:true,desc:'As team leader and quantitative lead, I set investment guidelines, built research and risk models, consolidated team findings, and helped turn the case into a coherent portfolio strategy.'},
    {id:'quant',cat:'markets',col:3,row:6,era:'Current work',title:'Healthcare quant pipeline',section:'#finance',desc:'I am building a quantitative research pipeline for healthcare, biomedical, and pharmaceutical stocks, combining multiple signals to study long-term market inefficiencies.'}
  ];

  const edges = [
    ['club','amc8'],['amc8','amc10'],['amc10','amc12'],['amc12','aime'],
    ['amc12','study'],['amc12','sumac'],['aime','sumac'],['amc12','usamo'],
    ['java','python'],['python','ai'],['ai','weather'],['ai','cac'],['weather','cac'],
    ['java','scrape'],['java','usaco'],['amc12','usaco'],['amc10','unt'],['weather','unt'],
    ['unt','papers'],['papers','txsef'],['unt','upenn'],['amc12','upenn'],
    ['deca10','deca11'],['deca11','icdc'],['deca11','wharton'],['scrape','wharton'],
    ['amc12','wharton'],['wharton','quant'],['scrape','quant'],['papers','quant'],['upenn','quant']
  ];

  milestones.forEach(node => {
    const el = document.createElement('article');
    el.className = `journey-node ${node.cat}${node.major ? ' major' : ''}${node.future ? ' future' : ''}${node.stanford ? ' stanford-node' : ''}`;
    el.id = `j-${node.id}`;
    el.tabIndex = 0;
    el.setAttribute('role','button');
    el.setAttribute('aria-pressed','false');
    el.setAttribute('aria-label',`${node.title}. ${node.era}. Click to show direct connections.`);
    el.innerHTML = `<span>${node.era}</span><strong>${node.title}</strong><a class="journey-jump" href="${node.section}">Go to section</a>`;
    wrap.appendChild(el);
    node.el = el;
  });

  const byId = new Map(milestones.map(n => [n.id,n]));
  const edgeObjects = edges.map(([a,b],index) => {
    const path = document.createElementNS(ns,'path');
    path.classList.add('journey-edge');
    path.dataset.a = a;
    path.dataset.b = b;
    path.id = `journey-edge-${index}`;
    if (byId.get(b)?.future) path.classList.add('future');
    edgeLayer.appendChild(path);
    return {a,b,path,index};
  });

  let selectedId = null;
  let travelerAnimations = [];

  function layout(){
    const width = map.clientWidth;
    const height = map.clientHeight;
    const sidePad = Math.max(48,Math.min(130,width * .12));
    const topPad = 82;
    const bottomPad = 42;
    const usableW = Math.max(1,width - sidePad * 2);
    const usableH = Math.max(1,height - topPad - bottomPad);
    const colGap = usableW / 3;
    const rowGap = usableH / (rows - 1);
    const baseNodeW = Math.max(76,Math.min(178,colGap * .74));

    milestones.forEach(node => {
      let x = sidePad + node.col * colGap;
      let y = topPad + node.row * rowGap;
      node.x = x;
      node.y = y;
      node.el.style.width = `${baseNodeW}px`;
      const h = node.el.offsetHeight || 66;
      node.w = baseNodeW;
      node.h = h;
      node.el.style.transform = `translate(${(x-baseNodeW/2).toFixed(1)}px,${(y-h/2).toFixed(1)}px)`;
    });

    svg.setAttribute('viewBox',`0 0 ${width} ${height}`);
    travelerLayer.setAttribute('viewBox',`0 0 ${width} ${height}`);
    edgeObjects.forEach((edge,index) => edge.path.setAttribute('d',routeFor(byId.get(edge.a),byId.get(edge.b),index)));
  }

  function distancePointToSegment(px,py,x1,y1,x2,y2){
    const dx=x2-x1,dy=y2-y1,l2=dx*dx+dy*dy;
    if(!l2)return Math.hypot(px-x1,py-y1);
    let t=((px-x1)*dx+(py-y1)*dy)/l2;
    t=Math.max(0,Math.min(1,t));
    return Math.hypot(px-(x1+t*dx),py-(y1+t*dy));
  }

  function routeFor(a,b,index){
    const A={x:a.x,y:a.y},B={x:b.x,y:b.y};
    const dx=B.x-A.x,dy=B.y-A.y;
    if(Math.abs(dx)<8){
      const bend=(index%2?1:-1)*16;
      return `M ${A.x.toFixed(1)} ${A.y.toFixed(1)} C ${(A.x+bend).toFixed(1)} ${(A.y+dy*.33).toFixed(1)}, ${(B.x+bend).toFixed(1)} ${(A.y+dy*.67).toFixed(1)}, ${B.x.toFixed(1)} ${B.y.toFixed(1)}`;
    }
    const len=Math.max(1,Math.hypot(dx,dy));
    const nx=-dy/len,ny=dx/len;
    let offset=(index%3-1)*14;
    for(const other of milestones){
      if(other===a||other===b)continue;
      if(distancePointToSegment(other.x,other.y,A.x,A.y,B.x,B.y)<Math.max(52,(other.w||150)*.42)){
        const cross=dx*(other.y-A.y)-dy*(other.x-A.x);
        offset += cross>=0 ? -38 : 38;
      }
    }
    offset=Math.max(-110,Math.min(110,offset));
    const mx=(A.x+B.x)/2+nx*offset;
    const my=(A.y+B.y)/2+ny*offset;
    return `M ${A.x.toFixed(1)} ${A.y.toFixed(1)} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${B.x.toFixed(1)} ${B.y.toFixed(1)}`;
  }

  function connectedIds(id){
    const set=new Set([id]);
    edges.forEach(([a,b])=>{if(a===id)set.add(b);if(b===id)set.add(a);});
    return set;
  }

  function stopTravelers(){
    travelerAnimations.forEach(id=>cancelAnimationFrame(id));
    travelerAnimations=[];
    travelerLayer.replaceChildren();
  }

  function pulseNode(id){
    const node=byId.get(id);
    if(!node)return;
    node.el.classList.remove('pulse');
    void node.el.offsetWidth;
    node.el.classList.add('pulse');
    setTimeout(()=>node.el.classList.remove('pulse'),620);
  }

  function animateEdge(edge,fromId,delay){
    if(reduced.matches)return;
    setTimeout(()=>{
      if(selectedId!==fromId)return;
      const length=edge.path.getTotalLength();
      const reverse=edge.b===fromId;
      const dot=document.createElementNS(ns,'circle');
      dot.setAttribute('r','5.5');
      dot.setAttribute('class','journey-traveler');
      travelerLayer.appendChild(dot);
      const start=performance.now();
      const duration=720;
      const move=now=>{
        if(selectedId!==fromId){dot.remove();return;}
        const t=Math.min(1,(now-start)/duration);
        const eased=1-Math.pow(1-t,3);
        const at=reverse?1-eased:eased;
        const pt=edge.path.getPointAtLength(length*at);
        dot.setAttribute('cx',pt.x.toFixed(2));
        dot.setAttribute('cy',pt.y.toFixed(2));
        if(t<1){
          const id=requestAnimationFrame(move);
          travelerAnimations.push(id);
        }else{
          const target=reverse?edge.a:edge.b;
          pulseNode(target);
          setTimeout(()=>dot.remove(),120);
        }
      };
      const id=requestAnimationFrame(move);
      travelerAnimations.push(id);
    },delay);
  }

  function updateDescriptor(node){
    if(!descriptor || !descriptorEra || !descriptorTitle || !descriptorText || !node)return;
    descriptorEra.textContent=node.era;
    descriptorTitle.textContent=node.title;
    descriptorText.textContent=node.desc;
    descriptor.classList.add('has-selection');
  }

  function selectNode(id,animate=true){
    stopTravelers();
    selectedId=id;
    updateDescriptor(byId.get(id));
    const linked=connectedIds(id);
    milestones.forEach(node=>{
      const isSelected=node.id===id;
      const isNeighbor=linked.has(node.id)&&!isSelected;
      node.el.classList.toggle('selected',isSelected);
      node.el.classList.toggle('neighbor',isNeighbor);
      node.el.classList.toggle('dim',!linked.has(node.id));
      node.el.setAttribute('aria-pressed',String(isSelected));
    });
    let delay=0;
    edgeObjects.forEach(edge=>{
      const active=edge.a===id||edge.b===id;
      edge.path.classList.toggle('active',active);
      edge.path.classList.toggle('dim',!active);
      if(active&&animate){animateEdge(edge,id,delay);delay+=85;}
    });
    pulseNode(id);
  }

  milestones.forEach(node=>{
    node.el.addEventListener('click',event=>{
      if(event.target.closest('.journey-jump'))return;
      selectNode(node.id,true);
    });
    node.el.addEventListener('keydown',event=>{
      if((event.key==='Enter'||event.key===' ')&&!event.target.closest('.journey-jump')){
        event.preventDefault();
        selectNode(node.id,true);
      }
    });
  });

  function reset(){
    stopTravelers();
    selectedId=null;
    milestones.forEach(node=>{
      node.el.classList.remove('selected','neighbor','dim','pulse');
      node.el.setAttribute('aria-pressed','false');
    });
    edgeObjects.forEach(edge=>edge.path.classList.remove('active','dim'));
    if(descriptor && descriptorEra && descriptorTitle && descriptorText){
      descriptorEra.textContent='Select a milestone';
      descriptorTitle.textContent='A little more context';
      descriptorText.textContent='Click any node to see what it meant, what I built or learned, and how it connects to the next step.';
      descriptor.classList.remove('has-selection');
    }
  }

  resetButton?.addEventListener('click',reset);
  const ro=new ResizeObserver(layout);
  ro.observe(map);
  window.addEventListener('load',layout,{once:true});
  reduced.addEventListener('change',()=>{if(reduced.matches)stopTravelers();});
  layout();
})();
