import express from 'express'

const router = express.Router()


const SEARCHES = {
  fall: 'whoosh',       
  catch: 'pop',         
  bomb: 'explosion',    
  bonus: 'coin',        
  win: 'level complete',
  over: 'game over',
}

let cache = null 

async function findSound(query) {
  const params = new URLSearchParams({
    query,
    filter: 'duration:[0.2 TO 4] license:"Creative Commons 0"',
    fields: 'id,name,previews',
    page_size: '5',
    token: process.env.FREESOUND_API_KEY, 
  })
  const response = await fetch('https://freesound.org/apiv2/search/text/?' + params, {
    signal: AbortSignal.timeout(8000),
  })
  if (!response.ok) throw new Error('Freesound error ' + response.status)

  const data = await response.json()
  const first = data.results.find((sound) => sound.previews)
  return first ? first.previews['preview-hq-mp3'] : null
}

router.get('/sounds', async (req, res) => {
  if (!process.env.FREESOUND_API_KEY) return res.json({})
  if (cache) return res.json(cache)

  try {
    const entries = await Promise.all(
      Object.entries(SEARCHES).map(async ([name, query]) => [name, await findSound(query)])
    )
    cache = Object.fromEntries(entries.filter(([, url]) => url))
    res.json(cache)
  } catch (err) {
    console.error(err)
    res.status(502).json({ message: 'Sound service is not available.' })
  }
})

export default router