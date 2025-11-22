'use client'

import React, { useState, useEffect } from 'react'
import { useStudyTimer } from '@/hooks/useStudyTimer'

interface Subject {
  id: string
  name: string
  color: string
}

export default function StudyTimer() {
  const {
    state,
    pomodoroSettings,
    sessionCount,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    switchSessionType,
    updatePomodoroSettings,
    formatTime,
    progress
  } = useStudyTimer()

  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [showSettings, setShowSettings] = useState(false)
  const [tempSettings, setTempSettings] = useState(pomodoroSettings)

  // Load subjects from API
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

  const handleStartSession = () => {
    if (selectedSubject) {
      startTimer(selectedSubject)
    }
  }

  const handleSaveSettings = () => {
    updatePomodoroSettings(tempSettings)
    setShowSettings(false)
  }

  const getSessionTypeColor = () => {
    switch (state.sessionType) {
      case 'work':
        return 'bg-blue-500'
      case 'break':
        return 'bg-green-500'
      case 'longBreak':
        return 'bg-purple-500'
      default:
        return 'bg-blue-500'
    }
  }

  const getSessionTypeLabel = () => {
    switch (state.sessionType) {
      case 'work':
        return 'Focus Time'
      case 'break':
        return 'Short Break'
      case 'longBreak':
        return 'Long Break'
      default:
        return 'Focus Time'
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Study Timer</h1>
        <p className="text-gray-600">
          {state.sessionType === 'work'
            ? 'Stay focused and track your study sessions'
            : 'Take a well-deserved break'
          }
        </p>
      </div>

      {/* Session Type Indicator */}
      <div className="text-center mb-6">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white ${getSessionTypeColor()}`}>
          {getSessionTypeLabel()}
        </span>
        {state.sessionType === 'work' && sessionCount > 0 && (
          <p className="text-sm text-gray-500 mt-1">
            Session {sessionCount + 1} completed
          </p>
        )}
      </div>

      {/* Timer Display */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <div className="relative w-64 h-64 mx-auto mb-6">
          {/* Progress Circle */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="128"
              cy="128"
              r="120"
              stroke="#e5e7eb"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="128"
              cy="128"
              r="120"
              className={getSessionTypeColor().replace('bg-', 'text-')}
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 120}`}
              strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
              className="transition-all duration-1000 ease-in-out"
            />
          </svg>

          {/* Timer Text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">
                {formatTime(state.timeLeft)}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {state.currentSubject && subjects.find(s => s.id === state.currentSubject)?.name}
              </div>
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center space-x-4">
          {!state.isRunning ? (
            <button
              onClick={handleStartSession}
              disabled={!selectedSubject || state.sessionType !== 'work'}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              Start Session
            </button>
          ) : (
            <>
              {!state.isPaused ? (
                <button
                  onClick={pauseTimer}
                  className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium"
                >
                  Pause
                </button>
              ) : (
                <button
                  onClick={resumeTimer}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                >
                  Resume
                </button>
              )}
              <button
                onClick={stopTimer}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Stop
              </button>
            </>
          )}
        </div>
      </div>

      {/* Subject Selection and Quick Session Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Subject Selection */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Subject</h3>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            disabled={state.isRunning}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          >
            <option value="">Choose a subject...</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>

          {subjects.length === 0 && (
            <p className="text-sm text-gray-500 mt-2">
              No subjects yet. <a href="/subjects" className="text-blue-600 hover:text-blue-500">Create one</a>
            </p>
          )}
        </div>

        {/* Quick Session Types */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Sessions</h3>
          <div className="space-y-2">
            <button
              onClick={() => switchSessionType('work')}
              className="w-full px-4 py-2 text-left bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
            >
              Focus ({pomodoroSettings.workDuration} min)
            </button>
            <button
              onClick={() => switchSessionType('break')}
              className="w-full px-4 py-2 text-left bg-green-50 text-green-700 rounded hover:bg-green-100"
            >
              Short Break ({pomodoroSettings.shortBreakDuration} min)
            </button>
            <button
              onClick={() => switchSessionType('longBreak')}
              className="w-full px-4 py-2 text-left bg-purple-50 text-purple-700 rounded hover:bg-purple-100"
            >
              Long Break ({pomodoroSettings.longBreakDuration} min)
            </button>
          </div>
        </div>
      </div>

      {/* Settings Button */}
      <div className="text-center">
        <button
          onClick={() => {
            setTempSettings(pomodoroSettings)
            setShowSettings(!showSettings)
          }}
          className="px-4 py-2 text-gray-600 hover:text-gray-900"
        >
          ⚙️ Timer Settings
        </button>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pomodoro Settings</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Work Duration (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={tempSettings.workDuration}
                  onChange={(e) => setTempSettings(prev => ({ ...prev, workDuration: parseInt(e.target.value) || 1 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Short Break (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={tempSettings.shortBreakDuration}
                  onChange={(e) => setTempSettings(prev => ({ ...prev, shortBreakDuration: parseInt(e.target.value) || 1 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Long Break (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={tempSettings.longBreakDuration}
                  onChange={(e) => setTempSettings(prev => ({ ...prev, longBreakDuration: parseInt(e.target.value) || 1 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sessions until Long Break
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={tempSettings.sessionsUntilLongBreak}
                  onChange={(e) => setTempSettings(prev => ({ ...prev, sessionsUntilLongBreak: parseInt(e.target.value) || 1 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSettings}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}