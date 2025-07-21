import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { requireAuth, requireAdmin } from '@/lib/auth'

const prisma = new PrismaClient()

// 创建物流信息验证模式
const createShippingSchema = z.object({
  orderId: z.string().uuid('无效的订单ID'),
  carrier: z.string().min(1, '物流公司不能为空'),
  trackingNumber: z.string().min(1, '运单号不能为空'),
  estimatedDelivery: z.string().datetime('无效的预计送达时间').optional(),
  notes: z.string().max(500, '备注不能超过500个字符').optional(),
})

// 更新物流信息验证模式
const updateShippingSchema = z.object({
  shippingId: z.string().uuid('无效的物流ID'),
  carrier: z.string().min(1, '物流公司不能为空').optional(),
  trackingNumber: z.string().min(1, '运单号不能为空').optional(),
  status: z.enum(['PENDING', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'EXCEPTION']).optional(),
  estimatedDelivery: z.string().datetime('无效的预计送达时间').optional(),
  actualDelivery: z.string().datetime('无效的实际送达时间').optional(),
  notes: z.string().max(500, '备注不能超过500个字符').optional(),
})

// GET - 获取物流信息
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
    const orderId = searchParams.get('orderId')
    const shippingId = searchParams.get('shippingId')

    if (!orderId && !shippingId) {
      return NextResponse.json(
        { message: '请提供订单ID或物流ID' },
        { status: 400 }
      )
    }

    let shipping
    if (shippingId) {
      // 通过物流ID查询
      shipping = await prisma.shipping.findUnique({
        where: { id: shippingId },
        include: {
          order: {
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
          },
        },
      })

      if (!shipping) {
        return NextResponse.json(
          { message: '物流信息不存在' },
          { status: 404 }
        )
      }

      // 检查权限
      if (user.role !== 'ADMIN' && shipping.order.quote.request.userId !== user.id) {
        return NextResponse.json(
          { message: '无权限查看此物流信息' },
          { status: 403 }
        )
      }
    } else {
      // 通过订单ID查询
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          quote: {
            include: {
              request: {
                select: {
                  userId: true,
                },
              },
            },
          },
          shipping: true,
        },
      })

      if (!order) {
        return NextResponse.json(
          { message: '订单不存在' },
          { status: 404 }
        )
      }

      // 检查权限
      if (user.role !== 'ADMIN' && order.quote.request.userId !== user.id) {
        return NextResponse.json(
          { message: '无权限查看此订单的物流信息' },
          { status: 403 }
        )
      }

      shipping = order.shipping
    }

    return NextResponse.json({ shipping })
  } catch (error) {
    console.error('获取物流信息失败:', error)
    return NextResponse.json(
      { message: '服务器内部错误' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// POST - 创建物流信息（管理员）
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
    const validatedData = createShippingSchema.parse(body)
    const { orderId, carrier, trackingNumber, estimatedDelivery, notes } = validatedData

    // 检查订单是否存在
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        shipping: true,
        quote: {
          include: {
            request: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        { message: '订单不存在' },
        { status: 404 }
      )
    }

    // 检查是否已存在物流信息
    if (order.shipping) {
      return NextResponse.json(
        { message: '此订单已存在物流信息' },
        { status: 400 }
      )
    }

    // 创建物流信息
    const shipping = await prisma.shipping.create({
      data: {
        orderId,
        carrier,
        trackingNumber,
        status: 'PENDING',
        estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : null,
        notes: notes || '',
      },
      include: {
        order: {
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
        },
      },
    })

    // 更新订单状态为已发货
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'SHIPPED' },
    })

    // 更新请求状态为已发货
    await prisma.request.update({
      where: { id: order.quote.requestId },
      data: { status: 'SHIPPED' },
    })

    return NextResponse.json(
      {
        message: '物流信息创建成功',
        shipping,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('创建物流信息失败:', error)
    
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

// PATCH - 更新物流信息（管理员）
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
    const validatedData = updateShippingSchema.parse(body)
    const { shippingId, ...updateData } = validatedData

    // 检查物流信息是否存在
    const existingShipping = await prisma.shipping.findUnique({
      where: { id: shippingId },
      include: {
        order: {
          include: {
            quote: {
              include: {
                request: true,
              },
            },
          },
        },
      },
    })

    if (!existingShipping) {
      return NextResponse.json(
        { message: '物流信息不存在' },
        { status: 404 }
      )
    }

    // 准备更新数据
    const dataToUpdate: any = {}
    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'estimatedDelivery' || key === 'actualDelivery') {
          dataToUpdate[key] = value ? new Date(value as string) : null
        } else {
          dataToUpdate[key] = value
        }
      }
    })

    // 更新物流信息
    const updatedShipping = await prisma.shipping.update({
      where: { id: shippingId },
      data: dataToUpdate,
      include: {
        order: {
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
        },
      },
    })

    // 如果物流状态更新为已送达，同步更新订单和请求状态
    if (updateData.status === 'DELIVERED') {
      await prisma.order.update({
        where: { id: existingShipping.orderId },
        data: { status: 'DELIVERED' },
      })

      await prisma.request.update({
        where: { id: existingShipping.order.quote.requestId },
        data: { status: 'COMPLETED' },
      })
    }

    return NextResponse.json({
      message: '物流信息更新成功',
      shipping: updatedShipping,
    })
  } catch (error) {
    console.error('更新物流信息失败:', error)
    
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