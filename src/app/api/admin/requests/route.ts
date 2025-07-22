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

// 开始处理验证模式
const startProcessingSchema = z.object({
  requestId: z.string().min(1, '请求ID不能为空'),
  assignedToId: z.string().optional().or(z.literal('')),
  priority: z.enum(['HIGH', 'NORMAL', 'LOW']),
  processingNotes: z.string().min(1, '处理备注不能为空').max(500, '备注不能超过500字符'),
  estimatedDays: z.number().min(1, '预估天数至少为1天').max(30, '预估天数不能超过30天'),
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
          assignedTo: {
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

// POST - 开始处理请求（增强功能）
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request)
    if (!admin) {
      return NextResponse.json(
        { message: '需要管理员权限' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = startProcessingSchema.parse(body)
    const { requestId, assignedToId, priority, processingNotes, estimatedDays } = validatedData

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

    if (existingRequest.status !== 'PENDING') {
      return NextResponse.json(
        { message: '只能处理待处理状态的请求' },
        { status: 400 }
      )
    }

    // 如果指定了分配对象，检查该用户是否存在且为管理员
    const finalAssignedToId = assignedToId && assignedToId.trim() !== '' ? assignedToId : admin.id
    
    if (finalAssignedToId !== admin.id) {
      const assignedUser = await prisma.user.findUnique({
        where: { id: finalAssignedToId },
      })

      if (!assignedUser || assignedUser.role !== 'ADMIN') {
        return NextResponse.json(
          { message: '指定的分配对象不存在或不是管理员' },
          { status: 400 }
        )
      }
    }

    // 计算预估完成时间
    const estimatedDate = new Date()
    estimatedDate.setDate(estimatedDate.getDate() + estimatedDays)

    // 使用事务更新请求和创建活动记录
    const result = await prisma.$transaction(async (tx) => {
      // 更新请求
      const updatedRequest = await tx.request.update({
        where: { id: requestId },
        data: {
          status: 'PROCESSING',
          priority,
          assignedToId: finalAssignedToId,
          processingNotes,
          estimatedDate,
          processedAt: new Date(),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          assignedTo: {
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

      // 创建状态变更活动记录
      await tx.requestActivity.create({
        data: {
          requestId,
          userId: admin.id,
          type: 'STATUS_CHANGE',
          title: '开始处理请求',
          content: `状态从 "待处理" 变更为 "处理中"`,
          metadata: JSON.stringify({
            oldStatus: 'PENDING',
            newStatus: 'PROCESSING',
            priority,
            estimatedDays,
          }),
        },
      })

      // 如果分配给了其他管理员，创建分配记录
      if (finalAssignedToId !== admin.id) {
        await tx.requestActivity.create({
          data: {
            requestId,
            userId: admin.id,
            type: 'ASSIGNED',
            title: '分配任务',
            content: `任务已分配给 ${updatedRequest.assignedTo?.name}`,
            metadata: JSON.stringify({
              assignedToId: finalAssignedToId,
              assignedToName: updatedRequest.assignedTo?.name,
            }),
          },
        })
      }

      // 创建处理备注记录
      await tx.requestActivity.create({
        data: {
          requestId,
          userId: admin.id,
          type: 'NOTE_ADDED',
          title: '添加处理备注',
          content: processingNotes,
          metadata: JSON.stringify({
            estimatedDate: estimatedDate.toISOString(),
          }),
        },
      })

      // 如果设置了优先级（非默认），创建优先级变更记录
      if (priority !== 'NORMAL') {
        await tx.requestActivity.create({
          data: {
            requestId,
            userId: admin.id,
            type: 'PRIORITY_CHANGED',
            title: '设置优先级',
            content: `优先级设置为 ${priority === 'HIGH' ? '高' : '低'}`,
            metadata: JSON.stringify({
              oldPriority: 'NORMAL',
              newPriority: priority,
            }),
          },
        })
      }

      return updatedRequest
    })

    return NextResponse.json({
      message: '开始处理成功',
      request: result,
    })
  } catch (error) {
    console.error('开始处理请求失败:', error)
    
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