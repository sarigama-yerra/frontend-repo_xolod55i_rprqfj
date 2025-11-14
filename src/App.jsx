import { useCallback, useEffect, useRef, useState } from 'react'
import Spline from '@splinetool/react-spline'
import { UploadCloud, Image as ImageIcon, ShieldAlert, Stethoscope, Loader2 } from 'lucide-react'

function App() {
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  const backendBase = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

  // Clean object URL
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const onSelectFile = useCallback((f) => {
    if (!f) return
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
    if (!validTypes.includes(f.type)) {
      setError('Please upload a JPG, PNG, or WEBP image')
      return
    }
    if (f.size > 8 * 1024 * 1024) {
      setError('Please upload an image smaller than 8MB')
      return
    }
    setError('')
    setFile(f)
    setPreviewUrl(URL.createObjectURL(f))
    setResult(null)
  }, [])

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const f = e.dataTransfer.files?.[0]
    if (f) onSelectFile(f)
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true)
    else if (e.type === 'dragleave') setDragActive(false)
  }

  const analyze = async () => {
    if (!file) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch(`${backendBase}/analyze`, {
        method: 'POST',
        body: form,
      })
      if (!res.ok) {
        throw new Error(`Analysis failed (${res.status})`)
      }
      const data = await res.json()
      setResult(data)
    } catch (err) {
      setError(err?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-white">
      {/* Hero with Spline */}
      <section className="relative w-full h-[58vh] md:h-[64vh] overflow-hidden">
        <div className="absolute inset-0">
          <Spline scene="https://prod.spline.design/2fSS9b44gtYBt4RI/scene.splinecode" style={{ width: '100%', height: '100%' }} />
        </div>
        {/* Gradient and vignette overlays - don't block Spline interaction */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-zinc-950/30 via-zinc-950/40 to-zinc-950" />
        <div className="pointer-events-none absolute inset-0" style={{ boxShadow: 'inset 0 0 180px 60px rgba(9,9,11,0.7)' }} />

        {/* Hero content */}
        <div className="relative z-10 h-full flex items-end">
          <div className="container mx-auto px-6 pb-10">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 text-emerald-300 px-3 py-1 text-xs font-medium ring-1 ring-emerald-500/20 mb-4">
                <Stethoscope size={14} />
                AI-Powered Skin Insights (Demo)
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white">
                Spot skin concerns faster with a private, on-device style workflow
              </h1>
              <p className="mt-3 text-zinc-300 max-w-2xl">
                Upload a photo to get a quick, educational assessment. Replace the placeholder model with your own TensorFlow/PyTorch checkpoint at any time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <main className="flex-1">
        <div className="container mx-auto px-6 -mt-16 md:-mt-20">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
            {/* Uploader card */}
            <div className="lg:col-span-3 bg-zinc-900/70 backdrop-blur rounded-2xl ring-1 ring-white/10 p-5 md:p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Upload a photo</h2>

              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`relative flex flex-col items-center justify-center w-full border-2 border-dashed rounded-xl p-6 md:p-8 transition-all ${dragActive ? 'border-emerald-400 bg-emerald-400/5' : 'border-white/15 hover:border-white/25 bg-zinc-950/30'}`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-zinc-800/70 flex items-center justify-center ring-1 ring-white/10 mb-3">
                    <UploadCloud className="text-zinc-200" size={22} />
                  </div>
                  <p className="text-sm text-zinc-200">
                    Drag & drop an image here, or
                    <button
                      type="button"
                      onClick={() => inputRef.current?.click()}
                      className="ml-1 text-emerald-300 hover:text-emerald-200 underline underline-offset-2"
                    >
                      browse
                    </button>
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">JPG, PNG, or WEBP up to 8MB</p>
                </div>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onSelectFile(e.target.files?.[0])}
                />

                {previewUrl && (
                  <div className="mt-6 w-full">
                    <div className="aspect-video w-full overflow-hidden rounded-lg ring-1 ring-white/10 bg-zinc-900">
                      {/* eslint-disable-next-line jsx-a11y/alt-text */}
                      <img src={previewUrl} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2 text-zinc-300 text-sm">
                        <ImageIcon size={16} />
                        <span className="truncate max-w-[18rem]">{file?.name}</span>
                      </div>
                      <button
                        onClick={analyze}
                        disabled={loading}
                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {loading ? <Loader2 className="animate-spin" size={16} /> : null}
                        {loading ? 'Analyzing...' : 'Analyze Image'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="mt-4 text-sm text-red-300 bg-red-900/20 border border-red-900/40 rounded-lg p-3">
                  {error}
                </div>
              )}

              {!previewUrl && (
                <div className="mt-4 text-xs text-zinc-400">
                  Tip: Good lighting and a steady close-up help the model give clearer results.
                </div>
              )}
            </div>

            {/* Results card */}
            <div className="lg:col-span-2 bg-zinc-900/70 backdrop-blur rounded-2xl ring-1 ring-white/10 p-5 md:p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Results</h2>

              {!result && !loading && (
                <div className="text-sm text-zinc-400">
                  Your analysis will appear here with the most likely condition, confidence, and care suggestions.
                </div>
              )}

              {loading && (
                <div className="flex items-center gap-3 text-zinc-300">
                  <Loader2 className="animate-spin" />
                  Running analysis...
                </div>
              )}

              {result && (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-zinc-400">Most likely condition</p>
                    <p className="text-xl font-semibold text-white mt-1">{result.condition}</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-sm text-zinc-300 mb-2">
                      <span>Confidence</span>
                      <span>{result.confidence}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500"
                        style={{ width: `${Math.max(0, Math.min(100, result.confidence))}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-1">~{result.size_kb} KB • {result.filename} • {result.latency_ms} ms</p>
                  </div>

                  <div>
                    <p className="text-sm text-zinc-300">{result.description}</p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-zinc-400 mb-2">Care suggestions</p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-zinc-200">
                      {result.suggestions?.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-8 md:mt-10">
            <div className="flex items-start gap-3 rounded-2xl bg-amber-950/20 ring-1 ring-amber-900/30 p-4">
              <ShieldAlert className="text-amber-300 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-200">
                Medical disclaimer: This app provides educational information only and is not a medical diagnosis or treatment. If you have concerns, seek advice from a qualified healthcare professional.
              </p>
            </div>
          </div>

          {/* Footer */}
          <footer className="py-10 text-center text-xs text-zinc-500">
            © {new Date().getFullYear()} DermAssist Demo. Built for rapid iteration.
          </footer>
        </div>
      </main>
    </div>
  )
}

export default App
