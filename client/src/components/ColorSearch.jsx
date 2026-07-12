import { useState, useCallback, useRef } from 'react'
import { Pipette, X, Loader } from 'lucide-react'
import { extractColors, colorDistance, hexToRgb, rgbToHex } from '../utils/colorUtils'

const PRESETS = [
  '#1a1a2e', '#16213e', '#0f3460', // deep blues 
  '#e94560', '#f5a623', '#7ed321', // vibrant
  '#4a90e2', '#50e3c2', '#9b59b6', // cool tones
  '#2ecc71', '#e67e22', '#e74c3c', // warm nature
  '#ffffff', '#888888', '#222222', // neutrals
]

export default function ColorSearch({ wallpapers, onResults, onClear, active }) {
  const [pickedColor, setPickedColor]   = useState(null)
  const [hexInput, setHexInput]         = useState('')
  const [loading, setLoading]           = useState(false)
  const [progress, setProgress]         = useState(0)
  const [showPanel, setShowPanel]       = useState(false)
  const abortRef = useRef(false)

  async function runColorSearch(targetHex) {
    const target = hexToRgb(targetHex)
    if (!target) return
    setLoading(true)
    setProgress(0)
    setPickedColor(targetHex)
    abortRef.current = false
    const scored = []
    const BATCH = 5

    for (let i = 0; i < wallpapers.length; i += BATCH) {
      if (abortRef.current) break
      const batch = wallpapers.slice(i, i + BATCH)
      await Promise.all(batch.map(async (wp) => {
        try {
          const colors = await extractColors(wp.thumbUrl, 5)
          const minDist = Math.min(...colors.map(c => colorDistance(c, target)))
          scored.push({ ...wp, colorDist: minDist })
        } catch {
          scored.push({ ...wp, colorDist: 999 })
        }
      }))
      setProgress(Math.min(100, Math.round(((i + BATCH) / wallpapers.length) * 100)))
    }
    if (!abortRef.current) {
      const results = scored
        .sort((a, b) => a.colorDist - b.colorDist)
        .slice(0, 20)
      onResults(results, targetHex)
    }
    setLoading(false)
    setProgress(0)
    setShowPanel(false)
  }

  function handleClear() {
    abortRef.current = true
    setPickedColor(null)
    setHexInput('')
    setLoading(false)
    onClear()
  }

  function handleHexSubmit(e) {
    e.preventDefault()
    const hex = hexInput.startsWith('#') ? hexInput : '#' + hexInput
    if (/^#[0-9a-f]{6}$/i.test(hex)) runColorSearch(hex)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowPanel(v => !v)}
        title="Search by color"
        className={`p-2 rounded-xl border text-sm transition-all flex items-center gap-1.5
          ${active
            ? 'bg-violet-500/20 border-violet-500/40 text-violet-300'
            : 'bg-dark-surface border-dark-border text-zinc-400 hover:text-white hover:border-zinc-500'
          }`}
      >
        <Pipette size={15} />
        {pickedColor && (
          <span
            className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
            style={{ background: pickedColor }}
          />
        )}
      </button>

      {/* Dropdown panel */}
      {showPanel && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setShowPanel(false)} />
          <div className="absolute right-0 top-full mt-2 w-72 bg-dark-surface border border-dark-border rounded-2xl shadow-2xl z-40 overflow-hidden">
            <div className="px-4 pt-4 pb-3 border-b border-dark-border">
              <p className="text-sm font-medium text-white">Search by color</p>
              <p className="text-xs text-zinc-500 mt-0.5">
                Pick a color to find matching wallpapers
              </p>
            </div>
            <div className="p-4 space-y-4">
              {/* Native color picker */}
              <div className="flex items-center gap-3">
                <label className="relative cursor-pointer">
                  <div
                    className="w-10 h-10 rounded-xl border-2 border-dark-border hover:border-zinc-500 transition-colors overflow-hidden"
                    style={{ background: pickedColor || '#ffffff' }}
                  />
                  <input
                    type="color"
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    value={pickedColor || '#ffffff'}
                    onChange={e => {
                      setPickedColor(e.target.value)
                      setHexInput(e.target.value)
                    }}
                    onBlur={e => runColorSearch(e.target.value)}
                  />
                </label>
                <form onSubmit={handleHexSubmit} className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={hexInput}
                    onChange={e => setHexInput(e.target.value)}
                    placeholder="#3a7bd5"
                    maxLength={7}
                    className="flex-1 bg-dark-card border border-dark-border rounded-xl px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 font-mono"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-white text-black rounded-xl text-xs font-semibold hover:bg-zinc-100 transition-colors"
                  >
                    Go
                  </button>
                </form>
              </div>

              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Quick picks</p>
                <div className="flex flex-wrap gap-2">
                  {PRESETS.map(hex => (
                    <button
                      key={hex}
                      onClick={() => { setPickedColor(hex); setHexInput(hex); runColorSearch(hex) }}
                      title={hex}
                      className={`w-7 h-7 rounded-lg border-2 transition-all hover:scale-110 ${
                        pickedColor === hex ? 'border-white scale-110' : 'border-transparent'
                      }`}
                      style={{ background: hex }}
                    />
                  ))}
                </div>
              </div>

              {loading && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-zinc-400 flex items-center gap-1.5">
                      <Loader size={11} className="animate-spin" />
                      Analyzing {wallpapers.length} wallpapers...
                    </span>
                    <span className="text-xs text-zinc-500">{progress}%</span>
                  </div>
                  <div className="h-1.5 bg-dark-card rounded-full overflow-hidden">
                    <div
                      className="h-full bg-violet-500 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Clear */}
              {(active || pickedColor) && !loading && (
                <button
                  onClick={handleClear}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-dark-border text-zinc-400 hover:text-white hover:border-zinc-500 text-xs font-medium transition-all"
                >
                  <X size={11} /> Clear color filter
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}