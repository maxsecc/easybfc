'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
// 不再使用Form组件
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { toast } from 'react-hot-toast'
import { apiRequest, storage } from '@/utils'

// 注册表单验证模式
const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: '姓名至少需要2个字符' })
      .max(50, { message: '姓名最多50个字符' }),
    email: z
      .string()
      .min(1, { message: '邮箱不能为空' })
      .email({ message: '请输入有效的邮箱地址' }),
    password: z
      .string()
      .min(6, { message: '密码至少需要6个字符' })
      .max(50, { message: '密码最多50个字符' }),
    confirmPassword: z.string(),
    phone: z
      .string()
      .min(11, { message: '请输入有效的手机号码' })
      .max(11, { message: '请输入有效的手机号码' }),
    company: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      company: '',
    },
  })

  const { handleSubmit } = form

  // 处理注册提交
  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setIsSubmitting(true)
      
      // 移除确认密码字段，后端不需要
      const { confirmPassword, ...registerData } = data
      
      const response = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(registerData),
      })

      if (response.success) {
        // 保存用户信息和令牌到本地存储
        storage.set('user', response.data.user)
        storage.set('token', response.data.token)
        
        toast.success('注册成功')
        router.push('/dashboard')
      } else {
        toast.error(response.message || '注册失败，请稍后再试')
      }
    } catch (error) {
      console.error('注册错误:', error)
      toast.error('注册失败，请稍后再试')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="min-h-screen flex justify-center items-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-red-500 font-bold mb-4 text-center">调试信息：表单容器</div>
          <Card className="w-full border-2 border-blue-500">
        <CardHeader className="text-center border-2 border-green-500">
          <CardTitle className="text-2xl font-bold">注册</CardTitle>
          <CardDescription>
            创建您的EasyBFC账户，开始使用我们的服务
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-purple-500 p-2 mb-2">调试信息：表单开始</div>
          <form onSubmit={handleSubmit(onSubmit)} className="border-2 border-yellow-500 space-y-6">
            <div className="border-2 border-orange-500 space-y-6">
              <div className="border-2 border-pink-500 p-2 mb-2">调试信息：姓名字段</div>
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700">姓名 <span className="text-red-500 ml-1">*</span></label>
                <Input
                  {...form.register("name")}
                  placeholder="请输入您的姓名"
                  autoComplete="name"
                />
                {form.formState.errors.name && (
                  <p className="text-sm font-medium text-red-500">{form.formState.errors.name.message}</p>
                )}
              </div>
              {/* 原始代码
              <FormField
                name="name"
                render={({ field }) => (
                  <div className="mb-4">
                    <FormLabel required>姓名</FormLabel>
                    <Input
                      {...field}
                      placeholder="请输入您的姓名"
                      autoComplete="name"
                    />
                    <FormMessage />
                  </div>
                )}
              />
              */}

              <div className="border-2 border-pink-500 p-2 mb-2">调试信息：邮箱字段</div>
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700">邮箱 <span className="text-red-500 ml-1">*</span></label>
                <Input
                  {...form.register("email")}
                  type="email"
                  placeholder="请输入您的邮箱地址"
                  autoComplete="email"
                />
                {form.formState.errors.email && (
                  <p className="text-sm font-medium text-red-500">{form.formState.errors.email.message}</p>
                )}
              </div>
              {/* 原始代码
              <FormField
                name="email"
                render={({ field }) => (
                  <div className="mb-4">
                    <FormLabel required>邮箱</FormLabel>
                    <Input
                      {...field}
                      type="email"
                      placeholder="请输入您的邮箱"
                      autoComplete="email"
                    />
                    <FormMessage />
                  </div>
                )}
              />
              */}

              <div className="border-2 border-pink-500 p-2 mb-2">调试信息：电话字段</div>
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700">手机号码 <span className="text-red-500 ml-1">*</span></label>
                <Input
                  {...form.register("phone")}
                  placeholder="请输入您的手机号码"
                  autoComplete="tel"
                />
                {form.formState.errors.phone && (
                  <p className="text-sm font-medium text-red-500">{form.formState.errors.phone.message}</p>
                )}
              </div>
              {/* 原始代码
              <FormField
                name="phone"
                render={({ field }) => (
                  <div className="mb-4">
                    <FormLabel required>手机号码</FormLabel>
                    <Input
                      {...field}
                      placeholder="请输入您的手机号码"
                      autoComplete="tel"
                    />
                    <FormMessage />
                  </div>
                )}
              />
              */}

              <div className="border-2 border-pink-500 p-2 mb-2">调试信息：公司字段</div>
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700">公司名称</label>
                <Input
                  {...form.register("company")}
                  placeholder="请输入您的公司名称（可选）"
                  autoComplete="organization"
                />
                {form.formState.errors.company && (
                  <p className="text-sm font-medium text-red-500">{form.formState.errors.company.message}</p>
                )}
              </div>
              {/* 原始代码
              <FormField
                name="company"
                render={({ field }) => (
                  <div className="mb-4">
                    <FormLabel>公司名称</FormLabel>
                    <Input
                      {...field}
                      placeholder="请输入您的公司名称（可选）"
                      autoComplete="organization"
                    />
                    <FormMessage />
                  </div>
                )}
              />
              */}

              <div className="border-2 border-pink-500 p-2 mb-2">调试信息：密码字段</div>
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700">密码 <span className="text-red-500 ml-1">*</span></label>
                <Input
                  {...form.register("password")}
                  type="password"
                  placeholder="请输入您的密码"
                  autoComplete="new-password"
                />
                {form.formState.errors.password && (
                  <p className="text-sm font-medium text-red-500">{form.formState.errors.password.message}</p>
                )}
              </div>
              {/* 原始代码
              <FormField
                name="password"
                render={({ field }) => (
                  <div className="mb-4">
                    <FormLabel required>密码</FormLabel>
                    <Input
                      {...field}
                      type="password"
                      placeholder="请输入您的密码"
                      autoComplete="new-password"
                    />
                    <FormMessage />
                  </div>
                )}
              />
              */}

              <div className="border-2 border-pink-500 p-2 mb-2">调试信息：确认密码字段</div>
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-700">确认密码 <span className="text-red-500 ml-1">*</span></label>
                <Input
                  {...form.register("confirmPassword")}
                  type="password"
                  placeholder="请再次输入您的密码"
                  autoComplete="new-password"
                />
                {form.formState.errors.confirmPassword && (
                  <p className="text-sm font-medium text-red-500">{form.formState.errors.confirmPassword.message}</p>
                )}
              </div>
              {/* 原始代码
              <FormField
                name="confirmPassword"
                render={({ field }) => (
                  <div className="mb-6">
                    <FormLabel required>确认密码</FormLabel>
                    <Input
                      {...field}
                      type="password"
                      placeholder="请再次输入您的密码"
                      autoComplete="new-password"
                    />
                    <FormMessage />
                  </div>
                )}
              />
              */}

              <div className="border-2 border-pink-500 p-2 mb-2">调试信息：提交按钮</div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? '注册中...' : '注册'}
                </Button>
              </div>

              <div className="mt-4 text-center text-sm">
                <p>
                  已有账户？{' '}
                  <Link
                    href="/auth/login"
                    className="text-primary hover:underline"
                  >
                    立即登录
                  </Link>
                </p>
              </div>
            </div>
          </form>
        </CardContent>
     </Card>
        </div>
      </div>
    </>
  )
}