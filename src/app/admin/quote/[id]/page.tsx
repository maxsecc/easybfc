'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import { 
  ArrowLeftIcon, 
  CurrencyDollarIcon,
  TruckIcon,
  ShoppingBagIcon,
  DocumentTextIcon,
  PhotoIcon
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Label } from '@/components/ui/label'
import { storage } from '@/utils'
import { useAuth } from '@/contexts/AuthContext'

// 报价表单验证模式
const quoteSchema = z.object({
  productName: z.string().min(1, '商品名称不能为空').max(200, '商品名称不能超过200字符'),
  productPrice: z.number().positive('商品价格必须大于0'),
  quantity: z.number().int().positive('数量必须是正整数'),
  serviceFee: z.number().min(0, '服务费不能为负数'),
  notes: z.string().max(1000, '备注不能超过1000字符').optional(),
  validUntil: z.string().min(1, '有效期不能为空'),
})

type QuoteFormValues = z.infer<typeof quoteSchema>

interface Request {
  id: string
  title: string
  description: string
  productUrl?: string
  images?: string
  status: string
  createdAt: string
  user: {
    id: string
    name: string
    email: string
  }
}

export default function AdminCreateQuotePage() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [request, setRequest] = useState<Request | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      productName: '',
      productPrice: 0,
      quantity: 1,
      serviceFee: 0,
      notes: '',
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 默认7天后过期
    },
  })

  const productPrice = watch('productPrice')
  const quantity = watch('quantity')
  const serviceFee = watch('serviceFee')

  const totalAmount = (productPrice * quantity) + serviceFee

  useEffect(() => {
    checkAuth()
    fetchRequestDetail()
  }, [user, isLoading])

  const checkAuth = async () => {
    if (isLoading) return
    
    if (!user) {
      router.push('/auth/login')
      return
    }
    
    if (user.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }
  }

  const fetchRequestDetail = async () => {
    try {
      const token = storage.get('token')
      if (!token) return

      const response = await fetch(`/api/admin/requests/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const requestData = await response.json()
        setRequest(requestData)
        // 如果有商品URL，可以预填商品名称
        if (requestData.title) {
          setValue('productName', requestData.title)
        }
      } else if (response.status === 404) {
        toast.error('请求不存在')
        router.push('/admin')
      } else {
        toast.error('获取请求详情失败')
      }
    } catch (error) {
      console.error('获取请求详情失败:', error)
      toast.error('获取请求详情失败')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: QuoteFormValues) => {
    setIsSubmitting(true)
    
    try {
      const token = storage.get('token')
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          requestId: params.id,
          ...data,
        }),
      })

      if (response.ok) {
        toast.success('报价创建成功')
        router.push(`/admin/request/${params.id}`)
      } else {
        const error = await response.json()
        toast.error(error.message || '创建报价失败')
      }
    } catch (error) {
      console.error('创建报价失败:', error)
      toast.error('创建报价失败，请稍后再试')
    } finally {
      setIsSubmitting(false)
    }
  }

  const parseImages = (images: string | string[]): string[] => {
    if (!images) return []
    if (Array.isArray(images)) return images
    try {
      const parsed = JSON.parse(images)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (!request) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">请求不存在</h3>
          <Link href="/admin" className="text-primary-600 hover:underline">
            返回管理后台
          </Link>
        </div>
      </div>
    )
  }

  const images = parseImages(request.images)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href={`/admin/request/${request.id}`}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                返回请求详情
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">创建报价</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 报价表单 */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>报价信息</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* 商品名称 */}
                  <div>
                    <Label htmlFor="productName">
                      <ShoppingBagIcon className="w-4 h-4 inline mr-1" />
                      商品名称 *
                    </Label>
                    <Input
                      id="productName"
                      {...register('productName')}
                      placeholder="输入商品名称"
                    />
                    {errors.productName && (
                      <p className="mt-1 text-sm text-red-600">{errors.productName.message}</p>
                    )}
                  </div>

                  {/* 价格和数量 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="productPrice">
                        <CurrencyDollarIcon className="w-4 h-4 inline mr-1" />
                        商品单价 (¥) *
                      </Label>
                      <Input
                        id="productPrice"
                        type="number"
                        step="0.01"
                        min="0"
                        {...register('productPrice', { valueAsNumber: true })}
                        placeholder="0.00"
                      />
                      {errors.productPrice && (
                        <p className="mt-1 text-sm text-red-600">{errors.productPrice.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="quantity">数量 *</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        {...register('quantity', { valueAsNumber: true })}
                        placeholder="1"
                      />
                      {errors.quantity && (
                        <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>
                      )}
                    </div>
                  </div>

                  {/* 服务费 */}
                  <div>
                    <Label htmlFor="serviceFee">服务费 (¥)</Label>
                    <Input
                      id="serviceFee"
                      type="number"
                      step="0.01"
                      min="0"
                      {...register('serviceFee', { valueAsNumber: true })}
                      placeholder="0.00"
                    />
                    {errors.serviceFee && (
                      <p className="mt-1 text-sm text-red-600">{errors.serviceFee.message}</p>
                    )}
                  </div>

                  {/* 有效期 */}
                  <div>
                    <Label htmlFor="validUntil">报价有效期 *</Label>
                    <Input
                      id="validUntil"
                      type="date"
                      {...register('validUntil')}
                    />
                    {errors.validUntil && (
                      <p className="mt-1 text-sm text-red-600">{errors.validUntil.message}</p>
                    )}
                  </div>

                  {/* 备注 */}
                  <div>
                    <Label htmlFor="notes">
                      <DocumentTextIcon className="w-4 h-4 inline mr-1" />
                      备注说明
                    </Label>
                    <Textarea
                      id="notes"
                      {...register('notes')}
                      rows={4}
                      placeholder="添加关于这个报价的说明、特殊条件或其他重要信息..."
                      className="resize-none"
                    />
                    {errors.notes && (
                      <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
                    )}
                  </div>

                  {/* 总价显示 */}
                  <div className="bg-primary-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">商品小计:</span>
                      <span className="text-sm">¥{(productPrice * quantity).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm text-gray-600">服务费:</span>
                      <span className="text-sm">¥{serviceFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-primary-200">
                      <span className="font-semibold text-gray-900">总价:</span>
                      <span className="text-xl font-bold text-primary-600">¥{totalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* 提交按钮 */}
                  <div className="flex space-x-4">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1"
                    >
                      {isSubmitting ? '创建中...' : '创建报价'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      disabled={isSubmitting}
                    >
                      取消
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* 侧边栏 - 请求信息 */}
          <div className="space-y-6">
            {/* 请求概要 */}
            <Card>
              <CardHeader>
                <CardTitle>请求信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{request.title}</h4>
                  <p className="text-sm text-gray-600">{request.description}</p>
                </div>

                {request.productUrl && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">商品链接:</span>
                    <a
                      href={request.productUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-sm text-primary-600 hover:underline break-all mt-1"
                    >
                      {request.productUrl}
                    </a>
                  </div>
                )}

                {images.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-700 mb-2 block">用户图片:</span>
                    <div className="grid grid-cols-2 gap-2">
                      {images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`商品图片 ${index + 1}`}
                          className="w-full h-20 object-cover rounded border border-gray-200"
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-sm text-gray-500 pt-4 border-t border-gray-200">
                  <div className="mb-2">
                    <span className="font-medium">用户:</span> {request.user.name}
                  </div>
                  <div className="mb-2">
                    <span className="font-medium">邮箱:</span> {request.user.email}
                  </div>
                  <div>
                    <span className="font-medium">提交时间:</span> {new Date(request.createdAt).toLocaleString()}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 报价提醒 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-amber-600">报价提醒</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-600">
                <p>• 请确保价格准确，包含所有相关费用</p>
                <p>• 服务费包括代购服务、质检等费用</p>
                <p>• 运费将在商品入库后单独计算</p>
                <p>• 支持多商品合并发货，节省运费</p>
                <p>• 报价创建后将通知用户确认</p>
                <p>• 有效期到期后报价自动失效</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}