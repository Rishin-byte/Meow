import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import { verifyPassword, createLoginResponse } from '@/lib/auth'
import { userLoginSchema } from '@/lib/validation'
import { ApiResponse } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = userLoginSchema.parse(body)

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
      select: {
        id: true,
        email: true,
        username: true,
        passwordHash: true,
        firstName: true,
        lastName: true,
        createdAt: true
      }
    })

    if (!user) {
      const response: ApiResponse = {
        success: false,
        error: 'Invalid email or password'
      }
      return NextResponse.json(response, { status: 401 })
    }

    // Verify password
    const isPasswordValid = await verifyPassword(validatedData.password, user.passwordHash)

    if (!isPasswordValid) {
      const response: ApiResponse = {
        success: false,
        error: 'Invalid email or password'
      }
      return NextResponse.json(response, { status: 401 })
    }

    // Create login response with token (exclude password hash)
    const { passwordHash, ...userWithoutPassword } = user
    const loginResponse = createLoginResponse(userWithoutPassword)

    const response: ApiResponse = {
      success: true,
      data: loginResponse,
      message: 'Login successful'
    }

    return NextResponse.json(response, { status: 200 })

  } catch (error) {
    console.error('Login error:', error)

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