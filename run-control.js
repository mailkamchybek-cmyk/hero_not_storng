'use strict';
let runEnabled=false;
const mainRunButton=document.getElementById('mainRunButton');
function setRunEnabled(value){runEnabled=!!value;mainRunButton.textContent=runEnabled?'Чуркоону токтотуу':'Чуркоо';mainRunButton.setAttribute('aria-pressed',String(runEnabled));}
mainRunButton.addEventListener('click',()=>{if(state==='playing')setRunEnabled(!runEnabled);});
