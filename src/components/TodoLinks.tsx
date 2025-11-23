'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { TodoLink } from '@/types/database'

interface TodoLinksProps {
  todoId: string
  onUpdate: () => void
}

export default function TodoLinks({ todoId, onUpdate }: TodoLinksProps) {
  const [links, setLinks] = useState<TodoLink[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({ label: '', url: '' })
  const supabase = createClient()

  useEffect(() => {
    loadLinks()
  }, [todoId])

  const loadLinks = async () => {
    try {
      const { data } = await supabase
        .from('todo_links')
        .select('*')
        .eq('todo_id', todoId)
        .order('created_at')

      if (data) setLinks(data)
    } catch (error) {
      console.error('Error loading links:', error)
    }
  }

  const detectLinkType = (url: string): 'website' | 'youtube' | 'other' => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'youtube'
    }
    return 'website'
  }

  const handleAddLink = async () => {
    if (!formData.label.trim() || !formData.url.trim()) return

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const linkType = detectLinkType(formData.url)

      const { error } = await supabase.from('todo_links').insert({
        user_id: user.id,
        todo_id: todoId,
        label: formData.label.trim(),
        url: formData.url.trim(),
        type: linkType,
      })

      if (error) throw error

      setFormData({ label: '', url: '' })
      setShowAddForm(false)
      loadLinks()
      onUpdate()
    } catch (error) {
      console.error('Error adding link:', error)
    }
  }

  const handleDeleteLink = async (linkId: string) => {
    if (!confirm('Delete this link?')) return

    try {
      const { error } = await supabase.from('todo_links').delete().eq('id', linkId)
      if (error) throw error
      loadLinks()
      onUpdate()
    } catch (error) {
      console.error('Error deleting link:', error)
    }
  }

  const getYouTubeEmbedUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    const videoId = match && match[2].length === 11 ? match[2] : null
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Links</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="rounded-md px-3 py-1 text-sm font-medium text-white"
          style={{ backgroundColor: '#01aaff' }}
        >
          {showAddForm ? 'Cancel' : '+ Add Link'}
        </button>
      </div>

      {showAddForm && (
        <div className="mb-4 space-y-2 rounded-md p-4" style={{ backgroundColor: '#242424' }}>
          <input
            type="text"
            value={formData.label}
            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
            placeholder="Link label (e.g., 'Watch video')"
            className="w-full rounded-md px-3 py-2 text-white"
            style={{ backgroundColor: '#2b2b2b', border: '1px solid #3a3a3a' }}
            autoFocus
          />
          <input
            type="url"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            placeholder="https://..."
            className="w-full rounded-md px-3 py-2 text-white"
            style={{ backgroundColor: '#2b2b2b', border: '1px solid #3a3a3a' }}
          />
          <button
            onClick={handleAddLink}
            className="w-full rounded-md px-4 py-2 font-medium text-white"
            style={{ backgroundColor: '#01eab9' }}
          >
            Add Link
          </button>
        </div>
      )}

      {links.length === 0 ? (
        <p className="text-gray-400">No links added yet</p>
      ) : (
        <div className="space-y-4">
          {links.map((link) => {
            const isYouTube = link.type === 'youtube'
            const embedUrl = isYouTube ? getYouTubeEmbedUrl(link.url) : null

            return (
              <div
                key={link.id}
                className="rounded-md p-4"
                style={{ backgroundColor: '#242424' }}
              >
                <div className="mb-2 flex items-center justify-between">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    {link.label} →
                  </a>
                  <button
                    onClick={() => handleDeleteLink(link.id)}
                    className="text-sm text-red-400 hover:text-red-300"
                  >
                    Delete
                  </button>
                </div>
                {embedUrl && (
                  <div className="mt-2 aspect-video w-full overflow-hidden rounded">
                    <iframe
                      src={embedUrl}
                      title={link.label}
                      className="h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}
                {!embedUrl && (
                  <p className="mt-2 break-all text-sm text-gray-400">{link.url}</p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

