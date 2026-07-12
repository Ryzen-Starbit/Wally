import { useState, useEffect, useCallback } from 'react'
import { X, Heart, Download, RefreshCw, Maximize2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

// Weighted random pick : higher tag scores = more likely to appear
function weightedPick(wallpapers, tagScores) {
  if (!wallpapers.length) return null
  const hasHistory = Object.keys(tagScores).length > 0
  if (!hasHistory) {
    return wallpapers[Math.floor(Math.random() * wallpapers.length)]
  }

  const scored = wallpapers.map(w => ({
    ...w,
    weight: Math.max(
      0.1,
      (w.tags || []).reduce((sum, tag) => sum + (tagScores[tag] || 0), 0) + 1
    ),
  }))

  const total = scored.reduce((s, w) => s + w.weight, 0)
  let r = Math.random() * total
  for (const w of scored) {
    r -= w.weight
    if (r <= 0) return w
  }
  return scored[scored.length - 1]
}

export default function Roulette({ open, onClose, wallpapers, likedIds, onLike, onOpen, genres }) {
  const { tagScores, trackInteraction } = useAuth()
  const [current, setCurrent]     = useState(null)
  const [skipped, setSkipped]     = useState(new Set())
  const [animating, setAnimating] = useState(false)

  const pickNext = useCallback(() => {
    if (!wallpapers.length) return
    const pool = wallpapers.filter(
      w => !skipped.has(w.id) && Array.isArray(w.tags)
    )
    if (!pool.length) { setSkipped(new Set()); return }
    const pick = weightedPick(pool, tagScores)
    setAnimating(true)
    setTimeout(() => { setCurrent(pick); setAnimating(false) }, 200)
  }, [wallpapers, skipped, tagScores])
  useEffect(() => {
    if (open && !current) pickNext()
  }, [open])

  function handleSkip() {
    if (!current) return
    // Skipping decreases these tag scores → roulette avoids similar wallpapers next
    trackInteraction(current.tags, 'rouletteSkip')
    setSkipped(prev => new Set([...prev, current.id]))
    pickNext()
  }

  function handleLike(id) {
    onLike(id, current?.tags)
  }
  if (!open) return null
  const hasHistory = Object.keys(tagScores).length > 0

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <div
          className="w-full max-w-lg bg-dark-surface border border-dark-border rounded-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-dark-border">
            <div>
              <h2 className="font-semibold text-sm flex items-center gap-2">
                🎲 Wallpaper Roulette
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                {hasHistory
                  ? 'Picks weighted by your taste — skips teach it more'
                  : 'Discover something random'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-dark-card text-zinc-400 hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
          </div>
          {current ? (
            <>
              <div className={`relative aspect-video overflow-hidden transition-opacity duration-200 ${animating ? 'opacity-0' : 'opacity-100'}`}>
                <img
                  src={current.fullUrl}
                  alt={current.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="font-semibold text-white">{current.title}</p>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {current.tags.map(t => (
                      <span
                        key={t}
                        className={`text-[10px] px-1.5 py-0.5 rounded-md border ${genres[t]?.color ?? ''}`}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="absolute top-2 right-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/60 text-zinc-400">
                  {current.id}
                </span>
              </div>

              <div className="p-4 flex gap-2">
                <button
                  onClick={handleSkip}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dark-border bg-dark-card text-zinc-400 hover:text-white hover:border-zinc-500 text-sm font-medium transition-all"
                >
                  <RefreshCw size={13} /> Skip
                </button>
                <button
                  onClick={() => handleLike(current.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all
                    ${likedIds.has(current.id)
                      ? 'bg-red-500/20 border-red-500/40 text-red-400'
                      : 'border-dark-border bg-dark-card text-zinc-400 hover:text-red-400 hover:border-red-500/30'}`}
                >
                  <Heart size={13} fill={likedIds.has(current.id) ? 'currentColor' : 'none'} />
                  {likedIds.has(current.id) ? 'Liked' : 'Like'}
                </button>
                <button
                  onClick={() => onOpen(current)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dark-border bg-dark-card text-zinc-400 hover:text-white hover:border-zinc-500 text-sm font-medium transition-all"
                >
                  <Maximize2 size={13} /> View
                </button>
                <button
                  onClick={() => window.open(current.fullUrl, '_blank', 'noopener')}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white text-black text-sm font-semibold hover:bg-zinc-100 transition-all"
                >
                  <Download size={13} /> Save
                </button>
              </div>

              <p className="text-center text-xs text-zinc-600 pb-4">
                {wallpapers.length - skipped.size} remaining · {skipped.size} skipped
              </p>
            </>
          ) : (
            <div className="flex items-center justify-center py-20">
              <p className="text-zinc-500 text-sm">Loading...</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}