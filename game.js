'use strict';
const canvas=document.getElementById('game'),ctx=canvas.getContext('2d');
const $=id=>document.getElementById(id),W=960,H=540,WORLD=3100,TOP=362,BOTTOM=480;
const keys=new Set(),tapped=new Set();
let state='title',hero,enemies,coins,particles,texts,stage,camera=0,time=0,shake=0,last=0,announcement='',announceTime=0,combo=0,comboTime=0;
let shopWasPlaying=false;
const waves=[{x:520,name:'01 / ЭКИ ХУЛИГАН',count:2},{x:1450,name:'02 / БАЗАР ЖОЛУ',count:3},{x:2380,name:'03 / АЙСУЛУУНУ КУТКАР',count:3}];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function unit(x,y,boss=false){return{x,y,z:0,vz:0,hp:boss?170:55,maxHp:boss?170:55,face:-1,cool:0,hurt:0,stun:0,attack:null,dead:0,boss,walk:0,kind:0};}
function reset(){hero=unit(150,430);hero.hp=hero.maxHp=100;hero.face=1;hero.money=0;hero.invuln=0;enemies=[];coins=[];particles=[];texts=[];stage=0;camera=0;time=0;shake=0;combo=0;comboTime=0;announcement='КӨЧӨНҮН АЯГЫНА ЖЕТ →';announceTime=3;waves.forEach(w=>{w.started=false;w.cleared=false});keys.clear();tapped.clear();}
function begin(){beginStory();}
function say(text,duration=2.4){announcement=text;announceTime=duration;}
function showMenu(tag,title,description,button){$('menuTag').textContent=tag;$('menuTitle').textContent=title;$('menuDescription').textContent=description;$('startButton').textContent=button;$('menuNote').textContent='J — муштум · K — тепки · Space — секирүү';$('overlay').hidden=false;keys.clear();tapped.clear();}
function pause(){if(state==='playing'){state='paused';showMenu('ТЫНЫГУУ','ПАУЗА','Көчө сени күтүп турат.','УЛАНТУУ →');$('pauseButton').textContent='▶';}else if(state==='paused'){state='playing';$('overlay').hidden=true;$('pauseButton').textContent='Ⅱ';}}
function startWave(index){const w=waves[index];w.started=true;stage=index;for(let i=0;i<w.count;i++){const e=unit(w.x+155+i*85,390+(i%3)*32,index===2&&i===2);e.kind=i%3;e.cool=.6+i*.35;enemies.push(e);}say(index===2?'АКЫРКЫ КАРМАШ — БАШЧЫ':w.name,3);}
function attack(u,type){if(u.cool>0||u.stun>0||u.hp<=0)return false;u.attack={type,age:0,hit:false};u.cool=type==='kick'?.55:.32;return true;}
function impact(x,y,color,n=8){for(let i=0;i<n;i++)particles.push({x,y,vx:(Math.random()-.5)*180,vy:-40-Math.random()*100,life:.25+Math.random()*.2,color});}
function damage(target,amount,attacker){if(target.hp<=0||target.hurt>0||(target===hero&&hero.invuln>0))return false;target.hp=Math.max(0,target.hp-amount);target.hurt=.17;target.stun=.28;target.x=clamp(target.x+attacker.face*13,20,WORLD-20);impact(target.x,target.y-target.z-45,'#ffd486');texts.push({x:target.x,y:target.y-target.z-75,text:String(amount),life:.65,color:'#ffdc91'});shake=target===hero?5:3;if(target===hero){hero.invuln=.65;combo=0;}else{combo++;comboTime=1.5;if(target.hp===0){for(let i=0;i<(target.boss?6:2);i++)coins.push({x:target.x+(i-1)*13,y:target.y+Math.random()*12,value:10,age:0});}}return true;}
function hitAttack(u,targets){const a=u.attack;if(!a||a.hit||a.age<.09)return;a.hit=true;const range=a.type==='kick'?90:65;for(const t of targets){if(t.hp<=0||Math.abs(t.y-u.y)>26)continue;const dx=(t.x-u.x)*u.face;if(dx>-12&&dx<range&&Math.abs(t.z-u.z)<65)damage(t,u===hero?(a.type==='kick'?22:14):(u.boss?18:9),u);}}
function updateUnit(u,dt){u.landing=Math.max(0,(u.landing||0)-dt);u.cool=Math.max(0,u.cool-dt);u.hurt=Math.max(0,u.hurt-dt);u.stun=Math.max(0,u.stun-dt);if(u.attack){u.attack.age+=dt;if(u.attack.age>.25)u.attack=null;}if(u.z>0||u.vz>0){u.z+=u.vz*dt;u.vz-=850*dt;if(u.z<=0){u.z=0;u.vz=0;u.landing=.1;}}if(u.hp<=0)u.dead+=dt;}
function openShop(){if(state!=='playing')return;const danger=enemies.some(e=>e.hp>0);if(danger){say('АЛГАЧ ДУШМАНДАРДЫ ЖЕҢ');return;}shopWasPlaying=true;state='shop';keys.clear();tapped.clear();$('shopMessage').textContent='Сенде '+hero.money+' сом бар.';$('shop').showModal();}
function update(dt){time+=dt;if(state!=='playing')return;announceTime=Math.max(0,announceTime-dt);comboTime=Math.max(0,comboTime-dt);shake=Math.max(0,shake-24*dt);hero.invuln=Math.max(0,hero.invuln-dt);updateUnit(hero,dt);
  let dx=Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft'));
  let dy=Number(keys.has('KeyS')||keys.has('ArrowDown'))-Number(keys.has('KeyW')||keys.has('ArrowUp'));
  hero.isMoving=false;
  if(hero.stun<=0){hero.isMoving=!!(dx||dy);if(dy&&!dx)hero.walk+=dt*10;const speed=hero.attack?65:175;if(dx){hero.face=Math.sign(dx);hero.walk+=dt*10;}hero.x+=dx*speed*dt;hero.y=clamp(hero.y+dy*110*dt,TOP,BOTTOM);if(tapped.has('Space')&&hero.z===0){hero.vz=360;impact(hero.x,hero.y,'#7a7a83',4);}if(tapped.has('KeyJ'))attack(hero,'punch');if(tapped.has('KeyK'))attack(hero,'kick');}
  if(tapped.has('KeyE'))openShop();
  const active=waves.find(w=>w.started&&!w.cleared);const maxX=active?active.x+490:WORLD-60;hero.x=clamp(hero.x,Math.max(25,camera+15),maxX);
  for(let i=0;i<waves.length;i++)if(!waves[i].started&&hero.x>waves[i].x-190&&(i===0||waves[i-1].cleared))startWave(i);
  for(const e of enemies){updateUnit(e,dt);if(e.hp<=0)continue;e.face=hero.x<e.x?-1:1;const ex=hero.x-e.x,ey=hero.y-e.y;if(e.stun<=0&&!e.attack){const d=Math.hypot(ex,ey);if(Math.abs(ex)>48||Math.abs(ey)>20){e.x+=ex/(d||1)*(e.boss?88:65)*dt;e.y=clamp(e.y+ey/(d||1)*65*dt,TOP,BOTTOM);e.walk+=dt*8;}else attack(e,e.boss?'kick':'punch');}hitAttack(e,[hero]);}
  hitAttack(hero,enemies);
  for(const w of waves)if(w.started&&!w.cleared&&enemies.every(e=>e.hp<=0)){w.cleared=true;say(w===waves[2]?'АЙСУЛУУ АЛДЫДА! АГА ЖЕТ →':w===waves[0]?'ЭКӨӨ ЖЕҢИЛДИ! АЙСУЛУУНУ БАШЧЫДАН КУТКАР →':'ЖОЛ АЧЫЛДЫ! E — ДҮКӨН · АЛГА →',3);}
  for(const c of coins){c.age+=dt;if(Math.hypot(c.x-hero.x,c.y-hero.y)<48){hero.money+=c.value;c.taken=true;texts.push({x:c.x,y:c.y-50,text:'+'+c.value+' ◈',life:.7,color:'#ffdb77'});}}coins=coins.filter(c=>!c.taken);
  for(const p of particles){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=400*dt;}particles=particles.filter(p=>p.life>0);for(const t of texts){t.life-=dt;t.y-=30*dt;}texts=texts.filter(t=>t.life>0);
  camera=clamp(hero.x-310,0,WORLD-W);
  if(hero.hp<=0){state='lost';showMenu('КӨЧӨ САБАК БЕРДИ','КАЙРА ТУР.','Чогулган акча: '+hero.money+' сом. Аралыкты кармап, тепки менен каршы ал.','КАЙРА ОЙНОО →');}
  else if(waves[2].cleared&&hero.x>2940){state='won';showMenu('ҮЧ КВАРТАЛ АРТТА КАЛДЫ','АЙСУЛУУ КУТКАРЫЛДЫ!','Айсулуу: «Келериңе ишенгем. Рахмат!» Чогулган акча: '+hero.money+' сом.','КАЙРА ОЙНОО →');}
  tapped.clear();syncHud();
}
function syncHud(){$('healthFill').style.width=hero.hp+'%';$('healthText').textContent=hero.hp+' / 100';$('money').textContent=hero.money;$('stageLabel').textContent=waves[stage].name;const alive=enemies.filter(e=>e.hp>0).length;$('objective').textContent=alive?'Душмандар: '+alive:'Айсулууну куткар →';$('announcement').textContent=announceTime>0?announcement:'';$('combo').textContent=comboTime>0&&combo>1?combo+' HIT!':'';}
function rect(x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),w,h);}
function text(s,x,y,size=12,color='#f3dfbd',align='left'){ctx.fillStyle=color;ctx.font='bold '+size+'px monospace';ctx.textAlign=align;ctx.fillText(s,x,y);ctx.textAlign='left';}
function building(x,y,width,height,color,sign){rect(x,y,width,height,color);rect(x-4,y-7,width+8,8,'#1b2333');rect(x+7,y+8,width-14,4,'#ffffff12');for(let r=0;r<3;r++)for(let c=0;c<Math.floor(width/45);c++){const wx=x+15+c*44,wy=y+25+r*53;rect(wx,wy,25,34,'#151e30');rect(wx+3,wy+3,19,26,(r+c)%3===0?'#d5945f':'#3a4b60');rect(wx+11,wy+3,2,27,'#202b3d');rect(wx,wy+34,27,3,'#a48573');}rect(x+width/2-20,y+height-60,40,60,'#172333');rect(x+width/2-16,y+height-55,32,48,'#344255');if(sign){rect(x+10,y+height-99,width-20,30,'#182c3c');rect(x+12,y+height-97,width-24,2,'#e1ab6b');text(sign,x+width/2,y+height-78,13,'#f2c182','center');}}
function drawAisuluu(){
  const x=3000,y=430;
  rect(x-14,y-68,28,30,'#251f29');rect(x-10,y-63,20,21,'#eab28c');rect(x-12,y-71,24,13,'#8c3f46');rect(x-10,y-71,20,3,'#e4c18b');rect(x+3,y-80,5,10,'#e6d9ba');
  rect(x-10,y-42,20,24,'#f3d8b4');rect(x-16,y-40,8,23,'#923947');rect(x+8,y-40,8,23,'#923947');rect(x-15,y-20,30,19,'#a74450');rect(x-8,y-1,6,3,'#242c3a');rect(x+3,y-1,6,3,'#242c3a');rect(x-14,y-52,5,42,'#26202a');
  if(waves[2].cleared)text('Айсулуу',x,y-91,12,'#ffe0a3','center');
}
function scenery(){rect(0,0,W,H,'#263348');const sky=ctx.createLinearGradient(0,70,0,330);sky.addColorStop(0,'#3f415e');sky.addColorStop(1,'#cb8c78');ctx.fillStyle=sky;ctx.fillRect(0,60,W,270);rect(672-camera*.08,115,64,64,'#eab087');rect(664-camera*.08,125,80,44,'#eab087');for(let i=0;i<16;i++){const x=i*100-camera*.2;rect(x,200-(i%3)*28,86,140,'#42445a');rect(x+12,210-(i%3)*28,5,6,'#c99676');}
  ctx.save();ctx.translate(-camera,0);for(let i=0;i<15;i++){const x=i*225;building(x,155+(i%3)*20,216,190-(i%3)*20,['#5d5059','#68605b','#645a66','#706356'][i%4],['ЧАЙ & САМСА','КӨЧӨ МЕКТЕБИ','АРКАДА','КИТЕП'][i%4]);}
  rect(0,338,WORLD,20,'#a3968a');rect(0,358,WORLD,8,'#2d3441');rect(0,366,WORLD,145,'#54545b');rect(0,499,WORLD,41,'#353c48');rect(0,500,WORLD,4,'#8d8580');
  for(let i=0;i<90;i++){const x=i*37;rect(x,392+(i%5)*21,17,2,'#62616a');if(i%3===0)rect(x+8,473,10,3,'#393e48');}for(let i=0;i<9;i++){const x=i*370+250;rect(x,245,5,113,'#252c3b');rect(x-12,243,30,7,'#252c3b');rect(x-9,249,22,5,'#efc887');rect(x-2,358,14,4,'#202936');}
  for(const w of waves)if(w.started&&!w.cleared){for(let y=365;y<490;y+=25){rect(w.x+490,y,5,14,'#f3af5f');rect(w.x+493,y+10,8,4,'#1a2231');}}
  drawAisuluu();rect(2988,260,8,102,'#233045');rect(2960,261,66,37,'#cb8050');text('EXIT',2993,286,17,'#1c2737','center');
  for(const c of coins){rect(c.x-5,c.y-8+Math.sin(time*6+c.x)*3,10,7,'#ffd474');rect(c.x-3,c.y-7+Math.sin(time*6+c.x)*3,2,4,'#a96d3b');}ctx.restore();
}
function fighter(u,isHero){if(isHero&&drawHeroSprite(u))return;if(u.dead>1.1)return;const x=Math.round(u.x-camera),y=Math.round(u.y-u.z);ctx.save();ctx.globalAlpha=u.hp<=0?Math.max(0,1-u.dead):1;ctx.fillStyle='#151d324f';ctx.beginPath();ctx.ellipse(x,u.y,22,6,0,0,Math.PI*2);ctx.fill();ctx.translate(x,y);ctx.scale(u.face,1);if(u.hp<=0){ctx.rotate(Math.PI/2);ctx.translate(-25,-10);}const scale=u.boss?1.32:1;ctx.scale(scale,scale);if(u.hurt>0&&Math.floor(time*30)%2===0)ctx.globalAlpha*=.5;
  const shirt=isHero?'#df8c52':u.boss?'#8f5d91':['#779184','#7d779e','#7595b1'][u.kind];const dark=isHero?'#995139':'#41485b';const skin='#edb789',shade='#c88c65',hair=isHero?'#302b2d':'#282c38';const stride=u.attack?0:Math.sin(u.walk)*5;
  rect(-14,-53,29,37,'#141c2b');rect(-11,-50,23,31,shirt);rect(-11,-33,23,7,dark);rect(-7,-26,14,3,'#332b33');rect(-10,-22,8,16+stride,'#283448');rect(3,-22,8,16-stride,'#283448');rect(-13,-8+stride,12,7,'#141b29');rect(3,-8-stride,13,7,'#141b29');
  rect(-14,-77,28,26,'#161c29');rect(-12,-74,24,22,skin);rect(-12,-59,24,7,shade);rect(-13,-77,26,8,hair);rect(-15,-72,5,13,hair);rect(9,-72,6,7,hair);rect(2,-65,4,4,'#222635');rect(8,-65,4,4,'#222635');rect(9,-58,6,2,'#875442');if(isHero){rect(-13,-73,27,3,'#efe1be');rect(-19,-71,8,3,'#cd7e58');}if(u.boss){rect(-14,-68,28,6,'#141b28');rect(0,-67,12,3,'#e3ba6d');}
  if(u.attack){const a=u.attack;if(a.type==='kick'){rect(-10,-46,9,18,shirt);rect(-10,-31,10,8,skin);rect(8,-23,26,8,'#283448');rect(28,-23,13,10,'#141b29');}else{rect(-13,-47,9,19,shirt);rect(8,-47,17,9,shirt);rect(23,-48,14,11,skin);rect(35,-47,4,9,shade);}}else{rect(-18,-47,9,18,shirt);rect(-17,-31,9,9,skin);rect(11,-47,9,16,shirt);rect(12,-33,9,10,skin);}
  ctx.restore();if(!isHero&&u.hp>0){const width=u.boss?52:34;rect(x-width/2,y-(u.boss?112:91),width,4,'#202a3a');rect(x-width/2,y-(u.boss?112:91),width*u.hp/u.maxHp,4,u.boss?'#ed9a64':'#b9c88c');if(u.boss)text('БАШЧЫ',x,y-119,9,'#edc59a','center');}}
function draw(){ctx.save();if(shake>0)ctx.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);scenery();const actors=[...enemies,hero].sort((a,b)=>a.y-b.y);for(const a of actors)fighter(a,a===hero);for(const p of particles)rect(p.x-camera,p.y,4,4,p.color);for(const t of texts)text(t.text,t.x-camera,t.y,15,t.color,'center');if(state==='playing'&&enemies.every(e=>e.hp<=0)&&Math.sin(time*5)>0)text('GO →',850,325,22,'#ffe0a3');ctx.restore();rect(0,0,W,4,'#e4a268');}
function frame(now){const dt=Math.min((now-last)/1000||0,.04);last=now;update(dt);draw();requestAnimationFrame(frame);}
function press(code){if(state==='playing'&&!keys.has(code))tapped.add(code);keys.add(code);}
window.addEventListener('keydown',e=>{if(state==='story'){if((e.code==='Enter'||e.code==='Space')&&!e.repeat){e.preventDefault();nextStory();}return;}if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();if(e.code==='Escape'){if(state!=='shop')pause();return;}if(state==='shop'){if(e.code==='KeyE')$('shop').close();return;}if(e.code==='Enter'&&state!=='playing'){if(state==='paused')pause();else begin();return;}press(e.code);});
window.addEventListener('keyup',e=>keys.delete(e.code));window.addEventListener('blur',()=>{keys.clear();tapped.clear();if(state==='playing')pause();});
$('startButton').addEventListener('click',()=>state==='paused'?pause():begin());$('pauseButton').addEventListener('click',pause);
$('buyFood').addEventListener('click',()=>{if(hero.hp>=100){$('shopMessage').textContent='HP толук.';return;}if(hero.money<20){$('shopMessage').textContent='20 сом керек. Душмандардан түшкөн тыйындарды чогулт.';return;}hero.money-=20;hero.hp=Math.min(100,hero.hp+40);$('shopMessage').textContent='Күч топтолду! Калганы: '+hero.money+' сом.';syncHud();});
$('shop').addEventListener('close',()=>{if(shopWasPlaying){state='playing';shopWasPlaying=false;last=performance.now();keys.clear();tapped.clear();}});
$('fullButton').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{$('fullButton').textContent='F11 — толук экран';}});
for(const b of document.querySelectorAll('[data-key]')){b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);press(b.dataset.key);});for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,()=>keys.delete(b.dataset.key));}
reset();syncHud();requestAnimationFrame(frame);
