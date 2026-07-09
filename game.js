// Scratch Life - Version plus addictive
let money = 0, xp = 0, level = 1, debt = 0;
let debtHours = 0, blockedHours = 0;
let currentTab = "work", infiniteMoney = false;

let chanceLevel = 1, symbolLevel = 1, scratchLevel = 1, autoLevel = 0;
let workLevel = 1, workGain = 1;

let hype = 0;
let streak = 0;
let ticketsBought = 0;
let jackpotsFound = 0;

let gadgets = { trash:false, robot:false, fan:false, mat:false };
let tableTickets = [];
let activeTicket = null;
let draggingTicket = null;
let dragOffsetX = 0, dragOffsetY = 0;

let achievements = {};

const tickets = [
  {
    name:"Petit Départ", icon:"🎟️", rarity:"Commun", price:15, max:20, level:1,
    style:"ticket-orange", rule:"Trouve 3 symboles identiques.",
    symbols:[
      {icon:"🍒",value:0,chance:58},{icon:"🍋",value:1,chance:24},
      {icon:"🍀",value:3,chance:9},{icon:"💎",value:8,chance:1.5},
      {icon:"?",value:20,chance:0.03}
    ]
  },
  {
    name:"Double Galère", icon:"2x", rarity:"Rare", price:75, max:120, level:3,
    style:"ticket-blue", rule:"Trouve deux gains identiques.",
    symbols:[
      {icon:"0€",value:0,chance:63},{icon:"2€",value:2,chance:20},
      {icon:"5€",value:5,chance:8},{icon:"20€",value:20,chance:1.5},
      {icon:"?",value:120,chance:0.02}
    ]
  },
  {
    name:"Pommier", icon:"🌳", rarity:"Épique", price:250, max:600, level:5,
    style:"ticket-apple", rule:"Les fruits gagnent. Les vers détruisent l’ambiance.",
    symbols:[
      {icon:"🪱",value:0,chance:62},{icon:"🍏",value:5,chance:18},
      {icon:"🍎",value:15,chance:7},{icon:"🍐",value:60,chance:1.2},
      {icon:"?",value:600,chance:0.015}
    ]
  },
  {
    name:"Coffre Royal", icon:"🔐", rarity:"Légendaire", price:1500, max:4000, level:8,
    style:"ticket-gold", rule:"La clé ouvre le gain. Le vide ouvre la dépression.",
    symbols:[
      {icon:"📦",value:0,chance:68},{icon:"🗝️",value:30,chance:13},
      {icon:"💰",value:150,chance:4},{icon:"👑",value:700,chance:0.8},
      {icon:"?",value:4000,chance:0.01}
    ]
  },
  {
    name:"Dernière Chance", icon:"💀", rarity:"Mythique", price:12000, max:100000, level:12,
    style:"ticket-red", rule:"Le symbole ? est le jackpot. Le reste est une gifle fiscale.",
    symbols:[
      {icon:"💀",value:0,chance:72},{icon:"🩸",value:-500,chance:10},
      {icon:"🔥",value:500,chance:3},{icon:"💎",value:3000,chance:0.5},
      {icon:"?",value:100000,chance:0.005}
    ]
  }
];

const gadgetsList = [
  {key:"trash",name:"Poubelle",icon:"🗑️",price:80,desc:"Jeter les tickets. Pas fini = pas de dette."},
  {key:"fan",name:"Ventilo",icon:"🌀",price:200,desc:"Tourne vite. Sert à rien. Donc indispensable."},
  {key:"robot",name:"Robot",icon:"🤖",price:500,desc:"Assistant qui juge tes décisions."},
  {key:"mat",name:"Tapis",icon:"▦",price:750,desc:"Tapis de grattage premium."}
];

const workTasks = [
  {name:"Nettoyer une vitre sale",reward:1,xp:5,dirt:26},
  {name:"Nettoyer un pare-brise dégueu",reward:2,xp:7,dirt:34},
  {name:"Ranger le tabac",reward:3,xp:9,dirt:42},
  {name:"Nettoyer une voiture entière",reward:5,xp:12,dirt:55}
];

const objectives = [
  {id:"money10",text:"Gagner tes premiers 10€",done:()=>money>=10},
  {id:"firstTicket",text:"Acheter ton premier ticket",done:()=>ticketsBought>=1},
  {id:"level3",text:"Atteindre le niveau 3",done:()=>level>=3},
  {id:"trash",text:"Acheter la poubelle",done:()=>gadgets.trash},
  {id:"pommier",text:"Débloquer Pommier",done:()=>level>=5},
  {id:"jackpot",text:"Trouver un symbole ?",done:()=>jackpotsFound>=1}
];

function $(id){return document.getElementById(id);}
function format(n){if(n>=1000000)return(n/1000000).toFixed(2)+"M"; if(n>=1000)return(n/1000).toFixed(1)+"K"; return Math.floor(n);}

function updateUI(){
  $("money").textContent=infiniteMoney?"∞":format(money);
  $("level").textContent=level; $("xp").textContent=xp; $("xpFill").style.width=xp+"%";
  $("chanceLevel").textContent=chanceLevel; $("chanceCost").textContent=format(chanceLevel*700);
  $("symbolLevel").textContent=symbolLevel; $("symbolCost").textContent=format(symbolLevel*1000);
  $("scratchLevel").textContent=scratchLevel; $("scratchCost").textContent=format(scratchLevel*500);
  $("autoLevel").textContent=autoLevel; $("autoCost").textContent=format((autoLevel+1)*2000);
  $("workGainText").textContent=format(workGain);
  $("debt").textContent=format(debt);

  $("trash").className=gadgets.trash?"trash active":"trash";
  $("fan").className=gadgets.fan?"decor fan active":"decor fan";
  $("robot").className=gadgets.robot?"robot active":"robot";
  $("scratchMat").className=gadgets.mat?"scratch-mat active":"scratch-mat";

  $("debtTimer").textContent =
    blockedHours>0 ? `Blocage : ${blockedHours}h restantes.`
    : debt>0 ? `Dette à payer avant : ${debtHours}h.`
    : `Aucune dette. Hype : ${hype}% | Streak : ${streak}`;
}

function addHistory(text){
  const div=document.createElement("div");
  div.className="history-entry";
  div.innerHTML=text;
  $("history").prepend(div);
}

function showResult(text,color){
  const o=$("resultOverlay");
  o.textContent=text; o.style.color=color; o.className="show";
  setTimeout(()=>o.className="",1200);
}

function unlock(id,text){
  if(achievements[id])return;
  achievements[id]=true;
  hype=Math.min(100,hype+10);
  showResult("SUCCÈS 🔥","#ffd43b");
  addHistory(`🏆 Succès débloqué : <b>${text}</b>`);
}

function checkObjectives(){
  objectives.forEach(o=>{ if(o.done()) unlock(o.id,o.text); });
}

function addXp(n){
  xp+=n;
  while(xp>=100){
    xp-=100; level++;
    showResult("NIVEAU +1 ⭐","#ffd43b");
    addHistory(`⭐ Niveau ${level} atteint. Nouveau contenu proche...`);
  }
  checkObjectives();
}

function setTab(tab){currentTab=tab;renderCatalog();renderMain();}

function renderCatalog(){
  const catalog=$("catalog"); catalog.innerHTML="";
  if(currentTab==="gadgets"){
    $("catalogTitle").textContent="Gadgets";
    gadgetsList.forEach(g=>{
      const item=document.createElement("div");
      item.className="catalog-item";
      item.innerHTML=`<div class="catalog-icon">${g.icon}</div><div><b>${g.name}</b><br>${gadgets[g.key]?"Acheté":format(g.price)+"€"}<br><small>${g.desc}</small></div>`;
      item.onclick=()=>buyGadget(g);
      catalog.appendChild(item);
    });
    return;
  }

  $("catalogTitle").textContent="Catalogue";
  tickets.forEach(t=>{
    const locked=level<t.level;
    const item=document.createElement("div");
    item.className="catalog-item"+(locked?" locked":"");
    item.innerHTML=`<div class="catalog-icon">${t.icon}</div><div><b>${locked?"Verrouillé":t.name}</b><br>${locked?"Niveau "+t.level:format(t.price)+"€"}<br><small>${t.rarity} — Max ${locked?"?":format(t.max)+"€"}</small></div>`;
    item.onclick=()=>{if(!locked)buyTicket(t);};
    catalog.appendChild(item);
  });

  const obj=document.createElement("div");
  obj.className="catalog-item"; obj.style.display="block";
  obj.innerHTML="<b>Objectifs</b><br>"+objectives.map(o=>(o.done()?"✅ ":"⬜ ")+o.text).join("<br>");
  catalog.appendChild(obj);
}

function renderMain(){
  $("workScreen").style.display=currentTab==="work"?"block":"none";
  renderTableTickets(); updateUI();
}

function randomEvent(){
  if(Math.random()>0.16)return;
  const events=[
    ()=>{money+=2;addHistory("🎁 Client sympa : +2€ de pourboire.");showResult("+2€","#51cf66");},
    ()=>{hype=Math.min(100,hype+8);addHistory("📹 Moment YouTube : le chat regarde ton ticket. Hype +8.");},
    ()=>{addHistory("👮 Contrôle du patron : rien ne se passe, mais stress +400%.");},
    ()=>{chanceLevel+=1;addHistory("🍀 Mini boost chance temporaire permanent parce que le code est une jungle.");showResult("LUCK +1","#51cf66");}
  ];
  events[Math.floor(Math.random()*events.length)]();
}

function doWork(){
  if(blockedHours>0){showResult("BLOQUÉ","red");return;}
  const task=workTasks[Math.min(workLevel-1,workTasks.length-1)];
  $("workScreen").innerHTML=`
    <h1>🧽 ${task.name}</h1>
    <p>Frotte vraiment la vitre pour gagner ${task.reward}€.</p>
    <div class="car-clean-box" id="carCleanBox">
      <div class="car-window" id="carWindow"></div>
      <div class="sponge" id="sponge">🧽</div>
    </div>`;
  const win=$("carWindow");
  for(let i=0;i<task.dirt;i++){
    const d=document.createElement("div");
    d.className="dirt"; d.style.left=Math.random()*320+"px"; d.style.top=Math.random()*160+"px";
    win.appendChild(d);
  }
  const box=$("carCleanBox"), sponge=$("sponge");
  function cleanAt(cx,cy){
    const r=box.getBoundingClientRect(), x=cx-r.left, y=cy-r.top;
    sponge.style.display="block"; sponge.style.left=x+"px"; sponge.style.top=y+"px";
    document.querySelectorAll(".dirt").forEach(d=>{
      const dr=d.getBoundingClientRect();
      const dx=dr.left-r.left+30-x, dy=dr.top-r.top+30-y;
      if(Math.sqrt(dx*dx+dy*dy)<45)d.remove();
    });
    if(document.querySelectorAll(".dirt").length===0){
      money+=task.reward; addXp(task.xp); randomEvent();
      addHistory(`🧽 ${task.name} : +${task.reward}€`);
      showResult("+"+task.reward+"€","#51cf66");
      $("workScreen").innerHTML=`<h1>💼 Métro, boulot, dodo</h1><p>Travaille pour acheter tes tickets.</p><button class="big-button" onclick="doWork()">Travailler</button><p>Gain actuel : <b><span id="workGainText">${workGain}</span> €</b></p>`;
      updateUI(); renderCatalog();
    }
  }
  box.addEventListener("mousemove",e=>{if(e.buttons!==1)return;cleanAt(e.clientX,e.clientY);});
  box.addEventListener("touchmove",e=>{e.preventDefault();cleanAt(e.touches[0].clientX,e.touches[0].clientY);},{passive:false});
}

function buyTicket(ticket){
  if(blockedHours>0){showResult("BLOQUÉ","red");return;}
  if(!infiniteMoney&&money<ticket.price){showResult("PAS ASSEZ","red");return;}
  if(!infiniteMoney)money-=ticket.price;
  ticketsBought++;
  const table=$("table");
  tableTickets.push({
    id:Date.now()+Math.random(),ticket,
    x:150+Math.random()*Math.max(100,table.clientWidth-330),
    y:120+Math.random()*Math.max(100,table.clientHeight-330),
    finished:false,finalGain:null,values:[]
  });
  addHistory(`🎟️ ${ticket.name} acheté. ${ticket.rarity}.`);
  unlock("firstTicket","Premier ticket acheté");
  currentTab="tickets"; renderCatalog(); renderMain();
}

function renderTableTickets(){
  const c=$("tableItems"); c.innerHTML="";
  tableTickets.forEach(t=>{
    const d=document.createElement("div");
    d.className="table-ticket"; d.style.left=t.x+"px"; d.style.top=t.y+"px";
    d.innerHTML=`${t.ticket.icon}<br>${t.ticket.name}`;
    d.onmousedown=e=>startDrag(e,t); d.ontouchstart=e=>startTouchDrag(e,t);
    d.onclick=()=>{if(!draggingTicket)openTicket(t);};
    c.appendChild(d);
  });
}

function startDrag(e,t){draggingTicket=t;dragOffsetX=e.offsetX;dragOffsetY=e.offsetY;}
document.addEventListener("mousemove",e=>{
  if(!draggingTicket)return;
  const r=$("table").getBoundingClientRect();
  draggingTicket.x=e.clientX-r.left-dragOffsetX; draggingTicket.y=e.clientY-r.top-dragOffsetY;
  renderTableTickets();
});
document.addEventListener("mouseup",()=>{if(!draggingTicket)return;checkDropTrash(draggingTicket);draggingTicket=null;});
function startTouchDrag(e,t){
  draggingTicket=t; const touch=e.touches[0], r=$("table").getBoundingClientRect();
  dragOffsetX=touch.clientX-r.left-t.x; dragOffsetY=touch.clientY-r.top-t.y;
}
document.addEventListener("touchmove",e=>{
  if(!draggingTicket)return;
  const touch=e.touches[0], r=$("table").getBoundingClientRect();
  draggingTicket.x=touch.clientX-r.left-dragOffsetX; draggingTicket.y=touch.clientY-r.top-dragOffsetY;
  renderTableTickets();
},{passive:false});
document.addEventListener("touchend",()=>{if(!draggingTicket)return;checkDropTrash(draggingTicket);draggingTicket=null;});

function checkDropTrash(t){
  if(!gadgets.trash)return;
  const tr=$("trash").getBoundingClientRect(), tb=$("table").getBoundingClientRect();
  const x=tb.left+t.x+62,y=tb.top+t.y+77;
  const inside=x>tr.left&&x<tr.right&&y>tr.top&&y<tr.bottom;
  if(!inside)return;
  if(t.finished&&t.finalGain<=0){
    const p=t.ticket.price*2; debt+=p; debtHours=24; streak=0;
    addHistory(`🗑️ Ticket perdant jeté : dette +${format(p)}€.`);
    showResult("DETTE +"+format(p)+"€","red");
  }else if(!t.finished){
    addHistory("🗑️ Ticket non fini jeté : pas de dette, pas de gain.");
    showResult("JETÉ","white");
  }
  tableTickets=tableTickets.filter(x=>x.id!==t.id);
  updateUI(); renderTableTickets();
}

function openTicket(t){
  activeTicket=t;
  if(t.values.length===0)t.values=generateTicketValues(t.ticket);
  $("tableItems").innerHTML="";
  const p=document.createElement("div");
  p.className="ticket-play "+t.ticket.style;
  p.innerHTML=`
    <div class="ticket-title">${t.ticket.name}</div>
    <p>${t.ticket.rule}</p>
    <div class="scratch-grid" id="scratchGrid"></div>
    <button class="finish-button" onclick="finishTicket()">FINIR LE TICKET</button>
    ${autoLevel>0?`<button class="auto-button" onclick="autoScratch()">Autogratteur</button>`:""}
    <div class="ticket-info">
      <h3>${t.ticket.rarity}</h3>
      <p>Un symbole compte à 60% gratté.</p>
      <p><b>?</b> = jackpot.</p>
      ${t.ticket.symbols.map(s=>`<p>${s.icon} : ${s.value}€</p>`).join("")}
      <hr><p>Hype actuelle : ${hype}%</p>
    </div>`;
  $("tableItems").appendChild(p);
  const g=$("scratchGrid");
  t.values.forEach((v,i)=>{
    const z=document.createElement("div"); z.className="scratch-zone"; z.innerHTML=`<span>${v.icon}</span>`;
    const canvas=document.createElement("canvas"); canvas.width=105; canvas.height=85; canvas.dataset.index=i;
    z.appendChild(canvas); g.appendChild(z); setupCanvas(canvas);
  });
}

function generateTicketValues(ticket){
  const arr=[];
  for(let i=0;i<6;i++)arr.push(weighted(ticket.symbols));
  const forced=0.6+chanceLevel*0.25+symbolLevel*0.08+hype*0.01;
  if(Math.random()*100<forced){
    const good=ticket.symbols.filter(s=>s.value>0&&s.icon!=="?");
    const chosen=good[Math.floor(Math.random()*good.length)];
    arr[0]=chosen;arr[1]=chosen;arr[2]=chosen;
  }
  return arr;
}
function weighted(symbols){
  const total=symbols.reduce((s,x)=>s+x.chance,0); let r=Math.random()*total;
  for(const s of symbols){r-=s.chance;if(r<=0)return s;}
  return symbols[0];
}

function setupCanvas(canvas){
  const ctx=canvas.getContext("2d");
  ctx.fillStyle="#bfc3c7";ctx.fillRect(0,0,105,85);
  ctx.fillStyle="#777";ctx.font="28px Arial";ctx.fillText("?",45,52);
  ctx.globalCompositeOperation="destination-out";
  function scratch(x,y){
    const size=8+scratchLevel*4;
    ctx.beginPath();ctx.arc(x,y,size,0,Math.PI*2);ctx.fill();
  }
  canvas.addEventListener("mousemove",e=>{if(e.buttons!==1)return;const r=canvas.getBoundingClientRect();scratch(e.clientX-r.left,e.clientY-r.top);});
  canvas.addEventListener("touchmove",e=>{e.preventDefault();const r=canvas.getBoundingClientRect(),t=e.touches[0];scratch(t.clientX-r.left,t.clientY-r.top);},{passive:false});
}

function revealedIndexes(){
  const canvases=[...document.querySelectorAll(".scratch-zone canvas")], idx=[];
  canvases.forEach((c,i)=>{
    const ctx=c.getContext("2d"),data=ctx.getImageData(0,0,c.width,c.height).data;
    let clear=0; for(let j=3;j<data.length;j+=4)if(data[j]===0)clear++;
    if(clear/(c.width*c.height)*100>=60){idx.push(i);c.style.display="none";}
  });
  return idx;
}

function finishTicket(){
  if(!activeTicket||activeTicket.finished)return;
  const visible=revealedIndexes().map(i=>activeTicket.values[i]);
  let gain=0, counts={};
  visible.forEach(s=>counts[s.icon]=(counts[s.icon]||0)+1);
  for(const icon in counts){
    if(counts[icon]>=3)gain+=visible.find(s=>s.icon===icon).value;
  }
  if(visible.some(s=>s.icon==="?")){
    const j=activeTicket.ticket.symbols.find(s=>s.icon==="?").value;
    gain+=j; jackpotsFound++; unlock("jackpot","Symbole ? trouvé");
  }
  activeTicket.finalGain=gain; activeTicket.finished=true;
  if(gain>0){
    money+=gain; streak++; hype=Math.min(100,hype+7); addXp(16);
    showResult("GAGNÉ +"+format(gain)+"€","lime");
    addHistory(`✅ ${activeTicket.ticket.name} : +${format(gain)}€ | Streak ${streak}`);
    unlock("firstWin","Premier gain");
  }else{
    streak=0; hype=Math.max(0,hype-4); addXp(4);
    showResult("0€","red");
    addHistory(`❌ ${activeTicket.ticket.name} : rien. Le tabac rigole.`);
    unlock("firstLoss","Première perte");
  }
  activeTicket.x=220; activeTicket.y=220; activeTicket=null;
  renderTableTickets(); updateUI(); renderCatalog();
}

function autoScratch(){
  if(!activeTicket||autoLevel<=0)return;
  const canvases=[...document.querySelectorAll(".scratch-zone canvas")]; let i=0;
  const inter=setInterval(()=>{
    if(i>=canvases.length){clearInterval(inter);return;}
    const c=canvases[i],ctx=c.getContext("2d");ctx.clearRect(0,0,c.width,c.height);c.style.display="none";i++;
  },600);
}

function buyUpgrade(name,cost,cb){
  if(!infiniteMoney&&money<cost){showResult("PAS ASSEZ","red");return;}
  if(!infiniteMoney)money-=cost; cb(); showResult("AMÉLIORÉ","#ffd43b"); addHistory("⬆️ "+name+" amélioré."); updateUI();
}
function upgradeChance(){buyUpgrade("Chance",chanceLevel*700,()=>chanceLevel++);}
function upgradeSymbol(){buyUpgrade("Chance symbole",symbolLevel*1000,()=>symbolLevel++);}
function upgradeScratchSize(){buyUpgrade("Taille grattage",scratchLevel*500,()=>scratchLevel++);}
function buyAutoScratcher(){buyUpgrade("Autogratteur",(autoLevel+1)*2000,()=>autoLevel++);}

function buyGadget(g){
  if(gadgets[g.key]){showResult("DÉJÀ ACHETÉ","white");return;}
  if(!infiniteMoney&&money<g.price){showResult("PAS ASSEZ","red");return;}
  if(!infiniteMoney)money-=g.price; gadgets[g.key]=true;
  showResult(g.name+" acheté","#51cf66"); addHistory("🛒 Gadget acheté : "+g.name);
  updateUI(); renderCatalog(); checkObjectives();
}

function payDebt(){
  if(debt<=0){addHistory("Aucune dette.");return;}
  if(!infiniteMoney&&money<debt){showResult("PAS ASSEZ","red");return;}
  if(!infiniteMoney)money-=debt; addHistory("✅ Dette remboursée : "+format(debt)+"€"); debt=0; debtHours=0; updateUI();
}

setInterval(()=>{
  if(debt>0&&debtHours>0)debtHours--;
  if(debt>0&&debtHours===0&&blockedHours===0){blockedHours=50;showResult("BLOQUÉ 50H","red");addHistory("⛔ Dette non payée : blocage 50h.");}
  if(blockedHours>0){blockedHours--;if(blockedHours===0)addHistory("✅ Blocage terminé.");}
  updateUI();
},180000);

function useSecretCode(){
  if($("secretCode").value.trim()==="3000"){
    infiniteMoney=true; showResult("ARGENT INFINI 💸","#ffd43b"); addHistory("💸 Code 3000 activé.");
  }else showResult("CODE FAUX","red");
  updateUI();
}

renderCatalog(); renderMain(); updateUI();
