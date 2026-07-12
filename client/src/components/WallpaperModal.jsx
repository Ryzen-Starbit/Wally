import { useEffect, useState } from 'react'
import { X, Download, Heart, ExternalLink, Monitor, Smartphone, Tablet } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { FolderPlus } from 'lucide-react'

const RESOLUTIONS = [
  { label: 'Mobile', w: 1080,  h: 1920, Icon: Smartphone },
  { label: 'HD',     w: 1920,  h: 1080, Icon: Monitor    },
  { label: '4K',     w: 3840,  h: 2160, Icon: Monitor    },
]

const DEVICES = [
  { key: 'desktop', label: 'Desktop', Icon: Monitor   },
  { key: 'tablet',  label: 'Tablet',  Icon: Tablet    },
  { key: 'phone',   label: 'Phone',   Icon: Smartphone },
]

const DEVICE_STYLES = {
  desktop: 'w-full aspect-video rounded-md border-[6px] border-zinc-700',
  tablet:  'w-48 aspect-[3/4] rounded-xl border-[6px] border-zinc-700 mx-auto',
  phone:   'w-28 aspect-[9/19] rounded-2xl border-[5px] border-zinc-700 mx-auto',
}

export default function WallpaperModal({ wallpaper, isLiked, onLike, onClose, genres, onAddToCollection }) {
  const [selectedRes, setSelectedRes] = useState(1)
  const [previewDevice, setPreviewDevice] = useState(null)
  const { trackInteraction } = useAuth()

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  useEffect(() => {
    if (wallpaper) setPreviewDevice(null)
  }, [wallpaper?.id])
  if (!wallpaper) return null
  const hasSeed = Boolean(wallpaper.seed)

  function getDownloadUrl() {
    if (!hasSeed) return wallpaper.fullUrl
    const r = RESOLUTIONS[selectedRes]
    return `https://picsum.photos/seed/${wallpaper.seed}/${r.w}/${r.h}`
  }
  function handleDownload() {
  // Track download → boosts tag scores for genres
  trackInteraction(wallpaper.tags, 'download')
  const r = RESOLUTIONS[selectedRes]
  window.open(`https://picsum.photos/seed/${wallpaper.seed}/${r.w}/${r.h}`, '_blank', 'noopener')
}

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-5xl bg-dark-surface border border-dark-border rounded-2xl overflow-hidden max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-black/60 border border-white/10 hover:bg-white/15 transition-colors">
          <X size={15} />
        </button>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_290px] overflow-auto flex-1">

          {/* Image panel */}
          <div className="relative bg-black flex items-center justify-center min-h-[280px] lg:min-h-[480px] overflow-hidden">
            {previewDevice ? (
              <div className={`${DEVICE_STYLES[previewDevice]} overflow-hidden shadow-2xl`}>
                <img src={wallpaper.fullUrl} alt={wallpaper.title} className="w-full h-full object-cover" />
              </div>
            ) : (
              <img src={wallpaper.fullUrl} alt={wallpaper.title} className="w-full h-full object-cover" />
            )}

            {/* Device toggle */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 bg-black/70 backdrop-blur-sm rounded-xl p-1 border border-white/10">
              <button
                onClick={() => setPreviewDevice(null)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${!previewDevice ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'}`}
              >
                Full
              </button>
              {DEVICES.map(d => (
                <button
                  key={d.key}
                  onClick={() => setPreviewDevice(d.key)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1 ${previewDevice === d.key ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'}`}
                >
                  <d.Icon size={11} /> {d.label}
                </button>
              ))}
            </div>
            <a href={wallpaper.fullUrl} target="_blank" rel="noopener" onClick={e => e.stopPropagation()}
              className="absolute top-3 left-3 flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg bg-black/60 border border-white/10 text-zinc-400 hover:text-white transition-colors">
              <ExternalLink size={10} /> Open original
            </a>
          </div>

          {/* Info panel */}
          <div className="flex flex-col gap-5 p-6 border-t lg:border-t-0 lg:border-l border-dark-border overflow-y-auto">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold leading-tight">{wallpaper.title}</h2>
                <p className="text-xs text-zinc-500 mt-1 font-mono">{wallpaper.id} · {wallpaper.res}</p>
                {wallpaper.views > 0 && <p className="text-xs text-zinc-600 mt-0.5">👁 {wallpaper.views} views</p>}
              </div>
              <button
                onClick={() => onLike(wallpaper.id, wallpaper.tags)}
                className={`shrink-0 p-2.5 rounded-xl border transition-all ${isLiked ? 'bg-red-500/20 border-red-500/40 text-red-400' : 'bg-dark-card border-dark-border text-zinc-400 hover:text-red-400 hover:border-red-500/30'}`}
              >
                <Heart size={15} fill={isLiked ? 'currentColor' : 'none'} />
              </button>
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Themes</p>
              <div className="flex flex-wrap gap-1.5">
                {wallpaper.tags.map(tag => (
                  <span key={tag} className={`text-xs px-2.5 py-1 rounded-lg border ${genres[tag]?.color ?? 'bg-zinc-800/50 text-zinc-400 border-zinc-700'}`}>
                    {genres[tag]?.icon} {tag}
                  </span>
                ))}
              </div>
            </div>     
            {onAddToCollection && (
              <button
                onClick={() => onAddToCollection(wallpaper)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dark-border bg-dark-card text-zinc-400 hover:text-amber-400 hover:border-amber-500/30 text-xs font-medium transition-all w-full"
              >
                <FolderPlus size={12} />
                Save to collection
              </button>
            )}
            {hasSeed && (
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Download as</p>
                <div className="grid grid-cols-3 gap-2">
                  {RESOLUTIONS.map(({ label, Icon }, i) => (
                    <button
                      key={label}
                      onClick={() => setSelectedRes(i)}
                      className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border text-xs transition-all ${selectedRes === i ? 'bg-white text-black border-white' : 'bg-dark-card border-dark-border text-zinc-400 hover:border-zinc-500 hover:text-white'}`}
                    >
                      <Icon size={13} />
                      <span className="font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <button
              onClick={handleDownload}
              className="mt-auto w-full py-3 rounded-xl bg-white text-black font-semibold text-sm hover:bg-zinc-100 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Download size={14} />
              {hasSeed ? `Download ${RESOLUTIONS[selectedRes].label}` : 'Download'}
            </button>
            <p className="text-[10px] text-zinc-600 text-center -mt-3">Opens in new tab — right-click to save</p>
          </div>
        </div>
      </div>
    </div>
  )
}