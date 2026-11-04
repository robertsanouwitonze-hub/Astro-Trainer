
import { initialResources } from "../data/resources.js";
import { gameConfig, planets, gameRules } from "../data/gameConfig.js";
import { gameItems } from "../data/items.js";

// Create a fresh game session
export function createInitialGameState(
  planet = gameConfig.defaultPlanet,
  difficulty = "normal"
) {
  return {
    planet,
    difficulty,
    day: gameConfig.startingDay,
    elapsedSeconds: 0,
    crewCount: 4,
    status: "active",

    resources: structuredClone(initialResources),

    // Starter equipment
    installedItems: ["solar-array"],

    warnings: []
  };
}

// Safely update resource quantities
function updateResource(resources, key, amount) {
  if (!resources[key]) return;

  resources[key].amount = Math.max(
    0,
    resources[key].amount + amount
  );
}

// Calculate equipment production
function calculatePowerProduction(installedItems) {
  return installedItems.reduce((total, id) => {
    const item = gameItems.find((entry) => entry.id === id);
    return total + (item?.powerGenerated || 0);
  }, 0);
}

// Generate warnings when supplies become low
function generateWarnings(resources) {
  const warnings = [];

  for (const [key, rule] of Object.entries(gameRules)) {
    const resource = resources[key];

    if (!resource) continue;

    if (resource.amount <= rule.criticalLevel) {
      warnings.push({
        resource: key,
        message: rule.depletionMessage,
        level: "critical"
      });
    }
  }

  return warnings;
}

// Advance the simulation by a given number of seconds
export function advanceSimulation(
  currentState,
  seconds = 1
) {
  if (currentState.status !== "active" || seconds <= 0) {
    return currentState;
  }

  const state = structuredClone(currentState);

  const difficulty =
    gameConfig.difficulty[state.difficulty] ||
    gameConfig.difficulty.normal;

  const environment =
    planets[state.planet] || planets.moon;

  const multiplier = difficulty.resourceMultiplier;

  const rates = gameConfig.simulation;

  const elapsed = state.elapsedSeconds + seconds;

  const daysPassed = Math.floor(
    elapsed / rates.dayDuration
  );

  const oldDay = Math.floor(
    state.elapsedSeconds / rates.dayDuration
  );

  const newDays = daysPassed - oldDay;

  // Apply resource changes for each completed game day
  if (newDays > 0) {
    const crew = state.crewCount;

    updateResource(
      state.resources,
      "oxygen",
      -rates.oxygenConsumptionRate * crew * multiplier * newDays
    );

    updateResource(
      state.resources,
      "water",
      -rates.waterConsumptionRate * crew * multiplier * newDays
    );

    updateResource(
      state.resources,
      "food",
      -rates.foodConsumptionRate * crew * multiplier * newDays
    );

    const powerProduced =
      calculatePowerProduction(state.installedItems) *
      environment.solarEfficiency *
      newDays;

    const powerConsumed =
      rates.energyConsumptionRate *
      crew *
      multiplier *
      newDays;

    updateResource(
      state.resources,
      "energy",
      powerProduced - powerConsumed
    );

    state.day += newDays;
  }

  state.elapsedSeconds = elapsed;

  // Check survival warnings
  state.warnings = generateWarnings(state.resources);

  // Check whether essential resources are depleted
  const essentialResources = [
    "oxygen",
    "water",
    "food"
  ];

  const hasDepletedResource = essentialResources.some(
    (key) => state.resources[key].amount <= 0
  );

  if (hasDepletedResource) {
    state.status = "critical";
  }

  return state;
}

// Install equipment into the outpost
export function installEquipment(state, itemId) {
  const item = gameItems.find(
    (entry) => entry.id === itemId
  );

  if (!item || !item.unlocked) return state;

  if (state.installedItems.includes(itemId)) {
    return state;
  }

  const credits = state.resources.credits.amount;

  if (credits < item.cost) return state;

  const updatedState = structuredClone(state);

  updatedState.resources.credits.amount -= item.cost;

  updatedState.installedItems.push(itemId);

  return updatedState;
}
