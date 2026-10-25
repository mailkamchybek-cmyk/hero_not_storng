'use strict';
const canvas=document.getElementById('game'),ctx=canvas.getContext('2d');
const image=new Image(),keys=new Set();
const FRAME_WIDTH=128,FRAME_HEIGHT=160,FRAMES=5,FPS=8,SPEED=200,GROUND=370;
let x=336,facing=1,clock=0,frame=0,last=null,ready=false;
image.onload=()=>{ready=true;document.getElementById('status').textContent='Даяр — A / D же жебелер менен басыңыз.';};
image.onerror=()=>{document.getElementById('status').textContent='walk.png файлы ушул папкада болушу керек.';};
image.src='walk.png';
function update(dt){
 const direction=Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft'));
 if(direction){facing=direction;x=Math.max(0,Math.min(canvas.width-FRAME_WIDTH,x+direction*SPEED*dt));clock+=dt;frame=Math.floor(clock*FPS)%FRAMES;}
 else{clock=0;frame=2;}
}
function draw(){ctx.clearRect(0,0,800,450);ctx.fillStyle='#e6e6e6';ctx.fillRect(0,0,800,450);ctx.fillStyle='#c8c8c8';ctx.fillRect(0,GROUND,800,1);if(!ready)return;ctx.save();ctx.imageSmoothingEnabled=false;ctx.translate(Math.round(x)+FRAME_WIDTH/2,GROUND-152);ctx.scale(facing,1);ctx.drawImage(image,frame*FRAME_WIDTH,0,FRAME_WIDTH,FRAME_HEIGHT,-FRAME_WIDTH/2,0,FRAME_WIDTH,FRAME_HEIGHT);ctx.restore();}
function tick(now){const dt=last===null?0:Math.min((now-last)/1000,.05);last=now;if(ready)update(dt);draw();requestAnimationFrame(tick);}
window.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','KeyA','KeyD'].includes(e.code)){e.preventDefault();keys.add(e.code);}});
window.addEventListener('keyup',e=>keys.delete(e.code));
window.addEventListener('blur',()=>{keys.clear();clock=0;frame=2;last=null;});
document.addEventListener('visibilitychange',()=>{if(document.hidden){keys.clear();clock=0;frame=2;last=null;}});
requestAnimationFrame(tick);
