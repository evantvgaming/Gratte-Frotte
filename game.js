// Scratch Life - game.js
// Partie 1/2

let money = 0;
let xp = 0;
let level = 1;
let debt = 0;
let debtHours = 0;
let blockedHours = 0;

let currentTab = "work";
let infiniteMoney = false;
let richEndingUnlocked = false;

let chanceLevel = 1;
let symbolLevel = 1;
let scratchLevel = 1;
let autoLevel = 0;
let workLevel = 1;
let workGain = 1;

let hype = 0;
let streak = 0;
let ticketsBought = 0;
let jackpotsFound = 0;

let gadgets = {
  trash: false,
  robot: false,
  fan: false,
  mat: false,
  phoneBlue: false,
  poster: false,
  cashRegister: false,
  goldenLamp: false,
  wall: false,
  plant: false,
  radio: false,
  cat: false
};

let tableTickets = [];
let activeTicket = null;
let draggingTicket = null;
let dragOffsetX = 0;
let dragOffsetY = 0;

let achievements = {};

const tickets = [
  {
    name: "Petit Départ",
    icon: "🎟️",
    rarity: "Commun",
    price: 15,
    max: 20,
    level: 1,
    style: "ticket-orange",
    rule: "Trouve 3 symboles identiques.",
  symbols: [
  { icon: "🍒", value: 0, chance: 45 },
  { icon: "🍋", value: 1, chance: 30 },
  { icon: "🍀", value: 3, chance: 15 },
  { icon: "💎", value: 8, chance: 5 },
  { icon: "?", value: 20, chance: 0.1 }
]
  },
  {
    name: "Double Galère",
    icon: "2x",
    rarity: "Rare",
    price: 75,
    max: 120,
    level: 3,
    style: "ticket-blue",
    rule: "Trouve deux gains identiques.",
  symbols: [
  { icon:"0€", value:0, chance:46 },
  { icon:"2€", value:2, chance:28 },
  { icon:"5€", value:6, chance:16 },
  { icon:"20€", value:30, chance:8 },
  { icon:"?", value:120, chance:2 }
]
  },
  {
    name: "Pommier",
    icon: "🌳",
    rarity: "Épique",
    price: 250,
    max: 600,
    level: 5,
    style: "ticket-apple",
    rule: "Les fruits gagnent. Les vers donnent 0€.",
   symbols: [
  { icon:"🪱", value:0, chance:48 },
  { icon:"🍏", value:10, chance:22 },
  { icon:"🍎", value:30, chance:16 },
  { icon:"🍐", value:100, chance:12 },
  { icon:"?", value:600, chance:2 }
]
  },
  {
    name: "Coffre Royal",
    icon: "🔐",
    rarity: "Légendaire",
    price: 1500,
    max: 4000,
    level: 8,
    style: "ticket-gold",
    rule: "La clé ouvre le gain. Le coffre vide ne donne rien.",
 symbols: [
  { icon:"📦", value:0, chance:55 },
  { icon:"🗝️", value:80, chance:20 },
  { icon:"💰", value:250, chance:15 },
  { icon:"👑", value:900, chance:8 },
  { icon:"?", value:4000, chance:2 }
]
  },
  {
    name: "Dernière Chance",
    icon: "💀",
    rarity: "Mythique",
    price: 12000,
    max: 100000,
    level: 12,
    style: "ticket-red",
    rule: "Le symbole ? est le jackpot. Le reste est une gifle fiscale.",
  symbols: [
  { icon:"💀", value:0, chance:62 },
  { icon:"🩸", value:-500, chance:10 },
  { icon:"🔥", value:1200, chance:18 },
  { icon:"💎", value:5000, chance:8 },
  { icon:"?", value:100000, chance:2 }
]            
  },
  {
    name: "Table Finale",
    icon: "🌌",
    rarity: "ULTIME",
    price: 1000000,
    max: 999999999,
    level: 20,
    style: "ticket-red",
    rule: "1 chance sur 100 000. Si tu gagnes, tu deviens riche.",
    symbols: [
      { icon: "💀", value: 0, chance: 99999 },
      { icon: "?", value: 999999999, chance: 1 }
    ]
  }
];

const gadgetsList = [
  { key: "trash", name: "Poubelle", icon: "🗑️", price: 80, desc: "Jeter les tickets. Pas fini = pas de dette." },
  { key: "fan", name: "Ventilo", icon: "🌀", price: 200, desc: "Tourne vite. Sert à rien. Donc indispensable." },
  { key: "robot", name: "Robot", icon: "🤖", price: 500, desc: "Assistant qui juge tes décisions." },
  { key: "mat", name: "Tapis", icon: "▦", price: 750, desc: "Tapis de grattage premium." },

  { key: "phoneBlue", name: "Téléphone bleu", icon: "☎️", price: 1200, desc: "Change la couleur du téléphone." },
  { key: "poster", name: "Poster mural", icon: "🖼️", price: 2500, desc: "Décore le mur du tabac." },
  { key: "cashRegister", name: "Caisse", icon: "💵", price: 5000, desc: "Caisse décorative." },
  { key: "goldenLamp", name: "Lampe dorée", icon: "💡", price: 12000, desc: "Pour faire riche sans l’être." },
  { key: "wall", name: "Mur de riche", icon: "🏆", price: 50000, desc: "Transforme le mur en version luxe." },
  { key: "plant", name: "Plante", icon: "🪴", price: 3000, desc: "Une plante qui regarde tes pertes." },
  { key: "radio", name: "Radio", icon: "📻", price: 8000, desc: "Ambiance vieux tabac du destin." },
  { key: "cat", name: "Chat du tabac", icon: "🐈", price: 20000, desc: "Il dort sur tes ambitions." }
];

const workTasks = [
  { name: "Nettoyer une vitre sale", reward: 1, xp: 5, dirt: 26 },
  { name: "Nettoyer un pare-brise dégueu", reward: 2, xp: 7, dirt: 34 },
  { name: "Ranger le comptoir", reward: 3, xp: 9, dirt: 42 },
  { name: "Nettoyer une voiture entière", reward: 5, xp: 12, dirt: 55 }
];

const objectives = [
  { id: "money10", text: "Gagner tes premiers 10€", done: () => money >= 10 },
  { id: "firstTicket", text: "Acheter ton premier ticket", done: () => ticketsBought >= 1 },
  { id: "level3", text: "Atteindre le niveau 3", done: () => level >= 3 },
  { id: "trash", text: "Acheter la poubelle", done: () => gadgets.trash },
  { id: "pommier", text: "Débloquer Pommier", done: () => level >= 5 },
  { id: "jackpot", text: "Trouver un symbole ?", done: () => jackpotsFound >= 1 },
  { id: "richEnding", text: "Débloquer la fin riche", done: () => richEndingUnlocked }
];

function $(id) {
  return document.getElementById(id);
}

function format(n) {
  if (n >= 1000000000) return (n / 1000000000).toFixed(2) + "B";
  if (n >= 1000000) return (n / 1000000).toFixed(2) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return Math.floor(n);
}

function updateUI() {
  $("money").textContent = infiniteMoney ? "∞" : format(money);
  $("level").textContent = level;
  $("xp").textContent = xp;
  $("xpFill").style.width = xp + "%";

  $("chanceLevel").textContent = chanceLevel;
  $("chanceCost").textContent = format(chanceLevel * 700);

  $("symbolLevel").textContent = symbolLevel;
  $("symbolCost").textContent = format(symbolLevel * 1000);

  $("scratchLevel").textContent = scratchLevel;
  $("scratchCost").textContent = format(scratchLevel * 500);

  $("autoLevel").textContent = autoLevel;
  $("autoCost").textContent = format((autoLevel + 1) * 2000);

  $("workGainText").textContent = format(workGain);
  $("debt").textContent = format(debt);

  $("trash").className = gadgets.trash ? "trash active" : "trash";
  $("fan").className = gadgets.fan ? "decor fan active" : "decor fan";
  $("robot").className = gadgets.robot ? "robot active" : "robot";
  $("scratchMat").className = gadgets.mat ? "scratch-mat active" : "scratch-mat";

  const phone = document.querySelector(".phone");
  if (phone) {
    phone.style.filter = gadgets.phoneBlue ? "hue-rotate(180deg)" : "none";
  }

  if (blockedHours > 0) {
    $("debtTimer").textContent = `Blocage : ${blockedHours}h restantes.`;
  } else if (debt > 0) {
    $("debtTimer").textContent = `Dette à payer avant : ${debtHours}h.`;
  } else {
    $("debtTimer").textContent = `Aucune dette. Hype : ${hype}% | Streak : ${streak}`;
  }

  renderDecorations();
}

function renderDecorations() {
  document.querySelectorAll(".table-deco").forEach(e => e.remove());

  const table = $("table");

  const decos = [
    gadgets.poster && { icon: "🖼️", x: 520, y: 40 },
    gadgets.cashRegister && { icon: "💵", x: 80, y: 520 },
    gadgets.goldenLamp && { icon: "💡", x: 760, y: 90 },
    gadgets.wall && { icon: "🏆", x: 650, y: 40 },
    gadgets.plant && { icon: "🪴", x: 120, y: 90 },
    gadgets.radio && { icon: "📻", x: 720, y: 500 },
    gadgets.cat && { icon: "🐈", x: 430, y: 540 }
  ].filter(Boolean);

  decos.forEach(d => {
    const el = document.createElement("div");
    el.className = "table-deco";
    el.textContent = d.icon;
    el.style.left = d.x + "px";
    el.style.top = d.y + "px";
    table.appendChild(el);
  });
}

function addHistory(text) {
  const div = document.createElement("div");
  div.className = "history-entry";
  div.innerHTML = text;
  $("history").prepend(div);
}

function showResult(text, color) {
  const overlay = $("resultOverlay");
  overlay.textContent = text;
  overlay.style.color = color;
  overlay.className = "show";

  setTimeout(() => {
    overlay.className = "";
  }, 1200);
}

function unlock(id, text) {
  if (achievements[id]) return;

  achievements[id] = true;
  hype = Math.min(100, hype + 10);

  showResult("SUCCÈS 🔥", "#ffd43b");
  addHistory(`🏆 Succès débloqué : <b>${text}</b>`);
}

function checkObjectives() {
  objectives.forEach(obj => {
    if (obj.done()) {
      unlock(obj.id, obj.text);
    }
  });
}

function addXp(amount) {
  xp += amount;

  while (xp >= 100) {
    xp -= 100;
    level++;
    showResult("NIVEAU +1 ⭐", "#ffd43b");
    addHistory(`⭐ Niveau ${level} atteint.`);
  }

  checkObjectives();
}

function setTab(tab) {
  currentTab = tab;
  renderCatalog();
  renderMain();
}

function renderCatalog() {
  const catalog = $("catalog");
  catalog.innerHTML = "";

  if (currentTab === "gadgets") {
    $("catalogTitle").textContent = "Gadgets";

    gadgetsList.forEach(gadget => {
      const item = document.createElement("div");
      item.className = "catalog-item";
      item.innerHTML = `
        <div class="catalog-icon">${gadget.icon}</div>
        <div>
          <b>${gadget.name}</b><br>
          ${gadgets[gadget.key] ? "Acheté" : format(gadget.price) + "€"}<br>
          <small>${gadget.desc}</small>
        </div>
      `;
      item.onclick = () => buyGadget(gadget);
      catalog.appendChild(item);
    });

    return;
  }

  $("catalogTitle").textContent = "Catalogue";

  tickets.forEach(ticket => {
    const locked = level < ticket.level;

    const item = document.createElement("div");
    item.className = "catalog-item" + (locked ? " locked" : "");

    item.innerHTML = `
      <div class="catalog-icon">${ticket.icon}</div>
      <div>
        <b>${locked ? "Verrouillé" : ticket.name}</b><br>
        ${locked ? "Niveau " + ticket.level : format(ticket.price) + "€"}<br>
        <small>${ticket.rarity} — Max ${locked ? "?" : format(ticket.max) + "€"}</small>
      </div>
    `;

    item.onclick = () => {
      if (!locked) buyTicket(ticket);
    };

    catalog.appendChild(item);
  });

  renderObjectives();
}

function renderObjectives() {
  const box = document.createElement("div");
  box.className = "catalog-item";
  box.style.display = "block";

  box.innerHTML =
    "<b>Objectifs</b><br>" +
    objectives.map(o => (o.done() ? "✅ " : "⬜ ") + o.text).join("<br>");

  $("catalog").appendChild(box);
}

function renderMain() {
  $("workScreen").style.display = currentTab === "work" ? "block" : "none";
  renderTableTickets();
  updateUI();
}

function randomEvent() {
  if (Math.random() > 0.12) return;

  const events = [
    () => {
      money += 2;
      addHistory("🎁 Client sympa : +2€ de pourboire.");
      showResult("+2€", "#51cf66");
    },
    () => {
      hype = Math.min(100, hype + 5);
      addHistory("📹 Moment YouTube : hype +5.");
    },
    () => {
      addHistory("👀 Le patron te regarde. Ambiance contrôle fiscal miniature.");
    }
  ];

  events[Math.floor(Math.random() * events.length)]();
}

function doWork() {
  if (blockedHours > 0) {
    showResult("BLOQUÉ", "red");
    return;
  }

  const task = workTasks[Math.min(workLevel - 1, workTasks.length - 1)];

  $("workScreen").innerHTML = `
    <h1>🧽 ${task.name}</h1>
    <p>Frotte vraiment la vitre pour gagner ${task.reward}€.</p>
    <div class="car-clean-box" id="carCleanBox">
      <div class="car-window" id="carWindow"></div>
      <div class="sponge" id="sponge">🧽</div>
    </div>
  `;

  const win = $("carWindow");

  for (let i = 0; i < task.dirt; i++) {
    const d = document.createElement("div");
    d.className = "dirt";
    d.style.left = Math.random() * 320 + "px";
    d.style.top = Math.random() * 160 + "px";
    win.appendChild(d);
  }

  const box = $("carCleanBox");
  const sponge = $("sponge");

  function cleanAt(clientX, clientY) {
    const rect = box.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    sponge.style.display = "block";
    sponge.style.left = x + "px";
    sponge.style.top = y + "px";

    document.querySelectorAll(".dirt").forEach(dirt => {
      const dr = dirt.getBoundingClientRect();
      const dx = dr.left - rect.left + 30 - x;
      const dy = dr.top - rect.top + 30 - y;

      if (Math.sqrt(dx * dx + dy * dy) < 45) {
        dirt.remove();
      }
    });

    if (document.querySelectorAll(".dirt").length === 0) {
      money += task.reward;
      addXp(task.xp);
      randomEvent();

      addHistory(`🧽 ${task.name} : +${task.reward}€`);
      showResult("+" + task.reward + "€", "#51cf66");

      $("workScreen").innerHTML = `
        <h1>💼 Métro, boulot, dodo</h1>
        <p>Travaille pour acheter tes tickets.</p>
        <button class="big-button" onclick="doWork()">Travailler</button>
        <p>Gain actuel : <b><span id="workGainText">${workGain}</span> €</b></p>
      `;

      updateUI();
      renderCatalog();
    }
  }

  box.addEventListener("mousemove", e => {
    if (e.buttons !== 1) return;
    cleanAt(e.clientX, e.clientY);
  });

  box.addEventListener("touchmove", e => {
    e.preventDefault();
    cleanAt(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: false });
}

function buyTicket(ticket) {
  if (blockedHours > 0) {
    showResult("BLOQUÉ", "red");
    return;
  }

  if (!infiniteMoney && money < ticket.price) {
    showResult("PAS ASSEZ", "red");
    return;
  }

  if (!infiniteMoney) money -= ticket.price;

  ticketsBought++;

  const table = $("table");

  tableTickets.push({
    id: Date.now() + Math.random(),
    ticket,
    x: 150 + Math.random() * Math.max(100, table.clientWidth - 330),
    y: 120 + Math.random() * Math.max(100, table.clientHeight - 330),
    finished: false,
    finalGain: null,
    values: []
  });

  addHistory(`🎟️ ${ticket.name} acheté et posé sur la table.`);
  unlock("firstTicket", "Premier ticket acheté");

  currentTab = "tickets";
  renderCatalog();
  renderMain();
}

function renderTableTickets() {
  const container = $("tableItems");
  container.innerHTML = "";

  tableTickets.forEach(t => {
    const div = document.createElement("div");
    div.className = "table-ticket";
    div.style.left = t.x + "px";
    div.style.top = t.y + "px";
    div.innerHTML = `${t.ticket.icon}<br>${t.ticket.name}`;

    div.onmousedown = e => startDrag(e, t);
    div.ontouchstart = e => startTouchDrag(e, t);
    div.onclick = () => {
      if (!draggingTicket) openTicket(t);
    };

    container.appendChild(div);
  });
}

function startDrag(e, ticket) {
  draggingTicket = ticket;
  dragOffsetX = e.offsetX;
  dragOffsetY = e.offsetY;
}

document.addEventListener("mousemove", e => {
  if (!draggingTicket) return;

  const rect = $("table").getBoundingClientRect();
  draggingTicket.x = e.clientX - rect.left - dragOffsetX;
  draggingTicket.y = e.clientY - rect.top - dragOffsetY;

  renderTableTickets();
});

document.addEventListener("mouseup", () => {
  if (!draggingTicket) return;
  checkDropTrash(draggingTicket);
  draggingTicket = null;
});

function startTouchDrag(e, ticket) {
  draggingTicket = ticket;

  const touch = e.touches[0];
  const rect = $("table").getBoundingClientRect();

  dragOffsetX = touch.clientX - rect.left - ticket.x;
  dragOffsetY = touch.clientY - rect.top - ticket.y;
}

document.addEventListener("touchmove", e => {
  if (!draggingTicket) return;

  const touch = e.touches[0];
  const rect = $("table").getBoundingClientRect();

  draggingTicket.x = touch.clientX - rect.left - dragOffsetX;
  draggingTicket.y = touch.clientY - rect.top - dragOffsetY;

  renderTableTickets();
}, { passive: false });

document.addEventListener("touchend", () => {
  if (!draggingTicket) return;
  checkDropTrash(draggingTicket);
  draggingTicket = null;
});

function checkDropTrash(ticket) {
  if (!gadgets.trash) return;

  const trash = $("trash").getBoundingClientRect();
  const table = $("table").getBoundingClientRect();

  const x = table.left + ticket.x + 62;
  const y = table.top + ticket.y + 77;

  const inside =
    x > trash.left &&
    x < trash.right &&
    y > trash.top &&
    y < trash.bottom;

  if (!inside) return;

  if (ticket.finished && ticket.finalGain <= 0) {
    const penalty = ticket.ticket.price * 2;
    debt += penalty;
    debtHours = 24;
    streak = 0;

    addHistory(`🗑️ Ticket perdant jeté : dette +${format(penalty)}€.`);
    showResult("DETTE +" + format(penalty) + "€", "red");
  } else if (!ticket.finished) {
    addHistory("🗑️ Ticket non terminé jeté : pas de dette, pas de gain.");
    showResult("JETÉ", "white");
  } else {
    addHistory("🗑️ Ticket jeté.");
  }

  tableTickets = tableTickets.filter(t => t.id !== ticket.id);
  updateUI();
  renderTableTickets();
}

function openTicket(ticket) {
  activeTicket = ticket;

  if (activeTicket.values.length === 0) {
    activeTicket.values = generateTicketValues(activeTicket.ticket);
  }

  $("tableItems").innerHTML = "";

  const panel = document.createElement("div");
  panel.className = "ticket-play " + activeTicket.ticket.style;

  panel.innerHTML = `
    <div class="ticket-title">${activeTicket.ticket.name}</div>
    <p>${activeTicket.ticket.rule}</p>

    <div class="scratch-grid" id="scratchGrid"></div>

    <button class="finish-button" onclick="finishTicket()">FINIR LE TICKET</button>
    ${autoLevel > 0 ? `<button class="auto-button" onclick="autoScratch()">Autogratteur</button>` : ""}

    <div class="ticket-info">
      <h3>${activeTicket.ticket.rarity}</h3>
      <p>Un symbole compte seulement s’il est gratté à 60% ou plus.</p>
      <p><b>?</b> = jackpot.</p>
      ${activeTicket.ticket.symbols.map(s => `<p>${s.icon} : ${format(s.value)}€</p>`).join("")}
      <hr>
      <p>Tu peux finir sans tout gratter.</p>
      <p>Tu peux jeter un ticket non fini sans dette.</p>
    </div>
  `;

  $("tableItems").appendChild(panel);

  const grid = $("scratchGrid");

  activeTicket.values.forEach((value, index) => {
    const zone = document.createElement("div");
    zone.className = "scratch-zone";
    zone.innerHTML = `<span>${value.icon}</span>`;

    const canvas = document.createElement("canvas");
    canvas.width = 105;
    canvas.height = 85;
    canvas.dataset.index = index;

    zone.appendChild(canvas);
    grid.appendChild(zone);

    setupCanvas(canvas);
  });
}

function generateTicketValues(ticket) {
  const values = [];

  for (let i = 0; i < 6; i++) {
    values.push(weightedSymbol(ticket.symbols));
  }

  const forcedChance = 0.6 + chanceLevel * 0.25 + symbolLevel * 0.08 + hype * 0.01;

  if (Math.random() * 100 < forcedChance) {
    const good = ticket.symbols.filter(s => s.value > 0 && s.icon !== "?");

    if (good.length > 0) {
      const chosen = good[Math.floor(Math.random() * good.length)];
      values[0] = chosen;
      values[1] = chosen;
      values[2] = chosen;
    }
  }

  return values;
}

function weightedSymbol(symbols) {
  const total = symbols.reduce((sum, s) => sum + s.chance, 0);
  let roll = Math.random() * total;

  for (const s of symbols) {
    roll -= s.chance;
    if (roll <= 0) return s;
  }

  return symbols[0];
}

function setupCanvas(canvas) {
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#bfc3c7";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#777";
  ctx.font = "28px Arial";
  ctx.fillText("?", 45, 52);

  ctx.globalCompositeOperation = "destination-out";

  function scratch(x, y) {
    const size = 8 + scratchLevel * 4;

    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  canvas.addEventListener("mousemove", e => {
    if (e.buttons !== 1) return;

    const rect = canvas.getBoundingClientRect();
    scratch(e.clientX - rect.left, e.clientY - rect.top);
  });

  canvas.addEventListener("touchmove", e => {
    e.preventDefault();

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];

    scratch(touch.clientX - rect.left, touch.clientY - rect.top);
  }, { passive: false });
}

function getRevealedIndexes() {
  const canvases = [...document.querySelectorAll(".scratch-zone canvas")];
  const indexes = [];

  canvases.forEach((canvas, index) => {
    const ctx = canvas.getContext("2d");
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    let clear = 0;

    for (let i = 3; i < data.length; i += 4) {
      if (data[i] === 0) clear++;
    }

    const percent = clear / (canvas.width * canvas.height) * 100;

    if (percent >= 60) {
      indexes.push(index);
      canvas.style.display = "none";
    }
  });

  return indexes;
}

function finishTicket() {
  if (!activeTicket || activeTicket.finished) return;

  const revealed = getRevealedIndexes().map(i => activeTicket.values[i]);

  let gain = 0;
  const counts = {};

  revealed.forEach(symbol => {
    counts[symbol.icon] = (counts[symbol.icon] || 0) + 1;
  });

  for (const icon in counts) {
    if (counts[icon] >= 3) {
      const symbol = revealed.find(s => s.icon === icon);
      gain += symbol.value;
    }
  }

  if (revealed.some(s => s.icon === "?")) {
    const jackpot = activeTicket.ticket.symbols.find(s => s.icon === "?");
    gain += jackpot.value;
    jackpotsFound++;
    unlock("jackpot", "Symbole ? trouvé");
  }

  activeTicket.finalGain = gain;
  activeTicket.finished = true;

  if (gain > 0) {
    money += gain;
    streak++;
    hype = Math.min(100, hype + 7);
    addXp(16);

    showResult("GAGNÉ +" + format(gain) + "€", "lime");
    addHistory(`✅ ${activeTicket.ticket.name} : +${format(gain)}€ | Streak ${streak}`);

    unlock("firstWin", "Premier gain");

    if (activeTicket.ticket.name === "Table Finale") {
      unlockRichEnding();
    }
  } else if (gain < 0) {
    money += gain;
    streak = 0;
    hype = Math.max(0, hype - 4);
    addXp(4);

    showResult("PERTE " + format(gain) + "€", "red");
    addHistory(`💀 ${activeTicket.ticket.name} : ${format(gain)}€.`);
  } else {
    streak = 0;
    hype = Math.max(0, hype - 4);
    addXp(4);

    showResult("0€", "red");
    addHistory(`❌ ${activeTicket.ticket.name} : rien. Le tabac rigole.`);
    unlock("firstLoss", "Première perte");
  }

  activeTicket.x = 220;
  activeTicket.y = 220;
  activeTicket = null;

  renderTableTickets();
  updateUI();
  renderCatalog();
}

function autoScratch() {
  if (!activeTicket || autoLevel <= 0) return;

  const canvases = [...document.querySelectorAll(".scratch-zone canvas")];
  let i = 0;

  const interval = setInterval(() => {
    if (i >= canvases.length) {
      clearInterval(interval);
      return;
    }

    const canvas = canvases[i];
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.style.display = "none";

    i++;
  }, 600);
}

function buyUpgrade(name, cost, callback) {
  if (!infiniteMoney && money < cost) {
    showResult("PAS ASSEZ", "red");
    return;
  }

  if (!infiniteMoney) money -= cost;

  callback();

  showResult("AMÉLIORÉ", "#ffd43b");
  addHistory("⬆️ " + name + " amélioré.");

  updateUI();
  renderCatalog();
}

function upgradeChance() {
  buyUpgrade("Chance", chanceLevel * 700, () => chanceLevel++);
}

function upgradeSymbol() {
  buyUpgrade("Chance symbole", symbolLevel * 1000, () => symbolLevel++);
}

function upgradeScratchSize() {
  buyUpgrade("Taille grattage", scratchLevel * 500, () => scratchLevel++);
}

function buyAutoScratcher() {
  buyUpgrade("Autogratteur", (autoLevel + 1) * 2000, () => autoLevel++);
}

function buyGadget(gadget) {
  if (gadgets[gadget.key]) {
    showResult("DÉJÀ ACHETÉ", "white");
    return;
  }

  if (!infiniteMoney && money < gadget.price) {
    showResult("PAS ASSEZ", "red");
    return;
  }

  if (!infiniteMoney) money -= gadget.price;

  gadgets[gadget.key] = true;

  showResult(gadget.name + " acheté", "#51cf66");
  addHistory("🛒 Gadget acheté : " + gadget.name);

  updateUI();
  renderCatalog();
  checkObjectives();
}

function payDebt() {
  if (debt <= 0) {
    addHistory("Aucune dette.");
    return;
  }

  if (!infiniteMoney && money < debt) {
    showResult("PAS ASSEZ", "red");
    return;
  }

  if (!infiniteMoney) money -= debt;

  addHistory("✅ Dette remboursée : " + format(debt) + "€");

  debt = 0;
  debtHours = 0;

  updateUI();
}

function unlockRichEnding() {
  if (richEndingUnlocked) return;

  richEndingUnlocked = true;
  money += 999999999;
  hype = 100;

  $("table").classList.add("rich-ending");
  document.body.style.background = "#050505";

  addHistory("🌌 TU AS GAGNÉ LE TICKET FINAL : la table et le mur deviennent riches.");
  showResult("RICH ENDING 🏆", "#ffd700");

  unlock("richEnding", "Fin riche débloquée");
  updateUI();
}

setInterval(() => {
  if (debt > 0 && debtHours > 0) debtHours--;

  if (debt > 0 && debtHours === 0 && blockedHours === 0) {
    blockedHours = 50;
    showResult("BLOQUÉ 50H", "red");
    addHistory("⛔ Dette non payée : blocage 50h.");
  }

  if (blockedHours > 0) {
    blockedHours--;

    if (blockedHours === 0) {
      addHistory("✅ Blocage terminé.");
    }
  }

  updateUI();
}, 180000);

function useSecretCode() {
  const code = $("secretCode").value.trim();

  if (code === "3000") {
    infiniteMoney = true;
    showResult("ARGENT INFINI 💸", "#ffd43b");
    addHistory("💸 Code 3000 activé.");
  } else {
    showResult("CODE FAUX", "red");
  }

  updateUI();
}

renderCatalog();
renderMain();
updateUI();
