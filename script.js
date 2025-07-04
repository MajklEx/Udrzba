// script.js
const app = document.getElementById('app');

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyClucXNjGC1iMqTRBnoxSw4y_kZOzRWlCA",
  authDomain: "udrzba-fc599.firebaseapp.com",
  projectId: "udrzba-fc599",
  storageBucket: "udrzba-fc599.appspot.com",
  messagingSenderId: "530653394982",
  appId: "1:530653394982:web:b80ef2475a005b3ea0ee7",
  measurementId: "G-KS8TPF37ZW"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

const users = {
  ex: { password: 'heslo', role: 'admin' },
  user: { password: 'user', role: 'user' }
};

let currentUser = null;
let machines = [];

async function loadMachines() {
  const snap = await db.collection("machines").get();
  machines = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function saveMachine(machine) {
  await db.collection("machines").doc(machine.id).set(machine);
}

function renderLogin() {
  app.innerHTML = `
    <h1>Přihlášení</h1>
    <input id="login-user" placeholder="Uživatel">
    <input id="login-pass" type="password" placeholder="Heslo">
    <button onclick="login()">Přihlásit se</button>
  `;
}

async function login() {
  const user = document.getElementById('login-user').value;
  const pass = document.getElementById('login-pass').value;
  if (users[user] && users[user].password === pass) {
    currentUser = { name: user, role: users[user].role };
    await loadMachines();
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
      <button onclick='renderMachine("${machine.id}")'>Zobrazit</button>
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

async function addMachine() {
  const name = document.getElementById('new-name').value;
  const file = document.getElementById('new-img').files[0];
  let imgURL = null;
  if (file) {
    const ref = storage.ref().child("machines/" + file.name);
    await ref.put(file);
    imgURL = await ref.getDownloadURL();
  }
  const docRef = await db.collection("machines").add({ name, img: imgURL, logs: [], inspections: [] });
  await loadMachines();
  renderApp();
}

function renderMachine(id) {
  const machine = machines.find(m => m.id === id);
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
      ${currentUser.role !== 'admin' && currentUser.role !== 'user' ? '' : `<button onclick='addLog("${machine.id}")'>Přidat záznam</button>`}
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
          <input type="checkbox" ${insp.done ? 'checked' : ''} onchange="toggleInsp('${machine.id}', ${i})">
          ${insp.name} (${insp.date})
        </div>`;
      }).join('')}
      <input id="insp-name" placeholder="Název prohlídky">
      <input id="insp-date" type="date">
      ${currentUser.role === 'admin' ? '<button onclick="addInsp(\'' + machine.id + '\')">Přidat prohlídku</button>' : ''}
    </div>
  `;
}

async function addLog(id) {
  const machine = machines.find(m => m.id === id);
  const text = document.getElementById('logtext').value;
  const file = document.getElementById('logimg').files[0];
  let imgURL = null;
  if (file) {
    const ref = storage.ref().child("logs/" + file.name);
    await ref.put(file);
    imgURL = await ref.getDownloadURL();
  }
  machine.logs.push({ date: new Date().toLocaleString(), text, img: imgURL });
  await saveMachine(machine);
  renderMachine(id);
}

async function toggleInsp(id, index) {
  const machine = machines.find(m => m.id === id);
  machine.inspections[index].done = !machine.inspections[index].done;
  await saveMachine(machine);
  renderMachine(id);
}

async function addInsp(id) {
  const machine = machines.find(m => m.id === id);
  const name = document.getElementById('insp-name').value;
  const date = document.getElementById('insp-date').value;
  if (!name || !date) return;
  machine.inspections.push({ name, date, done: false });
  await saveMachine(machine);
  renderMachine(id);
}

renderLogin();
