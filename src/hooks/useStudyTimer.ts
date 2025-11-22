'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { TimerState, PomodoroSettings } from '@/types'

const DEFAULT_POMODORO_SETTINGS: PomodoroSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsUntilLongBreak: 4
}

export function useStudyTimer() {
  const [state, setState] = useState<TimerState>({
    isRunning: false,
    isPaused: false,
    timeLeft: 25 * 60, // 25 minutes in seconds
    totalTime: 25 * 60,
    sessionType: 'work',
    currentSubject: null
  })

  const [pomodoroSettings, setPomodoroSettings] = useState<PomodoroSettings>(DEFAULT_POMODORO_SETTINGS)
  const [sessionCount, setSessionCount] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Clear interval when component unmounts
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // Timer tick effect
  useEffect(() => {
    if (state.isRunning && !state.isPaused && state.timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setState(prev => {
          const newTimeLeft = prev.timeLeft - 1

          if (newTimeLeft <= 0) {
            // Timer completed
            return {
              ...prev,
              isRunning: false,
              isPaused: false,
              timeLeft: 0
            }
          }

          return {
            ...prev,
            timeLeft: newTimeLeft
          }
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [state.isRunning, state.isPaused, state.timeLeft])

  const startTimer = useCallback((subjectId: string, duration?: number) => {
    const sessionDuration = duration || pomodoroSettings.workDuration * 60
    setState({
      isRunning: true,
      isPaused: false,
      timeLeft: sessionDuration,
      totalTime: sessionDuration,
      sessionType: 'work',
      currentSubject: subjectId
    })
  }, [pomodoroSettings.workDuration])

  const pauseTimer = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPaused: true
    }))
  }, [])

  const resumeTimer = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPaused: false
    }))
  }, [])

  const stopTimer = useCallback(() => {
    setState({
      isRunning: false,
      isPaused: false,
      timeLeft: pomodoroSettings.workDuration * 60,
      totalTime: pomodoroSettings.workDuration * 60,
      sessionType: 'work',
      currentSubject: null
    })
  }, [pomodoroSettings.workDuration])

  const switchSessionType = useCallback((type: 'work' | 'break' | 'longBreak') => {
    let duration: number
    switch (type) {
      case 'work':
        duration = pomodoroSettings.workDuration * 60
        break
      case 'break':
        duration = pomodoroSettings.shortBreakDuration * 60
        break
      case 'longBreak':
        duration = pomodoroSettings.longBreakDuration * 60
        break
      default:
        duration = pomodoroSettings.workDuration * 60
    }

    setState(prev => ({
      ...prev,
      sessionType: type,
      timeLeft: duration,
      totalTime: duration,
      isRunning: false,
      isPaused: false
    }))
  }, [pomodoroSettings])

  const completeSession = useCallback(() => {
    if (state.sessionType === 'work') {
      const newSessionCount = sessionCount + 1
      setSessionCount(newSessionCount)

      // Determine next session type
      if (newSessionCount % pomodoroSettings.sessionsUntilLongBreak === 0) {
        switchSessionType('longBreak')
      } else {
        switchSessionType('break')
      }
    } else {
      // After break, go back to work
      switchSessionType('work')
    }
  }, [state.sessionType, sessionCount, pomodoroSettings.sessionsUntilLongBreak, switchSessionType])

  const updatePomodoroSettings = useCallback((settings: Partial<PomodoroSettings>) => {
    setPomodoroSettings(prev => ({ ...prev, ...settings }))
  }, [])

  // Auto-advance to next session when timer completes
  useEffect(() => {
    if (state.timeLeft === 0 && state.isRunning === false) {
      completeSession()
    }
  }, [state.timeLeft, state.isRunning, completeSession])

  // Format time left as MM:SS
  const formatTime = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }, [])

  const progress = ((state.totalTime - state.timeLeft) / state.totalTime) * 100

  return {
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
  }
}