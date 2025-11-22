'use client'

import React, { useState } from 'react'
import TaskList from '@/components/tasks/TaskList'
import TaskForm from '@/components/tasks/TaskForm'
import { TaskWithSubject } from '@/types'

export default function TasksPage() {
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<TaskWithSubject | null>(null)

  const handleCreateTask = () => {
    setEditingTask(null)
    setShowForm(true)
  }

  const handleEditTask = (task: TaskWithSubject) => {
    setEditingTask(task)
    setShowForm(true)
  }

  const handleFormSubmit = async (taskData: any) => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) return

      const url = editingTask ? `/api/tasks/${editingTask.id}` : '/api/tasks'
      const method = editingTask ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData)
      })

      if (response.ok) {
        setShowForm(false)
        setEditingTask(null)
        window.location.reload()
      }
    } catch (error) {
      console.error('Error saving task:', error)
    }
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingTask(null)
  }

  const handleTaskUpdate = () => {
    // This will be called when a task is updated from the list
    window.location.reload()
  }

  return (
    <div className="max-w-7xl mx-auto py-6">
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
            <p className="text-gray-600">Manage your study assignments and to-dos</p>
          </div>
          <button
            onClick={handleCreateTask}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            + New Task
          </button>
        </div>

        {/* Task Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-screen overflow-y-auto">
              <TaskForm
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
                initialData={editingTask}
              />
            </div>
          </div>
        )}

        {/* Task List */}
        <TaskList
          onEdit={handleEditTask}
          onTaskUpdate={handleTaskUpdate}
        />
      </div>
    </div>
  )
}