'use strict';
const storyScenes = [
  {tag:'01 / КЕЗДЕШҮҮ',title:'Баары бир жолугушуудан башталды.',speaker:'Каарман',line:'Айсулууну биринчи көргөндө эле жүрөгүм башкача сокту. Аны менен дагы бир жолу жолугушкум келди.',note:'Бир аз убакыттан кийин экөөңөр кайра жолугуп, сүйлөшүп калдыңар.'},
  {tag:'02 / ТОСКООЛДУК',title:'Бирок алар буга каршы.',speaker:'Хулиган',line:'Эй, сен! Айсулууга жакындаба. Экөөңөрдүн бирге болушуңарга биз каршыбыз!',note:'Көчөнүн аркы башынан эки хулиган түз сени көздөй келе жатат.'},
  {tag:'03 / БИРИНЧИ КАРМАШ',title:'Артка кайтпайсың.',speaker:'Каарман',line:'Ким менен сүйлөшөрүн Айсулуу өзү чечет. Аны коркутууга силердин укугуңар жок!',note:'Биринчи максат: эки хулиганды жең. Алдыда Айсулууну алардын башчысынан куткаруу керек.'}
];
let storyIndex=0;
function renderStory(){const s=storyScenes[storyIndex];$('storyTag').textContent=s.tag;$('storyTitle').textContent=s.title;$('storySpeaker').textContent=s.speaker;$('storyLine').textContent=s.line;$('storyNote').textContent=s.note;$('storyProgress').textContent=(storyIndex+1)+' / '+storyScenes.length;$('storyNext').textContent=storyIndex===storyScenes.length-1?'МУШТАШТЫ БАШТОО →':'УЛАНТУУ →';$('storyDialog').dataset.scene=storyIndex;}
function beginStory(){reset();state='story';$('overlay').hidden=true;storyIndex=0;keys.clear();tapped.clear();renderStory();$('pauseButton').disabled=true;$('storyDialog').showModal();$('storyNext').focus();}
function finishStory(){if($('storyDialog').open)$('storyDialog').close();hero.x=350;state='playing';startWave(0);say('ЭКИ ХУЛИГАН КЕЛЕ ЖАТАТ — J МУШТУМ · K ТЕПКИ',4);$('pauseButton').disabled=false;$('pauseButton').textContent='Ⅱ';keys.clear();tapped.clear();last=performance.now();syncHud();$('pauseButton').focus();}
function nextStory(){if(state!=='story')return;if(storyIndex<storyScenes.length-1){storyIndex++;renderStory();}else finishStory();}
$('storyNext').addEventListener('click',nextStory);
$('storySkip').addEventListener('click',()=>{if(state==='story')finishStory();});
$('storyDialog').addEventListener('cancel',e=>e.preventDefault());
