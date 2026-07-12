import { X, Heart } from 'lucide-react'

export default function LikedPanel({ open, onClose, wallpapers, onOpen, onUnlike, genres }) {
  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 z-50 w-80 bg-dark-surface border-l border-dark-border flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-dark-border">
          <div className="flex items-center gap-2">
            <Heart size={15} className="text-red-400" fill="currentColor" />
            <span className="font-semibold text-sm">Liked Wallpapers</span>
            <span className="text-xs text-zinc-500">{wallpapers.length}</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-dark-card text-zinc-400 hover:text-white transition-colors">
            <X size={14} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {wallpapers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <span className="text-4xl mb-3">💔</span>
              <p className="text-zinc-400 text-sm font-medium">Nothing liked yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {wallpapers.map(wp => (
                <div key={wp.id}
                  className="flex gap-3 p-2 rounded-xl hover:bg-dark-card cursor-pointer group transition-colors"
                  onClick={() => onOpen(wp)}
                >
                  <div className="w-16 h-11 rounded-lg overflow-hidden shrink-0 bg-dark-card">
                    <img src={wp.thumbUrl} alt={wp.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{wp.title}</p>
                    <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{wp.id}</p>
                    <div className="flex gap-1 mt-1">
                      {wp.tags.slice(0, 2).map(t => (
                        <span key={t} className={`text-[9px] px-1.5 py-0.5 rounded border ${genres[t]?.color ?? 'bg-zinc-800 text-zinc-500 border-zinc-700'}`}>{t}</span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); onUnlike(wp.id, wp.tags) }}
                    className="shrink-0 p-1.5 rounded-lg text-zinc-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}