import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAuth } from '@/lib/auth'

const prisma = new PrismaClient()

// GET - 获取单个报价详情
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

    const quoteId = params.id

    // 获取报价详情
    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
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
    })

    if (!quote) {
      return NextResponse.json(
        { message: '报价不存在' },
        { status: 404 }
      )
    }

    // 检查权限：只有报价对应请求的用户才能查看
    if (quote.request.userId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: '无权限查看此报价' },
        { status: 403 }
      )
    }

    return NextResponse.json(quote)
  } catch (error) {
    console.error('获取报价详情失败:', error)
    return NextResponse.json(
      { message: '服务器内部错误' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}