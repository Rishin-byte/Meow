import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import { hashPassword, createLoginResponse } from '@/lib/auth'
import { userRegistrationSchema } from '@/lib/validation'
import { ApiResponse } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = userRegistrationSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: validatedData.email },
          { username: validatedData.username }
        ]
      }
    })

    if (existingUser) {
      const response: ApiResponse = {
        success: false,
        error: existingUser.email === validatedData.email
          ? 'Email already registered'
          : 'Username already taken'
      }
      return NextResponse.json(response, { status: 400 })
    }

    // Hash password
    const passwordHash = await hashPassword(validatedData.password)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        username: validatedData.username,
        passwordHash,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        createdAt: true
      }
    })

    // Create login response with token
    const loginResponse = createLoginResponse(user)

    const response: ApiResponse = {
      success: true,
      data: loginResponse,
      message: 'User registered successfully'
    }

    return NextResponse.json(response, { status: 201 })

  } catch (error) {
    console.error('Registration error:', error)

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