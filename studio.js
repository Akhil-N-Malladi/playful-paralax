(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const dark = () => document.documentElement.dataset.theme === 'dark';
  const colors = () => ({ink:dark()?'#e9eee3':'#263d35', grid:dark()?'#67816c':'#a1b596', accent:dark()?'#efa28b':'#b74e36'});
  function canvasSize(canvas) {
    const box=canvas.getBoundingClientRect(), dpr=Math.min(devicePixelRatio||1,2);
    canvas.width=Math.round(box.width*dpr);canvas.height=Math.round(box.height*dpr);
    const ctx=canvas.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);
    return {ctx,w:box.width,h:box.height};
  }
  function rotate(x,y,z,a,b) {
    const X=x*Math.cos(a)+z*Math.sin(a), Z=-x*Math.sin(a)+z*Math.cos(a);
    return [X,y*Math.cos(b)-Z*Math.sin(b),y*Math.sin(b)+Z*Math.cos(b)];
  }
  // Real 3D torus geometry, projected onto a lightweight 2D canvas.
  const sculpture=$('sculpture');let hero=canvasSize(sculpture), angle=.4, visible=true, paused=reduced.matches, frame=0, last=0;
  function drawSculpture(){
    const {ctx:c,w,h}=hero;if(!w||!h)return;c.clearRect(0,0,w,h);
    const scale=w*.255, cx=w*.50, cy=h*.49;
    const project=p=>{const q=rotate(...p,angle,.64);const depth=4/(4-q[2]);return [cx+q[0]*scale*depth,cy+q[1]*scale*depth,q[2]];};
    const shadow=c.createRadialGradient(cx,h*.79,0,cx,h*.79,w*.29);shadow.addColorStop(0,'#243b2520');shadow.addColorStop(1,'#243b2500');c.fillStyle=shadow;c.save();c.translate(0,h*.60);c.scale(1,.25);c.fillRect(0,0,w,h);c.restore();
    const faces=[],U=72,V=24;
    const p=(u,v)=>[(1+.34*Math.cos(v))*Math.cos(u),(1+.34*Math.cos(v))*Math.sin(u),.34*Math.sin(v)];
    for(let i=0;i<U;i++)for(let j=0;j<V;j++){
      const u=i/U*Math.PI*2,v=j/V*Math.PI*2;
      const points=[p(u,v),p(u+2*Math.PI/U,v),p(u+2*Math.PI/U,v+2*Math.PI/V),p(u,v+2*Math.PI/V)].map(project);
      const normal=rotate(Math.cos(v)*Math.cos(u),Math.cos(v)*Math.sin(u),Math.sin(v),angle,.64);
      const light=Math.max(0,normal[0]*-.35+normal[1]*-.5+normal[2]*.78);
      faces.push({points,z:points.reduce((a,p)=>a+p[2],0)/4,light});
    }
    faces.sort((a,b)=>a.z-b.z).forEach(f=>{c.beginPath();f.points.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();c.fillStyle=`hsl(86 23% ${dark()?24+f.light*35:48+f.light*30}%)`;c.fill();c.strokeStyle=`hsla(88, 25%, ${dark()?65:30}%, .17)`;c.lineWidth=.55;c.stroke();});
    function ball(x,y,r,a,b){const g=c.createRadialGradient(x-r*.35,y-r*.45,r*.05,x,y,r);g.addColorStop(0,a);g.addColorStop(1,b);c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();}
    ball(w*.78,h*.29,w*.087,'#f4cbb0','#b76548');ball(w*.21,h*.70,w*.046,'#f4e9c0','#b6a36b');
    c.strokeStyle=colors().grid;c.lineWidth=.8;c.beginPath();c.ellipse(cx,cy,w*.42,h*.18,-.42,0,Math.PI*2);c.stroke();
    const t=angle*1.4;ball(cx+Math.cos(t)*w*.38,cy+Math.sin(t)*h*.20,w*.012,'#eed2b7','#ad6d48');
  }
  function loop(t){frame=0;if(!visible||paused||document.hidden)return;if(t-last>32){angle+=.004;drawSculpture();last=t;}frame=requestAnimationFrame(loop);}
  function startHero(){if(!frame&&visible&&!paused&&!document.hidden)frame=requestAnimationFrame(loop);}
  function syncMotion(){paused=reduced.matches;$('orbit-toggle').setAttribute('aria-pressed',String(paused));$('orbit-toggle').textContent=paused?'Resume motion ▷':'Pause motion Ⅱ';if(paused){cancelAnimationFrame(frame);frame=0;}else startHero();}
  $('orbit-toggle').addEventListener('click',()=>{paused=!paused;$('orbit-toggle').setAttribute('aria-pressed',String(paused));$('orbit-toggle').textContent=paused?'Resume motion ▷':'Pause motion Ⅱ';if(paused){cancelAnimationFrame(frame);frame=0;}else startHero();});
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)startHero();else{cancelAnimationFrame(frame);frame=0;}}).observe(sculpture);
  reduced.addEventListener('change',syncMotion);
  new ResizeObserver(()=>{hero=canvasSize(sculpture);drawSculpture();}).observe(sculpture);syncMotion();drawSculpture();

  // Convex quadratic: gradient exactly (x, 3y), minimum exactly (0, 0).
  const canvas=$('gradient-canvas');let scene=canvasSize(canvas), yaw=-.65, tilt=.85;
  let x=2.8,y=2.0, steps=0, path=[[x,y]], timer=null, terminal=false;
  const loss=(a,b)=>.5*a*a+1.5*b*b;
  let viewScale=1,viewX=0,viewY=0;
  function project(a,b,z){const q=rotate(a,-z*.20,b,yaw,tilt);return [viewX+q[0]*viewScale,viewY+q[1]*viewScale,q[2]];}
  function line(points,color,width=1){const c=scene.ctx;c.beginPath();points.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.strokeStyle=color;c.lineWidth=width;c.stroke();}
  function draw(){
    const {ctx:c,w,h}=scene;if(!w||!h)return;c.clearRect(0,0,w,h);const palette=colors(),faces=[],N=22,R=3.2;
    const bounds=[];
    for(let i=0;i<=N;i++)for(let j=0;j<=N;j++){const a=-R+i*2*R/N,b=-R+j*2*R/N;bounds.push(rotate(a,-loss(a,b)*.20,b,yaw,tilt));}
    const minX=Math.min(...bounds.map(p=>p[0])),maxX=Math.max(...bounds.map(p=>p[0])),minY=Math.min(...bounds.map(p=>p[1])),maxY=Math.max(...bounds.map(p=>p[1]));
    viewScale=Math.min((w-42)/(maxX-minX),(h-36)/(maxY-minY));viewX=w/2-(minX+maxX)/2*viewScale;viewY=h/2-(minY+maxY)/2*viewScale;
    for(let i=0;i<N;i++)for(let j=0;j<N;j++){
      const a=-R+i*2*R/N,b=-R+j*2*R/N,d=2*R/N;
      const pts=[[a,b],[a+d,b],[a+d,b+d],[a,b+d]].map(([a,b])=>project(a,b,loss(a,b)));
      faces.push({pts,z:pts.reduce((sum,p)=>sum+p[2],0)/4,l:loss(a+d/2,b+d/2)});
    }
    faces.sort((a,b)=>a.z-b.z).forEach(f=>{c.beginPath();f.pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();c.fillStyle=`hsla(95,${dark()?18:24}%,${dark()?29+f.l*.4:82-f.l*.6}%,.78)`;c.fill();c.strokeStyle=dark()?'#9caf8740':'#6a896c40';c.lineWidth=.6;c.stroke();});
    const origin=project(0,0,0);c.strokeStyle=palette.ink;c.lineWidth=1.5;c.beginPath();c.ellipse(origin[0],origin[1],8,4,0,0,Math.PI*2);c.stroke();
    line(path.filter(([a,b])=>Math.abs(a)<=4&&Math.abs(b)<=4).map(([a,b])=>project(a,b,loss(a,b))),palette.accent,2.5);
    if(Math.abs(x)<=4&&Math.abs(y)<=4){const dot=project(x,y,loss(x,y));c.beginPath();c.arc(dot[0],dot[1],7,0,Math.PI*2);c.fillStyle=palette.accent;c.fill();c.strokeStyle=dark()?'#203229':'#fffef9';c.lineWidth=2;c.stroke();}
    c.font='11px monospace';c.fillStyle=palette.ink;c.fillText('minimum',origin[0]+13,origin[1]+15);
  }
  function status(text){$('gd-status').textContent=text;}
  function update(){ $('gd-steps').textContent=steps;$('gd-loss').textContent=loss(x,y).toFixed(4);draw(); }
  function stop(){clearInterval(timer);timer=null;$('gd-run').textContent=terminal?'Restart descent ↘':'Start descent ↘';}
  function step(){if(terminal)return;const rate=Number($('learning-rate').value);x-=rate*x;y-=rate*3*y;steps++;path.push([x,y]);
    if(!Number.isFinite(loss(x,y))||Math.abs(x)>3.7||Math.abs(y)>3.7){terminal=true;stop();status('Off the surface! The steps are too large. Lower the learning rate and restart.');}
    else if(loss(x,y)<.00001){terminal=true;stop();status('Found it. Tiny steps, a satisfying finish. The loss is now below 0.00001.');}
    else if(steps>=600){terminal=true;stop();status('Stopped at 600 steps. Try a different learning rate or a new starting point.');}
    else status(rate>2/3?'These steps overshoot. Watch the loss grow.':rate>.33?'A little zigzag, but still heading toward the minimum.':'Heading downhill. Each step brings the loss closer to zero.');
    update();
  }
  function reset(random=true){terminal=false;stop();steps=0;x=random?(1.4+Math.random()*1.5)*(Math.random()<.5?-1:1):2.8;y=random?(1.2+Math.random()*.9)*(Math.random()<.5?-1:1):2;path=[[x,y]];status('Fresh start. Where will your next step take you?');update();}
  $('gd-run').addEventListener('click',()=>{if(timer){stop();status('Paused. Take a look around, or continue downhill.');return;}if(terminal)reset(false);$('gd-run').textContent='Pause Ⅱ';timer=setInterval(step,180);});
  $('gd-step').addEventListener('click',()=>{stop();if(terminal)reset(false);step();});
  $('gd-reset').addEventListener('click',()=>reset());
  $('learning-rate').addEventListener('input',()=>{$('learning-rate-value').textContent=Number($('learning-rate').value).toFixed(2);if(terminal)reset(false);});
  $('rotate-surface').addEventListener('click',()=>{yaw+=Math.PI/6;draw();});
  let drag=null;
  canvas.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,yaw,tilt};canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener('pointermove',e=>{if(!drag)return;yaw=drag.yaw+(e.clientX-drag.x)*.008;tilt=Math.max(.35,Math.min(1.2,drag.tilt+(e.clientY-drag.y)*.003));draw();});
  ['pointerup','pointercancel','lostpointercapture'].forEach(type=>canvas.addEventListener(type,()=>drag=null));
  new ResizeObserver(()=>{scene=canvasSize(canvas);draw();}).observe(canvas);
  new IntersectionObserver(entries=>{if(!entries[0].isIntersecting&&timer){stop();status('Paused while you explore. Continue whenever you’re ready.');}}).observe($('gradient-lab'));
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;if(timer){stop();status('Paused. Continue whenever you’re ready.');}}else startHero();});
  window.addEventListener('themechange',()=>{draw();drawSculpture();});
  update();
})();
