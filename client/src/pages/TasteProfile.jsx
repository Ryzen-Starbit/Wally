import { useMemo } from 'react'
import { ArrowLeft, Heart, Eye, Download, Sparkles, TrendingUp } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const GENRE_COLORS = {
  nature:       { bar: 'bg-emerald-500', text: 'text-emerald-400', icon: '🌿' },
  space:        { bar: 'bg-indigo-500',  text: 'text-indigo-400',  icon: '🌌' },
  abstract:     { bar: 'bg-pink-500',    text: 'text-pink-400',    icon: '🎨' },
  minimal:      { bar: 'bg-zinc-400',    text: 'text-zinc-400',    icon: '◻'  },
  dark:         { bar: 'bg-slate-500',   text: 'text-slate-400',   icon: '🌑' },
  neon:         { bar: 'bg-violet-500',  text: 'text-violet-400',  icon: '⚡' },
  city:         { bar: 'bg-sky-500',     text: 'text-sky-400',     icon: '🏙' },
  architecture: { bar: 'bg-amber-500',   text: 'text-amber-400',   icon: '🏛' },
  ocean:        { bar: 'bg-cyan-500',    text: 'text-cyan-400',    icon: '🌊' },
  mountains:    { bar: 'bg-orange-500',  text: 'text-orange-400',  icon: '⛰' },
}

export default function TasteProfile({ onBack, likedWallpapers }) {
  const { user, tagScores } = useAuth()
  const sortedTags = useMemo(() =>
    Object.entries(tagScores)
      .filter(([, score]) => score > 0)
      .sort(([, a], [, b]) => b - a),
    [tagScores]
  )
  const maxScore = sortedTags.length > 0 ? sortedTags[0][1] : 1
  const totalInteractions = sortedTags.reduce((sum, [, v]) => sum + v, 0)
  const topGenres = sortedTags.slice(0, 3).map(([tag]) => tag)
  const hasData = sortedTags.length > 0
  const vibeMap = {
    nature: 'Nature Lover 🌿',
    space: 'Cosmic Explorer 🌌',
    abstract: 'Abstract Thinker 🎨',
    minimal: 'Minimalist ◻',
    dark: 'Dark Aesthetic 🌑',
    neon: 'Neon Dreamer ⚡',
    city: 'Urban Soul 🏙',
    architecture: 'Architecture Buff 🏛',
    ocean: 'Ocean Wanderer 🌊',
    mountains: 'Mountain Spirit ⛰',
  }
  const vibe = vibeMap[topGenres[0]] || 'Explorer 🔭'

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-dark-bg/85 backdrop-blur-md border-b border-dark-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-dark-surface border border-dark-border text-zinc-400 hover:text-white hover:border-zinc-500 transition-all"
          >
            <ArrowLeft size={15} />
          </button>
          <div>
            <h1 className="font-semibold text-sm">Taste Profile</h1>
            <p className="text-xs text-zinc-500">{user?.displayName || user?.email}</p>
          </div>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div className="bg-dark-surface border border-dark-border rounded-2xl p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Your vibe</p>
              <h2 className="text-2xl font-bold text-white">{vibe}</h2>
              {topGenres.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {topGenres.map(tag => (
                    <span
                      key={tag}
                      className={`text-xs px-2.5 py-1 rounded-lg border ${
                        GENRE_COLORS[tag]
                          ? `bg-${GENRE_COLORS[tag].bar.split('-')[1]}-500/15 ${GENRE_COLORS[tag].text} border-${GENRE_COLORS[tag].bar.split('-')[1]}-500/30`
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                      }`}
                    >
                      {GENRE_COLORS[tag]?.icon} {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            {user?.photoURL && (
              <img src={user.photoURL} alt="" className="w-14 h-14 rounded-full border-2 border-dark-border" />
            )}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            {[
              { icon: Heart, label: 'Liked',    value: likedWallpapers.length, color: 'text-red-400' },
              { icon: Sparkles, label: 'Genres explored', value: sortedTags.length, color: 'text-violet-400' },
              { icon: TrendingUp, label: 'Interactions', value: Math.round(totalInteractions), color: 'text-emerald-400' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="bg-dark-card rounded-xl p-3 text-center">
                <Icon size={16} className={`${color} mx-auto mb-1`} />
                <p className="text-lg font-bold text-white">{value}</p>
                <p className="text-[10px] text-zinc-500">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Genre score bars */}
        <div className="bg-dark-surface border border-dark-border rounded-2xl p-6">
          <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
            <TrendingUp size={14} className="text-violet-400" />
            Genre Scores
          </h3>
          {!hasData ? (
            <div className="text-center py-8">
              <p className="text-zinc-500 text-sm">No taste data yet</p>
              <p className="text-zinc-700 text-xs mt-1">Like and view wallpapers to build your profile</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedTags.map(([tag, score]) => {
                const info    = GENRE_COLORS[tag]
                const pct     = Math.max(4, (score / maxScore) * 100)
                const rounded = Math.round(score * 10) / 10
                return (
                  <div key={tag} className="flex items-center gap-3">
                    <span className="text-sm w-4 text-center">{info?.icon || '🏷'}</span>
                    <span className="text-xs text-zinc-400 w-20 shrink-0 capitalize">{tag}</span>
                    <div className="flex-1 h-2 bg-dark-card rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${info?.bar || 'bg-zinc-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-zinc-500 w-8 text-right tabular-nums">{rounded}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Liked wallpapers grid */}
        {likedWallpapers.length > 0 && (
          <div className="bg-dark-surface border border-dark-border rounded-2xl p-6">
            <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
              <Heart size={14} className="text-red-400" />
              Liked Wallpapers
              <span className="text-xs text-zinc-500">({likedWallpapers.length})</span>
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {likedWallpapers.slice(0, 12).map(wp => (
                <div key={wp.id} className="aspect-video rounded-xl overflow-hidden bg-dark-card">
                  <img
                    src={wp.thumbUrl}
                    alt={wp.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              {likedWallpapers.length > 12 && (
                <div className="aspect-video rounded-xl bg-dark-card flex items-center justify-center">
                  <p className="text-xs text-zinc-500">+{likedWallpapers.length - 12} more</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}