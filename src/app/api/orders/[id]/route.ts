import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAuth } from '@/lib/auth'

const prisma = new PrismaClient()

// GET - 获取单个订单详情
export async function GET(
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

    // 获取订单详情
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        quote: {
          include: {
            request: {
              select: {
                id: true,
                title: true,
                description: true,
                productUrl: true,
                images: true,
                userId: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
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

    // 检查权限：只有订单所有者或管理员才能查看
    if (order.userId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: '无权限查看此订单' },
        { status: 403 }
      )
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('获取订单详情失败:', error)
    return NextResponse.json(
      { message: '服务器内部错误' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}