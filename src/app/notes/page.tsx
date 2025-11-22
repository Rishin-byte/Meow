'use client'

import React, { useState } from 'react'
import NoteList from '@/components/notes/NoteList'
import NoteEditor from '@/components/notes/NoteEditor'
import { NoteWithSubject } from '@/types'

export default function NotesPage() {
  const [showForm, setShowForm] = useState(false)
  const [editingNote, setEditingNote] = useState<NoteWithSubject | null>(null)
  const [studyMode, setStudyMode] = useState<NoteWithSubject | null>(null)

  const handleCreateNote = () => {
    setEditingNote(null)
    setShowForm(true)
  }

  const handleEditNote = (note: NoteWithSubject) => {
    setEditingNote(note)
    setShowForm(true)
  }

  const handleFormSubmit = async (noteData: any) => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) return

      const url = editingNote ? `/api/notes/${editingNote.id}` : '/api/notes'
      const method = editingNote ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(noteData)
      })

      if (response.ok) {
        setShowForm(false)
        setEditingNote(null)
        window.location.reload()
      }
    } catch (error) {
      console.error('Error saving note:', error)
    }
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingNote(null)
  }

  const handleNoteUpdate = () => {
    window.location.reload()
  }

  const handleStudyMode = (note: NoteWithSubject) => {
    setStudyMode(note)
  }

  const closeStudyMode = () => {
    setStudyMode(null)
  }

  return (
    <div className="max-w-7xl mx-auto py-6">
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notes & Flashcards</h1>
            <p className="text-gray-600">Organize your study materials and create flashcards</p>
          </div>
          <button
            onClick={handleCreateNote}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            + New Note
          </button>
        </div>

        {/* Note Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-screen overflow-y-auto">
              <NoteEditor
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
                initialData={editingNote}
              />
            </div>
          </div>
        )}

        {/* Flashcard Study Mode */}
        {studyMode && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-2xl p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Flashcard Study</h2>
                <p className="text-gray-600">{studyMode.title}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-8 mb-6 min-h-[200px] flex items-center justify-center">
                <div className="text-center">
                  <div className="text-lg font-medium text-gray-700 mb-4">Front:</div>
                  <p className="text-gray-900 whitespace-pre-wrap">{studyMode.flashcardFront}</p>
                </div>
              </div>

              <div className="text-center mb-4">
                <button
                  onClick={() => {
                    const backElement = document.getElementById('card-back')
                    if (backElement) {
                      backElement.classList.toggle('hidden')
                    }
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Show Answer
                </button>
              </div>

              <div id="card-back" className="hidden">
                <div className="bg-blue-50 rounded-lg p-8 mb-6 min-h-[200px] flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-lg font-medium text-blue-700 mb-4">Back:</div>
                    <p className="text-gray-900 whitespace-pre-wrap">{studyMode.flashcardBack}</p>
                  </div>
                </div>

                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => alert('Marked as difficult - review this card again soon')}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    😞 Hard
                  </button>
                  <button
                    onClick={() => alert('Marked as medium - review this card later')}
                    className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                  >
                    😐 Medium
                  </button>
                  <button
                    onClick={() => alert('Marked as easy - review this card less frequently')}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    😊 Easy
                  </button>
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={closeStudyMode}
                  className="px-4 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Note List */}
        <NoteList
          onEdit={handleEditNote}
          onNoteUpdate={handleNoteUpdate}
          onStudyMode={handleStudyMode}
        />
      </div>
    </div>
  )
}