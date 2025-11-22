import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import { getUserFromToken } from '@/lib/auth'
import { taskSchema } from '@/lib/validation'
import { ApiResponse, TaskWithSubject } from '@/types'
import { TaskStatus } from '@prisma/client'

// GET - Fetch all tasks for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const response: ApiResponse = {
        success: false,
        error: 'No authorization token provided'
      }
      return NextResponse.json(response, { status: 401 })
    }

    const token = authHeader.substring(7)
    const tokenPayload = getUserFromToken(token)

    if (!tokenPayload) {
      const response: ApiResponse = {
        success: false,
        error: 'Invalid or expired token'
      }
      return NextResponse.json(response, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as TaskStatus | null
    const subjectId = searchParams.get('subjectId')
    const priority = searchParams.get('priority')

    const where: any = { userId: tokenPayload.id }

    if (status) where.status = status
    if (subjectId) where.subjectId = subjectId
    if (priority) where.priority = priority

    const tasks = await prisma.task.findMany({
      where,
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            color: true
          }
        }
      },
      orderBy: [
        { status: 'asc' },
        { priority: 'desc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    const response: ApiResponse<TaskWithSubject[]> = {
      success: true,
      data: tasks
    }

    return NextResponse.json(response, { status: 200 })

  } catch (error) {
    console.error('Error fetching tasks:', error)

    const response: ApiResponse = {
      success: false,
      error: 'Internal server error'
    }
    return NextResponse.json(response, { status: 500 })
  }
}

// POST - Create a new task
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const response: ApiResponse = {
        success: false,
        error: 'No authorization token provided'
      }
      return NextResponse.json(response, { status: 401 })
    }

    const token = authHeader.substring(7)
    const tokenPayload = getUserFromToken(token)

    if (!tokenPayload) {
      const response: ApiResponse = {
        success: false,
        error: 'Invalid or expired token'
      }
      return NextResponse.json(response, { status: 401 })
    }

    const body = await request.json()
    const validatedData = taskSchema.parse(body)

    const task = await prisma.task.create({
      data: {
        ...validatedData,
        userId: tokenPayload.id,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null
      },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            color: true
          }
        }
      }
    })

    const response: ApiResponse<TaskWithSubject> = {
      success: true,
      data: task,
      message: 'Task created successfully'
    }

    return NextResponse.json(response, { status: 201 })

  } catch (error) {
    console.error('Error creating task:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      const response: ApiResponse = {
        success: false,
        error: 'Invalid input data'
      }
      return NextResponse.json(response, { status: 400 })
    }

    const response: ApiResponse = {
      success: false,
      error: 'Internal server error'
    }
    return NextResponse.json(response, { status: 500 })
  }
}