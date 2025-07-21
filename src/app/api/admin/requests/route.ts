import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth'

const prisma = new PrismaClient()

// 更新请求状态验证模式
const updateStatusSchema = z.object({
  requestId: z.string().uuid('无效的请求ID'),
  status: z.enum(['PENDING', 'REVIEWING', 'QUOTED', 'PAID', 'PROCESSING', 'SHIPPED', 'COMPLETED', 'CANCELLED']),
})

// GET - 获取所有用户请求（管理员）
export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin(request)
    if (!admin) {
      return NextResponse.json(
        { message: '需要管理员权限' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // 构建查询条件
    const where: any = {}
    if (status && status !== 'ALL') {
      where.status = status
    }

    // 获取请求列表
    const [requests, total] = await Promise.all([
      prisma.request.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          quotes: {
            orderBy: { createdAt: 'desc' },
          },
          orders: {
            include: {
              shipping: true,
            },
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.request.count({ where }),
    ])

    return NextResponse.json({
      requests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('获取管理员请求列表失败:', error)
    return NextResponse.json(
      { message: '服务器内部错误' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// PATCH - 更新请求状态（管理员）
export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireAdmin(request)
    if (!admin) {
      return NextResponse.json(
        { message: '需要管理员权限' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = updateStatusSchema.parse(body)
    const { requestId, status } = validatedData

    // 检查请求是否存在
    const existingRequest = await prisma.request.findUnique({
      where: { id: requestId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!existingRequest) {
      return NextResponse.json(
        { message: '请求不存在' },
        { status: 404 }
      )
    }

    // 更新请求状态
    const updatedRequest = await prisma.request.update({
      where: { id: requestId },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        quotes: {
          orderBy: { createdAt: 'desc' },
        },
        orders: {
          include: {
            shipping: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    return NextResponse.json({
      message: '请求状态更新成功',
      request: updatedRequest,
    })
  } catch (error) {
    console.error('更新请求状态失败:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: '输入数据无效',
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: '服务器内部错误' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}