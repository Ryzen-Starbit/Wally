import { useState, useEffect, useMemo, useCallback } from 'react'
import Header            from './components/Header.jsx'
import FilterBar         from './components/FilterBar.jsx'
import WallpaperGrid     from './components/WallpaperGrid.jsx'
import WallpaperModal    from './components/WallpaperModal.jsx'
import TrendingRow       from './components/TrendingRow.jsx'
import RecommendedRow    from './components/RecommendedRow.jsx'
import LikedPanel        from './components/LikedPanel.jsx'
import Roulette          from './components/Roulette.jsx'
import AdminPanel        from './components/AdminPanel.jsx'
import NinePack          from './components/Pack.jsx'
import ColorSearch       from './components/ColorSearch.jsx'
import CollectionModal   from './components/CollectionModal.jsx'
import CollectionPanel   from './components/CollectionPanel.jsx'
import TasteProfile      from './pages/TasteProfile.jsx'
import { useAuth }       from './contexts/AuthContext.jsx'
import { useRecommendations } from './hooks/useRecommendations.js'
import { useCollections } from './hooks/useCollections.js'

export const GENRES = {
  nature:       { label: 'Nature',       icon: '🌿', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  space:        { label: 'Space',        icon: '🌌', color: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'   },
  abstract:     { label: 'Abstract',     icon: '🎨', color: 'bg-pink-500/15 text-pink-400 border-pink-500/30'         },
  minimal:      { label: 'Minimal',      icon: '◻',  color: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30'         },
  dark:         { label: 'Dark',         icon: '🌑', color: 'bg-slate-500/15 text-slate-400 border-slate-500/30'      },
  neon:         { label: 'Neon',         icon: '⚡', color: 'bg-violet-500/15 text-violet-400 border-violet-500/30'   },
  city:         { label: 'City',         icon: '🏙', color: 'bg-sky-500/15 text-sky-400 border-sky-500/30'            },
  architecture: { label: 'Architecture', icon: '🏛', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30'      },
  ocean:        { label: 'Ocean',        icon: '🌊', color: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'         },
  mountains:    { label: 'Mountains',    icon: '⛰', color: 'bg-orange-500/15 text-orange-400 border-orange-500/30'   },
}

export default function App() {
  const { likedIds, toggleLike, tagScores, trackInteraction, user } = useAuth()
  const {
    collections, createCollection,
    addToCollection, removeFromCollection,
    deleteCollection, togglePublic, renameCollection,
  } = useCollections(user)

  const [wallpapers, setWallpapers]         = useState([])
  const [loading, setLoading]               = useState(true)
  const [error, setError]                   = useState(null)
  const [activeTag, setActiveTag]           = useState('All')
  const [searchQuery, setSearchQuery]       = useState('')
  const [selectedWp, setSelectedWp]         = useState(null)
  const [showLiked, setShowLiked]           = useState(false)
  const [showRoulette, setShowRoulette]     = useState(false)
  const [showAdmin, setShowAdmin]           = useState(false)
  const [showPack, setShowPack]             = useState(false)
  const [showProfile, setShowProfile]       = useState(false)
  const [showCollections, setShowCollections] = useState(false)
  const [colorResults, setColorResults]     = useState(null)
  const [searchedColor, setSearchedColor]   = useState(null)
  const [colModalWp, setColModalWp]         = useState(null)
  const fetchWallpapers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/wallpapers')
      if (!res.ok) throw new Error(`Server error: ${res.status}`)
      setWallpapers(await res.json())
    } catch (e) {
      setError(e.message || 'Could not reach the server.')
    } finally {
      setLoading(false)
    }
  }, [])
  useEffect(() => { fetchWallpapers() }, [fetchWallpapers])
  const { recommendations, hasHistory } = useRecommendations(wallpapers, tagScores, 10)
  const displayWallpapers = colorResults || wallpapers
  const filtered = useMemo(() => {
    let r = displayWallpapers.filter(w => Array.isArray(w.tags))
    if (activeTag !== 'All') r = r.filter(w => w.tags.includes(activeTag))
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      r = r.filter(w =>
        w.title?.toLowerCase().includes(q) || w.tags.some(t => t.includes(q))
      )
    }
    return r
  }, [displayWallpapers, activeTag, searchQuery])
  const trending = useMemo(() =>
    [...wallpapers].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 8),
    [wallpapers]
  )
  const tagCounts = useMemo(() => {
    const c = { All: wallpapers.length }
    for (const w of wallpapers) {
      if (!Array.isArray(w.tags)) continue
      for (const t of w.tags) c[t] = (c[t] || 0) + 1
    }
    return c
  }, [wallpapers])
  const likedWallpapers = useMemo(() =>
    wallpapers.filter(w => likedIds.has(w.id)), [wallpapers, likedIds]
  )
  const openModal = useCallback(async (wp) => {
    setSelectedWp(wp)
    document.body.style.overflow = 'hidden'
    trackInteraction(wp.tags, 'view')
    try {
      await fetch(`/api/wallpapers/${wp.id}/view`, { method: 'PATCH' })
      setWallpapers(prev =>
        prev.map(w => w.id === wp.id ? { ...w, views: (w.views || 0) + 1 } : w)
      )
    } catch { /* silent */ }
  }, [trackInteraction])
  const closeModal = useCallback(() => {
    setSelectedWp(null)
    document.body.style.overflow = ''
  }, [])
  
  function openCollectionModal(wp) {
    if (!user) return
    setColModalWp(wp)
  }

  function handleColorResults(results, color) {
    setColorResults(results)
    setSearchedColor(color)
    setActiveTag('All')
    setSearchQuery('')
  }

  function handleColorClear() {
    setColorResults(null)
    setSearchedColor(null)
  }

  //Show taste profile page
  if (showProfile) {
    return (
      <TasteProfile
        onBack={() => setShowProfile(false)}
        likedWallpapers={likedWallpapers}
      />
    )
  }
  return (
    <div style={{ minHeight: '100vh' }}>
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        likedCount={likedIds.size}
        onLikedClick={() => setShowLiked(true)}
        onRouletteClick={() => setShowRoulette(true)}
        onAdminClick={() => setShowAdmin(true)}
        onPackClick={() => setShowPack(true)}
        onProfileClick={() => setShowProfile(true)}
        onCollectionsClick={() => setShowCollections(true)}
      />
      <FilterBar
        activeTag={activeTag}
        setActiveTag={tag => { setActiveTag(tag); handleColorClear() }}
        tagCounts={tagCounts}
        genres={GENRES}
      />
      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 pt-4 pb-8">
        {error && (
          <div className="mb-4 flex items-center justify-between gap-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            <span>⚠️ {error}</span>
            <button onClick={fetchWallpapers} className="shrink-0 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-xs font-medium transition-colors">Retry</button>
          </div>
        )}
        {colorResults && (
          <div className="mb-4 flex items-center gap-3 px-4 py-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-sm">
            <span
              className="w-4 h-4 rounded-full border border-white/20 shrink-0"
              style={{ background: searchedColor }}
            />
            <span className="text-violet-300 flex-1">
              Showing {colorResults.length} wallpapers closest to this color
            </span>
            <button
              onClick={handleColorClear}
              className="text-xs text-violet-400 hover:text-white transition-colors"
            >
              Clear
            </button>
          </div>
        )}
        {/* Color search widget*/}
        <div className="flex items-center justify-between mb-4">
          <div />
          <ColorSearch
            wallpapers={wallpapers}
            onResults={handleColorResults}
            onClear={handleColorClear}
            active={!!colorResults}
          />
        </div>
        {/* For You row */}
        {activeTag === 'All' && !searchQuery && !colorResults && hasHistory && recommendations.length > 0 && (
          <RecommendedRow wallpapers={recommendations} onOpen={openModal} genres={GENRES} />
        )}
        {/* Trending row */}
        {activeTag === 'All' && !searchQuery && !colorResults && trending.some(w => w.views > 0) && (
          <TrendingRow wallpapers={trending} onOpen={openModal} genres={GENRES} />
        )}
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-zinc-400">
            {loading
              ? <span className="animate-pulse">Loading wallpapers...</span>
              : <>
                  {colorResults
                    ? `${filtered.length} color matches`
                    : filtered.length === wallpapers.length
                    ? `${wallpapers.length} wallpapers`
                    : `${filtered.length} of ${wallpapers.length}`}
                  {activeTag !== 'All' && <span className="text-zinc-500"> · {activeTag}</span>}
                  {searchQuery && <span className="text-zinc-500"> · "{searchQuery}"</span>}
                </>
            }
          </p>
        </div>
        <WallpaperGrid
          wallpapers={filtered}
          loading={loading}
          likedIds={likedIds}
          onLike={toggleLike}
          onOpen={openModal}
          onAddToCollection={user ? openCollectionModal : null}
          genres={GENRES}
        />
        <footer className="mt-16 pt-8 border-t border-white/5 text-center text-xs text-zinc-700">
          Wally · V4 &nbsp;·&nbsp; Photos by{' '}
          <a href="https://picsum.photos" target="_blank" rel="noopener" className="text-zinc-500 hover:text-zinc-300 transition-colors">
            picsum.photos
          </a>
        </footer>
      </main>
      <WallpaperModal
        wallpaper={selectedWp}
        isLiked={selectedWp ? likedIds.has(selectedWp.id) : false}
        onLike={toggleLike}
        onClose={closeModal}
        genres={GENRES}
        onAddToCollection={user ? openCollectionModal : null}
      />
      <LikedPanel
        open={showLiked}
        onClose={() => setShowLiked(false)}
        wallpapers={likedWallpapers}
        onOpen={wp => { setShowLiked(false); openModal(wp) }}
        onUnlike={toggleLike}
        genres={GENRES}
      />
      <Roulette
        open={showRoulette}
        onClose={() => setShowRoulette(false)}
        wallpapers={wallpapers}
        likedIds={likedIds}
        onLike={toggleLike}
        onOpen={wp => { setShowRoulette(false); openModal(wp) }}
        genres={GENRES}
      />
      <AdminPanel
        open={showAdmin}
        onClose={() => setShowAdmin(false)}
        wallpapers={wallpapers}
        genres={GENRES}
        onRefresh={fetchWallpapers}
      />
      <NinePack
        open={showPack}
        onClose={() => setShowPack(false)}
        wallpapers={wallpapers}
        onOpen={wp => { setShowPack(false); openModal(wp) }}
        genres={GENRES}
      />
      <CollectionPanel
        open={showCollections}
        onClose={() => setShowCollections(false)}
        collections={collections}
        wallpapers={wallpapers}
        onDelete={deleteCollection}
        onTogglePublic={togglePublic}
        onRename={renameCollection}
        onOpen={wp => { setShowCollections(false); openModal(wp) }}
      />
      <CollectionModal
        open={!!colModalWp}
        onClose={() => setColModalWp(null)}
        wallpaperId={colModalWp?.id}
        wallpaperTitle={colModalWp?.title}
        collections={collections}
        onAddToExisting={addToCollection}
        onCreateNew={createCollection}
      />
    </div>
  )
}