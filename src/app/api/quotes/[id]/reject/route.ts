import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAuth } from '@/lib/auth'

const prisma = new PrismaClient()

// POST - 拒绝报价
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
        { message: '报价状态不允许拒绝' },
        { status: 400 }
      )
    }

    // 使用事务处理拒绝报价
    const result = await prisma.$transaction(async (tx) => {
      // 更新报价状态
      const updatedQuote = await tx.quote.update({
        where: { id: quoteId },
        data: { status: 'REJECTED' },
      })

      // 更新请求状态回到处理中
      await tx.request.update({
        where: { id: quote.requestId },
        data: { status: 'PROCESSING' },
      })

      // 创建活动记录
      await tx.requestActivity.create({
        data: {
          requestId: quote.requestId,
          userId: user.id,
          type: 'QUOTE_REJECTED',
          title: '拒绝报价',
          content: `用户拒绝了报价：${quote.productName}，总金额：¥${quote.totalPrice}`,
          metadata: JSON.stringify({
            quoteId: quote.id,
            productName: quote.productName,
            totalPrice: quote.totalPrice,
          }),
        },
      })

      return updatedQuote
    })

    return NextResponse.json({
      message: '已拒绝报价',
      quote: result,
    })
  } catch (error) {
    console.error('拒绝报价失败:', error)
    return NextResponse.json(
      { message: '服务器内部错误' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}