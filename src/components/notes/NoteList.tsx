'use client'

import React, { useState, useEffect } from 'react'
import { NoteWithSubject } from '@/types'

interface NoteListProps {
  onEdit: (note: NoteWithSubject) => void
  onNoteUpdate: () => void
  onStudyMode: (note: NoteWithSubject) => void
}

export default function NoteList({ onEdit, onNoteUpdate, onStudyMode }: NoteListProps) {
  const [notes, setNotes] = useState<NoteWithSubject[]>([])
  const [filteredNotes, setFilteredNotes] = useState<NoteWithSubject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState({
    subjectId: '',
    folderPath: '',
    isFlashcard: ''
  })

  useEffect(() => {
    fetchNotes()
  }, [])

  useEffect(() => {
    let filtered = notes

    if (filter.subjectId) {
      filtered = filtered.filter(note => note.subjectId === filter.subjectId)
    }

    if (filter.folderPath) {
      filtered = filtered.filter(note => note.folderPath.includes(filter.folderPath))
    }

    if (filter.isFlashcard) {
      filtered = filtered.filter(note => note.isFlashcard === (filter.isFlashcard === 'true'))
    }

    setFilteredNotes(filtered)
  }, [notes, filter])

  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) return

      const response = await fetch('/api/notes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setNotes(data.data)
        }
      }
    } catch (error) {
      console.error('Error fetching notes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return

    try {
      const token = localStorage.getItem('authToken')
      if (!token) return

      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        await fetchNotes()
        onNoteUpdate()
      }
    } catch (error) {
      console.error('Error deleting note:', error)
    }
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const regularNotes = filteredNotes.filter(note => !note.isFlashcard)
  const flashcards = filteredNotes.filter(note => note.isFlashcard)

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={filter.isFlashcard}
              onChange={(e) => setFilter(prev => ({ ...prev, isFlashcard: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="false">Notes</option>
              <option value="true">Flashcards</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Folder</label>
            <input
              type="text"
              value={filter.folderPath}
              onChange={(e) => setFilter(prev => ({ ...prev, folderPath: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Folder name..."
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setFilter({ subjectId: '', folderPath: '', isFlashcard: '' })}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Regular Notes */}
      {regularNotes.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes ({regularNotes.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {regularNotes.map((note) => (
              <div
                key={note.id}
                className="bg-white rounded-lg shadow border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-gray-900 flex-1 mr-2">{note.title}</h3>
                  {note.subject && (
                    <div
                      className="px-2 py-1 text-xs font-medium rounded text-white flex-shrink-0"
                      style={{ backgroundColor: note.subject.color }}
                    >
                      {note.subject.name}
                    </div>
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                  {truncateContent(note.content)}
                </p>

                {note.folderPath && (
                  <div className="text-xs text-gray-500 mb-2">
                    📁 {note.folderPath}
                  </div>
                )}

                <div className="text-xs text-gray-500 mb-3">
                  Last updated: {formatDate(note.updatedAt)}
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => onEdit(note)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Flashcards */}
      {flashcards.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Flashcards ({flashcards.length})</h2>
            <button
              onClick={() => onStudyMode(flashcards[0])}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
            >
              🎯 Study Mode
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {flashcards.map((note) => (
              <div
                key={note.id}
                className="bg-white rounded-lg shadow border border-gray-200 p-4 hover:shadow-md transition-shadow border-l-4 border-l-green-500"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-gray-900 flex-1 mr-2">{note.title}</h3>
                  {note.subject && (
                    <div
                      className="px-2 py-1 text-xs font-medium rounded text-white flex-shrink-0"
                      style={{ backgroundColor: note.subject.color }}
                    >
                      {note.subject.name}
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <div className="text-xs font-medium text-gray-700 mb-1">Front:</div>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {truncateContent(note.flashcardFront || '', 100)}
                  </p>
                </div>

                <div className="mb-3">
                  <div className="text-xs font-medium text-gray-700 mb-1">Back:</div>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {truncateContent(note.flashcardBack || '', 100)}
                  </p>
                </div>

                {note.folderPath && (
                  <div className="text-xs text-gray-500 mb-2">
                    📁 {note.folderPath}
                  </div>
                )}

                <div className="text-xs text-gray-500 mb-3">
                  Last updated: {formatDate(note.updatedAt)}
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => onStudyMode(note)}
                    className="text-green-600 hover:text-green-800 text-sm"
                  >
                    Study
                  </button>
                  <div className="space-x-2">
                    <button
                      onClick={() => onEdit(note)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {filteredNotes.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-lg font-medium mb-2">No notes found</div>
          <p className="text-sm">Try adjusting your filters or create a new note</p>
        </div>
      )}
    </div>
  )
}