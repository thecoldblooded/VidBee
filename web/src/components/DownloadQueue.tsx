import { useState, useEffect } from 'react'
import { supabase, type Download } from '../lib/supabase'
import {
  Clock,
  Download as DownloadIcon,
  CheckCircle2,
  XCircle,
  Trash2,
  Video,
  Music
} from 'lucide-react'

export default function DownloadQueue() {
  const [downloads, setDownloads] = useState<Download[]>([])

  useEffect(() => {
    fetchDownloads()

    const channel = supabase
      .channel('downloads')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'downloads',
        },
        () => {
          fetchDownloads()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchDownloads = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('downloads')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setDownloads(data)
    }
  }

  const deleteDownload = async (id: string) => {
    await supabase.from('downloads').delete().eq('id', id)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-slate-400" />
      case 'downloading':
        return <DownloadIcon className="w-5 h-5 text-blue-500 animate-pulse" />
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-slate-100 text-slate-700'
      case 'downloading':
        return 'bg-blue-100 text-blue-700'
      case 'completed':
        return 'bg-green-100 text-green-700'
      case 'failed':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

  if (downloads.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Download Queue</h2>
          <p className="text-sm text-slate-500 mt-1">{downloads.length} items in queue</p>
        </div>
      </div>

      <div className="space-y-3">
        {downloads.map((download) => (
          <div
            key={download.id}
            className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition-all"
          >
            <div className="flex-shrink-0">
              {download.format === 'video' ? (
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Video className="w-6 h-6 text-blue-600" />
                </div>
              ) : (
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Music className="w-6 h-6 text-purple-600" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium text-slate-900 truncate">
                  {download.title || 'Processing...'}
                </p>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(download.status)}`}>
                  {download.status}
                </span>
              </div>
              <p className="text-sm text-slate-500 truncate">{download.url}</p>

              {download.status === 'downloading' && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                    <span>{download.progress}%</span>
                    <span>{download.download_speed}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full transition-all duration-300"
                      style={{ width: `${download.progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {getStatusIcon(download.status)}
              <button
                onClick={() => deleteDownload(download.id)}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
