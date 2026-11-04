
export const gameItems = [
  {
    id: "oxygen-generator",
    name: "Oxygen Generator",
    category: "Life Support",
    description: "Produces breathable oxygen for the outpost.",
    icon: "🫁",
    cost: 300,
    powerRequired: 40,
    importance: "Critical",
    unlocked: true
  },
  {
    id: "water-recycler",
    name: "Water Recycler",
    category: "Life Support",
    description: "Filters and recycles used water.",
    icon: "💧",
    cost: 250,
    powerRequired: 25,
    importance: "Critical",
    unlocked: true
  },
  {
    id: "solar-array",
    name: "Solar Array",
    category: "Power",
    description: "Collects sunlight and converts it into electricity.",
    icon: "☀️",
    cost: 400,
    powerRequired: 0,
    powerGenerated: 100,
    importance: "Critical",
    unlocked: true
  },
  {
    id: "battery-bank",
    name: "Battery Bank",
    category: "Power",
    description: "Stores electricity for use during low-power periods.",
    icon: "🔋",
    cost: 200,
    powerRequired: 0,
    importance: "High",
    unlocked: true
  },
  {
    id: "radiation-shield",
    name: "Radiation Shield",
    category: "Protection",
    description: "Provides additional protection against space radiation.",
    icon: "🛡️",
    cost: 350,
    powerRequired: 5,
    importance: "Critical",
    unlocked: true
  }
];
