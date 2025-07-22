'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { 
  ArrowLeftIcon, 
  CreditCardIcon,
  BanknotesIcon,
  PhoneIcon,
  ShieldCheckIcon,
  ClockIcon
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
  createdAt: string
  quote: {
    productName: string
    productPrice: number
    quantity: number
    serviceFee: number
    totalPrice: number
  }
  request: {
    title: string
    description: string
  }
}

interface PaymentMethod {
  id: string
  name: string
  icon: React.ReactNode
  description: string
  available: boolean
}

export default function OrderPaymentPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('alipay')

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'alipay',
      name: '支付宝',
      icon: <BanknotesIcon className="w-6 h-6" />,
      description: '使用支付宝快速支付',
      available: true,
    },
    {
      id: 'wechat',
      name: '微信支付',
      icon: <PhoneIcon className="w-6 h-6" />,
      description: '使用微信支付',
      available: true,
    },
    {
      id: 'bank',
      name: '银行卡',
      icon: <CreditCardIcon className="w-6 h-6" />,
      description: '使用银行卡支付',
      available: false,
    },
  ]

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
        
        // 如果已经支付，跳转到订单详情页
        if (orderData.paymentStatus === 'PAID') {
          router.push(`/dashboard/order/${params.id}`)
          return
        }
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

  const handlePayment = async () => {
    if (!order) return

    setPaymentLoading(true)
    try {
      const token = storage.get('token')
      const response = await fetch(`/api/orders/${order.id}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          paymentMethod: selectedPaymentMethod,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        toast.success('支付成功！')
        
        // 跳转到订单详情页
        router.push(`/dashboard/order/${order.id}`)
      } else {
        const error = await response.json()
        toast.error(error.message || '支付失败')
      }
    } catch (error) {
      console.error('支付失败:', error)
      toast.error('支付失败，请稍后再试')
    } finally {
      setPaymentLoading(false)
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href={`/dashboard/order/${order.id}`}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                返回订单详情
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">订单支付</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 支付方式选择 */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>选择支付方式</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`relative border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedPaymentMethod === method.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${!method.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => method.available && setSelectedPaymentMethod(method.id)}
                    >
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {method.icon}
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-gray-900">
                              {method.name}
                              {!method.available && (
                                <span className="ml-2 text-xs text-gray-500">(暂不可用)</span>
                              )}
                            </h3>
                            <input
                              type="radio"
                              name="paymentMethod"
                              value={method.id}
                              checked={selectedPaymentMethod === method.id}
                              disabled={!method.available}
                              className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                              readOnly
                            />
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{method.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <Button
                    onClick={handlePayment}
                    disabled={paymentLoading || !selectedPaymentMethod}
                    className="w-full text-lg py-3"
                  >
                    {paymentLoading ? '支付中...' : `确认支付 ¥${order.totalAmount.toFixed(2)}`}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 订单信息 */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>订单信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900">{order.quote.productName}</h4>
                  <p className="text-sm text-gray-500 mt-1">订单号：{order.orderNumber}</p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">商品单价：</span>
                    <span>¥{order.quote.productPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">数量：</span>
                    <span>{order.quote.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">商品小计：</span>
                    <span>¥{(order.quote.productPrice * order.quote.quantity).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">服务费：</span>
                    <span>¥{order.quote.serviceFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200 font-semibold">
                    <span>合计：</span>
                    <span className="text-primary-600 text-lg">¥{order.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    * 运费将在发货时单独结算
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <ClockIcon className="w-4 h-4" />
                    <span>下单时间：{new Date(order.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 安全提示 */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center text-green-600">
                  <ShieldCheckIcon className="w-5 h-5 mr-2" />
                  支付安全
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 space-y-2">
                <p>• 支付过程使用SSL加密保护</p>
                <p>• 支持主流支付方式</p>
                <p>• 此次支付不包含运费</p>
                <p>• 运费将在发货时单独计算</p>
                <p>• 支付完成后立即更新订单状态</p>
                <p>• 如有问题请及时联系客服</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}