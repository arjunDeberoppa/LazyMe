'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface NoteItem {
  id: string
  type: 'text' | 'image'
  content: string
  x: number
  y: number
  width?: number
  height?: number
}

interface NotesCanvasProps {
  todoId: string
  onUpdate: () => void
}

export default function NotesCanvas({ todoId, onUpdate }: NotesCanvasProps) {
  const [notes, setNotes] = useState<NoteItem[]>([])
  const [selectedNote, setSelectedNote] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const canvasRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    loadNotes()
  }, [todoId])

  const loadNotes = async () => {
    try {
      const { data } = await supabase
        .from('todos')
        .select('notes_canvas')
        .eq('id', todoId)
        .single()

      if (data?.notes_canvas) {
        setNotes(Array.isArray(data.notes_canvas) ? data.notes_canvas : [])
      } else {
        setNotes([])
      }
    } catch (error) {
      console.error('Error loading notes:', error)
      setNotes([])
    }
  }

  const saveNotes = async (updatedNotes: NoteItem[]) => {
    try {
      const { error } = await supabase
        .from('todos')
        .update({ notes_canvas: updatedNotes })
        .eq('id', todoId)

      if (error) throw error
      onUpdate()
    } catch (error) {
      console.error('Error saving notes:', error)
    }
  }

  const handleAddTextNote = () => {
    const newNote: NoteItem = {
      id: Date.now().toString(),
      type: 'text',
      content: 'New note',
      x: 100,
      y: 100,
      width: 200,
      height: 100,
    }
    const updatedNotes = [...notes, newNote]
    setNotes(updatedNotes)
    saveNotes(updatedNotes)
  }

  const handleAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string
      const newNote: NoteItem = {
        id: Date.now().toString(),
        type: 'image',
        content: imageUrl,
        x: 100,
        y: 100,
        width: 200,
        height: 200,
      }
      const updatedNotes = [...notes, newNote]
      setNotes(updatedNotes)
      saveNotes(updatedNotes)
    }
    reader.readAsDataURL(file)
  }

  const handleDeleteNote = (id: string) => {
    const updatedNotes = notes.filter((note) => note.id !== id)
    setNotes(updatedNotes)
    saveNotes(updatedNotes)
  }

  const handleMouseDown = (e: React.MouseEvent, noteId: string) => {
    e.preventDefault()
    const note = notes.find((n) => n.id === noteId)
    if (!note) return

    setSelectedNote(noteId)
    setDragging(true)
    setDragOffset({
      x: e.clientX - note.x,
      y: e.clientY - note.y,
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !selectedNote) return

    const updatedNotes = notes.map((note) => {
      if (note.id === selectedNote) {
        return {
          ...note,
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        }
      }
      return note
    })
    setNotes(updatedNotes)
  }

  const handleMouseUp = () => {
    if (dragging && selectedNote) {
      saveNotes(notes)
    }
    setDragging(false)
    setSelectedNote(null)
  }

  const handleNoteContentChange = (id: string, content: string) => {
    const updatedNotes = notes.map((note) =>
      note.id === id ? { ...note, content } : note
    )
    setNotes(updatedNotes)
    saveNotes(updatedNotes)
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Notes Canvas</h3>
        <div className="flex gap-2">
          <button
            onClick={handleAddTextNote}
            className="cursor-pointer rounded-md px-3 py-1 text-sm font-medium text-white"
            style={{ backgroundColor: '#01aaff' }}
          >
            + Text Note
          </button>
          <label className="rounded-md px-3 py-1 text-sm font-medium text-white cursor-pointer" style={{ backgroundColor: '#9a86ff' }}>
            + Image
            <input
              type="file"
              accept="image/*"
              onChange={handleAddImage}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <div
        ref={canvasRef}
        className="relative h-96 w-full overflow-hidden rounded-md border-2 border-dashed"
        style={{ backgroundColor: '#242424', borderColor: '#3a3a3a' }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {notes.length === 0 ? (
          <div className="flex h-full items-center justify-center text-gray-500">
            <p>Click "+ Text Note" or "+ Image" to add notes</p>
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="absolute cursor-move rounded-md border-2 p-2"
              style={{
                left: `${note.x}px`,
                top: `${note.y}px`,
                width: note.width ? `${note.width}px` : 'auto',
                height: note.height ? `${note.height}px` : 'auto',
                backgroundColor: selectedNote === note.id ? '#2b2b2b' : '#1a1a1a',
                borderColor: selectedNote === note.id ? '#9a86ff' : '#3a3a3a',
              }}
              onMouseDown={(e) => handleMouseDown(e, note.id)}
            >
              {note.type === 'text' ? (
                <textarea
                  value={note.content}
                  onChange={(e) => handleNoteContentChange(note.id, e.target.value)}
                  className="h-full w-full resize-none bg-transparent text-white outline-none"
                  style={{ minHeight: '60px', minWidth: '150px' }}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <div className="relative">
                  <img
                    src={note.content}
                    alt="Note"
                    className="max-h-48 max-w-full object-contain"
                  />
                </div>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteNote(note.id)
                }}
                className="absolute right-1 top-1 cursor-pointer rounded bg-red-500 px-2 py-1 text-xs text-white opacity-0 transition-opacity hover:opacity-100"
                style={{ backgroundColor: '#ff7800' }}
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

