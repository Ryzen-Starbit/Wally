export default function FilterBar({ activeTag, setActiveTag, tagCounts, genres }) {
  const tabs = ['All', ...Object.keys(genres)]

  return (
    <div className="sticky top-16 z-30 bg-black/40 backdrop-blur-md border-b border-white/6">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6">
        <div className="flex gap-1.5 overflow-x-auto py-3 no-scrollbar">
          {tabs.map(tag => {
            const label    = tag === 'All' ? 'All' : genres[tag].label
            const icon     = tag === 'All' ? '✦'   : genres[tag].icon
            const count    = tagCounts[tag] ?? 0
            const isActive = activeTag === tag
            return (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-medium border transition-all whitespace-nowrap
                  ${isActive
                    ? 'bg-white text-black border-white'
                    : 'bg-white/6 text-zinc-400 border-white/10 hover:text-white hover:border-white/25'}`}
              >
                <span className="text-xs">{icon}</span>
                {label}
                <span className={`text-xs ${isActive ? 'text-black/50' : 'text-zinc-600'}`}>{count}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}