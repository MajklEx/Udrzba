/* script.js */
const app = document.getElementById('app');

const users = {
  ex: { password: 'heslo', role: 'admin' },
  user: { password: 'user', role: 'user' }
};

let currentUser = null;

const machines = [
  { name: "UMBRA 1", img: null, logs: [], inspections: [] },
  { name: "UMBRA 2", img: null, logs: [], inspections: [] },
  { name: "UMBRA 3", img: null, logs: [], inspections: [] },
  { name: "SN stará", img: null, logs: [], inspections: [] },
  { name: "SN nová", img: null, logs: [], inspections: [] },
  { name: "SN nejnovější", img: null, logs: [], inspections: [] }
];

function renderLogin() {
  app.innerHTML = `
    <h1>Přihlášení</h1>
    <input id="login-user" placeholder="Uživatel">
    <input id="login-pass" type="password" placeholder="Heslo">
    <button onclick="login()">Přihlásit se</button>
  `;
}

function login() {
  const user = document.getElementById('login-user').value;
  const pass = document.getElementById('login-pass').value;
  if (users[user] && users[user].password === pass) {
    currentUser = { name: user, role: users[user].role };
    renderApp();
  } else {
    alert("Špatné přihlašovací údaje.");
  }
}

function renderApp() {
  app.innerHTML = `<h2>Vítej, ${currentUser.name} (${currentUser.role})</h2>`;
  machines.forEach(machine => {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
      <h3>${machine.name}</h3>
      ${machine.img ? `<img src="${machine.img}" style="max-width: 100px">` : ''}
      <button onclick='renderMachine("${machine.name}")'>Zobrazit</button>
    `;
    app.appendChild(div);
  });
  if (currentUser.role === 'admin') {
    app.innerHTML += `
      <div class="card">
        <h3>Přidat stroj</h3>
        <input id="new-name" placeholder="Název stroje">
        <input id="new-img" type="file">
        <button onclick="addMachine()">Přidat</button>
      </div>
    `;
  }
}

function addMachine() {
  const name = document.getElementById('new-name').value;
  const imgInput = document.getElementById('new-img');
  if (!name) return;
  let img = null;
  if (imgInput.files[0]) {
    img = URL.createObjectURL(imgInput.files[0]);
  }
  machines.push({ name, img, logs: [], inspections: [] });
  renderApp();
}

function renderMachine(name) {
  const machine = machines.find(m => m.name === name);
  app.innerHTML = `<h2>${machine.name}</h2><button onclick="renderApp()">Zpět</button>`;

  app.innerHTML += `
    <div class="card">
      <h3>Záznamy</h3>
      ${machine.logs.map(log => `
        <div>
          <strong>${log.date}</strong>: ${log.text}<br>
          ${log.img ? `<img src="${log.img}" style="max-width:100px">` : ''}
        </div>
      `).join('')}
      <textarea id="logtext"></textarea>
      <input type="file" id="logimg">
      ${currentUser.role !== 'admin' && currentUser.role !== 'user' ? '' : `<button onclick='addLog("${machine.name}")'>Přidat záznam</button>`}
    </div>
  `;

  app.innerHTML += `
    <div class="card">
      <h3>Prohlídky</h3>
      ${machine.inspections.map((insp, i) => {
        const d = new Date(insp.date);
        const now = new Date();
        let cls = '';
        if (insp.done) cls = 'green';
        else if (d < now) cls = 'red';
        else if (d < new Date(now.getTime() + 7*86400000)) cls = 'yellow';
        return `<div class="${cls}">
          <input type="checkbox" ${insp.done ? 'checked' : ''} onchange="toggleInsp('${machine.name}', ${i})">
          ${insp.name} (${insp.date})
        </div>`;
      }).join('')}
      <input id="insp-name" placeholder="Název prohlídky">
      <input id="insp-date" type="date">
      ${currentUser.role === 'admin' ? '<button onclick="addInsp(\'' + machine.name + '\')">Přidat prohlídku</button>' : ''}
    </div>
  `;
}

function addLog(name) {
  const machine = machines.find(m => m.name === name);
  const text = document.getElementById('logtext').value;
  const imgInput = document.getElementById('logimg');
  let img = null;
  if (imgInput.files[0]) {
    img = URL.createObjectURL(imgInput.files[0]);
  }
  if (!text) return;
  machine.logs.push({ date: new Date().toLocaleString(), text, img });
  renderMachine(name);
}

function toggleInsp(name, index) {
  const machine = machines.find(m => m.name === name);
  machine.inspections[index].done = !machine.inspections[index].done;
  renderMachine(name);
}

function addInsp(name) {
  const machine = machines.find(m => m.name === name);
  const text = document.getElementById('insp-name').value;
  const date = document.getElementById('insp-date').value;
  if (!text || !date) return;
  machine.inspections.push({ name: text, date, done: false });
  renderMachine(name);
}

renderLogin();
