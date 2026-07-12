import { TrendingUp } from 'lucide-react'

export default function TrendingRow({ wallpapers, onOpen, genres }) {
  if (!wallpapers.some(w => w.views > 0)) return null

  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp size={14} className="text-orange-400" />
        <h2 className="text-xs font-semibold text-white uppercase tracking-wider">Trending</h2>
        <span className="text-xs text-zinc-500">most viewed</span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {wallpapers.map(wp => (
          <div
            key={wp.id}
            onClick={() => onOpen(wp)}
            className="shrink-0 w-40 cursor-pointer group rounded-xl overflow-hidden border border-white/6 hover:border-white/20 transition-all hover:scale-[1.02]"
          >
            <div className="relative aspect-video overflow-hidden bg-zinc-900">
              <img
                src={wp.thumbUrl}
                alt={wp.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 brightness-105 saturate-110"
              />
              <span className="absolute bottom-1 right-1.5 text-[9px] px-1.5 py-0.5 rounded bg-black/70 text-orange-400 font-medium">
                👁 {wp.views}
              </span>
            </div>
            <div className="px-2 py-1.5 bg-black/50 backdrop-blur-sm">
              <p className="text-[11px] font-medium truncate text-white">{wp.title}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}