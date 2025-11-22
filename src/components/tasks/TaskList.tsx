'use client'

import React, { useState, useEffect } from 'react'
import { TaskWithSubject } from '@/types'
import { TaskStatus, Priority } from '@prisma/client'

interface TaskListProps {
  onEdit: (task: TaskWithSubject) => void
  onTaskUpdate: () => void
}

export default function TaskList({ onEdit, onTaskUpdate }: TaskListProps) {
  const [tasks, setTasks] = useState<TaskWithSubject[]>([])
  const [filteredTasks, setFilteredTasks] = useState<TaskWithSubject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState({
    status: '',
    subjectId: '',
    priority: ''
  })

  useEffect(() => {
    fetchTasks()
  }, [])

  useEffect(() => {
    let filtered = tasks

    if (filter.status) {
      filtered = filtered.filter(task => task.status === filter.status)
    }

    if (filter.subjectId) {
      filtered = filtered.filter(task => task.subjectId === filter.subjectId)
    }

    if (filter.priority) {
      filtered = filtered.filter(task => task.priority === filter.priority)
    }

    setFilteredTasks(filtered)
  }, [tasks, filter])

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) return

      const response = await fetch('/api/tasks', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setTasks(data.data)
        }
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleTaskStatus = async (taskId: string, currentStatus: TaskStatus) => {
    let newStatus: TaskStatus

    switch (currentStatus) {
      case TaskStatus.PENDING:
        newStatus = TaskStatus.IN_PROGRESS
        break
      case TaskStatus.IN_PROGRESS:
        newStatus = TaskStatus.COMPLETED
        break
      case TaskStatus.COMPLETED:
        newStatus = TaskStatus.PENDING
        break
      default:
        newStatus = TaskStatus.PENDING
    }

    try {
      const token = localStorage.getItem('authToken')
      if (!token) return

      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        await fetchTasks()
        onTaskUpdate()
      }
    } catch (error) {
      console.error('Error updating task status:', error)
    }
  }

  const deleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return

    try {
      const token = localStorage.getItem('authToken')
      if (!token) return

      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        await fetchTasks()
        onTaskUpdate()
      }
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.PENDING:
        return 'bg-gray-100 text-gray-800'
      case TaskStatus.IN_PROGRESS:
        return 'bg-blue-100 text-blue-800'
      case TaskStatus.COMPLETED:
        return 'bg-green-100 text-green-800'
      case TaskStatus.CANCELLED:
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case Priority.HIGH:
        return 'bg-red-100 text-red-800 border-red-300'
      case Priority.MEDIUM:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case Priority.LOW:
        return 'bg-green-100 text-green-800 border-green-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.PENDING:
        return 'To Do'
      case TaskStatus.IN_PROGRESS:
        return 'In Progress'
      case TaskStatus.COMPLETED:
        return 'Completed'
      case TaskStatus.CANCELLED:
        return 'Cancelled'
      default:
        return 'To Do'
    }
  }

  const formatDueDate = (date: Date | string | null) => {
    if (!date) return 'No due date'
    const dueDate = new Date(date)
    const today = new Date()
    const isOverdue = dueDate < today && dueDate.toDateString() !== today.toDateString()

    return (
      <span className={isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}>
        {dueDate.toLocaleDateString()}
        {isOverdue && ' (Overdue)'}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const tasksByStatus = {
    [TaskStatus.PENDING]: filteredTasks.filter(task => task.status === TaskStatus.PENDING),
    [TaskStatus.IN_PROGRESS]: filteredTasks.filter(task => task.status === TaskStatus.IN_PROGRESS),
    [TaskStatus.COMPLETED]: filteredTasks.filter(task => task.status === TaskStatus.COMPLETED)
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filter.status}
              onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value={TaskStatus.PENDING}>To Do</option>
              <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
              <option value={TaskStatus.COMPLETED}>Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={filter.priority}
              onChange={(e) => setFilter(prev => ({ ...prev, priority: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Priorities</option>
              <option value={Priority.HIGH}>High</option>
              <option value={Priority.MEDIUM}>Medium</option>
              <option value={Priority.LOW}>Low</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setFilter({ status: '', subjectId: '', priority: '' })}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Task Boards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
          <div key={status} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">
                {getStatusLabel(status as TaskStatus)}
              </h3>
              <span className="text-sm text-gray-500">
                {statusTasks.length} {statusTasks.length === 1 ? 'task' : 'tasks'}
              </span>
            </div>

            <div className="space-y-3">
              {statusTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900 flex-1">{task.title}</h4>
                    <div className="flex items-center space-x-2 ml-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>

                  {task.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
                  )}

                  <div className="flex items-center justify-between mb-3">
                    {task.subject && (
                      <div
                        className="px-2 py-1 text-xs font-medium rounded text-white"
                        style={{ backgroundColor: task.subject.color }}
                      >
                        {task.subject.name}
                      </div>
                    )}
                    <div className="text-xs text-gray-500">
                      {formatDueDate(task.dueDate)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => toggleTaskStatus(task.id, task.status)}
                      className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)} hover:opacity-80`}
                    >
                      {getStatusLabel(task.status)}
                    </button>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => onEdit(task)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {statusTasks.length === 0 && (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No {getStatusLabel(status as TaskStatus).toLowerCase()} tasks
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-lg font-medium mb-2">No tasks found</div>
          <p className="text-sm">Try adjusting your filters or create a new task</p>
        </div>
      )}
    </div>
  )
}