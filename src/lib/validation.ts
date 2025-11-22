import { z } from 'zod'
import { Priority, TaskStatus } from '@/types'

// User validation schemas
export const userRegistrationSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters')
})

export const userLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
})

// Subject validation schema
export const subjectSchema = z.object({
  name: z.string().min(1, 'Subject name is required').max(100, 'Subject name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color code').default('#3b82f6')
})

// Task validation schema
export const taskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(200, 'Task title must be less than 200 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  subjectId: z.string().cuid('Invalid subject ID').optional(),
  priority: z.nativeEnum(Priority).default(Priority.MEDIUM),
  dueDate: z.string().datetime('Invalid due date').optional()
})

// Note validation schema
export const noteSchema = z.object({
  title: z.string().min(1, 'Note title is required').max(200, 'Note title must be less than 200 characters'),
  content: z.string().min(1, 'Note content is required').max(10000, 'Note content must be less than 10,000 characters'),
  subjectId: z.string().cuid('Invalid subject ID').optional(),
  folderPath: z.string().max(200, 'Folder path must be less than 200 characters').default(''),
  isFlashcard: z.boolean().default(false),
  flashcardFront: z.string().max(500, 'Flashcard front must be less than 500 characters').optional(),
  flashcardBack: z.string().max(500, 'Flashcard back must be less than 500 characters').optional()
}).refine((data) => {
  // If it's a flashcard, both front and back must be provided
  if (data.isFlashcard) {
    return data.flashcardFront && data.flashcardBack
  }
  return true
}, {
  message: 'Flashcard front and back are required when isFlashcard is true',
  path: ['flashcardFront']
})

// Schedule validation schema
export const scheduleSchema = z.object({
  title: z.string().min(1, 'Schedule title is required').max(200, 'Schedule title must be less than 200 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  startTime: z.string().datetime('Invalid start time'),
  endTime: z.string().datetime('Invalid end time'),
  subjectId: z.string().cuid('Invalid subject ID').optional(),
  isRecurring: z.boolean().default(false),
  recurringPattern: z.enum(['daily', 'weekly', 'monthly']).optional(),
  location: z.string().max(200, 'Location must be less than 200 characters').optional()
}).refine((data) => {
  // End time must be after start time
  return new Date(data.endTime) > new Date(data.startTime)
}, {
  message: 'End time must be after start time',
  path: ['endTime']
}).refine((data) => {
  // If recurring, pattern must be provided
  if (data.isRecurring) {
    return data.recurringPattern !== undefined
  }
  return true
}, {
  message: 'Recurring pattern is required when isRecurring is true',
  path: ['recurringPattern']
})

// Study session validation schema
export const studySessionSchema = z.object({
  subjectId: z.string().cuid('Invalid subject ID'),
  duration: z.number().min(60, 'Duration must be at least 1 minute').max(7200, 'Duration must be less than 2 hours'),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
  sessionType: z.enum(['regular', 'pomodoro', 'break']).default('regular')
})

// Pomodoro settings validation schema
export const pomodoroSettingsSchema = z.object({
  workDuration: z.number().min(1, 'Work duration must be at least 1 minute').max(120, 'Work duration must be less than 2 hours').default(25),
  shortBreakDuration: z.number().min(1, 'Short break must be at least 1 minute').max(30, 'Short break must be less than 30 minutes').default(5),
  longBreakDuration: z.number().min(1, 'Long break must be at least 1 minute').max(60, 'Long break must be less than 1 hour').default(15),
  sessionsUntilLongBreak: z.number().min(1, 'Must have at least 1 session').max(10, 'Cannot have more than 10 sessions').default(4)
})

// Chat message validation schema
export const chatMessageSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(2000, 'Message must be less than 2000 characters'),
  conversationId: z.string().cuid('Invalid conversation ID').optional(),
  subject: z.string().max(100, 'Subject must be less than 100 characters').optional()
})

// Type exports for form validation
export type UserRegistrationInput = z.infer<typeof userRegistrationSchema>
export type UserLoginInput = z.infer<typeof userLoginSchema>
export type SubjectInput = z.infer<typeof subjectSchema>
export type TaskInput = z.infer<typeof taskSchema>
export type NoteInput = z.infer<typeof noteSchema>
export type ScheduleInput = z.infer<typeof scheduleSchema>
export type StudySessionInput = z.infer<typeof studySessionSchema>
export type PomodoroSettingsInput = z.infer<typeof pomodoroSettingsSchema>
export type ChatMessageInput = z.infer<typeof chatMessageSchema>