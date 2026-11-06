const find = id => document.getElementById(id);
const clamp = x => Math.max(0, Math.min(1, x));
const ease = x => {const n=clamp(x); return n*n*(3-2*n)};
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const dogs = [
  {bride:true, coat:'#bd823f', dark:'#84532c', rest:24, y:109, scale:.99},
  {bride:false, coat:'#99938a', dark:'#514d49', rest:179, y:92, scale:1.09}
];
function puppet(dog) {
  const fur=dog.coat, ink=dog.dark;
  const leg=(x,far,phase)=>`<g data-leg="${x},${phase}"><path d="M${x-6} 53 q-3 12 -4 18 l-2 12 q0 5 6 5 l6 0 q4 -2 0 -5 l-5 -2 5 -18 4 -8" fill="${far?ink:fur}" stroke="${ink}" stroke-width="1.1"/></g>`;
  const ear=dog.bride?`<path d="M89 21 Q78 18 75 32 Q67 60 79 61 Q91 60 95 29Z" fill="#a96b32"/><path d="M85 27 Q78 44 78 53 M90 30 Q88 45 82 54" fill="none" stroke="#d7a15d"/>`:`<path d="M89 28 L83 6 Q91 8 100 23 M103 21 Q110 8 117 8 L111 31" fill="#716d67"/>`;
  const attire=dog.bride?`<path d="M73 41 Q59 49 43 46 L33 48 Q28 62 7 69 Q22 78 35 71 Q43 77 53 69 Q63 72 73 59 L80 48Z" fill="#fff6df" stroke="#b9a68b"/><path d="M67 47 Q57 60 47 66 M55 50 Q47 61 36 67 M43 52 Q38 60 23 67" fill="none" stroke="#d9c9aa"/><path d="M91 19 Q81 12 78 20 Q74 28 54 39 Q65 43 77 38 L89 24" fill="#fffaf1" fill-opacity=".82" stroke="#cabba1"/><g fill="#f9e7d2" stroke="#ad886b" stroke-width=".5"><circle cx="84" cy="19" r="3"/><circle cx="88" cy="17" r="3"/><circle cx="92" cy="18" r="2.5"/></g>`:`<path d="M77 40 Q61 47 44 45 L32 48 L23 66 Q42 68 61 60 L71 70 L82 48Z" fill="#384342" stroke="#293331"/><path d="M77 39 L84 45 L76 61 L69 45Z" fill="#fff6e4"/><path d="M74 42 L66 46 L69 50 L64 51 L73 62" fill="none" stroke="#a4ada0"/><path d="M77 46 l-5 -3 v6 l5 -2 4 3 1 -6Z" fill="#78434a"/>`;
  return `<g data-body>${leg(39,true,0)}${leg(79,true,Math.PI)}<g data-tail><path d="M31 51 Q18 49 11 37 Q7 27 4 32 Q5 51 23 59Z" fill="${fur}" stroke="${ink}" stroke-width="1.4"/></g><path d="M24 49 Q34 42 48 45 Q65 48 77 32 L89 36 Q88 53 76 61 Q64 73 44 67 Q32 67 25 61Z" fill="${fur}" stroke="${ink}" stroke-width="1.3"/>${leg(30,false,Math.PI)}${leg(72,false,0)}<path d="M78 40 Q77 23 92 18 Q105 12 112 25 L118 32 L128 35 Q130 40 122 43 L116 46 Q108 51 96 46 L84 48Z" fill="${fur}" stroke="${ink}" stroke-width="1.3"/>${ear}<path d="M109 36 Q118 34 126 36 Q126 45 115 46 L107 43" fill="${dog.bride?'#edc999':'#d6cfc1'}"/><path d="M123 35 Q127 32 130 36 Q129 40 125 40Z" fill="#382c27"/><circle cx="109" cy="29" r="2.4" fill="#2f2722"/><circle cx="109.7" cy="28.4" r=".7" fill="#fff"/><path d="M115 43 Q121 45 125 41" fill="none" stroke="#55392f" stroke-linecap="round"/>${attire}</g>`;
}
const svgNS='http://www.w3.org/2000/svg';
for(const dog of dogs){dog.node=document.createElementNS(svgNS,'g');dog.node.innerHTML=puppet(dog);find('actors').append(dog.node);dog.legs=[...dog.node.querySelectorAll('[data-leg]')].map(node=>({node,values:node.dataset.leg.split(',').map(Number)}))}
let zero=performance.now(),pullAt=null,queued=false,complete=false,frameId=0;
function render(now){
 const age=(now-zero)/1000, intro=reduced.matches?1:ease(age/2.25);
 if(queued&&intro===1&&pullAt===null)pullAt=now;
 const run=pullAt===null?0:(now-pullAt)/1000;
 const departure=ease(run/4.15),untie=ease((run-.95)/1.25),release=ease((run-2.16)/.6),open=ease((run-2.18)/1.65),rise=ease((run-3.45)/1.0);
 const mouths=[];
 dogs.forEach((d,i)=>{
  const distance=(1-intro)*(-350)+departure*447;
  const phi=(distance/(d.scale*43))*Math.PI*2+i*.85;
  const walking=(intro<1?Math.sin(Math.PI*intro)**.35:0)+(departure>0&&departure<1?Math.sin(Math.PI*departure)**.3:0);
  const lift=-Math.abs(Math.sin(phi))*2.4*walking;
  const x=d.rest+distance,y=d.y+lift;
  d.node.setAttribute('transform',`translate(${x} ${y}) scale(${d.scale})`);
  for(const {node,values:[joint,phase]} of d.legs){node.setAttribute('transform',`rotate(${22*Math.sin(phi+phase)*walking} ${joint} 54) translate(0 ${-2*Math.max(0,Math.cos(phi+phase))*walking})`)}
  d.node.querySelector('[data-tail]').setAttribute('transform',`rotate(${Math.sin(age*5+i)*4*walking} 27 53)`);
  mouths.push([x+123*d.scale,y+42*d.scale]);
 });
 const knotX=195+release*195,knotY=338-release*50;
 mouths.forEach(([x,y],i)=>{const droop=(1-untie)*(46+i*9)+release*8;find('thread'+(i+1)).setAttribute('d',`M ${knotX} ${knotY} Q ${(knotX+x)/2-15} ${(knotY+y)/2+droop} ${x} ${y}`)});
 const width=29*(1-untie),height=11*(1-untie);
 find('bow').setAttribute('d',`M195 338 c ${-width*1.7} ${-height*2.5} ${-width*1.7} ${height*1.9} 0 0 c ${width*1.7} ${-height*2.5} ${width*1.7} ${height*1.9} 0 0 M195 338 q -8 14 -20 21`);
 find('bow').style.opacity=1-untie;find('wrap').style.opacity=1-untie;
 for(const id of ['thread1','thread2'])find(id).style.opacity=1-release;
 const angle=open*1.98,c=Math.cos(angle),skew=Math.sin(angle)*.19;
 find('leftGate').setAttribute('transform',`matrix(${c} ${-skew} 0 1 ${93*(1-c)} ${93*skew})`);
 find('rightGate').setAttribute('transform',`matrix(${c} ${skew} 0 1 ${297*(1-c)} ${-297*skew})`);
 find('paperScene').setAttribute('transform',`translate(195 ${342-rise*145}) scale(${1+rise*.14}) translate(-195 -342)`);
 find('stage').setAttribute('viewBox',`0 0 390 ${472-rise*120}`);
 if(run>2.5)find('heading').textContent='Mis humanos se casan';
 if(run>=4.55){finish();return}
 if(!complete&&(intro<1||pullAt!==null||queued))frameId=requestAnimationFrame(render);
}
function finish(){complete=true;queued=false;find('heading').textContent='Mis humanos se casan';find('details').hidden=false;find('open').hidden=true;find('jump').textContent='Horarios y asistencia ↓'}
function settle(){cancelAnimationFrame(frameId);pullAt=performance.now()-5000;zero=pullAt-3000;render(performance.now())}
find('open').onclick=()=>{if(reduced.matches){settle();return}queued=true;find('open').disabled=true;cancelAnimationFrame(frameId);frameId=requestAnimationFrame(render)};
find('jump').onclick=()=>{if(!complete)settle();find('details').scrollIntoView({behavior:reduced.matches?'instant':'smooth'})};
find('again').onclick=()=>{cancelAnimationFrame(frameId);complete=false;queued=false;pullAt=null;zero=performance.now();find('details').hidden=true;find('open').hidden=false;find('open').disabled=false;find('jump').textContent='Ver la invitación';find('heading').textContent='Tenemos un secreto.';scrollTo({top:0,behavior:'instant'});frameId=requestAnimationFrame(render)};
document.querySelector('form').onsubmit=e=>{e.preventDefault();find('response').textContent='Probaste la confirmación. Tu respuesta no se envió.'};
frameId=requestAnimationFrame(render);
