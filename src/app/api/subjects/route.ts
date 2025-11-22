import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import { getUserFromToken } from '@/lib/auth'
import { subjectSchema } from '@/lib/validation'
import { ApiResponse } from '@/types'

// GET - Fetch all subjects for the authenticated user
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

    const subjects = await prisma.subject.findMany({
      where: { userId: tokenPayload.id },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            studySessions: true,
            tasks: true,
            notes: true
          }
        }
      }
    })

    const response: ApiResponse = {
      success: true,
      data: subjects
    }

    return NextResponse.json(response, { status: 200 })

  } catch (error) {
    console.error('Error fetching subjects:', error)

    const response: ApiResponse = {
      success: false,
      error: 'Internal server error'
    }
    return NextResponse.json(response, { status: 500 })
  }
}

// POST - Create a new subject
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
    const validatedData = subjectSchema.parse(body)

    // Check if subject with same name already exists for this user
    const existingSubject = await prisma.subject.findFirst({
      where: {
        userId: tokenPayload.id,
        name: validatedData.name
      }
    })

    if (existingSubject) {
      const response: ApiResponse = {
        success: false,
        error: 'Subject with this name already exists'
      }
      return NextResponse.json(response, { status: 400 })
    }

    const subject = await prisma.subject.create({
      data: {
        ...validatedData,
        userId: tokenPayload.id
      }
    })

    const response: ApiResponse = {
      success: true,
      data: subject,
      message: 'Subject created successfully'
    }

    return NextResponse.json(response, { status: 201 })

  } catch (error) {
    console.error('Error creating subject:', error)

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