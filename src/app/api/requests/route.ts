import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { requireAuth } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()

// 请求提交验证模式
const requestSchema = z.object({
  productUrl: z.string().url('请输入有效的商品链接').optional().or(z.literal('')),
  description: z.string().min(10, '商品描述至少需要10个字符').max(2000, '商品描述不能超过2000个字符'),
  images: z.array(z.string()).max(5, '最多只能上传5张图片').optional(),
})

// GET - 获取用户的所有请求
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    if (!user) {
      return NextResponse.json(
        { message: '请先登录' },
        { status: 401 }
      )
    }

    const requests = await prisma.request.findMany({
      where: { userId: user.id },
      include: {
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
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ requests })
  } catch (error) {
    console.error('获取请求列表失败:', error)
    return NextResponse.json(
      { message: '服务器内部错误' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// POST - 创建新的商品请求
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    if (!user) {
      return NextResponse.json(
        { message: '请先登录' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const productUrl = formData.get('productUrl') as string
    const description = formData.get('description') as string
    const images = formData.getAll('images') as File[]

    // 验证基本数据
    const validatedData = requestSchema.parse({
      productUrl: productUrl || '',
      description,
      images: [], // 图片单独处理
    })

    // 处理图片上传
    const imageUrls: string[] = []
    if (images && images.length > 0) {
      if (images.length > 5) {
        return NextResponse.json(
          { message: '最多只能上传5张图片' },
          { status: 400 }
        )
      }

      // 确保上传目录存在
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'requests')
      await mkdir(uploadDir, { recursive: true })

      for (const image of images) {
        // 验证文件类型
        if (!image.type.startsWith('image/')) {
          return NextResponse.json(
            { message: '只能上传图片文件' },
            { status: 400 }
          )
        }

        // 验证文件大小 (5MB)
        if (image.size > 5 * 1024 * 1024) {
          return NextResponse.json(
            { message: '图片文件大小不能超过5MB' },
            { status: 400 }
          )
        }

        // 生成唯一文件名
        const fileExtension = image.name.split('.').pop()
        const fileName = `${uuidv4()}.${fileExtension}`
        const filePath = join(uploadDir, fileName)

        // 保存文件
        const bytes = await image.arrayBuffer()
        const buffer = Buffer.from(bytes)
        await writeFile(filePath, buffer)

        // 保存相对路径
        imageUrls.push(`/uploads/requests/${fileName}`)
      }
    }

    // 创建请求记录
    const newRequest = await prisma.request.create({
      data: {
        userId: user.id,
        productUrl: validatedData.productUrl || null,
        description: validatedData.description,
        images: imageUrls,
        status: 'PENDING',
      },
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

    return NextResponse.json(
      {
        message: '商品请求提交成功',
        request: newRequest,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('创建请求失败:', error)
    
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