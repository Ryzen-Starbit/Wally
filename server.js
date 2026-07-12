const express = require('express')
const cors    = require('cors')
const fs      = require('fs')
const path    = require('path')
const app     = express()
const PORT    = 3001
const DB_PATH = path.join(__dirname, 'data', 'wallpapers.json')
app.use(cors())
app.use(express.json())
const GENRE_PREFIX = {
  nature:       'NAT',
  space:        'SPC',
  abstract:     'ABS',
  minimal:      'MIN',
  dark:         'DRK',
  neon:         'NEO',
  city:         'CTY',
  architecture: 'ARC',
  ocean:        'OCN',
  mountains:    'MTN',
}

function readDB() {
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'))
}
function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2))
}
function generateId(primaryTag, wallpapers) {
  const prefix   = GENRE_PREFIX[primaryTag] || 'GEN'
  const existing = wallpapers
    .filter(w => w.id.startsWith(prefix + '-'))
    .map(w => parseInt(w.id.split('-')[1]))
    .filter(n => !isNaN(n))
  const next = existing.length > 0 ? Math.max(...existing) + 1 : 1
  return `${prefix}-${String(next).padStart(3, '0')}`
}

app.get('/api/wallpapers', (req, res) => {
  try {
    res.json(readDB())
  } catch (e) {
    res.status(500).json({ error: 'Could not read database' })
  }
})

app.post('/api/wallpapers', (req, res) => {
  const { title, seed, imageUrl, primaryTag, tags, resolution } = req.body
  if (!title || !primaryTag || !tags || tags.length === 0) {
    return res.status(400).json({ error: 'title, primaryTag and tags are required' })
  }
  const db       = readDB()
  const id       = generateId(primaryTag, db)
  const useSeed  = seed || Math.random().toString(36).slice(2, 10)
  const thumbUrl = imageUrl || `https://picsum.photos/seed/${useSeed}/600/400`
  const fullUrl  = imageUrl || `https://picsum.photos/seed/${useSeed}/1920/1080`
  const allTags  = [primaryTag, ...tags.filter(t => t !== primaryTag)]
  const wallpaper = {
    id, title,
    tags:    allTags,
    seed:    imageUrl ? null : useSeed,
    res:     resolution || 'HD',
    thumbUrl, fullUrl,
    views:   0,
    addedAt: new Date().toISOString(),
  }
  db.push(wallpaper)
  writeDB(db)
  res.status(201).json(wallpaper)
})

app.delete('/api/wallpapers/:id', (req, res) => {
  const db  = readDB()
  const idx = db.findIndex(w => w.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: 'Not found' })
  const [removed] = db.splice(idx, 1)
  writeDB(db)
  res.json({ removed })
})

app.patch('/api/wallpapers/:id/view', (req, res) => {
  const db = readDB()
  const wp = db.find(w => w.id === req.params.id)
  if (!wp) return res.status(404).json({ error: 'Not found' })
  wp.views = (wp.views || 0) + 1
  writeDB(db)
  res.json({ id: wp.id, views: wp.views })
})

const server = app.listen(PORT, () => {
  console.log(`\n🖼  Wally API → http://localhost:${PORT}\n`)
})
server.on('error', err => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌  Port ${PORT} still busy after cleanup. Wait 5 seconds and try again.\n`)
  } else {
    console.error('Server error:', err)
  }
  process.exit(1)
})