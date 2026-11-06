/* Generated artwork + live canvas aperture. The invitation is always underneath. */
(()=>{
 const portal=document.querySelector('.portal'),canvas=document.querySelector('#portal-canvas'),ctx=canvas.getContext('2d'),trigger=portal.querySelector('.portal-touch'),skip=portal.querySelector('.portal-skip'),art=new Image();
 let active=false,opening=false,raf=0,startAt=0,ambient=0,previous=0,cw=0,ch=0,dpr=1;
 const reduce=matchMedia('(prefers-reduced-motion:reduce)');
 function resize(){cw=Math.min(innerWidth,480);ch=innerHeight;dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(cw*dpr);canvas.height=Math.round(ch*dpr);ctx.setTransform(dpr,0,0,dpr,0,0)}
 function draw(t){
  raf=0;if(!active)return;if(document.hidden){previous=0;return}
  const dt=previous?Math.min(t-previous,60):16;previous=t;ambient+=dt;
  const p=opening?Math.min(1,(t-startAt)/3200):0,e=p*p*(3-2*p),cx=cw*.5,cy=ch*.45;
  ctx.clearRect(0,0,cw,ch);ctx.save();ctx.translate(cx,cy);ctx.rotate(Math.sin(ambient/6500)*.026+e*.15);
  const scale=Math.max(cw/art.width,ch/art.height)*(1.10+Math.sin(ambient/2400)*.018+e*.13),iw=art.width*scale,ih=art.height*scale;
  ctx.drawImage(art,-iw*.5,-ih*.45,iw,ih);ctx.restore();
  // Warm glints travel around the painted sun before and during opening.
  if(!reduce.matches){for(let i=0;i<22;i++){const a=i*2.399+ambient*.00017,r=cw*(.13+(i%5)*.037),x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r;ctx.globalAlpha=(.2+.25*Math.sin(ambient*.001+i)**2)*(1-e);ctx.fillStyle='#ffe4a0';ctx.beginPath();ctx.arc(x,y,1+(i%3)*.35,0,Math.PI*2);ctx.fill()}ctx.globalAlpha=1}
  if(opening){
   // An irregular growing hole exposes live HTML immediately; no black frame.
   const radius=e*Math.hypot(cw,ch)*.8;
   ctx.save();ctx.globalCompositeOperation='destination-out';ctx.beginPath();
   for(let i=0;i<=180;i++){const a=i/180*Math.PI*2,r=radius*(1+.045*Math.sin(a*7-p*8)+.022*Math.sin(a*17+p*5));const x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r;i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.closePath();ctx.fill();
   // Short bristle marks feather the advancing edge.
   for(let i=0;i<100;i++){const a=i*2.399,r=radius*(1.015+.047*Math.sin(i*13.7)),x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r;ctx.globalAlpha=.38;ctx.beginPath();ctx.ellipse(x,y,2+e*4,5+e*12,a,0,Math.PI*2);ctx.fill()}ctx.restore();
   if(p>=1){finish();return}
  }
  if(!reduce.matches||opening)raf=requestAnimationFrame(draw);
 }
 function finish(){active=false;opening=false;cancelAnimationFrame(raf);raf=0;portal.hidden=true;portal.classList.remove('opening');document.body.classList.remove('portal-pending');main.inert=false;document.querySelector('header a').focus({preventScroll:true});window.portalComplete=true}
 window.finishPortal=finish;
 function open(){if(opening)return;if(reduce.matches){finish();return}opening=true;startAt=performance.now();portal.classList.add('opening');window.portalOpening=true;if(!raf)raf=requestAnimationFrame(draw)}
 function show(){if(!art.complete||!art.naturalWidth)return;scrollTo({top:0,behavior:'instant'});resize();active=true;opening=false;previous=0;portal.hidden=false;portal.classList.remove('opening');document.body.classList.add('portal-pending');main.inert=true;window.portalComplete=false;window.portalOpening=false;trigger.focus({preventScroll:true});cancelAnimationFrame(raf);raf=requestAnimationFrame(draw)}
 trigger.onclick=open;skip.onclick=finish;document.querySelector('#replay').onclick=show;
 portal.addEventListener('keydown',e=>{if(e.key==='Escape')finish();if(e.key==='Tab'){e.preventDefault();(document.activeElement===trigger?skip:trigger).focus()}});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden&&active){if(opening){finish();return}previous=0;raf=requestAnimationFrame(draw)}});
 addEventListener('resize',()=>{if(active){resize();if(reduce.matches)draw(performance.now())}});
 art.onload=()=>{window.portalReady=true;show()};art.onerror=()=>{window.portalReady=false;finish()};art.src='assets/portal-sol.webp';
})();
