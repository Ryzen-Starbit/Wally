import { useState } from 'react'
import { Search, X, Heart, Shuffle, Settings, LogOut, User, ChevronDown, Package, LayoutDashboard, FolderOpen } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import AuthModal from './AuthModal'

export default function Header({
  searchQuery, setSearchQuery, likedCount,
  onLikedClick, onRouletteClick, onAdminClick,
  onPackClick, onProfileClick, onCollectionsClick,
}) {
  const { user, logout } = useAuth()
  const [showAuth, setShowAuth]         = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const avatar = user?.photoURL
  const initials = (user?.displayName || user?.email || '?')[0].toUpperCase()
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User'
  return (
    <>
      <header className="sticky top-0 z-40 bg-dark-bg/85 backdrop-blur-md border-b border-dark-border">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">

          <div className="flex items-center gap-2 shrink-0">
            <span className="font-semibold text-lg tracking-tight">Wally</span>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search wallpapers or tags..."
              className="w-full bg-dark-surface border border-dark-border rounded-xl pl-9 pr-8 py-2 text-sm placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
              >
                <X size={13} />
              </button>
            )}
          </div>
          <div className="ml-auto flex items-center gap-2">

            {/* Liked count */}
            <button
              onClick={onLikedClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-dark-surface border border-dark-border text-sm text-zinc-400 hover:text-red-400 hover:border-red-500/30 transition-all"
            >
              <Heart size={13} />
              <span>{likedCount}</span>
            </button>

            {/* Roulette */}
            <button
              onClick={onRouletteClick}
              title="Wallpaper Roulette"
              className="p-2 rounded-xl bg-dark-surface border border-dark-border text-zinc-400 hover:text-violet-400 hover:border-violet-500/30 transition-all"
            >
              <Shuffle size={15} />
            </button>
            {/*Pack*/}
            <button
              onClick={onPackClick}
              title="My Pack"
              className="p-2 rounded-xl bg-dark-surface border border-dark-border text-zinc-400 hover:text-violet-400 hover:border-violet-500/30 transition-all"
            >
              <Package size={15} />
            </button>

            {/* Collections */}
            <button
              onClick={onCollectionsClick}
              title="My Collections"
              className="p-2 rounded-xl bg-dark-surface border border-dark-border text-zinc-400 hover:text-amber-400 hover:border-amber-500/30 transition-all"
            >
              <FolderOpen size={15} />
            </button>

            {/* Admin */}
            <button
              onClick={onAdminClick}
              title="Admin Panel"
              className="p-2 rounded-xl bg-dark-surface border border-dark-border text-zinc-400 hover:text-white hover:border-zinc-500 transition-all"
            >
              <Settings size={15} />
            </button>

            {/* Auth section */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(v => !v)}
                  className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-xl bg-dark-surface border border-dark-border hover:border-zinc-500 transition-all"
                >
                  {avatar ? (
                    <img src={avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-violet-500/25 flex items-center justify-center text-violet-300 text-xs font-bold">
                      {initials}
                    </div>
                  )}
                  <span className="text-sm text-zinc-300 max-w-[90px] truncate hidden sm:block">
                    {displayName}
                  </span>
                  <ChevronDown size={12} className={`text-zinc-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>
                {showUserMenu && (
                  <>

                    <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-dark-surface border border-dark-border rounded-xl shadow-2xl z-20 overflow-hidden">
                      {/* User info */}
                      <div className="px-4 py-3 border-b border-dark-border">
                        <div className="flex items-center gap-3">
                          {avatar ? (
                            <img src={avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-violet-500/25 flex items-center justify-center text-violet-300 text-sm font-bold">
                              {initials}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white truncate">{displayName}</p>
                            <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                          </div>
                        </div>
                      </div>

                      <div className="px-4 py-2.5 border-b border-dark-border">
                        <p className="text-xs text-emerald-400 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                          Likes synced to cloud
                        </p>
                      </div>
                       
                      <button
                        onClick={() => { onProfileClick(); setShowUserMenu(false) }}
                        className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-zinc-400 hover:text-white hover:bg-dark-card transition-colors border-b border-dark-border"
                      >
                        <LayoutDashboard size={13} />
                        Taste Profile
                      </button>

                      {/* Sign out */}
                      <button
                        onClick={() => { logout(); setShowUserMenu(false) }}
                        className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-zinc-400 hover:text-white hover:bg-dark-card transition-colors"
                      >
                        <LogOut size={13} />
                        Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white text-black text-sm font-semibold hover:bg-zinc-100 active:scale-95 transition-all"
              >
                <User size={13} />
                Sign in
              </button>
            )}
          </div>
        </div>
      </header>

      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
    </>
  )
}