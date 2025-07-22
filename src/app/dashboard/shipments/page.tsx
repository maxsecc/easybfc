'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  PlusIcon, 
  TruckIcon, 
  PackageIcon,
  ClockIcon,
  CheckCircleIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { storage } from '@/utils'

interface Order {
  id: string
  orderNumber: string
  paymentStatus: string
  orderStatus: string
  quote: {
    id: string
    productName: string
    totalPrice: number
  }
}

interface Shipment {
  id: string
  shipmentNumber: string
  status: string
  totalWeight?: number
  shippingFee: number
  createdAt: string
  shipmentItems: {
    id: string
    quote: {
      productName: string
    }
    order: {
      orderNumber: string
    }
  }[]
}

export default function ShipmentsPage() {
  const router = useRouter()
  const [pendingOrders, setPendingOrders] = useState<Order[]>([])
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('pending')

  useEffect(() => {
    checkAuth()
    fetchData()
  }, [])

  const checkAuth = () => {
    const token = storage.get('token')
    if (!token) {
      router.push('/auth/login')
      return
    }
  }

  const fetchData = async () => {
    try {
      const token = storage.get('token')
      if (!token) return

      // 获取待发货的订单（已支付且状态为PAID的订单）
      const ordersResponse = await fetch('/api/orders?status=PAID', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json()
        setPendingOrders(ordersData.orders || [])
      }

      // 获取用户的发货记录
      const shipmentsResponse = await fetch('/api/shipments', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (shipmentsResponse.ok) {
        const shipmentsData = await shipmentsResponse.json()
        setShipments(shipmentsData.shipments || [])
      }
    } catch (error) {
      console.error('获取数据失败:', error)
      toast.error('获取数据失败')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { text: string; className: string } } = {
      PREPARING: { text: '准备中', className: 'bg-yellow-100 text-yellow-800' },
      SHIPPED: { text: '已发货', className: 'bg-blue-100 text-blue-800' },
      IN_TRANSIT: { text: '运输中', className: 'bg-purple-100 text-purple-800' },
      DELIVERED: { text: '已送达', className: 'bg-green-100 text-green-800' },
    }
    return statusMap[status] || { text: status, className: 'bg-gray-100 text-gray-800' }
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-2xl font-bold text-primary-600">
                我的发货
              </Link>
            </div>
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
              返回仪表板
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <ClockIcon className="w-8 h-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">待发货订单</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {pendingOrders.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <PackageIcon className="w-8 h-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">发货包裹</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {shipments.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircleIcon className="w-8 h-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">已送达</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {shipments.filter(s => s.status === 'DELIVERED').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 标签页 */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('pending')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'pending'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                待发货商品 ({pendingOrders.length})
              </button>
              <button
                onClick={() => setActiveTab('shipments')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'shipments'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                发货记录 ({shipments.length})
              </button>
            </nav>
          </div>
        </div>

        {/* 待发货商品 */}
        {activeTab === 'pending' && (
          <div>
            {pendingOrders.length > 0 && (
              <div className="mb-6">
                <Button>
                  <PlusIcon className="w-4 h-4 mr-2" />
                  创建发货包裹
                </Button>
              </div>
            )}

            <div className="space-y-4">
              {pendingOrders.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <PackageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">暂无待发货商品</h3>
                    <p className="text-gray-600">所有商品都已安排发货</p>
                  </CardContent>
                </Card>
              ) : (
                pendingOrders.map((order) => (
                  <Card key={order.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-2">
                            {order.quote.productName}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            订单号：{order.orderNumber}
                          </p>
                          <p className="text-lg font-semibold text-primary-600">
                            ¥{order.quote.totalPrice.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 mb-2">
                            已支付
                          </span>
                          <br />
                          <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            待发货
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* 发货记录 */}
        {activeTab === 'shipments' && (
          <div className="space-y-4">
            {shipments.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <TruckIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">暂无发货记录</h3>
                  <p className="text-gray-600">您还没有任何发货记录</p>
                </CardContent>
              </Card>
            ) : (
              shipments.map((shipment) => (
                <Card key={shipment.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">
                          发货单号：{shipment.shipmentNumber}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          包含 {shipment.shipmentItems.length} 件商品
                        </p>
                        <p className="text-sm text-gray-500">
                          创建时间：{new Date(shipment.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(shipment.status).className} mb-2`}>
                          {getStatusBadge(shipment.status).text}
                        </span>
                        {shipment.shippingFee > 0 && (
                          <div className="text-sm">
                            <span className="text-gray-600">运费：</span>
                            <span className="font-semibold text-primary-600">¥{shipment.shippingFee.toFixed(2)}</span>
                          </div>
                        )}
                        {shipment.totalWeight && (
                          <div className="text-xs text-gray-500 mt-1">
                            重量：{shipment.totalWeight}kg
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 商品列表 */}
                    <div className="border-t border-gray-200 pt-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">包含商品：</h5>
                      <div className="space-y-1">
                        {shipment.shipmentItems.map((item) => (
                          <div key={item.id} className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">{item.quote.productName}</span>
                            <span className="text-gray-500">订单：{item.order.orderNumber}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end mt-4">
                      <Link
                        href={`/dashboard/shipments/${shipment.id}`}
                        className="text-primary-600 hover:underline text-sm"
                      >
                        查看详情
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}