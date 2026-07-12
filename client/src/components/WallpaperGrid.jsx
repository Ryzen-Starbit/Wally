import WallpaperCard from './WallpaperCard.jsx'

export default function WallpaperGrid({ wallpapers, loading, likedIds, onLike, onOpen }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[4px]" style={{ gridAutoRows: '220px' }}>
        {Array.from({ length: 16 }).map((_, i) => (
          <div
            key={i}
            className="bg-zinc-900/80 animate-pulse rounded-[10px]"
            style={i % 9 === 0 ? { gridColumn: 'span 2', gridRow: 'span 2' } : {}}
          />
        ))}
      </div>
    )
  }
  if (wallpapers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <span className="text-5xl mb-4">🔍</span>
        <p className="text-zinc-300 font-medium">No wallpapers found</p>
        <p className="text-zinc-500 text-sm mt-1">Try a different tag or search term</p>
      </div>
    )
  }

  return (
    <div className="px-1 py-1">
      <div
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[4px]"
        style={{ gridAutoRows: '220px', overflow: 'visible' }}
      >
        {wallpapers.map((wp, i) => {
          const isFeatured = i % 9 === 0
          return (
            <div
              key={wp.id}
              style={{
                ...(isFeatured ? { gridColumn: 'span 2', gridRow: 'span 2' } : {}),
                overflow: 'visible',
                height: '100%',
              }}
            >
              <WallpaperCard
                wallpaper={wp}
                isLiked={likedIds.has(wp.id)}
                onLike={onLike}
                onOpen={onOpen}
                featured={isFeatured}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}