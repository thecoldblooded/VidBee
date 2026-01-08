import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Download, Link as LinkIcon, Video, Music, Sparkles } from 'lucide-react'

export default function VideoDownloader() {
  const [url, setUrl] = useState('')
  const [format, setFormat] = useState<'video' | 'audio'>('video')
  const [quality, setQuality] = useState('best')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase.from('downloads').insert({
        user_id: user.id,
        url: url.trim(),
        format,
        quality,
        status: 'pending',
      })

      if (error) throw error

      setUrl('')
    } catch (err) {
      console.error('Error adding download:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Download Video</h2>
          <p className="text-sm text-slate-500">Paste a video URL to get started</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Video URL
          </label>
          <div className="relative">
            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-lg"
              placeholder="https://www.youtube.com/watch?v=..."
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormat('video')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  format === 'video'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <Video className="w-6 h-6" />
                <span className="font-medium text-sm">Video</span>
              </button>
              <button
                type="button"
                onClick={() => setFormat('audio')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  format === 'audio'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <Music className="w-6 h-6" />
                <span className="font-medium text-sm">Audio</span>
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="quality" className="block text-sm font-medium text-slate-700 mb-3">
              Quality
            </label>
            <select
              id="quality"
              value={quality}
              onChange={(e) => setQuality(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              <option value="best">Best Quality</option>
              <option value="1080p">1080p</option>
              <option value="720p">720p</option>
              <option value="480p">480p</option>
              <option value="360p">360p</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold py-4 rounded-xl hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
        >
          <Download className="w-5 h-5" />
          {loading ? 'Adding to Queue...' : 'Start Download'}
        </button>
      </form>
    </div>
  )
}
