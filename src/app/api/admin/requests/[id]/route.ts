import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAdmin } from '@/lib/auth'

const prisma = new PrismaClient()

// GET - 获取单个请求详情（管理员）
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin(request)
    if (!admin) {
      return NextResponse.json(
        { message: '需要管理员权限' },
        { status: 403 }
      )
    }

    const requestId = params.id

    // 获取请求详情
    const requestDetail = await prisma.request.findUnique({
      where: { id: requestId },
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
        activities: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!requestDetail) {
      return NextResponse.json(
        { message: '请求不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json(requestDetail)
  } catch (error) {
    console.error('获取请求详情失败:', error)
    return NextResponse.json(
      { message: '服务器内部错误' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// PUT - 更新请求详情（管理员）
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin(request)
    if (!admin) {
      return NextResponse.json(
        { message: '需要管理员权限' },
        { status: 403 }
      )
    }

    const requestId = params.id
    const { title, description, productUrl, status } = await request.json()

    // 检查请求是否存在
    const existingRequest = await prisma.request.findUnique({
      where: { id: requestId },
    })

    if (!existingRequest) {
      return NextResponse.json(
        { message: '请求不存在' },
        { status: 404 }
      )
    }

    // 更新请求
    const updatedRequest = await prisma.request.update({
      where: { id: requestId },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(productUrl !== undefined && { productUrl }),
        ...(status && { status }),
      },
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
      message: '请求更新成功',
      request: updatedRequest,
    })
  } catch (error) {
    console.error('更新请求失败:', error)
    return NextResponse.json(
      { message: '服务器内部错误' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// DELETE - 删除请求（管理员）
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin(request)
    if (!admin) {
      return NextResponse.json(
        { message: '需要管理员权限' },
        { status: 403 }
      )
    }

    const requestId = params.id

    // 检查请求是否存在
    const existingRequest = await prisma.request.findUnique({
      where: { id: requestId },
      include: {
        quotes: true,
        orders: true,
      },
    })

    if (!existingRequest) {
      return NextResponse.json(
        { message: '请求不存在' },
        { status: 404 }
      )
    }

    // 检查是否有关联的订单
    if (existingRequest.orders.length > 0) {
      return NextResponse.json(
        { message: '无法删除已有订单的请求' },
        { status: 400 }
      )
    }

    // 删除请求（会级联删除报价）
    await prisma.request.delete({
      where: { id: requestId },
    })

    return NextResponse.json({
      message: '请求删除成功',
    })
  } catch (error) {
    console.error('删除请求失败:', error)
    return NextResponse.json(
      { message: '服务器内部错误' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}