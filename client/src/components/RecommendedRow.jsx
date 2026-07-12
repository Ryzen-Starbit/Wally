import { Sparkles } from 'lucide-react'

export default function RecommendedRow({ wallpapers, onOpen, genres }) {
  if (!wallpapers.length) return null

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={14} className="text-violet-400" />
        <h2 className="text-sm font-semibold text-white">For You</h2>
        <span className="text-xs text-zinc-500">based on your taste</span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
        {wallpapers.map(wp => (
          <div
            key={wp.id}
            onClick={() => onOpen(wp)}
            className="shrink-0 w-44 cursor-pointer group rounded-xl overflow-hidden border border-white/5 hover:border-violet-500/30 transition-all hover:-translate-y-1 duration-200"
          >
            <div className="relative aspect-video overflow-hidden bg-zinc-900">
              <img
                src={wp.thumbUrl}
                alt={wp.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="px-2.5 py-2 bg-black/20 backdrop-blur-sm">
              <p className="text-[11px] font-medium truncate text-white">{wp.title}</p>
              <div className="flex gap-1 mt-1 flex-wrap">
                {wp.tags.slice(0, 2).map(t => (
                  <span
                    key={t}
                    className={`text-[9px] px-1.5 py-0.5 rounded border ${genres[t]?.color ?? 'bg-zinc-800 text-zinc-500 border-zinc-700'}`}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}