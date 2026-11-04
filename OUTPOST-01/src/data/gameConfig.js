
export const gameConfig = {
  title: "OUTPOST-01",
  version: "1.0.0",
  developer: "OUTPOST Development Team",

  startingCredits: 1000,
  startingDay: 1,

  defaultPlanet: "moon",

  simulation: {
    dayDuration: 120,
    oxygenConsumptionRate: 0.8,
    waterConsumptionRate: 1.5,
    foodConsumptionRate: 0.5,
    energyConsumptionRate: 2,
    autoSave: true
  },

  difficulty: {
    easy: {
      label: "Explorer",
      resourceMultiplier: 0.7,
      description: "A relaxed introduction to outpost management."
    },

    normal: {
      label: "Survivor",
      resourceMultiplier: 1,
      description: "Balanced survival and resource management."
    },

    hard: {
      label: "Pioneer",
      resourceMultiplier: 1.5,
      description: "Limited resources and challenging conditions."
    }
  }
};

export const planets = {
  moon: {
    id: "moon",
    name: "The Moon",
    icon: "🌕",
    gravity: 1.62,
    atmosphere: "Virtually none",
    environment: "Extreme temperature variations",
    radiationRisk: "High",
    solarEfficiency: 1.0,
    description:
      "Build a lunar research outpost and survive the harsh conditions of Earth's natural satellite."
  },

  mars: {
    id: "mars",
    name: "Mars",
    icon: "🔴",
    gravity: 3.71,
    atmosphere: "Thin carbon dioxide atmosphere",
    environment: "Cold and dusty",
    radiationRisk: "High",
    solarEfficiency: 0.55,
    description:
      "Establish a human settlement on Mars while managing dust storms, limited resources and radiation."
  }
};

export const gameRules = {
  oxygen: {
    criticalLevel: 20,
    depletionMessage: "Oxygen reserves are critically low!"
  },

  water: {
    criticalLevel: 15,
    depletionMessage: "Water reserves are critically low!"
  },

  food: {
    criticalLevel: 15,
    depletionMessage: "Food supplies are critically low!"
  },

  energy: {
    criticalLevel: 50,
    depletionMessage: "Outpost power reserves are critically low!"
  }
};
