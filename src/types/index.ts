import { User, Subject, StudySession, Schedule, Task, Note, Conversation, Message, Priority, TaskStatus, MessageRole } from '@prisma/client'

// Export all Prisma types
export type {
  User,
  Subject,
  StudySession,
  Schedule,
  Task,
  Note,
  Conversation,
  Message,
  Priority,
  TaskStatus,
  MessageRole
}

// Extended types for API responses
export interface UserWithRelations extends User {
  subjects: Subject[]
  studySessions: StudySession[]
  schedules: Schedule[]
  tasks: Task[]
  notes: Note[]
  conversations: Conversation[]
}

export interface SubjectWithRelations extends Subject {
  _count: {
    studySessions: number
    tasks: number
    notes: number
  }
}

export interface StudySessionWithSubject extends StudySession {
  subject: Subject
}

export interface TaskWithSubject extends Task {
  subject: Subject | null
}

export interface NoteWithSubject extends Note {
  subject: Subject | null
}

export interface ConversationWithMessages extends Conversation {
  messages: Message[]
  _count: {
    messages: number
  }
}

// Form types
export interface UserRegistrationForm {
  email: string
  username: string
  password: string
  firstName: string
  lastName: string
}

export interface UserLoginForm {
  email: string
  password: string
}

export interface SubjectForm {
  name: string
  description?: string
  color: string
}

export interface StudySessionForm {
  subjectId: string
  duration: number
  notes?: string
  sessionType: 'regular' | 'pomodoro' | 'break'
}

export interface TaskForm {
  title: string
  description?: string
  subjectId?: string
  priority: Priority
  dueDate?: string
}

export interface NoteForm {
  title: string
  content: string
  subjectId?: string
  folderPath: string
  isFlashcard: boolean
  flashcardFront?: string
  flashcardBack?: string
}

export interface ScheduleForm {
  title: string
  description?: string
  startTime: string
  endTime: string
  subjectId?: string
  isRecurring: boolean
  recurringPattern?: 'daily' | 'weekly' | 'monthly'
  location?: string
}

export interface ChatMessage {
  content: string
  role: MessageRole
  conversationId: string
}

export interface ChatForm {
  message: string
  conversationId?: string
  subject?: string
}

// Timer specific types
export interface TimerState {
  isRunning: boolean
  isPaused: boolean
  timeLeft: number
  totalTime: number
  sessionType: 'work' | 'break' | 'longBreak'
  currentSubject: string | null
}

export interface PomodoroSettings {
  workDuration: number // minutes
  shortBreakDuration: number // minutes
  longBreakDuration: number // minutes
  sessionsUntilLongBreak: number
}

// Dashboard analytics types
export interface DashboardStats {
  totalStudyTime: number // minutes
  sessionsCount: number
  tasksCompleted: number
  tasksPending: number
  currentStreak: number // days
  weeklyProgress: DailyProgress[]
  subjectBreakdown: SubjectProgress[]
}

export interface DailyProgress {
  date: string
  studyTime: number // minutes
  sessionsCount: number
  tasksCompleted: number
}

export interface SubjectProgress {
  subject: Subject
  totalStudyTime: number // minutes
  sessionsCount: number
  percentageOfTotal: number
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Authentication types
export interface AuthUser {
  id: string
  email: string
  username: string
  firstName: string
  lastName: string
}

export interface AuthState {
  user: AuthUser | null
  isLoading: boolean
  error: string | null
}

export interface LoginResponse {
  user: AuthUser
  token: string
}

// Context state types
export interface StudyTimerContextType {
  state: TimerState
  pomodoroSettings: PomodoroSettings
  startTimer: (subjectId: string, duration?: number) => void
  pauseTimer: () => void
  resumeTimer: () => void
  stopTimer: () => void
  switchSessionType: (type: 'work' | 'break' | 'longBreak') => void
  updatePomodoroSettings: (settings: Partial<PomodoroSettings>) => void
}

export interface TasksContextType {
  tasks: TaskWithSubject[]
  isLoading: boolean
  error: string | null
  createTask: (task: TaskForm) => Promise<void>
  updateTask: (id: string, task: Partial<TaskForm>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  toggleTaskStatus: (id: string) => Promise<void>
  refreshTasks: () => Promise<void>
}

export interface NotesContextType {
  notes: NoteWithSubject[]
  folders: string[]
  isLoading: boolean
  error: string | null
  createNote: (note: NoteForm) => Promise<void>
  updateNote: (id: string, note: Partial<NoteForm>) => Promise<void>
  deleteNote: (id: string) => Promise<void>
  refreshNotes: () => Promise<void>
  getNotesByFolder: (folderPath: string) => NoteWithSubject[]
}

export interface ScheduleContextType {
  schedules: Schedule[]
  isLoading: boolean
  error: string | null
  createSchedule: (schedule: ScheduleForm) => Promise<void>
  updateSchedule: (id: string, schedule: Partial<ScheduleForm>) => Promise<void>
  deleteSchedule: (id: string) => Promise<void>
  refreshSchedules: () => Promise<void>
  getSchedulesForDate: (date: string) => Schedule[]
  getSchedulesForWeek: (startDate: string) => Schedule[]
}

export interface ChatContextType {
  conversations: ConversationWithMessages[]
  currentConversation: ConversationWithMessages | null
  isLoading: boolean
  error: string | null
  sendMessage: (message: string, conversationId?: string) => Promise<void>
  createConversation: (subject?: string) => Promise<void>
  deleteConversation: (id: string) => Promise<void>
  refreshConversations: () => Promise<void>
}