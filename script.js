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
  app.innerHTML = \`
    <h1>Přihlášení</h1>
    <input id="login-user" placeholder="Uživatel">
    <input id="login-pass" type="password" placeholder="Heslo">
    <button onclick="login()">Přihlásit se</button>
  \`;
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
  app.innerHTML = \`<h2>Vítej, \${currentUser.name} (\${currentUser.role})</h2>\`;
  machines.forEach(machine => {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = \`
      <h3>\${machine.name}</h3>
      <button onclick='renderMachine("\${machine.name}")'>Zobrazit</button>
    \`;
    app.appendChild(div);
  });
  if (currentUser.role === 'admin') {
    app.innerHTML += \`
      <div class="card">
        <h3>Přidat stroj</h3>
        <input id="new-name" placeholder="Název stroje">
        <button onclick="addMachine()">Přidat</button>
      </div>
    \`;
  }
}

function addMachine() {
  const name = document.getElementById('new-name').value;
  if (!name) return;
  machines.push({ name, img: null, logs: [], inspections: [] });
  renderApp();
}

function renderMachine(name) {
  const machine = machines.find(m => m.name === name);
  app.innerHTML = \`<h2>\${machine.name}</h2><button onclick="renderApp()">Zpět</button>\`;

  app.innerHTML += \`
    <div class="card">
      <h3>Záznamy</h3>
      \${machine.logs.map(log => \`
        <div>
          <strong>\${log.date}</strong>: \${log.text}
        </div>
      \`).join('')}
      <textarea id="logtext"></textarea>
      <button onclick='addLog("\${machine.name}")'>Přidat záznam</button>
    </div>
  \`;

  app.innerHTML += \`
    <div class="card">
      <h3>Prohlídky</h3>
      \${machine.inspections.map((insp, i) => {
        const d = new Date(insp.date);
        const now = new Date();
        let cls = '';
        if (insp.done) cls = 'green';
        else if (d < now) cls = 'red';
        else if (d < new Date(now.getTime() + 7*86400000)) cls = 'yellow';
        return \`<div class="\${cls}">
          <input type="checkbox" \${insp.done ? 'checked' : ''} onchange="toggleInsp('\${machine.name}', \${i})">
          \${insp.name} (\${insp.date})
        </div>\`;
      }).join('')}
    </div>
  \`;
}

function addLog(name) {
  const machine = machines.find(m => m.name === name);
  const text = document.getElementById('logtext').value;
  if (!text) return;
  machine.logs.push({ date: new Date().toLocaleString(), text });
  renderMachine(name);
}

function toggleInsp(name, index) {
  const machine = machines.find(m => m.name === name);
  machine.inspections[index].done = !machine.inspections[index].done;
  renderMachine(name);
}

renderLogin();
