'use client'

import React, { useState, useEffect } from 'react'
import { NoteWithSubject } from '@/types'

interface Subject {
  id: string
  name: string
  color: string
}

interface NoteEditorProps {
  onSubmit: (noteData: any) => void
  onCancel: () => void
  initialData?: NoteWithSubject
}

export default function NoteEditor({ onSubmit, onCancel, initialData }: NoteEditorProps) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    subjectId: '',
    folderPath: '',
    isFlashcard: false,
    flashcardFront: '',
    flashcardBack: ''
  })

  const [subjects, setSubjects] = useState<Subject[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        content: initialData.content || '',
        subjectId: initialData.subjectId || '',
        folderPath: initialData.folderPath || '',
        isFlashcard: initialData.isFlashcard || false,
        flashcardFront: initialData.flashcardFront || '',
        flashcardBack: initialData.flashcardBack || ''
      })
    }
  }, [initialData])

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const token = localStorage.getItem('authToken')
        if (!token) return

        const response = await fetch('/api/subjects', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setSubjects(data.data)
          }
        }
      } catch (error) {
        console.error('Error fetching subjects:', error)
      }
    }

    fetchSubjects()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await onSubmit(formData)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {initialData ? 'Edit Note' : 'Create New Note'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter note title"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="subjectId" className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <select
              id="subjectId"
              name="subjectId"
              value={formData.subjectId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">No subject</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="folderPath" className="block text-sm font-medium text-gray-700 mb-1">
              Folder
            </label>
            <input
              type="text"
              id="folderPath"
              name="folderPath"
              value={formData.folderPath}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Mathematics/Calculus"
            />
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isFlashcard"
            name="isFlashcard"
            checked={formData.isFlashcard}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isFlashcard" className="ml-2 block text-sm text-gray-900">
            Create as flashcard
          </label>
        </div>

        {formData.isFlashcard ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="flashcardFront" className="block text-sm font-medium text-gray-700 mb-1">
                Front of Card *
              </label>
              <textarea
                id="flashcardFront"
                name="flashcardFront"
                required
                rows={3}
                value={formData.flashcardFront}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter the question or prompt"
              />
            </div>

            <div>
              <label htmlFor="flashcardBack" className="block text-sm font-medium text-gray-700 mb-1">
                Back of Card *
              </label>
              <textarea
                id="flashcardBack"
                name="flashcardBack"
                required
                rows={3}
                value={formData.flashcardBack}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter the answer or explanation"
              />
            </div>
          </div>
        ) : (
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              Content *
            </label>
            <textarea
              id="content"
              name="content"
              required
              rows={8}
              value={formData.content}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your note content here..."
            />
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || !formData.title.trim() || (formData.isFlashcard && (!formData.flashcardFront.trim() || !formData.flashcardBack.trim())) || (!formData.isFlashcard && !formData.content.trim())}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : (initialData ? 'Update Note' : 'Create Note')}
          </button>
        </div>
      </form>
    </div>
  )
}