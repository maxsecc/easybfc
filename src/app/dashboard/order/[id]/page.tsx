'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { 
  ArrowLeftIcon, 
  CheckCircleIcon, 
  ClockIcon,
  TruckIcon,
  CreditCardIcon,
  DocumentTextIcon,
  PhoneIcon,
  MapPinIcon
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { storage } from '@/utils'

interface Order {
  id: string
  orderNumber: string
  totalAmount: number
  paymentStatus: string
  orderStatus: string
  paymentId?: string
  createdAt: string
  updatedAt: string
  quote: {
    id: string
    productName: string
    productPrice: number
    quantity: number
    serviceFee: number
    totalPrice: number
    notes?: string
    request: {
      id: string
      title: string
      description: string
      productUrl?: string
      images?: string
    }
  }
  user: {
    id: string
    name: string
    email: string
  }
  shipping?: {
    id: string
    trackingNumber?: string
    carrier?: string
    status: string
  }
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrderDetail()
  }, [])

  const fetchOrderDetail = async () => {
    try {
      const token = storage.get('token')
      if (!token) {
        router.push('/auth/login')
        return
      }

      const response = await fetch(`/api/orders/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const orderData = await response.json()
        setOrder(orderData)
      } else if (response.status === 404) {
        toast.error('订单不存在')
        router.push('/dashboard')
      } else {
        toast.error('获取订单详情失败')
      }
    } catch (error) {
      console.error('获取订单详情失败:', error)
      toast.error('获取订单详情失败')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string, type: 'payment' | 'order') => {
    const statusMaps = {
      payment: {
        PENDING: { text: '待支付', className: 'bg-yellow-100 text-yellow-800' },
        PAID: { text: '已支付', className: 'bg-green-100 text-green-800' },
        FAILED: { text: '支付失败', className: 'bg-red-100 text-red-800' },
        REFUNDED: { text: '已退款', className: 'bg-gray-100 text-gray-800' },
      },
      order: {
        PENDING: { text: '待处理', className: 'bg-yellow-100 text-yellow-800' },
        PAID: { text: '已支付', className: 'bg-green-100 text-green-800' },
        PROCESSING: { text: '处理中', className: 'bg-blue-100 text-blue-800' },
        PURCHASING: { text: '采购中', className: 'bg-purple-100 text-purple-800' },
        SHIPPING: { text: '发货中', className: 'bg-blue-100 text-blue-800' },
        DELIVERED: { text: '已送达', className: 'bg-green-100 text-green-800' },
        COMPLETED: { text: '已完成', className: 'bg-gray-100 text-gray-800' },
        CANCELLED: { text: '已取消', className: 'bg-red-100 text-red-800' },
      }
    }
    const map = statusMaps[type][status as keyof typeof statusMaps[typeof type]]
    return map || { text: status, className: 'bg-gray-100 text-gray-800' }
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

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">订单不存在</h3>
          <Link href="/dashboard" className="text-primary-600 hover:underline">
            返回仪表板
          </Link>
        </div>
      </div>
    )
  }

  const images = parseImages(order.quote.request.images)
  const canPay = order.paymentStatus === 'PENDING'

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
              <h1 className="text-xl font-semibold text-gray-900">订单详情</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 主要内容 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 订单基本信息 */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>订单信息</CardTitle>
                  <div className="flex space-x-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(order.paymentStatus, 'payment').className}`}>
                      {getStatusBadge(order.paymentStatus, 'payment').text}
                    </span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(order.orderStatus, 'order').className}`}>
                      {getStatusBadge(order.orderStatus, 'order').text}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    订单号：{order.orderNumber}
                  </h3>
                  <h4 className="text-base font-medium text-gray-700">
                    {order.quote.productName}
                  </h4>
                </div>

                {/* 商品信息 */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">商品明细</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">商品单价</span>
                      <span>¥{order.quote.productPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">数量</span>
                      <span>{order.quote.quantity}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">商品小计</span>
                      <span>¥{(order.quote.productPrice * order.quote.quantity).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">服务费</span>
                      <span>¥{order.quote.serviceFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-gray-200 font-semibold">
                      <span>订单总额</span>
                      <span className="text-primary-600 text-xl">¥{order.totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      * 运费将在商品发货时单独结算
                    </div>
                  </div>
                </div>

                {/* 商品备注 */}
                {order.quote.notes && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">商品备注</h4>
                    <p className="text-gray-700">{order.quote.notes}</p>
                  </div>
                )}

                {/* 相关需求 */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">相关需求</h4>
                  <div className="space-y-3">
                    <div>
                      <h5 className="font-medium text-gray-700">{order.quote.request.title}</h5>
                      <p className="text-gray-600 mt-1">{order.quote.request.description}</p>
                    </div>
                    
                    {order.quote.request.productUrl && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">商品链接:</span>
                        <a
                          href={order.quote.request.productUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-sm text-primary-600 hover:underline break-all mt-1"
                        >
                          {order.quote.request.productUrl}
                        </a>
                      </div>
                    )}

                    {images.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-gray-700 mb-2 block">商品图片:</span>
                        <div className="grid grid-cols-3 gap-2">
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
                  </div>
                </div>

                {/* 订单时间信息 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
                  <div>
                    <ClockIcon className="w-4 h-4 inline mr-1" />
                    <span>下单时间：{new Date(order.createdAt).toLocaleString()}</span>
                  </div>
                  <div>
                    <ClockIcon className="w-4 h-4 inline mr-1" />
                    <span>更新时间：{new Date(order.updatedAt).toLocaleString()}</span>
                  </div>
                  {order.paymentId && (
                    <div className="md:col-span-2">
                      <CreditCardIcon className="w-4 h-4 inline mr-1" />
                      <span>支付单号：{order.paymentId}</span>
                    </div>
                  )}
                </div>
            </CardContent>
            </Card>

            {/* 物流信息 */}
            {order.shipping && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TruckIcon className="w-5 h-5 mr-2" />
                    物流信息
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {order.shipping.carrier && (
                      <div>
                        <span className="text-gray-600">物流公司：</span>
                        <span className="font-medium">{order.shipping.carrier}</span>
                      </div>
                    )}
                    {order.shipping.trackingNumber && (
                      <div>
                        <span className="text-gray-600">快递单号：</span>
                        <span className="font-medium">{order.shipping.trackingNumber}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="text-gray-600">物流状态：</span>
                    <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(order.shipping.status, 'order').className}`}>
                      {getStatusBadge(order.shipping.status, 'order').text}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 侧边栏 */}
          <div className="space-y-6">
            {/* 操作按钮 */}
            <Card>
              <CardHeader>
                <CardTitle>操作</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {canPay && (
                  <Link
                    href={`/dashboard/order/${order.id}/payment`}
                    className="block"
                  >
                    <Button className="w-full">
                      <CreditCardIcon className="w-4 h-4 mr-2" />
                      立即支付
                    </Button>
                  </Link>
                )}
                
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.print()}
                >
                  <DocumentTextIcon className="w-4 h-4 mr-2" />
                  打印订单
                </Button>
              </CardContent>
            </Card>

            {/* 用户信息 */}
            <Card>
              <CardHeader>
                <CardTitle>订单用户</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-gray-500 text-sm">用户姓名:</span>
                  <p className="font-semibold">{order.user.name}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">邮箱地址:</span>
                  <p className="font-semibold">{order.user.email}</p>
                </div>
              </CardContent>
            </Card>

            {/* 客服联系 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-600">需要帮助？</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-gray-600 space-y-2">
                  <p>• 订单问题请及时联系客服</p>
                  <p>• 支付遇到困难可寻求帮助</p>
                  <p>• 物流信息实时更新</p>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <PhoneIcon className="w-4 h-4 mr-2" />
                  联系客服
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}