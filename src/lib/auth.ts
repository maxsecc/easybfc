import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface JWTPayload {
  userId: string
  email: string
  role: string
  iat: number
  exp: number
}

export interface AuthenticatedUser {
  id: string
  name: string
  email: string
  role: string
  createdAt: Date
  updatedAt: Date
}

/**
 * 从请求头中提取并验证JWT token
 */
export async function verifyToken(request: NextRequest): Promise<JWTPayload | null> {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7) // 移除 'Bearer ' 前缀
    const jwtSecret = process.env.JWT_SECRET
    
    if (!jwtSecret) {
      throw new Error('JWT_SECRET 环境变量未设置')
    }

    const decoded = jwt.verify(token, jwtSecret) as JWTPayload
    return decoded
  } catch (error) {
    console.error('Token验证失败:', error)
    return null
  }
}

/**
 * 获取当前认证用户的完整信息
 */
export async function getCurrentUser(request: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    const payload = await verifyToken(request)
    if (!payload) {
      return null
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return user
  } catch (error) {
    console.error('获取用户信息失败:', error)
    return null
  } finally {
    await prisma.$disconnect()
  }
}

/**
 * 检查用户是否有管理员权限
 */
export async function requireAdmin(request: NextRequest): Promise<AuthenticatedUser | null> {
  const user = await getCurrentUser(request)
  if (!user || user.role !== 'ADMIN') {
    return null
  }
  return user
}

/**
 * 检查用户是否已认证（普通用户或管理员）
 */
export async function requireAuth(request: NextRequest): Promise<AuthenticatedUser | null> {
  const user = await getCurrentUser(request)
  if (!user) {
    return null
  }
  return user
}

/**
 * 生成新的JWT token
 */
export function generateToken(user: { id: string; email: string; role: string }): string {
  const jwtSecret = process.env.JWT_SECRET
  if (!jwtSecret) {
    throw new Error('JWT_SECRET 环境变量未设置')
  }

  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    jwtSecret,
    {
      expiresIn: '7d',
    }
  )
}