'use strict';
const heroAtlas = new Image();
heroAtlas.src = 'hero-sprites.png?v=1';
const walkAtlas=new Image();walkAtlas.src='walking-demo/walk.png?v=2';
const runAtlas=new Image();runAtlas.src='walking-demo/run.png?v=2';
const HERO_ROWS = {
  idleRight: [0,4,6], idleLeft: [1,4,6],
  walkRight: [2,8,10], walkLeft: [3,8,10],
  punchRight: [4,6,24], punchLeft: [5,6,24],
  kickRight: [6,6,24], kickLeft: [7,6,24],
  hurt: [8,4,16], jump: [9,6,10]
};
function heroSpriteFrame(u) {
  const side=u.face<0?'Left':'Right';
  if(u.hp<=0) return {row:8,frame:3,mirror:u.face<0};
  if(u.stun>0) return {row:8,frame:Math.min(3,Math.floor((.28-u.stun)/.28*4)),mirror:u.face<0};
  if(u.z>0||u.vz>0||u.landing>0) {
    const phase=u.landing>0?1:clamp((360-u.vz)/720,0,1);
    return {row:9,frame:Math.min(5,Math.floor(phase*6)),mirror:u.face<0};
  }
  if(u.attack) {
    const a=HERO_ROWS[u.attack.type+side];
    return {row:a[0],frame:Math.min(a[1]-1,Math.floor(u.attack.age*a[2])),mirror:false};
  }
  const a=HERO_ROWS['idle'+side];
  return {row:a[0],frame:Math.floor(u.isMoving?u.walk:time*a[2])%a[1],mirror:false};
}
function drawHeroSprite(u) {
  if(!heroAtlas.complete||!heroAtlas.naturalWidth) return false;
  if(u.dead>1.1) return true;
  const moving=u.isMoving&&u.hp>0&&u.stun<=0&&!u.attack&&u.z===0&&u.vz<=0&&!(u.landing>0);
  const motionImage=u.isRunning?runAtlas:walkAtlas;
  if(moving&&motionImage.complete&&motionImage.naturalWidth){
    const count=u.isRunning?8:5,frame=Math.floor((u.motionPhase||0)*count)%count,scale=84/144;
    ctx.save();ctx.translate(Math.round(u.x-camera),Math.round(u.y));ctx.scale(u.face,1);ctx.imageSmoothingEnabled=false;
    ctx.drawImage(motionImage,frame*128,0,128,160,-64*scale,-152*scale,128*scale,160*scale);ctx.restore();return true;
  }
  const a=heroSpriteFrame(u),x=Math.round(u.x-camera),y=Math.round(u.y-u.z),size=112;
  ctx.save();
  ctx.globalAlpha=u.hp<=0?Math.max(0,1-u.dead):1;
  ctx.fillStyle='#151d324f';ctx.beginPath();ctx.ellipse(x,u.y,22,6,0,0,Math.PI*2);ctx.fill();
  ctx.translate(x,y);
  if(a.mirror)ctx.scale(-1,1);
  if(u.hurt>0&&Math.floor(time*30)%2===0)ctx.globalAlpha*=.5;
  ctx.imageSmoothingEnabled=false;
  ctx.drawImage(heroAtlas,a.frame*64,a.row*64,64,64,-size/2,-61*size/64,size,size);
  ctx.restore();return true;
}
