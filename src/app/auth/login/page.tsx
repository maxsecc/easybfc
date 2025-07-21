'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, FormField, FormLabel, FormMessage, FormSection, FormActions } from '@/components/ui/Form'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { toast } from 'react-hot-toast'
import { apiRequest, storage } from '@/utils'

// 登录表单验证模式
const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: '邮箱不能为空' })
    .email({ message: '请输入有效的邮箱地址' }),
  password: z
    .string()
    .min(6, { message: '密码至少需要6个字符' })
    .max(50, { message: '密码最多50个字符' }),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const { handleSubmit } = form

  // 处理登录提交
  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsSubmitting(true)
      
      const response = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      })

      if (response.success) {
        // 保存用户信息和令牌到本地存储
        storage.set('user', response.data.user)
        storage.set('token', response.data.token)
        
        toast.success('登录成功')
        
        // 根据用户角色重定向到不同页面
        if (response.data.user.role === 'ADMIN') {
          router.push('/admin/dashboard')
        } else {
          router.push('/dashboard')
        }
      } else {
        toast.error(response.message || '登录失败，请检查您的凭据')
      }
    } catch (error) {
      console.error('登录错误:', error)
      toast.error('登录失败，请稍后再试')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">登录</CardTitle>
          <CardDescription>
            登录您的账户以访问EasyBFC服务
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form form={form} onSubmit={handleSubmit(onSubmit)}>
            <FormSection>
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

              <FormField
                name="password"
                render={({ field }) => (
                  <div className="mb-6">
                    <FormLabel required>密码</FormLabel>
                    <Input
                      {...field}
                      type="password"
                      placeholder="请输入您的密码"
                      autoComplete="current-password"
                    />
                    <FormMessage />
                  </div>
                )}
              />

              <FormActions>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? '登录中...' : '登录'}
                </Button>
              </FormActions>

              <div className="mt-4 text-center text-sm">
                <p>
                  还没有账户？{' '}
                  <Link
                    href="/auth/register"
                    className="text-primary hover:underline"
                  >
                    立即注册
                  </Link>
                </p>
              </div>
            </FormSection>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}