
import {
  createInitialGameState,
  advanceSimulation,
  installEquipment
} from "./engine/simulation.js";

import { planets } from "./data/gameConfig.js";
import { gameItems } from "./data/items.js";

import { mountOutpostScene } from "./scene/outpost3d.js";

// ----------------------------------
// GAME INITIALIZATION
// ----------------------------------

let game = createInitialGameState();
let paused = false;

const app = document.getElementById("app");

function formatNumber(value) {
  return Number(value).toFixed(1);
}

// ----------------------------------
// RESOURCE DISPLAY
// ----------------------------------

function createResourceCards() {
  return Object.entries(game.resources)
    .map(([key, resource]) => `
      <div class="resource-card" id="resource-${key}">
        <div class="resource-icon">${resource.icon}</div>

        <div class="resource-info">
          <span>${resource.name}</span>
          <strong id="amount-${key}">
            ${formatNumber(resource.amount)} ${resource.unit}
          </strong>
        </div>
      </div>
    `).join("");
}

// ----------------------------------
// EQUIPMENT INVENTORY
// ----------------------------------

function createInventory() {
  return gameItems.map(item => {
    const installed = game.installedItems.includes(item.id);

    return `
      <div class="item-card">
        <div class="item-icon">${item.icon}</div>

        <div class="item-info">
          <strong>${item.name}</strong>
          <small>${item.description}</small>
          <span>${item.cost} CR</span>
        </div>

        <button
          class="install-btn"
          data-install="${item.id}"
          ${installed ? "disabled" : ""}
        >
          ${installed ? "INSTALLED" : "INSTALL"}
        </button>
      </div>
    `;
  }).join("");
}

// ----------------------------------
// ALERT DISPLAY
// ----------------------------------

function updateAlerts() {
  const container = document.getElementById("alerts-container");

  if (!container) return;

  if (game.warnings.length > 0) {
    container.innerHTML = game.warnings.map(warning => `
      <div class="alert">
        ⚠️ ${warning.message}
      </div>
    `).join("");
  } else {
    container.innerHTML = `
      <div class="success-alert">
        ✓ All monitored resources are within safe limits.
      </div>
    `;
  }
}

// ----------------------------------
// LIVE DASHBOARD UPDATES
// ----------------------------------

function updateDashboard() {
  const planet = planets[game.planet];

  document.getElementById("day-number").textContent = game.day;

  document.getElementById("game-status").textContent =
    game.status.toUpperCase();

  document.getElementById("scene-status").textContent =
    game.status.toUpperCase();

  document.getElementById("credits-number").textContent =
    formatNumber(game.resources.credits.amount);

  document.getElementById("crew-number").textContent =
    game.crewCount;

  document.getElementById("installed-number").textContent =
    game.installedItems.length;

  document.getElementById("planet-name").textContent =
    planet.name;

  document.getElementById("planet-gravity").textContent =
    `${planet.gravity} m/s²`;

  document.getElementById("planet-atmosphere").textContent =
    planet.atmosphere;

  document.getElementById("planet-radiation").textContent =
    planet.radiationRisk;

  document.getElementById("pause-btn").textContent =
    paused ? "▶ RESUME SIMULATION" : "Ⅱ PAUSE SIMULATION";

  for (const [key, resource] of Object.entries(game.resources)) {
    const amount = document.getElementById(`amount-${key}`);

    if (amount) {
      amount.textContent =
        `${formatNumber(resource.amount)} ${resource.unit}`;
    }
  }

  updateAlerts();
}

// ----------------------------------
// MAIN GAME INTERFACE
// ----------------------------------

function render() {
  const planet = planets[game.planet];

  app.innerHTML = `
    <header class="topbar">

      <div class="brand">
        <span class="brand-icon">◈</span>

        <div>
          <h1>OUTPOST-01</h1>
          <small>INTERPLANETARY SURVIVAL PROGRAM</small>
        </div>
      </div>

      <div class="top-status">
        <span class="live-dot"></span>
        <span id="game-status">${game.status.toUpperCase()}</span>
      </div>

    </header>

    <main>

      <section class="dashboard-heading">

        <div>
          <p class="eyebrow">
            MISSION CONTROL / ACTIVE DEPLOYMENT
          </p>

          <h2>${planet.icon} ${planet.name} OUTPOST</h2>

          <p>${planet.description}</p>
        </div>

        <div class="day-counter">
          <small>MISSION DAY</small>
          <strong id="day-number">${game.day}</strong>
        </div>

      </section>

      <section class="planet-selector">

        <button
          data-planet="moon"
          class="${game.planet === "moon" ? "selected" : ""}"
        >
          🌕 LUNAR BASE
        </button>

        <button
          data-planet="mars"
          class="${game.planet === "mars" ? "selected" : ""}"
        >
          🔴 MARS BASE
        </button>

      </section>

      <section class="game-layout">

        <div class="planet-scene">

          <div class="scene-label">
            <span>LIVE 3D OUTPOST VIEW</span>
            <span>CAM 01 / EXTERIOR</span>
          </div>

          <div class="scene-footer">
            <span>
              OUTPOST STATUS:
              <span id="scene-status">${game.status.toUpperCase()}</span>
            </span>

            <span>
              CREW:
              <span id="crew-number">${game.crewCount}</span>
            </span>
          </div>

          <div class="scene-controls">
            <span>W A S D</span>
            <small>DRIVE ROVER</small>
            <span>MOUSE</span>
            <small>ROTATE CAMERA</small>
          </div>

        </div>

        <aside class="status-panel">

          <h3>MISSION STATUS</h3>

          <div class="status-row">
            <span>Planet</span>
            <strong id="planet-name">${planet.name}</strong>
          </div>

          <div class="status-row">
            <span>Gravity</span>
            <strong id="planet-gravity">${planet.gravity} m/s²</strong>
          </div>

          <div class="status-row">
            <span>Atmosphere</span>
            <strong id="planet-atmosphere">${planet.atmosphere}</strong>
          </div>

          <div class="status-row">
            <span>Radiation</span>
            <strong id="planet-radiation">${planet.radiationRisk}</strong>
          </div>

          <div class="status-row">
            <span>Difficulty</span>
            <strong>${game.difficulty.toUpperCase()}</strong>
          </div>

          <div class="status-row">
            <span>Installed systems</span>
            <strong id="installed-number">${game.installedItems.length}</strong>
          </div>

          <button class="control-btn" id="pause-btn">
            ${paused ? "▶ RESUME SIMULATION" : "Ⅱ PAUSE SIMULATION"}
          </button>

        </aside>

      </section>

      <section class="resources-section">

        <div class="section-heading">

          <div>
            <p class="eyebrow">SURVIVAL MONITORING</p>
            <h3>OUTPOST RESOURCES</h3>
          </div>

          <span class="section-tag">LIVE DATA</span>

        </div>

        <div class="resource-grid">
          ${createResourceCards()}
        </div>

      </section>

      <section class="inventory-section">

        <div class="section-heading">

          <div>
            <p class="eyebrow">CONSTRUCTION & DEVELOPMENT</p>
            <h3>EQUIPMENT INVENTORY</h3>
          </div>

          <span class="credits">
            🪙 <span id="credits-number">
              ${formatNumber(game.resources.credits.amount)}
            </span> CR
          </span>

        </div>

        <div class="inventory-grid">
          ${createInventory()}
        </div>

      </section>

      <section class="alerts-section">

        <p class="eyebrow">SYSTEM ALERTS</p>

        <div id="alerts-container"></div>

      </section>

    </main>

    <footer>
      OUTPOST-01 © 2026 · HUMANITY'S NEXT FRONTIER
    </footer>
  `;

  // Mount the 3D world
  mountOutpostScene(
    document.querySelector(".planet-scene"),
    game.planet
  );

  attachEvents();

  updateDashboard();
}

// ----------------------------------
// EVENT LISTENERS
// ----------------------------------

function attachEvents() {

  // Planet selection
  document.querySelectorAll("[data-planet]").forEach(button => {

    button.addEventListener("click", () => {

      const selectedPlanet = button.dataset.planet;

      if (!planets[selectedPlanet]) return;

      game.planet = selectedPlanet;

      render();
    });

  });

  // Equipment installation
  document.querySelectorAll("[data-install]").forEach(button => {

    button.addEventListener("click", () => {

      const itemId = button.dataset.install;

      const previousState = game;

      game = installEquipment(game, itemId);

      if (game !== previousState) {
        render();
      }

    });

  });

  // Pause and resume
  document.getElementById("pause-btn")
    .addEventListener("click", () => {

      paused = !paused;

      updateDashboard();

    });

}

// ----------------------------------
// GAME LOOP
// ----------------------------------

render();

setInterval(() => {

  if (!paused && game.status === "active") {

    game = advanceSimulation(game, 1);

    updateDashboard();

  }

}, 1000);
