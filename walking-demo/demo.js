'use strict';
const canvas=document.getElementById('game'),ctx=canvas.getContext('2d');
const image=new Image(),keys=new Set();
const runImage=new Image();
let runReady=false,animationState='IDLE',cyclePhase=0;
let autoRun=false;
const runButton=document.getElementById('runButton');
function syncRunButton(){runButton.textContent=autoRun?'Чуркоону токтотуу':'Чуркоо';runButton.setAttribute('aria-pressed',String(autoRun));}
runButton.addEventListener('click',()=>{autoRun=!autoRun;syncRunButton();});
runImage.onload=()=>{runReady=true;};
runImage.onerror=()=>{document.getElementById('status').textContent='run.png жүктөлгөн жок; басуу иштей берет.';};
runImage.src='run.png';
const FRAME_WIDTH=128,FRAME_HEIGHT=160,FRAMES=5,FPS=8,SPEED=200,GROUND=370;
let x=336,facing=1,clock=0,frame=0,last=null,ready=false;
image.onload=()=>{ready=true;document.getElementById('status').textContent='Даяр — A / D же жебелер менен басыңыз.';};
image.onerror=()=>{document.getElementById('status').textContent='walk.png файлы ушул папкада болушу керек.';};
image.src='walk.png';
function update(dt){
 const pressedDirection=Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft'));
 const direction=pressedDirection||(autoRun?facing:0);
 if(direction){
   const running=runReady&&(autoRun||keys.has('ShiftLeft')||keys.has('ShiftRight'));
   animationState=running?'RUN':'WALK';
   const fps=running?12:FPS,count=running?8:FRAMES,speed=running?400:SPEED;
   facing=direction;x=Math.max(0,Math.min(canvas.width-FRAME_WIDTH,x+direction*speed*dt));
   cyclePhase=(cyclePhase+dt*fps/count)%1;
   frame=Math.floor(cyclePhase*count);clock+=dt;
 }
 else{animationState='IDLE';clock=0;cyclePhase=0;frame=2;}
}
function draw(){ctx.clearRect(0,0,800,450);ctx.fillStyle='#e6e6e6';ctx.fillRect(0,0,800,450);ctx.fillStyle='#c8c8c8';ctx.fillRect(0,GROUND,800,1);if(!ready)return;ctx.save();ctx.imageSmoothingEnabled=false;ctx.translate(Math.round(x)+FRAME_WIDTH/2,GROUND-152);ctx.scale(facing,1);ctx.drawImage(animationState==='RUN'?runImage:image,frame*FRAME_WIDTH,0,FRAME_WIDTH,FRAME_HEIGHT,-FRAME_WIDTH/2,0,FRAME_WIDTH,FRAME_HEIGHT);ctx.restore();}
function tick(now){const dt=last===null?0:Math.min((now-last)/1000,.05);last=now;if(ready)update(dt);draw();requestAnimationFrame(tick);}
window.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','KeyA','KeyD','ShiftLeft','ShiftRight'].includes(e.code)){e.preventDefault();keys.add(e.code);}});
window.addEventListener('keyup',e=>keys.delete(e.code));
function releaseControls(){keys.clear();autoRun=false;syncRunButton();clock=0;cyclePhase=0;animationState='IDLE';frame=2;last=null;}
window.addEventListener('blur',releaseControls);
document.addEventListener('visibilitychange',()=>{if(document.hidden)releaseControls();});
requestAnimationFrame(tick);
