export const LEVELS = [
  { time: 30, fallSpeed: 3, bombChance: 0.15, spawnEvery: 900, target: 15 },
  { time: 30, fallSpeed: 3.5, bombChance: 0.2, spawnEvery: 800, target: 25 },
  { time: 35, fallSpeed: 4, bombChance: 0.2, spawnEvery: 700, target: 35 },
  { time: 35, fallSpeed: 4.5, bombChance: 0.25, spawnEvery: 600, target: 45 },
  { time: 40, fallSpeed: 5, bombChance: 0.3, spawnEvery: 500, target: 60 },
]


export function getUnlocked() {
  return Number(localStorage.getItem('unlockedLevel')) || 1
}

export function unlockLevel(n) {
  const next = Math.min(n, LEVELS.length)
  if (next > getUnlocked()) localStorage.setItem('unlockedLevel', next)
}