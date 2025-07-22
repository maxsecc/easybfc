import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAdmin } from '@/lib/auth'

const prisma = new PrismaClient()

// GET - 获取所有订单 (管理员)
export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin(request)
    if (!admin) {
      return NextResponse.json(
        { message: '需要管理员权限' },
        { status: 403 }
      )
    }

    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        quote: {
          include: {
            request: {
              select: {
                id: true,
                title: true,
                description: true,
              },
            },
          },
        },
        shipping: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(orders)
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

// POST - 创建新订单 (通常由报价确认后自动创建)
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request)
    if (!admin) {
      return NextResponse.json(
        { message: '需要管理员权限' },
        { status: 403 }
      )
    }

    const { quoteId, orderNumber } = await request.json()

    if (!quoteId) {
      return NextResponse.json(
        { message: '报价ID不能为空' },
        { status: 400 }
      )
    }

    // 检查报价是否存在且已被接受
    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: {
        request: {
          include: {
            user: true,
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

    if (quote.status !== 'ACCEPTED') {
      return NextResponse.json(
        { message: '只能为已接受的报价创建订单' },
        { status: 400 }
      )
    }

    // 生成订单号
    const generatedOrderNumber = orderNumber || `EBF${Date.now()}`

    // 创建订单
    const newOrder = await prisma.order.create({
      data: {
        orderNumber: generatedOrderNumber,
        userId: quote.request.userId,
        quoteId: quote.id,
        totalAmount: quote.totalAmount,
        paymentStatus: 'PENDING',
        orderStatus: 'CREATED',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        quote: {
          include: {
            request: {
              select: {
                id: true,
                title: true,
                description: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(
      {
        message: '订单创建成功',
        order: newOrder,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('创建订单失败:', error)
    return NextResponse.json(
      { message: '服务器内部错误' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}