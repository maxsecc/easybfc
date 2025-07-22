import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAuth } from '@/lib/auth'
import { randomBytes } from 'crypto'

const prisma = new PrismaClient()

// POST - 接受报价并创建订单
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

    const quoteId = params.id

    // 获取报价详情
    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: {
        request: {
          select: {
            id: true,
            userId: true,
            title: true,
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

    // 检查权限
    if (quote.request.userId !== user.id) {
      return NextResponse.json(
        { message: '无权限操作此报价' },
        { status: 403 }
      )
    }

    // 检查报价状态
    if (quote.status !== 'PENDING') {
      return NextResponse.json(
        { message: '报价状态不允许接受' },
        { status: 400 }
      )
    }

    // 检查报价是否过期
    if (new Date(quote.validUntil) < new Date()) {
      return NextResponse.json(
        { message: '报价已过期' },
        { status: 400 }
      )
    }

    // 使用事务处理接受报价和创建订单
    const result = await prisma.$transaction(async (tx) => {
      // 更新报价状态
      const updatedQuote = await tx.quote.update({
        where: { id: quoteId },
        data: { status: 'ACCEPTED' },
      })

      // 生成订单号
      const orderNumber = 'EBF' + Date.now() + randomBytes(2).toString('hex').toUpperCase()

      // 创建订单
      const order = await tx.order.create({
        data: {
          userId: user.id,
          requestId: quote.requestId,
          quoteId: quote.id,
          orderNumber,
          totalAmount: quote.totalPrice,
          paymentStatus: 'PENDING',
          orderStatus: 'PENDING',
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
        where: { id: quote.requestId },
        data: { status: 'PAID' }, // 注意：这里应该是ORDERED，后续可能需要调整
      })

      // 创建订单活动记录
      await tx.requestActivity.create({
        data: {
          requestId: quote.requestId,
          userId: user.id,
          type: 'ORDER_CREATED',
          title: '接受报价并创建订单',
          content: `订单号：${orderNumber}，总金额：¥${quote.totalPrice}`,
          metadata: JSON.stringify({
            orderId: order.id,
            orderNumber,
            quoteId: quote.id,
            totalAmount: quote.totalPrice,
          }),
        },
      })

      return { quote: updatedQuote, order }
    })

    return NextResponse.json({
      message: '报价已接受，订单创建成功',
      quote: result.quote,
      order: result.order,
    })
  } catch (error) {
    console.error('接受报价失败:', error)
    return NextResponse.json(
      { message: '服务器内部错误' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}