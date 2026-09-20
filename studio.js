(() => {
  'use strict';

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const map = document.getElementById('journey-map');
  const wrap = document.getElementById('journey-nodes');
  const svg = document.getElementById('journey-edges');
  const edgeLayer = document.getElementById('journey-edge-layer');
  const travelerLayer = document.getElementById('journey-travelers');
  const resetButton = document.getElementById('journey-reset');
  if (!map || !wrap || !svg || !edgeLayer || !travelerLayer) return;

  const WIDTH = 1240;
  const HEIGHT = 900;
  const CX = WIDTH / 2;
  const CY = HEIGHT / 2;
  const NODE_W = 174;
  const NODE_H = 74;
  const ns = 'http://www.w3.org/2000/svg';

  const milestones = [
    {id:'club',cat:'math',ring:0,angle:205,era:'Grade 7',title:'Math competition club',section:'#math'},
    {id:'java',cat:'code',ring:0,angle:25,era:'Grade 9',title:'Learning Java',section:'#cs'},
    {id:'amc8',cat:'math',ring:1,angle:225,era:'Grade 8',title:'AMC 8 · 17',section:'#math'},
    {id:'amc10',cat:'math',ring:2,angle:210,era:'Grades 9-10',title:'AMC 10 · AIME qualifier',section:'#math'},
    {id:'python',cat:'code',ring:2,angle:18,era:'Grade 10',title:'Java to Python',section:'#cs'},
    {id:'deca10',cat:'markets',ring:2,angle:150,era:'Grade 10',title:'DECA · 33 / 1,700+',section:'#finance'},
    {id:'weather',cat:'code',ring:3,angle:42,era:'Project',title:'Severe weather AI',section:'#weather-project'},
    {id:'scrape',cat:'code',ring:3,angle:350,era:'After grade 10',title:'Small research tools',section:'#cs'},
    {id:'unt',cat:'research',ring:3,angle:92,era:'Research',title:'University of North Texas',section:'#unt-experience'},
    {id:'deca11',cat:'markets',ring:4,angle:143,era:'Grade 11',title:'DECA · 12 / 1,600+',section:'#finance'},
    {id:'amc12',cat:'math',ring:4,angle:232,era:'Grade 11',title:'AMC 12 · 123',section:'#math',major:true},
    {id:'aime',cat:'math',ring:4,angle:260,era:'Grade 11',title:'AIME · 8',section:'#math',major:true},
    {id:'cac',cat:'code',ring:4,angle:56,era:'App challenge',title:'Congressional App Challenge',section:'#weather-project',major:true},
    {id:'usaco',cat:'code',ring:4,angle:315,era:'Algorithms',title:'USACO Silver',section:'#cs'},
    {id:'papers',cat:'research',ring:4,angle:104,era:'Research',title:'Dataset, analysis, action',section:'#research'},
    {id:'study',cat:'math',ring:4,angle:285,era:'Independent study',title:'Beyond the syllabus',section:'#math'},
    {id:'icdc',cat:'markets',ring:5,angle:128,era:'International',title:'DECA ICDC · 14 / 100',section:'#finance',major:true},
    {id:'wharton',cat:'markets',ring:5,angle:162,era:'Wharton Global Youth',title:'Semifinalist',section:'#wharton-experience',major:true},
    {id:'txsef',cat:'research',ring:5,angle:82,era:'Texas science fair',title:'TXSEF · 1st place',section:'#research',major:true},
    {id:'upenn',cat:'research',ring:5,angle:190,era:'Research',title:'UPenn · Game theory',section:'#upenn-experience'},
    {id:'sumac',cat:'math',ring:5,angle:250,era:'Summer study',title:'Stanford SUMaC',section:'#sumac-experience',stanford:true},
    {id:'quant',cat:'markets',ring:5,angle:335,era:'Current work',title:'Healthcare quant pipeline',section:'#finance'},
    {id:'usamo',cat:'math',ring:6,angle:295,era:'Future goal',title:'USAMO qualification',section:'#math',future:true}
  ];

  const edges = [
    ['club','amc8'],['amc8','amc10'],['amc10','amc12'],['amc12','aime'],
    ['amc12','study'],['amc12','sumac'],['aime','sumac'],['amc12','usamo'],
    ['java','python'],['python','weather'],['weather','cac'],['java','scrape'],
    ['java','usaco'],['amc12','usaco'],['amc10','unt'],['weather','unt'],
    ['unt','papers'],['papers','txsef'],['unt','upenn'],['amc12','upenn'],
    ['deca10','deca11'],['deca11','icdc'],['deca11','wharton'],['scrape','wharton'],
    ['amc12','wharton'],['wharton','quant'],['scrape','quant'],['papers','quant'],['upenn','quant']
  ];

  function anchorFor(node){
    if(node.ring===0){
      const side=node.id==='club'?-1:1;
      return {x:CX + side*74, y:CY + (node.id==='club'?-24:24)};
    }
    const angle=node.angle*Math.PI/180;
    const rx=110 + node.ring*78;
    const ry=72 + node.ring*55;
    return {x:CX + Math.cos(angle)*rx, y:CY + Math.sin(angle)*ry};
  }

  milestones.forEach(node=>{
    const a=anchorFor(node);
    node.ax=a.x; node.ay=a.y; node.x=a.x; node.y=a.y; node.vx=0; node.vy=0;
    const el=document.createElement('article');
    el.className=`journey-node ${node.cat}${node.major?' major':''}${node.future?' future':''}${node.stanford?' stanford-node':''}`;
    el.id=`j-${node.id}`;
    el.tabIndex=0;
    el.setAttribute('role','button');
    el.setAttribute('aria-pressed','false');
    el.setAttribute('aria-label',`${node.title}. ${node.era}. Click to trace connections.`);
    el.innerHTML=`<span>${node.era}</span><strong>${node.title}</strong><a class="journey-jump" href="${node.section}">Go to section</a>`;
    wrap.appendChild(el);
    node.el=el;
  });

  const byId = new Map(milestones.map(n=>[n.id,n]));
  const edgeObjects = edges.map(([a,b],index)=>{
    const path=document.createElementNS(ns,'path');
    path.classList.add('journey-edge');
    path.dataset.a=a; path.dataset.b=b;
    if(byId.get(b)?.future) path.classList.add('future');
    path.id=`journey-edge-${index}`;
    edgeLayer.appendChild(path);
    return {a,b,path,index};
  });

  let mouse={x:CX,y:CY,active:false,lastMove:0};
  let selectedId=null;
  let visible=true;
  let raf=0;
  let drag=null;
  let suppressClick=false;

  function nodeCenter(n){ return {x:n.x,y:n.y}; }
  function distancePointToSegment(px,py,x1,y1,x2,y2){
    const dx=x2-x1,dy=y2-y1,l2=dx*dx+dy*dy;
    if(!l2)return Math.hypot(px-x1,py-y1);
    let t=((px-x1)*dx+(py-y1)*dy)/l2;
    t=Math.max(0,Math.min(1,t));
    return Math.hypot(px-(x1+t*dx),py-(y1+t*dy));
  }

  function routeFor(a,b){
    const A=nodeCenter(a),B=nodeCenter(b);
    const dx=B.x-A.x,dy=B.y-A.y;
    const len=Math.max(1,Math.hypot(dx,dy));
    const nx=-dy/len,ny=dx/len;
    let offset=0;
    for(const other of milestones){
      if(other===a||other===b)continue;
      const d=distancePointToSegment(other.x,other.y,A.x,A.y,B.x,B.y);
      if(d<92){
        const cross=dx*(other.y-A.y)-dy*(other.x-A.x);
        offset += cross>=0 ? -54 : 54;
      }
    }
    offset=Math.max(-145,Math.min(145,offset));
    const mx=(A.x+B.x)/2+nx*offset;
    const my=(A.y+B.y)/2+ny*offset;
    return `M ${A.x.toFixed(1)} ${A.y.toFixed(1)} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${B.x.toFixed(1)} ${B.y.toFixed(1)}`;
  }

  function updateEdges(){
    for(const e of edgeObjects){
      e.path.setAttribute('d',routeFor(byId.get(e.a),byId.get(e.b)));
    }
  }

  function render(){
    for(const n of milestones){
      n.el.style.transform=`translate3d(${(n.x-NODE_W/2).toFixed(1)}px,${(n.y-NODE_H/2).toFixed(1)}px,0)`;
    }
    updateEdges();
  }

  function collide(){
    for(let i=0;i<milestones.length;i++){
      for(let j=i+1;j<milestones.length;j++){
        const a=milestones[i],b=milestones[j];
        const dx=b.x-a.x,dy=b.y-a.y;
        const overlapX=NODE_W+18-Math.abs(dx);
        const overlapY=NODE_H+14-Math.abs(dy);
        if(overlapX>0&&overlapY>0){
          if(overlapX<overlapY){
            const push=overlapX*.022*(dx>=0?1:-1);
            if(!a.dragging)a.vx-=push;if(!b.dragging)b.vx+=push;
          }else{
            const push=overlapY*.026*(dy>=0?1:-1);
            if(!a.dragging)a.vy-=push;if(!b.dragging)b.vy+=push;
          }
        }
      }
    }
  }

  function tick(now=performance.now()){
    raf=0;
    if(!visible||document.hidden)return;
    if(mouse.active&&now-mouse.lastMove>180)mouse.active=false;
    let unsettled=false;
    if(!reduced.matches){
      collide();
      for(const n of milestones){
        if(n.dragging){unsettled=true;continue;}
        n.vx+=(n.ax-n.x)*.0065;
        n.vy+=(n.ay-n.y)*.0065;
        if(mouse.active){
          const dx=mouse.x-n.x,dy=mouse.y-n.y,dist=Math.hypot(dx,dy);
          if(dist<285){
            const pull=(1-dist/285)*.020;
            n.vx+=dx*pull*.045;
            n.vy+=dy*pull*.045;
          }
        }
        n.vx*=.86;n.vy*=.86;
        n.x+=n.vx;n.y+=n.vy;
        const minX=NODE_W/2+14,maxX=WIDTH-NODE_W/2-14,minY=NODE_H/2+14,maxY=HEIGHT-NODE_H/2-14;
        if(n.x<minX){n.x=minX;n.vx*=-.25;}if(n.x>maxX){n.x=maxX;n.vx*=-.25;}
        if(n.y<minY){n.y=minY;n.vy*=-.25;}if(n.y>maxY){n.y=maxY;n.vy*=-.25;}
        if(Math.abs(n.vx)+Math.abs(n.vy)>.035||Math.abs(n.ax-n.x)+Math.abs(n.ay-n.y)>.35)unsettled=true;
      }
    }
    render();
    if(mouse.active||drag||unsettled)raf=requestAnimationFrame(tick);
  }

  function start(){ if(!raf&&visible&&!document.hidden) raf=requestAnimationFrame(tick); }

  function mapPoint(event){
    const rect=map.getBoundingClientRect();
    return {x:(event.clientX-rect.left)*(WIDTH/rect.width),y:(event.clientY-rect.top)*(HEIGHT/rect.height)};
  }

  map.addEventListener('pointermove',event=>{
    const p=mapPoint(event);mouse={...p,active:true,lastMove:performance.now()};start();
    if(drag){
      const n=byId.get(drag.id);
      const dx=p.x-drag.startX,dy=p.y-drag.startY;
      if(Math.hypot(dx,dy)>5)suppressClick=true;
      n.x=Math.max(NODE_W/2+14,Math.min(WIDTH-NODE_W/2-14,p.x-drag.offsetX));
      n.y=Math.max(NODE_H/2+14,Math.min(HEIGHT-NODE_H/2-14,p.y-drag.offsetY));
      n.vx=0;n.vy=0;
    }
  });
  map.addEventListener('pointerleave',()=>{mouse.active=false;start();});

  function beginDrag(event,node){
    if(event.target.closest('.journey-jump'))return;
    const p=mapPoint(event); node.dragging=true; suppressClick=false; start();
    drag={id:node.id,startX:p.x,startY:p.y,offsetX:p.x-node.x,offsetY:p.y-node.y};
    node.el.setPointerCapture?.(event.pointerId);
  }
  function endDrag(node){
    if(!drag)return;
    node.dragging=false;
    if(suppressClick){node.ax=node.x;node.ay=node.y;}
    drag=null;
    start();
    setTimeout(()=>{suppressClick=false;},0);
  }

  function connectedIds(id){
    const set=new Set([id]);
    for(const [a,b] of edges){if(a===id)set.add(b);if(b===id)set.add(a);}
    return set;
  }

  function pulseNode(id){
    const n=byId.get(id); if(!n)return;
    n.el.classList.remove('pulse');
    void n.el.offsetWidth;
    n.el.classList.add('pulse');
    setTimeout(()=>n.el.classList.remove('pulse'),700);
  }

  function animateEdge(edge,fromId,delay){
    if(reduced.matches)return;
    setTimeout(()=>{
      const length=edge.path.getTotalLength();
      const reverse=edge.b===fromId;
      const dot=document.createElementNS(ns,'circle');
      dot.setAttribute('r','5');
      dot.setAttribute('class','journey-traveler');
      travelerLayer.appendChild(dot);
      const start=performance.now(),duration=650;
      const move=now=>{
        const t=Math.min(1,(now-start)/duration);
        const eased=1-Math.pow(1-t,3);
        const at=reverse?1-eased:eased;
        const pt=edge.path.getPointAtLength(length*at);
        dot.setAttribute('cx',pt.x.toFixed(2));dot.setAttribute('cy',pt.y.toFixed(2));
        if(t<1)requestAnimationFrame(move);else{dot.remove();pulseNode(reverse?edge.a:edge.b);}
      };
      requestAnimationFrame(move);
    },delay);
  }

  function selectNode(id,animate=true){
    selectedId=id;
    const linked=connectedIds(id);
    for(const n of milestones){
      n.el.classList.toggle('selected',n.id===id);
      n.el.classList.toggle('neighbor',linked.has(n.id)&&n.id!==id);
      n.el.setAttribute('aria-pressed',String(n.id===id));
    }
    let delay=0;
    for(const e of edgeObjects){
      const active=e.a===id||e.b===id;
      e.path.classList.toggle('active',active);
      if(active&&animate){animateEdge(e,id,delay);delay+=70;}
    }
    pulseNode(id);
  }

  milestones.forEach(node=>{
    node.el.addEventListener('pointerdown',event=>beginDrag(event,node));
    node.el.addEventListener('pointerup',()=>endDrag(node));
    node.el.addEventListener('pointercancel',()=>endDrag(node));
    node.el.addEventListener('click',event=>{
      if(event.target.closest('.journey-jump')||suppressClick)return;
      selectNode(node.id,true);
    });
    node.el.addEventListener('keydown',event=>{
      if((event.key==='Enter'||event.key===' ')&&!event.target.closest('.journey-jump')){
        event.preventDefault();selectNode(node.id,true);
      }
    });
  });

  function resetLayout(){
    selectedId=null;
    for(const n of milestones){
      const a=anchorFor(n);n.ax=a.x;n.ay=a.y;n.x=a.x;n.y=a.y;n.vx=0;n.vy=0;
      n.el.classList.remove('selected','neighbor','pulse');n.el.setAttribute('aria-pressed','false');
    }
    edgeObjects.forEach(e=>e.path.classList.remove('active'));
    travelerLayer.replaceChildren();
    render();start();
  }
  resetButton?.addEventListener('click',resetLayout);

  new IntersectionObserver(entries=>{
    visible=entries[0]?.isIntersecting??true;
    if(visible)start();else if(raf){cancelAnimationFrame(raf);raf=0;}
  },{threshold:.03}).observe(map);
  document.addEventListener('visibilitychange',start);
  reduced.addEventListener('change',()=>{if(reduced.matches)render();start();});

  render();
  start();
})();
