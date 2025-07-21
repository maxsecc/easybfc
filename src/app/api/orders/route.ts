import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { requireAuth, requireAdmin } from '@/lib/auth'

const prisma = new PrismaClient()

// 创建订单验证模式
const createOrderSchema = z.object({
  quoteId: z.string().uuid('无效的报价ID'),
  shippingAddress: z.object({
    name: z.string().min(1, '收件人姓名不能为空'),
    phone: z.string().min(1, '联系电话不能为空'),
    address: z.string().min(10, '详细地址至少需要10个字符'),
    city: z.string().min(1, '城市不能为空'),
    state: z.string().min(1, '省/州不能为空'),
    country: z.string().min(1, '国家不能为空'),
    zipCode: z.string().min(1, '邮政编码不能为空'),
  }),
})

// 更新订单状态验证模式
const updateOrderSchema = z.object({
  orderId: z.string().uuid('无效的订单ID'),
  status: z.enum(['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
})

// GET - 获取订单列表
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    if (!user) {
      return NextResponse.json(
        { message: '请先登录' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const isAdmin = user.role === 'ADMIN'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // 构建查询条件
    const where: any = {}
    if (!isAdmin) {
      // 普通用户只能查看自己的订单
      where.quote = {
        request: {
          userId: user.id,
        },
      }
    }

    const status = searchParams.get('status')
    if (status && status !== 'ALL') {
      where.status = status
    }

    // 获取订单列表
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          quote: {
            include: {
              request: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
          shipping: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ])

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('获取订单列表失败:', error)
    return NextResponse.json(
      { message: '服务器内部错误' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// POST - 创建新订单（用户接受报价）
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    if (!user) {
      return NextResponse.json(
        { message: '请先登录' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createOrderSchema.parse(body)
    const { quoteId, shippingAddress } = validatedData

    // 检查报价是否存在且属于当前用户
    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: {
        request: {
          select: {
            userId: true,
            status: true,
          },
        },
      },
    })

    if (!quote) {
      return NextResponse.json(
        { message: '报价不存在' },
        { status: 404 }
      )
    }

    if (quote.request.userId !== user.id) {
      return NextResponse.json(
        { message: '无权限操作此报价' },
        { status: 403 }
      )
    }

    if (quote.status !== 'PENDING') {
      return NextResponse.json(
        { message: '此报价已被处理，无法创建订单' },
        { status: 400 }
      )
    }

    // 检查是否已存在订单
    const existingOrder = await prisma.order.findFirst({
      where: { quoteId },
    })

    if (existingOrder) {
      return NextResponse.json(
        { message: '此报价已创建订单' },
        { status: 400 }
      )
    }

    // 创建订单
    const order = await prisma.order.create({
      data: {
        quoteId,
        totalAmount: quote.totalPrice,
        shippingAddress: JSON.stringify(shippingAddress),
        status: 'PENDING',
      },
      include: {
        quote: {
          include: {
            request: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    // 更新报价状态
    await prisma.quote.update({
      where: { id: quoteId },
      data: { status: 'ACCEPTED' },
    })

    // 更新请求状态
    await prisma.request.update({
      where: { id: quote.requestId },
      data: { status: 'PAID' },
    })

    return NextResponse.json(
      {
        message: '订单创建成功',
        order,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('创建订单失败:', error)
    
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

// PATCH - 更新订单状态（管理员）
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
    const validatedData = updateOrderSchema.parse(body)
    const { orderId, status } = validatedData

    // 检查订单是否存在
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        quote: {
          include: {
            request: true,
          },
        },
      },
    })

    if (!existingOrder) {
      return NextResponse.json(
        { message: '订单不存在' },
        { status: 404 }
      )
    }

    // 更新订单状态
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        quote: {
          include: {
            request: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        shipping: true,
      },
    })

    // 同步更新请求状态
    let requestStatus = existingOrder.quote.request.status
    if (status === 'PROCESSING') {
      requestStatus = 'PROCESSING'
    } else if (status === 'SHIPPED') {
      requestStatus = 'SHIPPED'
    } else if (status === 'DELIVERED') {
      requestStatus = 'COMPLETED'
    } else if (status === 'CANCELLED') {
      requestStatus = 'CANCELLED'
    }

    await prisma.request.update({
      where: { id: existingOrder.quote.requestId },
      data: { status: requestStatus },
    })

    return NextResponse.json({
      message: '订单状态更新成功',
      order: updatedOrder,
    })
  } catch (error) {
    console.error('更新订单状态失败:', error)
    
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