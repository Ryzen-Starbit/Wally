import { useState } from 'react'
import { X, Plus, FolderPlus, Check } from 'lucide-react'

export default function CollectionModal({
  open, onClose,
  wallpaperId, wallpaperTitle,
  collections,
  onAddToExisting,
  onCreateNew,
}) {
  const [newName, setNewName]   = useState('')
  const [creating, setCreating] = useState(false)
  const [added, setAdded]       = useState(null) 
  const [loading, setLoading]   = useState(false)
  if (!open) return null

  async function handleAddTo(colId) {
    setLoading(true)
    await onAddToExisting(colId, wallpaperId)
    setAdded(colId)
    setLoading(false)
    setTimeout(() => { setAdded(null); onClose() }, 800)
  }

  async function handleCreate(e) {
    e.preventDefault()
    if (!newName.trim()) return
    setLoading(true)
    await onCreateNew(newName.trim(), wallpaperId)
    setNewName('')
    setCreating(false)
    setLoading(false)
    onClose()
  }

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div
          className="w-full max-w-sm bg-dark-surface border border-dark-border rounded-2xl shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-dark-border">
            <div>
              <p className="font-semibold text-sm">Save to collection</p>
              <p className="text-xs text-zinc-500 mt-0.5 truncate max-w-[200px]">{wallpaperTitle}</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-dark-card transition-colors">
              <X size={14} />
            </button>
          </div>

          <div className="p-3 space-y-1 max-h-60 overflow-y-auto">
            {collections.length === 0 && !creating && (
              <p className="text-center text-zinc-600 text-xs py-4">No collections yet</p>
            )}
            {collections.map(col => {
              const hasIt = col.wallpapers?.includes(wallpaperId)
              const justAdded = added === col.id
              return (
                <button
                  key={col.id}
                  onClick={() => !hasIt && handleAddTo(col.id)}
                  disabled={hasIt || loading}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all
                    ${hasIt
                      ? 'text-zinc-600 cursor-default'
                      : 'hover:bg-dark-card text-zinc-300 hover:text-white cursor-pointer'
                    }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base">📁</span>
                    <span className="truncate">{col.name}</span>
                    <span className="text-xs text-zinc-600">({col.wallpapers?.length || 0})</span>
                  </span>
                  {justAdded
                    ? <Check size={13} className="text-emerald-400 shrink-0" />
                    : hasIt
                    ? <span className="text-xs text-zinc-600 shrink-0">Already added</span>
                    : <Plus size={13} className="text-zinc-500 shrink-0" />
                  }
                </button>
              )
            })}
          </div>

          <div className="px-3 pb-3 border-t border-dark-border pt-3">
            {creating ? (
              <form onSubmit={handleCreate} className="flex gap-2">
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="Collection name..."
                  autoFocus
                  className="flex-1 bg-dark-card border border-dark-border rounded-xl px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
                />
                <button
                  type="submit"
                  disabled={!newName.trim() || loading}
                  className="px-3 py-2 bg-white text-black rounded-xl text-xs font-semibold hover:bg-zinc-100 disabled:opacity-50 transition-all"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setCreating(false)}
                  className="px-3 py-2 border border-dark-border rounded-xl text-xs text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <button
                onClick={() => setCreating(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dark-border text-zinc-400 hover:text-white hover:border-zinc-500 text-sm font-medium transition-all"
              >
                <FolderPlus size={13} />
                New collection
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}