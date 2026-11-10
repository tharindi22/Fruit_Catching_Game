import express from 'express'

const router = express.Router()

const SEARCHES = {
  catch: 'pop',
  bomb: 'small explosion',
}

const PICKED = {
}

let cache = null

async function getJson(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(8000) })
  if (!response.ok) throw new Error('Freesound error ' + response.status)
  return response.json()
}


async function findSound(name, query) {
  const key = process.env.FREESOUND_API_KEY 

  if (PICKED[name]) {
    const sound = await getJson(
      'https://freesound.org/apiv2/sounds/' + PICKED[name] + '/?fields=id,name,previews&token=' + key
    )
    return sound.previews['preview-hq-mp3']
  }

  const params = new URLSearchParams({
    query,
    filter: 'duration:[0.2 TO 3] license:"Creative Commons 0"',
    sort: 'rating_desc', 
    fields: 'id,name,previews',
    page_size: '5',
    token: key,
  })
  const data = await getJson('https://freesound.org/apiv2/search/text/?' + params)
  const first = data.results.find((sound) => sound.previews)
  return first ? first.previews['preview-hq-mp3'] : null
}

router.get('/sounds', async (req, res) => {
  if (!process.env.FREESOUND_API_KEY) return res.json({})
  if (cache) return res.json(cache)

  try {
    const entries = await Promise.all(
      Object.entries(SEARCHES).map(async ([name, query]) => [name, await findSound(name, query)])
    )
    cache = Object.fromEntries(entries.filter(([, url]) => url))
    res.json(cache)
  } catch (err) {
    console.error(err)
    res.status(502).json({ message: 'Sound service is not available.' })
  }
})

router.get('/sounds/try', async (req, res) => {
  try {
    const params = new URLSearchParams({
      query: req.query.query || 'pop',
      filter: 'duration:[0.2 TO 3] license:"Creative Commons 0"',
      sort: 'rating_desc',
      fields: 'id,name,previews',
      page_size: '8',
      token: process.env.FREESOUND_API_KEY,
    })
    const data = await getJson('https://freesound.org/apiv2/search/text/?' + params)
    res.json(
      data.results.map((s) => ({ id: s.id, name: s.name, listen: s.previews['preview-hq-mp3'] }))
    )
  } catch (err) {
    console.error(err)
    res.status(502).json({ message: 'Sound service is not available.' })
  }
})

export default router