import { useState, useMemo } from 'react'
import { X, Download, Package, RefreshCw, Shuffle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useRecommendations } from '../hooks/useRecommendations'

export default function NinePack({ open, onClose, wallpapers, onOpen, genres }) {
  const { tagScores } = useAuth()
  const { recommendations } = useRecommendations(wallpapers, tagScores, 30)

  // Active pack — array of 9 indices into recommendations
  const [packIndices, setPackIndices] = useState(() =>
    Array.from({ length: 9 }, (_, i) => i)
  )
  const [swapHint, setSwapHint] = useState(null)

  // The 9 wallpapers 
  const pack = useMemo(() =>
    packIndices.map(i => recommendations[i]).filter(Boolean),
    [packIndices, recommendations]
  )

  // available as swap candidates
  const available = useMemo(() =>
    recommendations
      .map((w, i) => ({ w, i }))
      .filter(({ i }) => !packIndices.includes(i)),
    [recommendations, packIndices]
  )
  if (!open) return null

  // Refresh the entire pack 
  function handleRefreshAll() {
    if (recommendations.length < 9) return
    const indices = Array.from({ length: recommendations.length }, (_, i) => i)
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]]
    }
    setPackIndices(indices.slice(0, 9))
    setSwapHint(null)
  }

  // Swap one slot with the next available candidate
  function handleSwapSlot(slotIndex) {
    if (!available.length) return
    const { i: newIdx } = available[Math.floor(Math.random() * available.length)]
    setPackIndices(prev => {
      const next = [...prev]
      next[slotIndex] = newIdx
      return next
    })
    setSwapHint(slotIndex)
    setTimeout(() => setSwapHint(null), 1000)
  }
  const isEmpty = pack.length === 0

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <div
          className="w-full max-w-2xl bg-dark-surface border border-dark-border rounded-2xl overflow-hidden flex flex-col max-h-[90vh]"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between px-6 py-4 border-b border-dark-border shrink-0">
            <div>
              <h2 className="font-semibold flex items-center gap-2 text-sm">
                <Package size={15} className="text-violet-400" />
                Your Custom 9-Pack
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                {isEmpty
                  ? 'Like and view more wallpapers to unlock your pack'
                  : `${pack.length} wallpapers · hover a card to swap it out`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {!isEmpty && (
                <button
                  onClick={handleRefreshAll}
                  title="Shuffle all 9 slots"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-dark-card border border-dark-border text-zinc-400 hover:text-white hover:border-zinc-500 text-xs font-medium transition-all"
                >
                  <RefreshCw size={12} />
                  Refresh all
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-dark-card text-zinc-400 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            {isEmpty ? (
              <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
                <span className="text-5xl">🎨</span>
                <p className="text-zinc-300 font-medium text-sm">No taste profile yet</p>
                <p className="text-zinc-600 text-xs max-w-xs">
                  Like wallpapers, open them and download your favourites.
                  We'll start building your pack automatically.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {pack.map((wp, slotIdx) => (
                  <div
                    key={`${wp.id}-${slotIdx}`}
                    className={`group relative rounded-xl overflow-hidden border transition-all duration-200
                      ${swapHint === slotIdx
                        ? 'border-violet-500/60 ring-1 ring-violet-500/30'
                        : 'border-white/5 hover:border-white/20'
                      }`}
                  >
                    {/* Image */}
                    <div
                      className="aspect-video bg-zinc-900 overflow-hidden cursor-pointer"
                      onClick={() => { onOpen(wp); onClose() }}
                    >
                      <img
                        src={wp.thumbUrl}
                        alt={wp.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                    {swapHint === slotIdx && (
                      <div className="absolute inset-0 bg-violet-500/10 flex items-center justify-center pointer-events-none">
                        <span className="text-xs text-violet-300 font-medium bg-violet-500/20 px-2 py-1 rounded-lg">
                          Swapped!
                        </span>
                      </div>
                    )}

                    <div className="absolute top-1.5 left-1.5">
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/65 text-zinc-400 font-mono">
                        #{slotIdx + 1}
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Swap this */}
                      <button
                        onClick={e => { e.stopPropagation(); handleSwapSlot(slotIdx) }}
                        title="Swap this wallpaper"
                        className="p-1.5 rounded-lg bg-black/70 text-zinc-300 hover:text-white hover:bg-violet-500/50 transition-all"
                      >
                        <Shuffle size={10} />
                      </button>

                      {/* Download */}
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          window.open(wp.fullUrl, '_blank', 'noopener')
                        }}
                        title="Download"
                        className="p-1.5 rounded-lg bg-black/70 text-zinc-300 hover:text-white hover:bg-white/20 transition-all"
                      >
                        <Download size={10} />
                      </button>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <p className="text-[10px] font-medium text-white truncate">{wp.title}</p>
                    </div>
                  </div>
                ))}

                {Array.from({ length: Math.max(0, 9 - pack.length) }).map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="aspect-video rounded-xl bg-zinc-900/40 border border-dark-border flex items-center justify-center"
                  >
                    <p className="text-zinc-700 text-[10px]">More soon</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {!isEmpty && (
            <div className="px-6 py-3 border-t border-dark-border shrink-0 flex items-center justify-between">
              <p className="text-xs text-zinc-600">
                Taste built from{' '}
                <span className="text-zinc-400">{Object.keys(tagScores).length} genres</span>
                {available.length > 0 && (
                  <span> · {available.length} more candidates available</span>
                )}
              </p>
              <p className="text-xs text-zinc-700">
                🔀 hover → swap &nbsp; · &nbsp; click → preview
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}