/* Teatro de papel a 720 unidades de ancho. La misma línea de tiempo alimenta
   la intro interactiva y la exportación MP4, sin capturas del video ajeno. */
(()=>{
const C=document.getElementById('pelicula'),g=C.getContext('2d',{alpha:false});
const params=new URLSearchParams(location.search),exporting=params.has('export');
const W=720,H=exporting?1280:Math.round(720*Math.max(1.55,Math.min(2.25,innerHeight/Math.min(innerWidth,540))));
C.width=W;C.height=H;if(exporting)document.body.classList.add('exporting');
const A={},S={},DURATION=20.5;
const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x)},ease=x=>1-(1-clamp(x))**3;
const progress=(t,a,b)=>smooth((t-a)/(b-a));
function cover(im,zoom=1,x=0,y=0){const scale=Math.max(W/im.width,H/im.height)*zoom;g.drawImage(im,(W-im.width*scale)/2+x,(H-im.height*scale)/2+y,im.width*scale,im.height*scale)}
function sprite(im,x,y,w,angle=0,alpha=1){if(alpha<=0)return;const h=w*im.height/im.width;g.save();g.globalAlpha*=alpha;g.translate(x,y);g.rotate(angle);g.drawImage(im,-w/2,-h,w,h);g.restore()}
function label(s,x,y,size,family='Cormorant',color='#fff4df',alpha=1,spacing=0){if(alpha<=0)return;g.save();g.globalAlpha*=alpha;g.fillStyle=color;g.textAlign='center';g.textBaseline='alphabetic';g.font='400 '+size+'px '+family;if(!spacing)g.fillText(s,x,y,W-100);else{const chars=[...s],width=chars.reduce((sum,c)=>sum+g.measureText(c).width,0)+spacing*(chars.length-1);let cx=x-width/2;g.textAlign='left';chars.forEach(c=>{g.fillText(c,cx,y);cx+=g.measureText(c).width+spacing})}g.restore()}
function motes(t,night=false){g.save();for(let i=0;i<22;i++){const x=(i*137.53+Math.sin(t*.18+i)*17)%W,y=((i*117.7-t*(night?1.4:4))+H*4)%H;g.globalAlpha=(.13+.1*Math.sin(t*.9+i))*(night?.65:1);g.fillStyle=night?'#fff7d0':'#fff8e4';g.beginPath();g.arc(x,y,i%3===0?1.6:.8,0,Math.PI*2);g.fill()}g.restore()}
function shadow(im){const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const q=c.getContext('2d');q.drawImage(im,0,0);q.globalCompositeOperation='source-in';q.fillStyle='#342b29';q.fillRect(0,0,c.width,c.height);return c}
function light(t){g.save();g.globalCompositeOperation='screen';const x=300+Math.sin(t*.28)*150;const grad=g.createRadialGradient(x,H*.52,30,x,H*.52,W*.8);grad.addColorStop(0,'#fff1cb18');grad.addColorStop(1,'#fff1cb00');g.fillStyle=grad;g.fillRect(0,0,W,H);g.restore()}
function night(t){
 cover(A.palacio,1+progress(t,0,5.7)*.075,0,progress(t,0,5.7)*H*.012);
 const shade=g.createLinearGradient(0,0,0,H);shade.addColorStop(0,'#07132122');shade.addColorStop(.45,'#07132122');shade.addColorStop(1,'#07132155');g.fillStyle=shade;g.fillRect(0,0,W,H);
 const tx=progress(t,4.2,5.7),titleAlpha=progress(t,0,.9)*(1-tx);
 label('Estás invitado',360,H*.265,77,'Letra','#fff7e6',titleAlpha);
 label('A NUESTRA',360,H*.337,42,'Cormorant','#fff7e6',titleAlpha,2);
 label('GRAN NOCHE',360,H*.396,65,'Cormorant','#fff7e6',titleAlpha,1);
 const x=350+Math.sin(t*1.1)*24+ease((t-4.2)/1.4)*500;
 const y=H*.986+Math.sin(t*2.2)*3,w=Math.min(440,H*.34);
 sprite(S.pareja,x-40,y-40,w*1.05,Math.sin(t*1.1)*.035,.4);
 sprite(A.pareja,x,y,w,Math.sin(t*1.1)*.033,progress(t,0,.7));
 motes(t,true);
}
function ballroom(t){
 cover(A.salon,1.04+progress(t,5,17)*.035,Math.sin(t*.16)*8,0);
 g.fillStyle='#f3e6cd25';g.fillRect(0,0,W,H);light(t);
 const shadowAlpha=progress(t,11,13)*.22;
 sprite(S.pareja,140+Math.sin(t*.8)*22,H*.95,430,Math.sin(t*.9)*.045,shadowAlpha);
 sprite(S.pareja,575+Math.cos(t*.8)*25,H*.93,390,-Math.sin(t*.9)*.04,shadowAlpha*.9);
 const waiterX=-220+ease((t-5)/1.8)*560-ease((t-11.6)/2)*780;
 sprite(S.camarero,waiterX-60,H*.91-42,435,Math.sin(t*2)*.009,.24);
 sprite(A.camarero,waiterX,H*.96+Math.sin(t*2)*2,415,Math.sin(t*2)*.012);
 const a=progress(t,5.7,6.6)*(1-progress(t,10.5,11.2));
 label('Reservá esta noche',360,H*.17,61,'Letra','#352c26',a);
 label('Emilia',360,H*.275,104,'Letra','#352c26',a);
 label('&',360,H*.328,44,'Cormorant','#352c26',a);
 label('Nicolás',360,H*.415,106,'Letra','#352c26',a);
 const bird=progress(t,9.2,12.8);if(t>9.2&&t<12.8)sprite(A.palomas,-250+bird*1250,H*.24+Math.sin(bird*Math.PI)*-65,340,-.12+bird*.2);
 const ca=progress(t,11.3,12.3);
 label('Villa de las Rosas',360,H*.205,77,'Letra','#352c26',ca);
 label('20 · NOVIEMBRE · 2027',360,H*.27,26,'Sans','#352c26',ca,1);
 label('SAN ISIDRO · 17:30 H',360,H*.315,23,'Sans','#352c26',ca,1);
 const mx=950-ease((t-12.1)/2)*560;
 sprite(S.musico,mx-65,H*.94-25,435,Math.sin(t*2.1)*.035,.2*progress(t,12.2,13.8));
 sprite(A.musico,mx,H*.97+Math.sin(t*4)*5,420,Math.sin(t*2.1)*.033);
 motes(t);
}
function veil(p){
 if(p<=0||p>=1)return;
 // A curved sweep made of translucent folds, not a black crossfade.
 const x=-W*1.8+p*W*3.7;
 for(let i=0;i<5;i++){g.save();g.fillStyle=['#f8f2e6fa','#fffaf0c0','#e6d8bf80','#fffaf050','#fffaf024'][i];g.beginPath();g.moveTo(x+i*34,-H*.15);g.bezierCurveTo(x+W*.6+i*26,H*.15,x-W*.3,H*.7,x+W*.6,H*1.2);g.lineTo(x+W*1.3,H*1.2);g.bezierCurveTo(x+W*.35,H*.65,x+W*1.5,H*.2,x+W*.7,-H*.15);g.closePath();g.fill();g.restore()}
}
function closing(t){
 const a=progress(t,17.2,19);g.save();g.globalAlpha=a;g.fillStyle='#f3e9d7';g.fillRect(0,0,W,H);
 const rad=g.createRadialGradient(100,H*.6,0,100,H*.6,H*.7);rad.addColorStop(0,'#dfc59a33');rad.addColorStop(1,'#dfc59a00');g.fillStyle=rad;g.fillRect(0,0,W,H);
 sprite(A.palomas,360+Math.sin(t)*4,H*.2,230,Math.sin(t)*.02);
 label('Hay noches que lo cambian todo.',360,H*.27,35,'Cormorant','#382e26');
 label('Emilia',360,H*.372,130,'Letra','#382e26');label('&',360,H*.424,42,'Cormorant','#382e26');label('Nicolás',360,H*.51,130,'Letra','#382e26');
 label('Nos casamos',360,H*.565,37,'Cormorant','#382e26');label('20 · NOVIEMBRE · 2027',360,H*.608,23,'Sans','#382e26',1,1);
 sprite(A.pareja,360,H*.96,Math.min(350,H*.27),Math.sin(t)*.012);
 g.restore();
}
function render(t){g.clearRect(0,0,W,H);if(t<5.9)night(t);if(t>5.1){g.save();g.globalAlpha=progress(t,5.1,5.9);ballroom(t);g.restore()}if(t>=4.5&&t<=6.5)veil((t-4.5)/2);if(t>17.2)closing(t);document.getElementById('progreso').style.width=(clamp(t/DURATION)*100)+'%'}
window.CINE={duration:DURATION,render,exporting,width:W,height:H,ready:false};
window.cineReady=Promise.all([
 ...['palacio','salon','pareja','camarero','musico','palomas'].map(name=>new Promise((ok,no)=>{const im=new Image;im.onload=()=>{A[name]=im;ok()};im.onerror=()=>no(Error('No se pudo cargar '+name));im.src='assets/'+name+'.webp'})),
 document.fonts.load('40px Cormorant'),document.fonts.load('40px Letra'),document.fonts.load('20px Sans')
]).then(()=>{for(const n of ['pareja','camarero','musico'])S[n]=shadow(A[n]);CINE.ready=true;render(0);return CINE});
window.renderIntroAt=t=>{render(t);return C.toDataURL('image/jpeg',.94)};
})();
