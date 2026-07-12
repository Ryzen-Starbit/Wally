import { useState } from 'react'
import { X, Trash2, Globe, Lock, Edit2, Check, ExternalLink, Copy } from 'lucide-react'

export default function CollectionPanel({
  open, onClose,
  collections, wallpapers,
  onDelete, onTogglePublic, onRename,
  onOpen,
}) {
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName]   = useState('')
  const [copiedId, setCopiedId]   = useState(null)
  const [expanded, setExpanded]   = useState(null)
  if (!open) return null
  function getWallpapersForCollection(col) {
    return (col.wallpapers || [])
      .map(id => wallpapers.find(w => w.id === id))
      .filter(Boolean)
  }

  function handleCopyLink(col) {
    const url = `${window.location.origin}/collection/${col.slug}`
    navigator.clipboard.writeText(url)
    setCopiedId(col.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  async function handleRename(col) {
    if (editName.trim() && editName !== col.name) {
      await onRename(col.id, editName.trim())
    }
    setEditingId(null)
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 z-50 w-96 bg-dark-surface border-l border-dark-border flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-dark-border shrink-0">
          <div>
            <p className="font-semibold text-sm">My Collections</p>
            <p className="text-xs text-zinc-500 mt-0.5">{collections.length} collections</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-dark-card transition-colors">
            <X size={14} />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {collections.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-16">
              <span className="text-4xl">📁</span>
              <p className="text-zinc-400 text-sm font-medium">No collections yet</p>
              <p className="text-zinc-600 text-xs">
                Open any wallpaper and click "Save to collection"
              </p>
            </div>
          )}
          {collections.map(col => {
            const colWallpapers = getWallpapersForCollection(col)
            const isExpanded    = expanded === col.id
            const isEditing     = editingId === col.id
            return (
              <div
                key={col.id}
                className="bg-dark-card border border-dark-border rounded-xl overflow-hidden"
              >
                <div className="flex items-center gap-2 p-3">
                  <button
                    onClick={() => setExpanded(isExpanded ? null : col.id)}
                    className="flex-1 flex items-center gap-2 text-left min-w-0"
                  >
                    <span className="text-lg">📁</span>
                    {isEditing ? (
                      <input
                        autoFocus
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        onBlur={() => handleRename(col)}
                        onKeyDown={e => e.key === 'Enter' && handleRename(col)}
                        className="flex-1 bg-dark-surface border border-dark-border rounded-lg px-2 py-0.5 text-sm text-white focus:outline-none focus:border-zinc-500"
                        onClick={e => e.stopPropagation()}
                      />
                    ) : (
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{col.name}</p>
                        <p className="text-xs text-zinc-500">
                          {colWallpapers.length} wallpaper{colWallpapers.length !== 1 ? 's' : ''}
                          {col.isPublic && <span className="text-emerald-500 ml-1">· public</span>}
                        </p>
                      </div>
                    )}
                  </button>

                  <div className="flex items-center gap-1 shrink-0">

                    <button
                      onClick={() => { setEditingId(col.id); setEditName(col.name) }}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-dark-surface transition-colors"
                    >
                      <Edit2 size={11} />
                    </button>

                    <button
                      onClick={() => onTogglePublic(col.id, col.isPublic)}
                      title={col.isPublic ? 'Make private' : 'Make public'}
                      className={`p-1.5 rounded-lg transition-colors ${
                        col.isPublic
                          ? 'text-emerald-400 hover:text-zinc-400'
                          : 'text-zinc-500 hover:text-emerald-400'
                      } hover:bg-dark-surface`}
                    >
                      {col.isPublic ? <Globe size={11} /> : <Lock size={11} />}
                    </button>

                    {col.isPublic && (
                      <button
                        onClick={() => handleCopyLink(col)}
                        title="Copy shareable link"
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-dark-surface transition-colors"
                      >
                        {copiedId === col.id
                          ? <Check size={11} className="text-emerald-400" />
                          : <Copy size={11} />
                        }
                      </button>
                    )}

                    {/* Delete */}
                    <button
                      onClick={() => onDelete(col.id)}
                      className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-dark-surface transition-colors"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-3 pb-3 border-t border-dark-border pt-2">
                    {colWallpapers.length === 0 ? (
                      <p className="text-xs text-zinc-600 text-center py-3">No wallpapers yet</p>
                    ) : (
                      <div className="grid grid-cols-3 gap-1.5">
                        {colWallpapers.map(wp => (
                          <div
                            key={wp.id}
                            onClick={() => { onOpen(wp); onClose() }}
                            className="aspect-video rounded-lg overflow-hidden cursor-pointer hover:ring-1 hover:ring-white/20 transition-all"
                          >
                            <img
                              src={wp.thumbUrl}
                              alt={wp.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    {col.isPublic && (
                      <div className="mt-2 flex items-center gap-1.5">
                        <ExternalLink size={10} className="text-zinc-600" />
                        <p className="text-[10px] text-zinc-600 truncate">
                          {window.location.origin}/collection/{col.slug}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}