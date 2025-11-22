import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { AuthUser, LoginResponse } from '@/types'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(payload: Omit<AuthUser, 'firstName' | 'lastName'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): Omit<AuthUser, 'firstName' | 'lastName'> | null {
  try {
    return jwt.verify(token, JWT_SECRET) as Omit<AuthUser, 'firstName' | 'lastName'>
  } catch (error) {
    return null
  }
}

export function createLoginResponse(user: AuthUser): LoginResponse {
  return {
    user,
    token: generateToken({
      id: user.id,
      email: user.email,
      username: user.username
    })
  }
}

export function getUserFromToken(token: string): Omit<AuthUser, 'firstName' | 'lastName'> | null {
  try {
    // Remove "Bearer " prefix if present
    const cleanToken = token.replace(/^Bearer\s+/, '')
    return verifyToken(cleanToken)
  } catch (error) {
    return null
  }
}