import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import { getUserFromToken } from '@/lib/auth'
import { noteSchema } from '@/lib/validation'
import { ApiResponse, NoteWithSubject } from '@/types'

// GET - Fetch all notes for the authenticated user
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
    const subjectId = searchParams.get('subjectId')
    const folderPath = searchParams.get('folderPath')
    const isFlashcard = searchParams.get('isFlashcard')

    const where: any = { userId: tokenPayload.id }

    if (subjectId) where.subjectId = subjectId
    if (folderPath) where.folderPath = folderPath
    if (isFlashcard) where.isFlashcard = isFlashcard === 'true'

    const notes = await prisma.note.findMany({
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
      orderBy: { updatedAt: 'desc' }
    })

    const response: ApiResponse<NoteWithSubject[]> = {
      success: true,
      data: notes
    }

    return NextResponse.json(response, { status: 200 })

  } catch (error) {
    console.error('Error fetching notes:', error)

    const response: ApiResponse = {
      success: false,
      error: 'Internal server error'
    }
    return NextResponse.json(response, { status: 500 })
  }
}

// POST - Create a new note
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
    const validatedData = noteSchema.parse(body)

    const note = await prisma.note.create({
      data: {
        ...validatedData,
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

    const response: ApiResponse<NoteWithSubject> = {
      success: true,
      data: note,
      message: 'Note created successfully'
    }

    return NextResponse.json(response, { status: 201 })

  } catch (error) {
    console.error('Error creating note:', error)

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