import { useState } from 'react'
import { X, Plus, Trash2, AlertTriangle } from 'lucide-react'

const GENRE_KEYS = ['nature','space','abstract','minimal','dark','neon','city','architecture','ocean','mountains']

const GENRE_PREFIX = {
  nature: 'NAT', space: 'SPC', abstract: 'ABS', minimal: 'MIN', dark: 'DRK',
  neon: 'NEO', city: 'CTY', architecture: 'ARC', ocean: 'OCN', mountains: 'MTN',
}

const EMPTY_FORM = {
  title: '', seed: '', imageUrl: '', primaryTag: 'nature', extraTags: [], resolution: 'HD',
}

export default function AdminPanel({ open, onClose, wallpapers, genres, onRefresh }) {
  const [tab, setTab]                   = useState('add')
  const [form, setForm]                 = useState(EMPTY_FORM)
  const [status, setStatus]             = useState(null)
  const [submitting, setSubmitting]     = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [manageSearch, setManageSearch] = useState('')

  if (!open) return null

  function toggleExtraTag(tag) {
    setForm(f => ({
      ...f,
      extraTags: f.extraTags.includes(tag)
        ? f.extraTags.filter(t => t !== tag)
        : [...f.extraTags, tag],
    }))
  }

  async function handleAdd(e) {
    e.preventDefault()
    if (!form.title.trim()) return setStatus({ type: 'err', msg: 'Title is required.' })
    setSubmitting(true)
    setStatus(null)
    try {
      const body = {
        title:      form.title.trim(),
        seed:       form.seed.trim() || undefined,
        imageUrl:   form.imageUrl.trim() || undefined,
        primaryTag: form.primaryTag,
        tags:       [form.primaryTag, ...form.extraTags.filter(t => t !== form.primaryTag)],
        resolution: form.resolution,
      }
      const res  = await fetch('/api/wallpapers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setStatus({ type: 'ok', msg: `Added "${data.title}" — ID: ${data.id}` })
      setForm(EMPTY_FORM)
      onRefresh()
    } catch (err) {
      setStatus({ type: 'err', msg: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id) {
    try {
      const res = await fetch(`/api/wallpapers/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      setDeleteConfirm(null)
      onRefresh()
    } catch (err) {
      alert(err.message)
    }
  }

  const filteredManage = wallpapers.filter(w =>
    w.title.toLowerCase().includes(manageSearch.toLowerCase()) ||
    w.id.toLowerCase().includes(manageSearch.toLowerCase()) ||
    w.tags.some(t => t.includes(manageSearch.toLowerCase()))
  )

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
        <div
          className="w-full max-w-2xl bg-dark-surface border border-dark-border rounded-2xl overflow-hidden flex flex-col max-h-[90vh]"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-dark-border shrink-0">
            <div>
              <h2 className="font-semibold">⚙ Admin Panel</h2>
              <p className="text-xs text-zinc-500 mt-0.5">{wallpapers.length} wallpapers in database</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-dark-card text-zinc-400 hover:text-white transition-colors">
              <X size={14} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-dark-border shrink-0">
            {[['add', '+ Add Wallpaper'], ['manage', '📋 Manage']].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`px-5 py-3 text-sm font-medium border-b-2 transition-all ${tab === key ? 'border-white text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-6">

            {/* ADD TAB */}
            {tab === 'add' && (
              <form onSubmit={handleAdd} className="space-y-5">

                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5 uppercase tracking-wide">Title *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. Misty Mountain Peak"
                    className="w-full bg-dark-card border border-dark-border rounded-xl px-3 py-2.5 text-sm placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1.5 uppercase tracking-wide">
                      Image Seed <span className="text-zinc-600 normal-case">(blank = random)</span>
                    </label>
                    <input
                      type="text"
                      value={form.seed}
                      onChange={e => setForm(f => ({ ...f, seed: e.target.value, imageUrl: '' }))}
                      placeholder="e.g. myforest"
                      className="w-full bg-dark-card border border-dark-border rounded-xl px-3 py-2.5 text-sm placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
                    />
                    {form.seed && (
                      <a href={`https://picsum.photos/seed/${form.seed}/600/400`} target="_blank" rel="noopener"
                        className="text-[10px] text-zinc-500 hover:text-zinc-300 mt-1 inline-block">
                        Preview ↗
                      </a>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1.5 uppercase tracking-wide">Or Custom URL</label>
                    <input
                      type="url"
                      value={form.imageUrl}
                      onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value, seed: '' }))}
                      placeholder="https://..."
                      className="w-full bg-dark-card border border-dark-border rounded-xl px-3 py-2.5 text-sm placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Primary Type */}
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5 uppercase tracking-wide">
                    Primary Type * <span className="text-zinc-600 normal-case">(sets ID prefix)</span>
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {GENRE_KEYS.map(g => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, primaryTag: g, extraTags: f.extraTags.filter(t => t !== g) }))}
                        className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border text-xs transition-all ${form.primaryTag === g ? 'bg-white text-black border-white' : 'bg-dark-card border-dark-border text-zinc-400 hover:border-zinc-500 hover:text-white'}`}
                      >
                        <span>{genres[g]?.icon}</span>
                        <span className="font-medium capitalize">{g}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Extra Tags */}
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5 uppercase tracking-wide">Additional Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {GENRE_KEYS.filter(g => g !== form.primaryTag).map(g => {
                      const checked = form.extraTags.includes(g)
                      return (
                        <button
                          key={g}
                          type="button"
                          onClick={() => toggleExtraTag(g)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs transition-all ${checked ? genres[g]?.color ?? '' : 'bg-dark-card border-dark-border text-zinc-500 hover:text-zinc-300'}`}
                        >
                          <span>{genres[g]?.icon}</span> {g}
                          {checked && <span className="text-[9px]">✓</span>}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Resolution */}
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5 uppercase tracking-wide">Resolution</label>
                  <div className="flex gap-2">
                    {['HD', '4K'].map(r => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, resolution: r }))}
                        className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${form.resolution === r ? 'bg-white text-black border-white' : 'bg-dark-card border-dark-border text-zinc-400 hover:border-zinc-500 hover:text-white'}`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-dark-card border border-dark-border rounded-xl px-4 py-3 text-sm">
                  <span className="text-zinc-500">Generated ID: </span>
                  <span className="font-mono text-white">{GENRE_PREFIX[form.primaryTag] || 'GEN'}-0XX</span>
                  <span className="text-zinc-600 text-xs ml-2">(auto-incremented by server)</span>
                </div>

                {status && (
                  <div className={`flex items-start gap-2 px-4 py-3 rounded-xl border text-sm ${status.type === 'ok' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                    {status.type === 'err' && <AlertTriangle size={14} className="shrink-0 mt-0.5" />}
                    {status.msg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-white text-black font-semibold text-sm hover:bg-zinc-100 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Plus size={15} />
                  {submitting ? 'Adding...' : 'Add Wallpaper'}
                </button>
              </form>
            )}

            {/* MANAGE TAB */}
            {tab === 'manage' && (
              <div className="space-y-3">
                <input
                  type="text"
                  value={manageSearch}
                  onChange={e => setManageSearch(e.target.value)}
                  placeholder="Search by title, ID or tag..."
                  className="w-full bg-dark-card border border-dark-border rounded-xl px-3 py-2.5 text-sm placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
                />
                <p className="text-xs text-zinc-600">{filteredManage.length} wallpapers shown</p>

                <div className="space-y-2">
                  {filteredManage.map(wp => (
                    <div key={wp.id} className="flex items-center gap-3 p-3 rounded-xl bg-dark-card border border-dark-border group">
                      <div className="w-12 h-8 rounded-lg overflow-hidden shrink-0 bg-dark-surface">
                        <img src={wp.thumbUrl} alt={wp.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{wp.title}</p>
                        <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{wp.id} · {wp.res} · 👁 {wp.views}</p>
                      </div>
                      <div className="flex flex-wrap gap-1 max-w-[120px]">
                        {wp.tags.slice(0, 2).map(t => (
                          <span key={t} className={`text-[9px] px-1.5 py-0.5 rounded border ${genres[t]?.color ?? 'bg-zinc-800 text-zinc-500 border-zinc-700'}`}>{t}</span>
                        ))}
                      </div>

                      {deleteConfirm === wp.id ? (
                        <div className="flex gap-1.5 shrink-0">
                          <button
                            onClick={() => handleDelete(wp.id)}
                            className="px-2.5 py-1 rounded-lg bg-red-500/80 text-white text-xs font-medium hover:bg-red-500 transition-colors"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="px-2.5 py-1 rounded-lg bg-dark-surface border border-dark-border text-zinc-400 text-xs hover:text-white transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(wp.id)}
                          className="shrink-0 p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}