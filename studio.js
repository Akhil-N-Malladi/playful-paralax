(() => {
  'use strict';

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const shell = document.getElementById('journey-shell');
  const stage = document.getElementById('journey-stage');
  const map = document.getElementById('journey-map');
  const canvas = document.getElementById('journey-canvas');
  const wrap = document.getElementById('journey-nodes');
  const edgeLayer = document.getElementById('journey-edge-layer');
  const travelerLayer = document.getElementById('journey-travelers');
  const resetButton = document.getElementById('journey-reset');
  const expandButton = document.getElementById('journey-expand');
  const closeButton = document.getElementById('journey-close');
  const descriptor = document.getElementById('journey-descriptor');
  const descriptorEra = document.getElementById('journey-descriptor-era');
  const descriptorTitle = document.getElementById('journey-descriptor-title');
  const descriptorText = document.getElementById('journey-descriptor-text');
  const descriptorLink = document.getElementById('journey-descriptor-link');
  if (!shell || !stage || !map || !canvas || !wrap || !edgeLayer || !travelerLayer) return;

  const WIDTH = 1800;
  const HEIGHT = 1200;
  const CX = WIDTH / 2;
  const CY = HEIGHT / 2;
  const NODE_W = 174;
  const NODE_H = 74;
  const ns = 'http://www.w3.org/2000/svg';
  const ringRX = [120, 330, 520, 700, 780];
  const ringRY = [70, 205, 320, 435, 500];

  const milestones = [
    {id:'club',cat:'math',ring:0,angle:210,era:'Grade 7',title:'Math competition club',section:'#math',desc:'I was one of 25 students selected from about 300 for my middle-school math competition club. It was my first structured step into competition math.'},
    {id:'java',cat:'code',ring:0,angle:30,era:'Grade 9',title:'Learning Java',section:'#cs',desc:'I learned Java through CSI at school. That course introduced me to programming, algorithms, and the habit of turning a problem into a sequence of precise steps.'},

    {id:'amc8',cat:'math',ring:1,angle:240,era:'Grade 8',title:'AMC 8 · 17',section:'#math',desc:'My AMC 8 score of 17 gave me an early competition-math baseline and showed me where I needed stronger algebra, geometry, counting, and number theory.'},
    {id:'python',cat:'code',ring:1,angle:345,era:'Grade 10',title:'Java to Python',section:'#cs',desc:'I expanded from Java into Python so I could work faster with machine learning, automation, web scraping, and mathematical modeling.'},
    {id:'deca10',cat:'markets',ring:1,angle:150,era:'Grade 10',title:'DECA · 33 / 1,700+',section:'#finance',desc:'My first DECA Stock Market Game season finished 33rd out of more than 1,700 teams. It gave me practical experience with markets, research, and team decisions.'},

    {id:'amc10',cat:'math',ring:2,angle:225,era:'Grades 9-10',title:'AMC 10 · AIME qualifier',section:'#math',desc:'I moved from an AMC 10 score of 75 in grade 9 to 99 in grade 10, which qualified me for AIME and pushed me toward deeper competition preparation.'},
    {id:'presai',cat:'code',ring:2,angle:320,era:'AI challenge',title:'Presidential AI Challenge',section:'#weather-project',desc:'I participated in the Presidential AI Challenge with my severe-weather project. I used Python and machine learning to build the project, then submitted the same core project to the Congressional App Challenge.'},
    {id:'weather',cat:'code',ring:2,angle:15,era:'Project',title:'Severe weather project',section:'#weather-project',desc:'I built a severe-weather prediction project that combines code, machine learning, and a web interface to make weather-risk information easier to explore.'},
    {id:'unt',cat:'research',ring:2,angle:80,era:'Research internship',title:'University of North Texas',section:'#unt-experience',desc:'At UNT, I worked on computational epidemiology research that combined machine learning and biology, including disease-spread data, modeling, and public-health interpretation.'},
    {id:'deca11',cat:'markets',ring:2,angle:125,era:'Grade 11',title:'DECA · 12 / 1,600+',section:'#finance',desc:'In the next Stock Market Game season, my team finished 12th out of more than 1,600 teams, qualified for ICDC, and reported 114% portfolio growth.'},

    {id:'amc12',cat:'math',ring:3,angle:205,era:'Grade 11',title:'AMC 12 · 123',section:'#math',major:true,desc:'I scored 123 on the AMC 12. The result reflects the shift from learning standard methods to recognizing structure, invariants, and less obvious problem-solving ideas.'},
    {id:'aime',cat:'math',ring:3,angle:235,era:'Grade 11',title:'AIME · 8',section:'#math',major:true,desc:'I scored 8 on AIME after qualifying through AMC 12. The experience pushed me further into late-AIME problem solving and more advanced olympiad-style techniques.'},
    {id:'study',cat:'math',ring:3,angle:270,era:'Independent study',title:'Beyond the syllabus',section:'#math',desc:'Outside school, I have studied Calculus III, discrete mathematics, real analysis, and linear algebra, and I am now learning abstract algebra.'},
    {id:'school',cat:'code',ring:3,angle:310,era:'Applied at school',title:'School data automation',section:'#cs',desc:'I built a grade scraper that uploads grades to Google Sheets and runs regression and other calculations. It is a practical example of using automation to remove repetitive school work.'},
    {id:'usaco',cat:'code',ring:3,angle:345,era:'Algorithms',title:'USACO Silver',section:'#cs',desc:'I reached USACO Silver using Java. Competitive programming strengthened the algorithmic side of my coding and connected naturally with competition-math problem solving.'},
    {id:'cac',cat:'code',ring:3,angle:25,era:'App challenge',title:'Congressional App Challenge',section:'#weather-project',major:true,desc:'I submitted the same severe-weather project to the Congressional App Challenge, extending it into an interactive web application that lets users explore weather risk.'},
    {id:'papers',cat:'research',ring:3,angle:100,era:'Publication work',title:'Dataset, analysis, action',section:'#research',desc:'The UNT work is being structured into three papers for Q2 journals: a dataset paper, a machine-learning analysis of disease spread, and a paper focused on public-action recommendations from the results.'},

    {id:'icdc',cat:'markets',ring:4,angle:155,era:'International',title:'DECA ICDC · 14 / 100',section:'#finance',major:true,desc:'At DECA ICDC, my Stock Market Game team finished 14th out of 100 teams in the international field.'},
    {id:'wharton',cat:'markets',ring:4,angle:180,era:'Wharton Global Youth',title:'Semifinalist',section:'#wharton-experience',major:true,desc:'As team leader and quantitative lead, I set investment guidelines, built research and modeling pipelines, consolidated team findings, and helped translate the case-study client into portfolio and risk decisions.'},
    {id:'txsef',cat:'research',ring:4,angle:70,era:'Texas science fair',title:'TXSEF · 1st place',section:'#research',major:true,desc:'My computational epidemiology work won 1st place in its category at the Texas Science and Engineering Fair.'},
    {id:'upenn',cat:'research',ring:4,angle:115,era:'Research',title:'UPenn · Game theory research',section:'#upenn-experience',desc:'I worked on game theory research at the University of Pennsylvania, extending my mathematical interests into strategic decision-making and formal models of interaction.'},
    {id:'sumac',cat:'math',ring:4,angle:245,era:'Summer study',title:'Stanford SUMaC · Track 1',section:'#sumac-experience',stanford:true,desc:'I attended Stanford SUMaC Track 1, focused on abstract algebra. It connects my competition-math background with more proof-based university mathematics.'},
    {id:'quant',cat:'markets',ring:4,angle:10,era:'Current work',title:'Healthcare quant pipeline',section:'#finance',desc:'I am building a healthcare-focused quantitative research pipeline that combines multiple signals, tests where they hold up, and looks for persistent long-term market inefficiencies.'},
    {id:'usamo',cat:'math',ring:4,angle:285,era:'Future goal',title:'USAMO qualification',section:'#math',future:true,desc:'USAMO qualification is a future goal. It represents the next step in the competition-math path rather than a completed achievement.'}
  ];

  const edges = [
    ['club','amc8'],['amc8','amc10'],['amc10','amc12'],['amc12','aime'],
    ['amc12','study'],['amc12','sumac'],['aime','sumac'],['amc12','usamo'],
    ['java','python'],['python','presai'],['presai','weather'],['presai','cac'],['weather','cac'],
    ['java','school'],['java','usaco'],['amc12','usaco'],
    ['amc10','unt'],['weather','unt'],['unt','papers'],['papers','txsef'],['unt','upenn'],['amc12','upenn'],
    ['deca10','deca11'],['deca11','icdc'],['deca11','wharton'],['school','wharton'],['amc12','wharton'],
    ['wharton','quant'],['school','quant'],['papers','quant'],['upenn','quant']
  ];

  function anchorFor(node){
    const angle=node.angle*Math.PI/180;
    return {x:CX+Math.cos(angle)*ringRX[node.ring],y:CY+Math.sin(angle)*ringRY[node.ring]};
  }

  milestones.forEach(node=>{
    const a=anchorFor(node);node.x=a.x;node.y=a.y;
    const el=document.createElement('article');
    el.className=`journey-node ${node.cat}${node.major?' major':''}${node.future?' future':''}${node.stanford?' stanford-node':''}`;
    el.id=`j-${node.id}`;
    el.dataset.nodeId=node.id;
    el.tabIndex=0;
    el.setAttribute('role','button');
    el.setAttribute('aria-pressed','false');
    el.setAttribute('aria-label',`${node.title}. ${node.era}. Select to trace direct connections.`);
    el.style.transform=`translate3d(${(node.x-NODE_W/2).toFixed(1)}px,${(node.y-NODE_H/2).toFixed(1)}px,0)`;
    el.innerHTML=`<span>${node.era}</span><strong>${node.title}</strong>`;
    wrap.appendChild(el);node.el=el;
  });

  const byId=new Map(milestones.map(n=>[n.id,n]));
  const edgeObjects=edges.map(([a,b],index)=>{
    const path=document.createElementNS(ns,'path');
    path.classList.add('journey-edge');path.dataset.a=a;path.dataset.b=b;
    if(byId.get(b)?.future)path.classList.add('future');
    path.id=`journey-edge-${index}`;edgeLayer.appendChild(path);
    return {a,b,path};
  });

  function distancePointToSegment(px,py,x1,y1,x2,y2){
    const dx=x2-x1,dy=y2-y1,l2=dx*dx+dy*dy;if(!l2)return Math.hypot(px-x1,py-y1);
    let t=((px-x1)*dx+(py-y1)*dy)/l2;t=Math.max(0,Math.min(1,t));
    return Math.hypot(px-(x1+t*dx),py-(y1+t*dy));
  }

  function routeFor(a,b){
    const dx=b.x-a.x,dy=b.y-a.y,len=Math.max(1,Math.hypot(dx,dy)),nx=-dy/len,ny=dx/len;
    let offset=0;
    for(const other of milestones){
      if(other===a||other===b)continue;
      const d=distancePointToSegment(other.x,other.y,a.x,a.y,b.x,b.y);
      if(d<108){const cross=dx*(other.y-a.y)-dy*(other.x-a.x);offset+=cross>=0?-58:58;}
    }
    offset=Math.max(-170,Math.min(170,offset));
    const mx=(a.x+b.x)/2+nx*offset,my=(a.y+b.y)/2+ny*offset;
    return `M ${a.x.toFixed(1)} ${a.y.toFixed(1)} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
  }

  function updateEdges(){edgeObjects.forEach(e=>e.path.setAttribute('d',routeFor(byId.get(e.a),byId.get(e.b))));}
  updateEdges();

  let selectedId=null;
  let expanded=false;
  let zoomAnimation=null;

  function fitGraph(){
    const w=Math.max(1,stage.clientWidth-14),h=Math.max(1,stage.clientHeight-14);
    const scale=Math.min(w/WIDTH,h/HEIGHT);
    map.style.setProperty('--fit-scale',Math.max(.1,scale).toFixed(5));
  }

  function animateZoomOut(){
    if(reduced.matches||!canvas.animate)return;
    zoomAnimation?.cancel();
    zoomAnimation=canvas.animate([{transform:'scale(1.16)'},{transform:'scale(1)'}],{duration:720,easing:'cubic-bezier(.16,1,.3,1)',fill:'none'});
  }

  function expandGraph(){
    if(expanded)return;
    expanded=true;shell.classList.add('is-expanded');document.body.classList.add('journey-focus-open');
    closeButton?.focus({preventScroll:true});
    requestAnimationFrame(()=>{fitGraph();requestAnimationFrame(animateZoomOut);});
  }

  function closeGraph(){
    if(!expanded)return;
    expanded=false;shell.classList.remove('is-expanded');document.body.classList.remove('journey-focus-open');
    zoomAnimation?.cancel();requestAnimationFrame(fitGraph);expandButton?.focus({preventScroll:true});
  }

  function connectedIds(id){
    const set=new Set([id]);for(const [a,b] of edges){if(a===id)set.add(b);if(b===id)set.add(a);}return set;
  }

  function updateDescriptor(node){
    if(!node||!descriptor||!descriptorEra||!descriptorTitle||!descriptorText)return;
    descriptorEra.textContent=node.era;descriptorTitle.textContent=node.title;descriptorText.textContent=node.desc;
    if(descriptorLink){descriptorLink.href=node.section;descriptorLink.hidden=false;}
    descriptor.classList.add('has-selection');
    const color=getComputedStyle(node.el).getPropertyValue('--node-color').trim();
    descriptor.style.setProperty('--descriptor-color',color||'var(--line)');
  }

  function pulseNode(id){
    const node=byId.get(id);if(!node)return;
    node.el.classList.remove('pulse');void node.el.offsetWidth;node.el.classList.add('pulse');
    setTimeout(()=>node.el.classList.remove('pulse'),740);
  }

  function animateEdge(edge,fromId,delay,color){
    if(reduced.matches)return;
    setTimeout(()=>{
      const length=edge.path.getTotalLength(),reverse=edge.b===fromId;
      const dot=document.createElementNS(ns,'circle');dot.setAttribute('r','6');dot.setAttribute('class','journey-traveler');
      dot.style.setProperty('--traveler-color',color);travelerLayer.appendChild(dot);
      const start=performance.now(),duration=720;
      const move=now=>{
        const t=Math.min(1,(now-start)/duration),eased=1-Math.pow(1-t,3),at=reverse?1-eased:eased;
        const pt=edge.path.getPointAtLength(length*at);dot.setAttribute('cx',pt.x.toFixed(2));dot.setAttribute('cy',pt.y.toFixed(2));
        if(t<1)requestAnimationFrame(move);else{dot.remove();pulseNode(reverse?edge.a:edge.b);}
      };
      requestAnimationFrame(move);
    },delay);
  }

  function selectNode(id,animate=true){
    const node=byId.get(id);if(!node)return;
    selectedId=id;const linked=connectedIds(id);
    for(const n of milestones){
      const isSelected=n.id===id,isLinked=linked.has(n.id);
      n.el.classList.toggle('selected',isSelected);n.el.classList.toggle('neighbor',isLinked&&!isSelected);n.el.classList.toggle('dim',!isLinked);
      n.el.setAttribute('aria-pressed',String(isSelected));
    }
    const color=getComputedStyle(node.el).getPropertyValue('--node-color').trim()||getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
    let delay=0;
    for(const edge of edgeObjects){
      const active=edge.a===id||edge.b===id;edge.path.classList.toggle('active',active);edge.path.classList.toggle('dim',!active);
      if(active&&animate){animateEdge(edge,id,delay,color);delay+=75;}
    }
    updateDescriptor(node);pulseNode(id);
  }

  function resetGraph(){
    selectedId=null;travelerLayer.replaceChildren();
    milestones.forEach(n=>{n.el.classList.remove('selected','neighbor','dim','pulse');n.el.setAttribute('aria-pressed','false');});
    edgeObjects.forEach(e=>e.path.classList.remove('active','dim'));
    if(descriptor&&descriptorEra&&descriptorTitle&&descriptorText){
      descriptor.classList.remove('has-selection');descriptor.style.removeProperty('--descriptor-color');
      descriptorEra.textContent='Select a milestone';descriptorTitle.textContent='A little more context';descriptorText.textContent='Click any node to see what I learned, built, or accomplished there and how it connects to the next step.';
      if(descriptorLink){descriptorLink.hidden=true;descriptorLink.href='#journey';}
    }
  }

  milestones.forEach(node=>{
    node.el.addEventListener('click',()=>{
      if(!expanded){expandGraph();setTimeout(()=>selectNode(node.id,true),reduced.matches?0:260);return;}
      selectNode(node.id,true);
    });
    node.el.addEventListener('keydown',event=>{
      if(event.key==='Enter'||event.key===' '){
        event.preventDefault();if(!expanded)expandGraph();setTimeout(()=>selectNode(node.id,true),reduced.matches?0:220);
      }
    });
  });

  stage.addEventListener('click',event=>{if(!expanded&&!event.target.closest('.journey-node'))expandGraph();});
  expandButton?.addEventListener('click',expandGraph);
  closeButton?.addEventListener('click',closeGraph);
  descriptorLink?.addEventListener('click',()=>{if(expanded)closeGraph();});
  resetButton?.addEventListener('click',resetGraph);
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&expanded)closeGraph();});

  if('ResizeObserver' in window)new ResizeObserver(fitGraph).observe(stage);else addEventListener('resize',fitGraph);
  addEventListener('resize',fitGraph);
  addEventListener('themechange',()=>{if(selectedId)updateDescriptor(byId.get(selectedId));});
  reduced.addEventListener('change',fitGraph);
  fitGraph();
})();
