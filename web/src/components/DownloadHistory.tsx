import { useState, useEffect } from 'react'
import { supabase, type DownloadHistory } from '../lib/supabase'
import { Video, Music, Calendar, HardDrive, Clock, Trash2 } from 'lucide-react'

export default function DownloadHistoryComponent() {
  const [history, setHistory] = useState<DownloadHistory[]>([])

  useEffect(() => {
    fetchHistory()

    const channel = supabase
      .channel('download_history')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'download_history',
        },
        () => {
          fetchHistory()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchHistory = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('download_history')
      .select('*')
      .eq('user_id', user.id)
      .order('downloaded_at', { ascending: false })

    if (!error && data) {
      setHistory(data)
    }
  }

  const deleteHistoryItem = async (id: string) => {
    await supabase.from('download_history').delete().eq('id', id)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}m ${secs}s`
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (history.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">No Download History</h3>
        <p className="text-slate-500">Your completed downloads will appear here</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Download History</h2>
        <p className="text-sm text-slate-500 mt-1">{history.length} completed downloads</p>
      </div>

      <div className="grid gap-4">
        {history.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-4 p-5 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition-all group"
          >
            {item.thumbnail ? (
              <img
                src={item.thumbnail}
                alt={item.title}
                className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
              />
            ) : (
              <div className="w-24 h-24 bg-gradient-to-br from-slate-200 to-slate-300 rounded-lg flex items-center justify-center flex-shrink-0">
                {item.format === 'video' ? (
                  <Video className="w-8 h-8 text-slate-500" />
                ) : (
                  <Music className="w-8 h-8 text-slate-500" />
                )}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900 mb-1 truncate">{item.title}</h3>
              <p className="text-sm text-slate-500 truncate mb-3">{item.url}</p>

              <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-1.5">
                  {item.format === 'video' ? (
                    <Video className="w-4 h-4" />
                  ) : (
                    <Music className="w-4 h-4" />
                  )}
                  <span className="capitalize">{item.format}</span>
                  <span className="text-slate-400">•</span>
                  <span>{item.quality}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4" />
                  <span>{formatFileSize(item.file_size)}</span>
                </div>

                {item.duration > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    <span>{formatDuration(item.duration)}</span>
                  </div>
                )}

                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(item.downloaded_at)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => deleteHistoryItem(item.id)}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
