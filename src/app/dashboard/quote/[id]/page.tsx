'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { 
  ArrowLeftIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  CreditCardIcon,
  ClockIcon,
  CurrencyDollarIcon,
  TruckIcon,
  ShoppingBagIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { storage } from '@/utils'

interface Quote {
  id: string
  productName: string
  productPrice: number
  quantity: number
  serviceFee: number
  totalPrice: number
  notes?: string
  validUntil: string
  status: string
  createdAt: string
  request: {
    id: string
    title: string
    description: string
    productUrl?: string
    images?: string
  }
}

export default function QuoteDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [quote, setQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchQuoteDetail()
  }, [])

  const fetchQuoteDetail = async () => {
    try {
      const token = storage.get('token')
      if (!token) {
        router.push('/auth/login')
        return
      }

      const response = await fetch(`/api/quotes/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const quoteData = await response.json()
        setQuote(quoteData)
      } else if (response.status === 404) {
        toast.error('报价不存在')
        router.push('/dashboard')
      } else {
        toast.error('获取报价详情失败')
      }
    } catch (error) {
      console.error('获取报价详情失败:', error)
      toast.error('获取报价详情失败')
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptQuote = async () => {
    if (!quote) return

    setActionLoading(true)
    try {
      const token = storage.get('token')
      const response = await fetch(`/api/quotes/${quote.id}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const result = await response.json()
        toast.success('报价已接受，订单已创建')
        // 跳转到支付页面
        router.push(`/dashboard/order/${result.order.id}/payment`)
      } else {
        const error = await response.json()
        toast.error(error.message || '接受报价失败')
      }
    } catch (error) {
      console.error('接受报价失败:', error)
      toast.error('接受报价失败，请稍后再试')
    } finally {
      setActionLoading(false)
    }
  }

  const handleRejectQuote = async () => {
    if (!quote || !confirm('确定要拒绝这个报价吗？')) return

    setActionLoading(true)
    try {
      const token = storage.get('token')
      const response = await fetch(`/api/quotes/${quote.id}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        toast.success('已拒绝报价')
        setQuote(prev => prev ? { ...prev, status: 'REJECTED' } : null)
      } else {
        const error = await response.json()
        toast.error(error.message || '拒绝报价失败')
      }
    } catch (error) {
      console.error('拒绝报价失败:', error)
      toast.error('拒绝报价失败，请稍后再试')
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { text: string; className: string } } = {
      PENDING: { text: '待确认', className: 'bg-yellow-100 text-yellow-800' },
      ACCEPTED: { text: '已接受', className: 'bg-green-100 text-green-800' },
      REJECTED: { text: '已拒绝', className: 'bg-red-100 text-red-800' },
      EXPIRED: { text: '已过期', className: 'bg-gray-100 text-gray-800' },
    }
    return statusMap[status] || { text: status, className: 'bg-gray-100 text-gray-800' }
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

  const isExpired = quote ? new Date(quote.validUntil) < new Date() : false
  const canAccept = quote && quote.status === 'PENDING' && !isExpired

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (!quote) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">报价不存在</h3>
          <Link href="/dashboard" className="text-primary-600 hover:underline">
            返回仪表板
          </Link>
        </div>
      </div>
    )
  }

  const images = parseImages(quote.request.images)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                返回仪表板
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">报价详情</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 主要内容 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 报价信息 */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>报价信息</CardTitle>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(quote.status).className}`}>
                    {getStatusBadge(quote.status).text}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    <ShoppingBagIcon className="w-5 h-5 inline mr-2" />
                    {quote.productName}
                  </h3>
                </div>

                {/* 价格明细 */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">商品单价</span>
                    <span className="font-medium">¥{quote.productPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">数量</span>
                    <span className="font-medium">{quote.quantity}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">商品小计</span>
                    <span className="font-medium">¥{(quote.productPrice * quote.quantity).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">
                      <CurrencyDollarIcon className="w-4 h-4 inline mr-1" />
                      服务费
                    </span>
                    <span className="font-medium">¥{quote.serviceFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-t-2 border-primary-200 bg-primary-50 px-4 rounded-lg">
                    <span className="text-lg font-semibold text-primary-900">总金额</span>
                    <span className="text-2xl font-bold text-primary-600">¥{quote.totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                {/* 有效期 */}
                <div className="flex items-center space-x-2">
                  <ClockIcon className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-600">有效期至：</span>
                  <span className={`font-medium ${isExpired ? 'text-red-600' : 'text-gray-900'}`}>
                    {new Date(quote.validUntil).toLocaleString()}
                    {isExpired && ' (已过期)'}
                  </span>
                </div>

                {/* 备注 */}
                {quote.notes && (
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <DocumentTextIcon className="w-5 h-5 text-gray-500" />
                      <span className="text-gray-600 font-medium">备注说明</span>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700 leading-relaxed">{quote.notes}</p>
                    </div>
                  </div>
                )}

                {/* 创建时间 */}
                <div className="text-sm text-gray-500">
                  报价时间：{new Date(quote.createdAt).toLocaleString()}
                </div>
              </CardContent>
            </Card>

            {/* 相关需求信息 */}
            <Card>
              <CardHeader>
                <CardTitle>相关需求</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{quote.request.title}</h4>
                  <p className="text-gray-600 leading-relaxed">{quote.request.description}</p>
                </div>

                {quote.request.productUrl && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">商品链接:</span>
                    <a
                      href={quote.request.productUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-sm text-primary-600 hover:underline break-all mt-1"
                    >
                      {quote.request.productUrl}
                    </a>
                  </div>
                )}

                {images.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-700 mb-2 block">您上传的图片:</span>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
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
              </CardContent>
            </Card>
          </div>

          {/* 侧边栏操作 */}
          <div className="space-y-6">
            {/* 操作按钮 */}
            <Card>
              <CardHeader>
                <CardTitle>操作</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {canAccept && (
                  <>
                    <Button
                      onClick={handleAcceptQuote}
                      disabled={actionLoading}
                      className="w-full"
                    >
                      <CheckCircleIcon className="w-4 h-4 mr-2" />
                      {actionLoading ? '处理中...' : '接受报价并下单'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleRejectQuote}
                      disabled={actionLoading}
                      className="w-full"
                    >
                      <XCircleIcon className="w-4 h-4 mr-2" />
                      拒绝报价
                    </Button>
                  </>
                )}
                
                {quote.status === 'ACCEPTED' && (
                  <div className="text-center py-4">
                    <CheckCircleIcon className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <p className="text-green-600 font-medium">报价已接受</p>
                    <p className="text-sm text-gray-500 mt-1">订单已创建，请前往订单页面查看</p>
                  </div>
                )}
                
                {quote.status === 'REJECTED' && (
                  <div className="text-center py-4">
                    <XCircleIcon className="w-8 h-8 text-red-500 mx-auto mb-2" />
                    <p className="text-red-600 font-medium">报价已拒绝</p>
                  </div>
                )}
                
                {isExpired && quote.status === 'PENDING' && (
                  <div className="text-center py-4">
                    <ClockIcon className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                    <p className="text-gray-600 font-medium">报价已过期</p>
                    <p className="text-sm text-gray-500 mt-1">请联系客服重新报价</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 提醒信息 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-amber-600">重要提醒</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-600">
                <p>• 接受报价后将自动创建订单</p>
                <p>• 请在有效期内确认报价</p>
                <p>• 报价包含商品费和服务费</p>
                <p>• 运费将在发货时单独计算</p>
                <p>• 支持多商品合并发货节省运费</p>
                <p>• 如有疑问请及时联系客服</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}