const API = 'http://localhost:5000/api'

const sounds = {} 
let loaded = false
let muted = localStorage.getItem('muted') === 'true'

export async function loadSounds() {
  if (loaded) return
  loaded = true
  try {
    const res = await fetch(API + '/sounds')
    if (!res.ok) return
    const links = await res.json()
    for (const [name, url] of Object.entries(links)) {
      const audio = new Audio(url)
      audio.preload = 'auto'
      sounds[name] = audio
    }
  } catch {
    
  }
}

export function playSound(name, volume = 1) {
  const audio = sounds[name]
  if (muted || !audio) return
  const copy = audio.cloneNode()
  copy.volume = volume
  copy.play().catch(() => {})
}

export function isMuted() {
  return muted
}

export function setMuted(value) {
  muted = value
  localStorage.setItem('muted', value)
}