import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import { getUserFromToken } from '@/lib/auth'
import { ApiResponse } from '@/types'

// GET - Fetch a single task
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

    const task = await prisma.task.findFirst({
      where: {
        id: id,
        userId: tokenPayload.id
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

    if (!task) {
      const response: ApiResponse = {
        success: false,
        error: 'Task not found'
      }
      return NextResponse.json(response, { status: 404 })
    }

    const response: ApiResponse = {
      success: true,
      data: task
    }

    return NextResponse.json(response, { status: 200 })

  } catch (error) {
    console.error('Error fetching task:', error)

    const response: ApiResponse = {
      success: false,
      error: 'Internal server error'
    }
    return NextResponse.json(response, { status: 500 })
  }
}

// PATCH - Update a task
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

    // Check if task exists and belongs to user
    const existingTask = await prisma.task.findFirst({
      where: {
        id: id,
        userId: tokenPayload.id
      }
    })

    if (!existingTask) {
      const response: ApiResponse = {
        success: false,
        error: 'Task not found'
      }
      return NextResponse.json(response, { status: 404 })
    }

    const body = await request.json()
    const updateData: any = {}

    // Handle specific fields that can be updated
    if (body.title !== undefined) updateData.title = body.title
    if (body.description !== undefined) updateData.description = body.description
    if (body.subjectId !== undefined) updateData.subjectId = body.subjectId
    if (body.priority !== undefined) updateData.priority = body.priority
    if (body.status !== undefined) {
      updateData.status = body.status
      if (body.status === 'COMPLETED') {
        updateData.completedAt = new Date()
      } else {
        updateData.completedAt = null
      }
    }
    if (body.dueDate !== undefined) {
      updateData.dueDate = body.dueDate ? new Date(body.dueDate) : null
    }

    const task = await prisma.task.update({
      where: { id: id },
      data: updateData,
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

    const response: ApiResponse = {
      success: true,
      data: task,
      message: 'Task updated successfully'
    }

    return NextResponse.json(response, { status: 200 })

  } catch (error) {
    console.error('Error updating task:', error)

    const response: ApiResponse = {
      success: false,
      error: 'Internal server error'
    }
    return NextResponse.json(response, { status: 500 })
  }
}

// DELETE - Delete a task
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

    // Check if task exists and belongs to user
    const existingTask = await prisma.task.findFirst({
      where: {
        id: id,
        userId: tokenPayload.id
      }
    })

    if (!existingTask) {
      const response: ApiResponse = {
        success: false,
        error: 'Task not found'
      }
      return NextResponse.json(response, { status: 404 })
    }

    await prisma.task.delete({
      where: { id: id }
    })

    const response: ApiResponse = {
      success: true,
      message: 'Task deleted successfully'
    }

    return NextResponse.json(response, { status: 200 })

  } catch (error) {
    console.error('Error deleting task:', error)

    const response: ApiResponse = {
      success: false,
      error: 'Internal server error'
    }
    return NextResponse.json(response, { status: 500 })
  }
}