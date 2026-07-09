let money = 0;
let xp = 0;
let level = 1;
let debt = 0;
let debtHours = 0;
let blockedHours = 0;

let currentTab = "work";
let infiniteMoney = false;

let chanceLevel = 1;
let symbolLevel = 1;
let scratchLevel = 1;
let autoLevel = 0;
let workLevel = 1;
let workGain = 1;

let gadgets = {
  trash: false,
  robot: false,
  fan: false,
  mat: false
};

let tableTickets = [];
let activeTicket = null;
let draggingTicket = null;
let dragOffsetX = 0;
let dragOffsetY = 0;

const tickets = [
  {
    name: "Petit Départ",
    icon: "🎟️",
    price: 15,
    max: 20,
    level: 1,
    style: "ticket-orange",
    rule: "Trouve 3 symboles identiques.",
    symbols: [
      { icon: "🍒", value: 0, chance: 55 },
      { icon: "🍋", value: 1, chance: 25 },
      { icon: "🍀", value: 3, chance: 10 },
      { icon: "💎", value: 8, chance: 2 },
      { icon: "?", value: 20, chance: 0.05 }
    ]
  },
  {
    name: "Double Chance",
    icon: "2x",
    price: 60,
    max: 100,
    level: 3,
    style: "ticket-blue",
    rule: "Trouve deux gains identiques.",
    symbols: [
      { icon: "0€", value: 0, chance: 60 },
      { icon: "2€", value: 2, chance: 20 },
      { icon: "5€", value: 5, chance: 10 },
      { icon: "20€", value: 20, chance: 2 },
      { icon: "?", value: 100, chance: 0.04 }
    ]
  },
  {
    name: "Pommier",
    icon: "🌳",
    price: 200,
    max: 500,
    level: 5,
    style: "ticket-apple",
    rule: "Les fruits donnent des gains. Les vers donnent 0€.",
    symbols: [
      { icon: "🪱", value: 0, chance: 60 },
      { icon: "🍏", value: 5, chance: 20 },
      { icon: "🍎", value: 15, chance: 8 },
      { icon: "🍐", value: 50, chance: 2 },
      { icon: "?", value: 500, chance: 0.03 }
    ]
  },
  {
    name: "Coffre Royal",
    icon: "🔐",
    price: 1000,
    max: 3000,
    level: 8,
    style: "ticket-gold",
    rule: "La clé ouvre le gain. Le coffre vide ne donne rien.",
    symbols: [
      { icon: "📦", value: 0, chance: 65 },
      { icon: "🗝️", value: 30, chance: 15 },
      { icon: "💰", value: 150, chance: 5 },
      { icon: "👑", value: 600, chance: 1 },
      { icon: "?", value: 3000, chance: 0.02 }
    ]
  },
  {
    name: "Dernière Chance",
    icon: "💀",
    price: 10000,
    max: 50000,
    level: 12,
    style: "ticket-red",
    rule: "Ticket dangereux. Le symbole ? est le jackpot.",
    symbols: [
      { icon: "💀", value: 0, chance: 70 },
      { icon: "🩸", value: -500, chance: 10 },
      { icon: "🔥", value: 500, chance: 4 },
      { icon: "💎", value: 3000, chance: 0.8 },
      { icon: "?", value: 50000, chance: 0.01 }
    ]
  }
];

const gadgetsList = [
  { key: "trash", name: "Poubelle", icon: "🗑️", price: 80, desc: "Permet de jeter les tickets." },
  { key: "fan", name: "Ventilo", icon: "🌀", price: 200, desc: "Décor animé sur la table." },
  { key: "robot", name: "Robot", icon: "🤖", price: 500, desc: "Assistant inutile mais stylé." },
  { key: "mat", name: "Tapis", icon: "▦", price: 750, desc: "Tapis de grattage sur la table." }
];

const workTasks = [
  { name: "Nettoyer une vitre sale", reward: 1, xp: 5 },
  { name: "Nettoyer une vitre très sale", reward: 2, xp: 7 },
  { name: "Nettoyer un pare-brise dégueu", reward: 3, xp: 9 },
  { name: "Nettoyer une voiture entière", reward: 5, xp: 12 }
];

const objectives = [
  { text: "Gagner tes premiers 10€", done: () => money >= 10 },
  { text: "Acheter ton premier ticket", done: () => tableTickets.length > 0 },
  { text: "Atteindre le niveau 3", done: () => level >= 3 },
  { text: "Acheter la poubelle", done: () => gadgets.trash },
  { text: "Débloquer le Pommier", done: () => level >= 5 }
];

function $(id) {
  return document.getElementById(id);
}

function format(n) {
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

  if (blockedHours > 0) {
    $("debtTimer").textContent = `Blocage : ${blockedHours}h restantes.`;
  } else if (debt > 0) {
    $("debtTimer").textContent = `Dette à payer avant : ${debtHours}h.`;
  } else {
    $("debtTimer").textContent = "Aucune dette.";
  }
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
  setTimeout(() => overlay.className = "", 1200);
}

function addXp(amount) {
  xp += amount;

  while (xp >= 100) {
    xp -= 100;
    level++;
    showResult("NIVEAU +1 ⭐", "#ffd43b");
    addHistory(`⭐ Niveau ${level} atteint.`);
  }
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
      const owned = gadgets[gadget.key];
      const item = document.createElement("div");
      item.className = "catalog-item";
      item.innerHTML = `
        <div class="catalog-icon">${gadget.icon}</div>
        <div>
          <b>${gadget.name}</b><br>
          ${owned ? "Acheté" : format(gadget.price) + "€"}<br>
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
        Max : ${locked ? "?" : format(ticket.max) + "€"}
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
  box.innerHTML = `<b>Objectifs</b><br>`;

  objectives.forEach(obj => {
    box.innerHTML += `${obj.done() ? "✅" : "⬜"} ${obj.text}<br>`;
  });

  $("catalog").appendChild(box);
}

function renderMain() {
  $("workScreen").style.display = currentTab === "work" ? "block" : "none";
  renderTableTickets();
  updateUI();
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

  const windowBox = $("carWindow");

  for (let i = 0; i < 20 + workLevel * 6; i++) {
    const dirt = document.createElement("div");
    dirt.className = "dirt";
    dirt.style.left = Math.random() * 320 + "px";
    dirt.style.top = Math.random() * 160 + "px";
    windowBox.appendChild(dirt);
  }

  const cleanBox = $("carCleanBox");
  const sponge = $("sponge");

  function cleanAt(clientX, clientY) {
    const rect = cleanBox.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    sponge.style.display = "block";
    sponge.style.left = x + "px";
    sponge.style.top = y + "px";

    document.querySelectorAll(".dirt").forEach(dirt => {
      const d = dirt.getBoundingClientRect();
      const dx = d.left - rect.left + 30 - x;
      const dy = d.top - rect.top + 30 - y;

      if (Math.sqrt(dx * dx + dy * dy) < 45) {
        dirt.remove();
      }
    });

    if (document.querySelectorAll(".dirt").length === 0) {
      money += task.reward;
      addXp(task.xp);
      addHistory(`🧽 ${task.name} : +${task.reward}€`);
      showResult("+" + task.reward + "€", "#51cf66");

      $("workScreen").innerHTML = `
        <h1>💼 Métro, boulot, dodo</h1>
        <p>Tu commences avec 0€. Travaille pour acheter tes premiers tickets.</p>
        <button class="big-button" onclick="doWork()">Travailler</button>
        <p>Gain actuel : <b><span id="workGainText">${workGain}</span> €</b></p>
      `;

      updateUI();
      renderCatalog();
    }
  }

  cleanBox.addEventListener("mousemove", e => {
    if (e.buttons !== 1) return;
    cleanAt(e.clientX, e.clientY);
  });

  cleanBox.addEventListener("touchmove", e => {
    e.preventDefault();
    const touch = e.touches[0];
    cleanAt(touch.clientX, touch.clientY);
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

  const table = $("table");
  const x = 150 + Math.random() * Math.max(100, table.clientWidth - 330);
  const y = 120 + Math.random() * Math.max(100, table.clientHeight - 330);

  tableTickets.push({
    id: Date.now() + Math.random(),
    ticket,
    x,
    y,
    state: "unplayed",
    finished: false,
    revealedPercent: 0,
    finalGain: null,
    values: []
  });

  addHistory(`🎟️ ${ticket.name} acheté et posé sur la table.`);
  currentTab = "tickets";
  renderCatalog();
  renderMain();
}

function renderTableTickets() {
  const container = $("tableItems");
  container.innerHTML = "";

  tableTickets.forEach(tableTicket => {
    const div = document.createElement("div");
    div.className = "table-ticket";
    div.style.left = tableTicket.x + "px";
    div.style.top = tableTicket.y + "px";
    div.innerHTML = `${tableTicket.ticket.icon}<br>${tableTicket.ticket.name}`;

    div.onmousedown = e => startDrag(e, tableTicket);
    div.ontouchstart = e => startTouchDrag(e, tableTicket);

    div.ondblclick = () => openTicket(tableTicket);

    div.onclick = () => {
      if (!draggingTicket) openTicket(tableTicket);
    };

    container.appendChild(div);
  });
}

function startDrag(e, tableTicket) {
  draggingTicket = tableTicket;
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

function startTouchDrag(e, tableTicket) {
  draggingTicket = tableTicket;
  const touch = e.touches[0];
  const rect = $("table").getBoundingClientRect();

  dragOffsetX = touch.clientX - rect.left - tableTicket.x;
  dragOffsetY = touch.clientY - rect.top - tableTicket.y;
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

function checkDropTrash(tableTicket) {
  if (!gadgets.trash) return;

  const trash = $("trash").getBoundingClientRect();
  const table = $("table").getBoundingClientRect();

  const ticketCenterX = table.left + tableTicket.x + 62;
  const ticketCenterY = table.top + tableTicket.y + 77;

  const inside =
    ticketCenterX > trash.left &&
    ticketCenterX < trash.right &&
    ticketCenterY > trash.top &&
    ticketCenterY < trash.bottom;

  if (!inside) return;

  if (tableTicket.finished && tableTicket.finalGain <= 0) {
    const penalty = tableTicket.ticket.price * 2;
    debt += penalty;
    debtHours = 24;
    addHistory(`🗑️ Ticket perdant jeté : dette +${format(penalty)}€.`);
    showResult("DETTE +" + format(penalty) + "€", "red");
  } else if (!tableTicket.finished) {
    addHistory("🗑️ Ticket non terminé jeté : aucun gain, aucune dette.");
    showResult("JETÉ", "white");
  } else {
    addHistory("🗑️ Ticket jeté.");
  }

  tableTickets = tableTickets.filter(t => t.id !== tableTicket.id);
  updateUI();
  renderTableTickets();
}

function openTicket(tableTicket) {
  if (blockedHours > 0) {
    showResult("BLOQUÉ", "red");
    return;
  }

  activeTicket = tableTicket;

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
      <h3>Table des symboles</h3>
      <p><b>Un symbole compte seulement s’il est gratté à 60% ou plus.</b></p>
      <p>Le symbole <b>?</b> = jackpot.</p>
      ${activeTicket.ticket.symbols.map(s => `<p>${s.icon} : ${s.value}€</p>`).join("")}
      <hr>
      <p>Tu n’es pas obligé de tout gratter.</p>
      <p>Si tu jettes sans finir : pas de dette.</p>
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

  const generalChance = 1 + chanceLevel * 0.5;
  const symbolBonus = symbolLevel * 0.15;

  if (Math.random() * 100 < generalChance + symbolBonus) {
    const goodSymbols = ticket.symbols.filter(s => s.value > 0);
    const chosen = goodSymbols[Math.floor(Math.random() * goodSymbols.length)];

    values[0] = chosen;
    values[1] = chosen;
    values[2] = chosen;
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

    updateRevealPercent();
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

function updateRevealPercent() {
  if (!activeTicket) return;

  const canvases = [...document.querySelectorAll(".scratch-zone canvas")];
  let totalPercent = 0;

  canvases.forEach(canvas => {
    const ctx = canvas.getContext("2d");
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let clear = 0;

    for (let i = 3; i < data.length; i += 4) {
      if (data[i] === 0) clear++;
    }

    totalPercent += clear / (canvas.width * canvas.height) * 100;
  });

  activeTicket.revealedPercent = totalPercent / canvases.length;
}

function finishTicket() {
  if (!activeTicket || activeTicket.finished) return;

  const revealedIndexes = getRevealedIndexes();
  let gain = 0;

  const visibleSymbols = revealedIndexes.map(i => activeTicket.values[i]);

  const counts = {};

  visibleSymbols.forEach(symbol => {
    counts[symbol.icon] = (counts[symbol.icon] || 0) + 1;
  });

  for (const icon in counts) {
    if (counts[icon] >= 3) {
      const symbol = visibleSymbols.find(s => s.icon === icon);
      gain += symbol.value;
    }
  }

  if (visibleSymbols.some(s => s.icon === "?")) {
    const jackpotSymbol = activeTicket.ticket.symbols.find(s => s.icon === "?");
    gain += jackpotSymbol.value;
  }

  activeTicket.finalGain = gain;
  activeTicket.finished = true;

  if (gain > 0) {
    money += gain;
    addXp(16);
    showResult("GAGNÉ +" + format(gain) + "€", "lime");
    addHistory(`✅ ${activeTicket.ticket.name} terminé : +${format(gain)}€.`);
  } else if (gain < 0) {
    money += gain;
    addXp(4);
    showResult("PERTE " + format(gain) + "€", "red");
    addHistory(`💀 ${activeTicket.ticket.name} terminé : ${format(gain)}€.`);
  } else {
    addXp(4);
    showResult("0€", "red");
    addHistory(`❌ ${activeTicket.ticket.name} terminé : aucun gain.`);
  }

  activeTicket.x = 220;
  activeTicket.y = 220;
  activeTicket = null;

  renderTableTickets();
  updateUI();
  renderCatalog();
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
    updateRevealPercent();
  }, 600);
}

function upgradeChance() {
  buyUpgrade("chance", chanceLevel * 700, () => chanceLevel++);
}

function upgradeSymbol() {
  buyUpgrade("symbol", symbolLevel * 1000, () => symbolLevel++);
}

function upgradeScratchSize() {
  buyUpgrade("taille de grattage", scratchLevel * 500, () => scratchLevel++);
}

function buyAutoScratcher() {
  buyUpgrade("autogratteur", (autoLevel + 1) * 2000, () => autoLevel++);
}

function buyUpgrade(name, cost, callback) {
  if (!infiniteMoney && money < cost) {
    showResult("PAS ASSEZ", "red");
    return;
  }

  if (!infiniteMoney) money -= cost;

  callback();
  showResult("AMÉLIORÉ", "#ffd43b");
  addHistory(`⬆️ Amélioration achetée : ${name}.`);
  updateUI();
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
  addHistory(`🛒 Gadget acheté : ${gadget.name}.`);

  updateUI();
  renderCatalog();
}

function payDebt() {
  if (debt <= 0) {
    addHistory("Aucune dette à payer.");
    return;
  }

  if (!infiniteMoney && money < debt) {
    showResult("PAS ASSEZ", "red");
    return;
  }

  if (!infiniteMoney) money -= debt;

  addHistory(`✅ Dette remboursée : ${format(debt)}€.`);
  debt = 0;
  debtHours = 0;

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
