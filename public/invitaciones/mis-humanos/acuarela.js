const byId = id => document.getElementById(id);
const svg = byId('stage');
const namespace = svg.namespaceURI;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
function element(tag, attributes, parent) {
  const node = document.createElementNS(namespace, tag);
  for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value);
  parent.append(node);
  return node;
}
function ease(value) {
  const x = Math.max(0, Math.min(1, value));
  return x * x * (3 - 2 * x);
}
const dogs = [
  { key:'novia', image:'assets/novia.webp', x:7, y:92, width:177, mouth:[728,131], joint:324, cuts:[0,166,350,521,768] },
  { key:'novio', image:'assets/novio.webp', x:184, y:75, width:192, mouth:[729,154], joint:309, cuts:[0,166,352,539,768] }
];
const defs = svg.querySelector('defs');
function clippedPainting(dog, group, name, x, y, width, height) {
  const id = dog.key + '-' + name;
  const clip = element('clipPath',{id},defs);
  element('rect',{x,y,width,height},clip);
  element('use',{href:'#'+dog.key,'clip-path':'url(#'+id+')'},group);
}
for (const dog of dogs) {
  element('image',{id:dog.key,href:dog.image,width:768,height:512},defs);
  dog.actor = element('g',{},byId('actors'));
  dog.legs = dog.cuts.slice(0,-1).map((x,i) => {
    const limb = element('g',{},dog.actor);
    clippedPainting(dog,limb,'pata-'+i,x,dog.joint,dog.cuts[i+1]-x,512-dog.joint);
    return limb;
  });
  clippedPainting(dog,dog.actor,'cuerpo',0,0,768,dog.joint+1);
}
const phaseOffsets = [0,Math.PI,.87*Math.PI,1.88*Math.PI];
function pose(dog, distance, stride, index) {
  const scale = dog.width/768;
  const phase = 2*Math.PI*distance/62 + index*.94;
  const x = dog.x + distance;
  const y = dog.y - Math.abs(Math.sin(phase))*2.6*stride;
  dog.actor.setAttribute('transform',`translate(${x} ${y}) scale(${scale})`);
  dog.legs.forEach((limb,i) => {
    const gait = phase + phaseOffsets[i];
    const swing = 12*Math.sin(gait)*stride;
    const reach = 1-.13*Math.max(0,Math.cos(gait))*stride;
    limb.setAttribute('transform',`translate(0 ${dog.joint}) skewX(${swing}) scale(1 ${reach}) translate(0 ${-dog.joint})`);
  });
  return [x+scale*dog.mouth[0],y+scale*dog.mouth[1]];
}
let start = performance.now(), pulled = null, queued = false, finished = false, frame;
function draw(now) {
  const arrival = reducedMotion.matches ? 1 : ease((now-start)/2600);
  if (queued && arrival===1 && pulled===null) pulled=now;
  const t = pulled===null ? 0 : (now-pulled)/1000;
  const walk=ease(t/4.55), untie=ease((t-.68)/1.42), loose=ease((t-2.06)/.75);
  const unfold=ease((t-2.28)/1.55), rise=ease((t-3.5)/1.25);
  const distance=-390*(1-arrival)+420*walk;
  const stride=Math.pow(Math.max(0, Math.sin(Math.PI*arrival)+Math.sin(Math.PI*walk)),.38);
  const anchorX=195+loose*180, anchorY=338-loose*72;
  dogs.forEach((dog,i) => {
    const [x,y]=pose(dog,distance,stride,i);
    const slack=(1-untie)*(47+12*i);
    byId('thread'+(i+1)).setAttribute('d',`M${anchorX} ${anchorY} Q${(x+anchorX)/2-12} ${(y+anchorY)/2+slack} ${x} ${y}`);
  });
  svg.querySelector('.threads').style.opacity=1-loose;
  svg.querySelector('.glints').style.opacity=1-loose;
  const w=32*(1-untie), h=13*(1-untie);
  byId('bow').setAttribute('d',`M195 338c${-w*1.65} ${-h*2.15} ${-w*1.6} ${h*1.9} 0 0c${w*1.5} ${-h*2.45} ${w*1.8} ${h*1.65} 0 0m0 0q-6 14 -18 22m18 -22q7 11 12 13`);
  byId('bow').style.opacity=1-untie;
  byId('wrap').style.opacity=1-untie;
  const width=Math.cos(unfold*2.08), skew=Math.sin(unfold*2.08)*.19;
  byId('leftGate').setAttribute('transform',`matrix(${width} ${-skew} 0 1 ${93*(1-width)} ${93*skew})`);
  byId('rightGate').setAttribute('transform',`matrix(${width} ${skew} 0 1 ${297*(1-width)} ${-297*skew})`);
  byId('paperScene').setAttribute('transform',`translate(195 ${342-rise*158}) scale(${1+rise*.17}) translate(-195 -342)`);
  svg.setAttribute('viewBox',`0 0 390 ${472-rise*134}`);
  if (t>=2.3) byId('heading').textContent='Mis humanos se casan';
  if (t>=4.8) {
    finished=true;
    byId('details').hidden=false;
    byId('open').hidden=true;
    byId('jump').textContent='Horarios y asistencia ↓';
    return;
  }
  if (arrival<1 || queued) frame=requestAnimationFrame(draw);
}
function showCard() {
  cancelAnimationFrame(frame);
  const now=performance.now();
  start=now-8500;
  pulled=now-5500;
  draw(now);
}
byId('open').onclick=() => {
  if (reducedMotion.matches) {showCard();byId('jump').focus({preventScroll:true});return;}
  queued=true;
  byId('open').disabled=true;
  cancelAnimationFrame(frame);
  frame=requestAnimationFrame(draw);
};
byId('jump').onclick=() => {
  if (!finished) showCard();
  byId('details').scrollIntoView({behavior:reducedMotion.matches?'instant':'smooth'});
};
byId('again').onclick=() => {
  cancelAnimationFrame(frame);
  queued=false;finished=false;pulled=null;start=performance.now();
  byId('details').hidden=true;byId('open').hidden=false;byId('open').disabled=false;
  byId('jump').textContent='Ver la invitación';byId('heading').textContent='Tenemos un secreto.';
  window.scrollTo({top:0,behavior:'instant'});
  byId('open').focus({preventScroll:true});
  draw(start);
};
const moments = [...document.querySelectorAll('.moments div')];
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.remove('incoming');
        observer.unobserve(entry.target);
      }
    }
  }, { threshold:.4, rootMargin:'0px 0px -8% 0px' });
  for (const moment of moments) {
    moment.classList.add('incoming');
    observer.observe(moment);
  }
}
const form = byId('guestForm');
const sign = byId('placard');
function typesetName() {
  if (!sign.clientWidth) return;
  let size = Math.min(34, Math.round(sign.clientWidth / 5.3));
  sign.style.fontSize = size+'px';
  while ((sign.scrollHeight > sign.clientHeight+1 || sign.scrollWidth > sign.clientWidth+1) && size>10) {
    sign.style.fontSize = --size+'px';
  }
}
if ('ResizeObserver' in window) new ResizeObserver(typesetName).observe(byId('portrait'));
form.onsubmit = event => {
  event.preventDefault();
  const name = form.elements.guest.value.trim();
  const attending = form.elements.attendance.value === 'yes';
  byId('portrait').hidden = !attending;
  sign.textContent = attending ? name : '';
  byId('response').textContent = attending ? '¡Guardamos un brindis para vos!' : 'Gracias por avisarnos, '+name+'.';
  byId('reply').hidden = false;
  form.hidden = true;
  typesetName();
  byId('reply').focus({preventScroll:true});
  byId('reply').scrollIntoView({behavior:reducedMotion.matches?'instant':'smooth',block:'center'});
};
byId('editReply').onclick = () => {
  byId('reply').hidden = true;
  form.hidden = false;
  form.elements.guest.focus();
};
draw(start);