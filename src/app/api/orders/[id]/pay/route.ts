import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAuth } from '@/lib/auth'

const prisma = new PrismaClient()

// POST - 处理订单支付
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)
    if (!user) {
      return NextResponse.json(
        { message: '请先登录' },
        { status: 401 }
      )
    }

    const orderId = params.id
    const { paymentMethod } = await request.json()

    // 获取订单详情
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        quote: {
          select: {
            productName: true,
          },
        },
        request: {
          select: {
            id: true,
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

    // 检查权限
    if (order.userId !== user.id) {
      return NextResponse.json(
        { message: '无权限操作此订单' },
        { status: 403 }
      )
    }

    // 检查订单状态
    if (order.paymentStatus !== 'PENDING') {
      return NextResponse.json(
        { message: '订单状态不允许支付' },
        { status: 400 }
      )
    }

    // 模拟支付处理
    // 在实际项目中，这里应该调用第三方支付API
    const paymentId = 'PAY_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)

    // 使用事务处理支付
    const result = await prisma.$transaction(async (tx) => {
      // 更新订单状态
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'PAID',
          orderStatus: 'PAID',
          paymentId,
        },
        include: {
          quote: {
            select: {
              productName: true,
              totalPrice: true,
            },
          },
          request: {
            select: {
              title: true,
            },
          },
        },
      })

      // 更新请求状态
      await tx.request.update({
        where: { id: order.requestId },
        data: { status: 'PAID' },
      })

      // 创建支付活动记录
      await tx.requestActivity.create({
        data: {
          requestId: order.requestId,
          userId: user.id,
          type: 'PAYMENT_COMPLETED',
          title: '订单支付完成',
          content: `订单 ${order.orderNumber} 支付成功，支付方式：${paymentMethod}，金额：¥${order.totalAmount}`,
          metadata: JSON.stringify({
            orderId: order.id,
            orderNumber: order.orderNumber,
            paymentId,
            paymentMethod,
            amount: order.totalAmount,
          }),
        },
      })

      return updatedOrder
    })

    return NextResponse.json({
      message: '支付成功',
      order: result,
      paymentId,
    })
  } catch (error) {
    console.error('订单支付失败:', error)
    return NextResponse.json(
      { message: '服务器内部错误' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}