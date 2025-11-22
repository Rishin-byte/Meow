import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import { getUserFromToken } from '@/lib/auth'
import { ApiResponse } from '@/types'

export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const response: ApiResponse = {
        success: false,
        error: 'No authorization token provided'
      }
      return NextResponse.json(response, { status: 401 })
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    // Verify token and get user info
    const tokenPayload = getUserFromToken(token)
    if (!tokenPayload) {
      const response: ApiResponse = {
        success: false,
        error: 'Invalid or expired token'
      }
      return NextResponse.json(response, { status: 401 })
    }

    // Get full user data from database
    const user = await prisma.user.findUnique({
      where: { id: tokenPayload.id },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!user) {
      const response: ApiResponse = {
        success: false,
        error: 'User not found'
      }
      return NextResponse.json(response, { status: 404 })
    }

    const response: ApiResponse = {
      success: true,
      data: user
    }

    return NextResponse.json(response, { status: 200 })

  } catch (error) {
    console.error('Token validation error:', error)

    const response: ApiResponse = {
      success: false,
      error: 'Internal server error'
    }
    return NextResponse.json(response, { status: 500 })
  }
}