(()=>{
const $=s=>document.querySelector(s),intro=$('#intro'),main=$('#invitacion'),reduce=matchMedia('(prefers-reduced-motion:reduce)');
main.inert=true;
// Pétalos contenidos en la carta: nunca pasan por delante del palacio.
const petalLayer=$('.petals'),letter=$('.letter');
const petalColors=['#cf8e9d','#d9a06f','#b7a0cc','#a7b69c','#d9b475'];
for(let i=0;i<23;i++){
 const petal=document.createElement('i');petal.className='petal';
 const duration=25+(i*7%12),size=9+(i*3%8);
 petal.style.cssText=`left:${3+(i*37%94)}%;--petal-color:${petalColors[i%5]};--petal-size:${size}px;--petal-duration:${duration}s;--petal-delay:${-duration*((i*.61803398875)%1)}s;--petal-turn:${i*47%360}deg;--petal-drift:${(i%2?1:-1)*(12+i*3%25)}px;--petal-opacity:${.22+(i%4)*.035}`;
 petalLayer.appendChild(petal);
}
const petalSize=new ResizeObserver(()=>petalLayer.style.setProperty('--petal-fall',`${letter.clientHeight+65}px`));petalSize.observe(letter);
const petalVisibility=new IntersectionObserver(entries=>letter.classList.toggle('petals-outside',!entries[0].isIntersecting));petalVisibility.observe(letter);
let playing=false,paused=false,stopped=false,elapsed=0,last=0,raf=0,transitionTimer=0;
function tick(now){if(!playing)return;if(!paused&&!document.hidden)elapsed+=Math.min((now-last)/1000,.1);last=now;CINE.render(elapsed);if(elapsed>=CINE.duration){leave();return}raf=requestAnimationFrame(tick)}
function leave(instant=false){if(stopped&&intro.hidden)return;playing=false;stopped=true;cancelAnimationFrame(raf);clearTimeout(transitionTimer);main.inert=false;main.removeAttribute('inert');document.body.classList.remove('intro-active');intro.classList.add('leaving');main.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});const hide=()=>{intro.hidden=true;intro.setAttribute('aria-hidden','true')};if(instant||reduce.matches)hide();else transitionTimer=setTimeout(hide,1000)}
function start(){clearTimeout(transitionTimer);stopped=false;playing=true;paused=false;elapsed=0;last=performance.now();intro.hidden=false;intro.removeAttribute('aria-hidden');intro.classList.remove('leaving');main.inert=true;document.body.classList.add('intro-active');window.scrollTo({top:0,behavior:'instant'});$('#pausa-intro').textContent='Ⅱ';$('#pausa-intro').setAttribute('aria-label','Pausar introducción');intro.focus({preventScroll:true});raf=requestAnimationFrame(tick)}
$('#saltar').addEventListener('click',()=>leave());$('#pausa-intro').addEventListener('click',()=>{paused=!paused;$('#pausa-intro').textContent=paused?'▶':'Ⅱ';$('#pausa-intro').setAttribute('aria-label',paused?'Reanudar introducción':'Pausar introducción')});
intro.addEventListener('keydown',e=>{if(e.key==='Escape'){leave();return}if(e.key==='Tab'){const first=$('#saltar'),last=$('#pausa-intro');if(e.shiftKey&&(document.activeElement===first||document.activeElement===intro)){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
$('#repetir').addEventListener('click',()=>{if(CINE.ready)start()});
if(reduce.matches)leave(true);else if(!CINE.exporting)intro.focus({preventScroll:true});
window.cineReady.then(()=>{$('#cargando').hidden=true;if(!stopped&&!CINE.exporting)start()}).catch(e=>{console.error(e);leave(true)});
let motionPaused=reduce.matches;main.classList.toggle('paused',motionPaused);$('#movimiento').textContent=motionPaused?'Activar movimiento':'Pausar movimiento';$('#movimiento').setAttribute('aria-pressed',String(motionPaused));
$('#movimiento').addEventListener('click',()=>{motionPaused=!motionPaused;main.classList.toggle('paused',motionPaused);$('#movimiento').textContent=motionPaused?'Activar movimiento':'Pausar movimiento';$('#movimiento').setAttribute('aria-pressed',String(motionPaused))});
reduce.addEventListener('change',e=>{if(e.matches){motionPaused=true;main.classList.add('paused');$('#movimiento').textContent='Activar movimiento';$('#movimiento').setAttribute('aria-pressed','true');if(playing)leave(true)}});
document.documentElement.classList.add('enhanced');const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}}),{threshold:.08});document.querySelectorAll('.reveal').forEach(e=>observer.observe(e));
let scrollPending=false;function route(){const r=$('.agenda').getBoundingClientRect();const p=Math.max(0,Math.min(1,(innerHeight*.75-r.top)/r.height));$('#camino').style.strokeDashoffset=String(1-p);scrollPending=false}addEventListener('scroll',()=>{if(!scrollPending){scrollPending=true;requestAnimationFrame(route)}},{passive:true});route();
$('#mapa').href=EVENTO.mapa;
$('#calendario').addEventListener('click',()=>{const ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//MyB Invite//Boda Cine Demo//ES','BEGIN:VEVENT','UID:boda-cine-demo-20271120@mybinvite.com','DTSTAMP:20261109T120000Z','DTSTART:20271120T203000Z','DTEND:20271121T060000Z','SUMMARY:Boda de Emilia y Nicolás (demo)','LOCATION:Villa de las Rosas - San Isidro (datos ficticios)','DESCRIPTION:Evento de demostración de MyB Invite.','END:VEVENT','END:VCALENDAR'].join('\r\n');const url=URL.createObjectURL(new Blob([ics],{type:'text/calendar;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='Emilia-y-Nicolas-demo.ics';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000)});
function attending(){const yes=$('input[name="asiste"]:checked').value==='si';$('#detalles-asistencia').hidden=!yes;$('#personas').disabled=!yes;$('#comida').disabled=!yes}document.querySelectorAll('[name=asiste]').forEach(e=>e.addEventListener('change',attending));
function showAnswer(data){$('#asistencia').hidden=true;$('#respuesta').hidden=false;$('#saludo').textContent=(data.asiste==='si'?'¡Te esperamos, ':'Gracias por avisarnos, ')+data.nombre+'!';$('#mensaje-respuesta').textContent=data.asiste==='si'?'Ya sos parte de esta historia.':'Te vamos a tener cerquita, aunque sea a la distancia.';$('#respuesta').focus({preventScroll:true});$('#respuesta').scrollIntoView({behavior:reduce.matches?'instant':'smooth',block:'center'})}
$('#asistencia').addEventListener('submit',e=>{e.preventDefault();$('#error').textContent='';const f=new FormData(e.currentTarget),nombre=String(f.get('nombre')||'').trim();if(!nombre){$('#nombre').setCustomValidity('Escribí tu nombre.');$('#nombre').reportValidity();return}$('#nombre').setCustomValidity('');const data={nombre,email:String(f.get('email')).trim(),asiste:f.get('asiste'),personas:f.get('asiste')==='si'?Number(f.get('personas')):0,comida:String(f.get('comida')||'').trim(),demo:true,fecha:new Date().toISOString()};try{localStorage.setItem(EVENTO.storageKey,JSON.stringify(data));showAnswer(data)}catch{ $('#error').textContent='El navegador no permite guardar esta prueba. Habilitá el almacenamiento local e intentá otra vez.' }});
$('#nombre').addEventListener('input',()=>$('#nombre').setCustomValidity(''));
$('#editar').addEventListener('click',()=>{$('#respuesta').hidden=true;$('#asistencia').hidden=false;$('#nombre').focus()});
try{const saved=JSON.parse(localStorage.getItem(EVENTO.storageKey)||'null');if(saved){$('#nombre').value=saved.nombre||'';$('#email').value=saved.email||'';const radio=document.querySelector('input[name="asiste"][value="'+(saved.asiste==='no'?'no':'si')+'"]');radio.checked=true;$('#personas').value=String(saved.personas||1);$('#comida').value=saved.comida||'';attending()}}catch{}
window.finishIntro=leave;
})();
