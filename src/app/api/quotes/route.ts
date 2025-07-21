import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { requireAdmin, requireAuth } from '@/lib/auth'

const prisma = new PrismaClient()

// 创建报价验证模式
const createQuoteSchema = z.object({
  requestId: z.string().uuid('无效的请求ID'),
  productPrice: z.number().positive('商品价格必须大于0'),
  serviceFee: z.number().min(0, '服务费不能为负数'),
  shippingFee: z.number().min(0, '运费不能为负数'),
  notes: z.string().max(1000, '备注不能超过1000个字符').optional(),
})

// GET - 获取报价列表
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
    const requestId = searchParams.get('requestId')

    if (!requestId) {
      return NextResponse.json(
        { message: '请求ID不能为空' },
        { status: 400 }
      )
    }

    // 检查请求是否存在且用户有权限查看
    const requestRecord = await prisma.request.findUnique({
      where: { id: requestId },
      select: { userId: true },
    })

    if (!requestRecord) {
      return NextResponse.json(
        { message: '请求不存在' },
        { status: 404 }
      )
    }

    // 普通用户只能查看自己的报价，管理员可以查看所有报价
    if (user.role !== 'ADMIN' && requestRecord.userId !== user.id) {
      return NextResponse.json(
        { message: '无权限查看此报价' },
        { status: 403 }
      )
    }

    const quotes = await prisma.quote.findMany({
      where: { requestId },
      include: {
        request: {
          select: {
            id: true,
            description: true,
            productUrl: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ quotes })
  } catch (error) {
    console.error('获取报价列表失败:', error)
    return NextResponse.json(
      { message: '服务器内部错误' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// POST - 创建新报价（管理员）
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
    const validatedData = createQuoteSchema.parse(body)
    const { requestId, productPrice, serviceFee, shippingFee, notes } = validatedData

    // 检查请求是否存在
    const requestRecord = await prisma.request.findUnique({
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

    if (!requestRecord) {
      return NextResponse.json(
        { message: '请求不存在' },
        { status: 404 }
      )
    }

    // 计算总价
    const totalPrice = productPrice + serviceFee + shippingFee

    // 创建报价
    const quote = await prisma.quote.create({
      data: {
        requestId,
        productPrice,
        serviceFee,
        shippingFee,
        totalPrice,
        notes: notes || '',
        status: 'PENDING',
      },
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
    })

    // 更新请求状态为已报价
    await prisma.request.update({
      where: { id: requestId },
      data: { status: 'QUOTED' },
    })

    return NextResponse.json(
      {
        message: '报价创建成功',
        quote,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('创建报价失败:', error)
    
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