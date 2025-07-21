import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

// 注册请求验证模式
const registerSchema = z.object({
  name: z.string().min(2, '姓名至少需要2个字符').max(50, '姓名不能超过50个字符'),
  email: z.string().email('请输入有效的电子邮箱'),
  password: z.string().min(8, '密码至少需要8个字符').max(100, '密码不能超过100个字符'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 验证请求数据
    const validatedData = registerSchema.parse(body)
    const { name, email, password } = validatedData

    // 检查邮箱是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { message: '该邮箱已被注册' },
        { status: 400 }
      )
    }

    // 加密密码
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // 创建用户
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'USER', // 默认为普通用户
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })

    return NextResponse.json(
      {
        message: '注册成功',
        user,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('注册错误:', error)
    
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