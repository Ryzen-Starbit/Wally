import { Heart, Download } from 'lucide-react'

export default function WallpaperCard({ wallpaper, isLiked, onLike, onOpen, featured }) {
  function handleLike(e) {
    e.stopPropagation()
    onLike(wallpaper.id, wallpaper.tags)
  }

  function handleDownload(e) {
    e.stopPropagation()
    const url = wallpaper.seed
      ? `https://picsum.photos/seed/${wallpaper.seed}/1920/1080`
      : wallpaper.fullUrl
    window.open(url, '_blank', 'noopener')
  }

  return (
    <div
      onClick={() => onOpen(wallpaper)}
      className="relative group cursor-pointer w-full h-full rounded-[10px] overflow-hidden bg-zinc-900"
    >
      <img
        src={wallpaper.thumbUrl}
        alt={wallpaper.title}
        loading="lazy"
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/0 to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-2">
        <div className="flex justify-end gap-1.5">
          <button
            onClick={handleLike}
            className={`p-1.5 rounded-lg border transition-all ${
              isLiked
                ? 'bg-red-500/20 border-red-500/40 text-red-400'
                : 'bg-black/60 border-white/10 text-white hover:text-red-400'
            }`}
          >
            <Heart size={13} fill={isLiked ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={handleDownload}
            className="p-1.5 rounded-lg border border-white/10 bg-black/60 text-white hover:text-white/80 transition-all"
          >
            <Download size={13} />
          </button>
        </div>

        <p className={`font-medium text-white truncate ${featured ? 'text-sm' : 'text-xs'}`}>
          {wallpaper.title}
        </p>
      </div>
    </div>
  )
}