
import {
  createInitialGameState,
  advanceSimulation,
  installEquipment
} from "./engine/simulation.js";

import { planets } from "./data/gameConfig.js";
import { gameItems } from "./data/items.js";

let game = createInitialGameState();
let paused = false;

const app = document.getElementById("app");

function formatNumber(value) {
  return Number(value).toFixed(1);
}

function render() {
  const planet = planets[game.planet];

  const resources = game.resources;

  const resourceCards = Object.entries(resources)
    .map(([key, resource]) => `
      <div class="resource-card">
        <div class="resource-icon">${resource.icon}</div>
        <div class="resource-info">
          <span>${resource.name}</span>
          <strong>${formatNumber(resource.amount)} ${resource.unit}</strong>
        </div>
      </div>
    `).join("");

  const inventory = gameItems.map(item => {
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
        ${game.status.toUpperCase()}
      </div>
    </header>

    <main>
      <section class="dashboard-heading">
        <div>
          <p class="eyebrow">MISSION CONTROL / ACTIVE DEPLOYMENT</p>
          <h2>${planet.icon} ${planet.name} OUTPOST</h2>
          <p>${planet.description}</p>
        </div>

        <div class="day-counter">
          <small>MISSION DAY</small>
          <strong>${game.day}</strong>
        </div>
      </section>

      <section class="planet-selector">
        <button data-planet="moon"
          class="${game.planet === "moon" ? "selected" : ""}">
          🌕 LUNAR BASE
        </button>

        <button data-planet="mars"
          class="${game.planet === "mars" ? "selected" : ""}">
          🔴 MARS BASE
        </button>
      </section>

      <section class="game-layout">

        <div class="planet-scene ${game.planet}">
          <div class="scene-label">
            <span>LIVE OUTPOST VIEW</span>
            <span>CAM 01 / EXTERIOR</span>
          </div>

          <div class="stars"></div>

          <div class="planet-horizon"></div>

          <div class="mountain mountain-back"></div>
          <div class="mountain mountain-front"></div>

          <div class="outpost">
            <div class="antenna">
              <div></div>
            </div>

            <div class="solar-panels">
              <div class="solar-panel"></div>
              <div class="solar-panel"></div>
            </div>

            <div class="habitat">
              <div class="dome"></div>
              <div class="habitat-body">
                <div class="window"></div>
                <div class="door"></div>
              </div>
              <div class="habitat-base"></div>
            </div>
          </div>

          <div class="scene-footer">
            <span>OUTPOST STATUS: ${game.status.toUpperCase()}</span>
            <span>CREW: ${game.crewCount}</span>
          </div>
        </div>

        <aside class="status-panel">
          <h3>MISSION STATUS</h3>

          <div class="status-row">
            <span>Planet</span>
            <strong>${planet.name}</strong>
          </div>

          <div class="status-row">
            <span>Gravity</span>
            <strong>${planet.gravity} m/s²</strong>
          </div>

          <div class="status-row">
            <span>Atmosphere</span>
            <strong>${planet.atmosphere}</strong>
          </div>

          <div class="status-row">
            <span>Radiation</span>
            <strong>${planet.radiationRisk}</strong>
          </div>

          <div class="status-row">
            <span>Difficulty</span>
            <strong>${game.difficulty.toUpperCase()}</strong>
          </div>

          <div class="status-row">
            <span>Installed systems</span>
            <strong>${game.installedItems.length}</strong>
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
          ${resourceCards}
        </div>
      </section>

      <section class="inventory-section">
        <div class="section-heading">
          <div>
            <p class="eyebrow">CONSTRUCTION & DEVELOPMENT</p>
            <h3>EQUIPMENT INVENTORY</h3>
          </div>
          <span class="credits">
            🪙 ${formatNumber(resources.credits.amount)} CR
          </span>
        </div>

        <div class="inventory-grid">
          ${inventory}
        </div>
      </section>

      <section class="alerts-section">
        <p class="eyebrow">SYSTEM ALERTS</p>

        ${
          game.warnings.length
            ? game.warnings.map(warning => `
              <div class="alert">
                ⚠️ ${warning.message}
              </div>
            `).join("")
            : `<div class="success-alert">
                ✓ All monitored resources are within safe limits.
              </div>`
        }
      </section>
    </main>

    <footer>
      OUTPOST-01 © 2026 · HUMANITY'S NEXT FRONTIER
    </footer>
  `;

  attachEvents();
}

function attachEvents() {
  document.querySelectorAll("[data-planet]").forEach(button => {
    button.addEventListener("click", () => {
      const selectedPlanet = button.dataset.planet;

      if (planets[selectedPlanet]) {
        game.planet = selectedPlanet;
        render();
      }
    });
  });

  document.querySelectorAll("[data-install]").forEach(button => {
    button.addEventListener("click", () => {
      game = installEquipment(game, button.dataset.install);
      render();
    });
  });

  document.getElementById("pause-btn")
    .addEventListener("click", () => {
      paused = !paused;
      render();
    });
}

setInterval(() => {
  if (!paused && game.status === "active") {
    game = advanceSimulation(game, 1);
    render();
  }
}, 1000);

render();
