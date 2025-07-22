'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PlusIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'
import { storage } from '@/utils'

interface Request {
  id: string
  title: string
  description: string
  status: string
  createdAt: string
  quotes: Quote[]
}

interface Quote {
  id: string
  productName: string
  totalPrice: number
  status: string
  validUntil: string
}

interface Order {
  id: string
  orderNumber: string
  totalAmount: number
  paymentStatus: string
  orderStatus: string
  createdAt: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [requests, setRequests] = useState<Request[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('requests')

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
    // 这里可以添加token验证逻辑
  }

  const fetchData = async () => {
    try {
      const token = storage.get('token')
      if (!token) return

      // 获取用户信息
      const userResponse = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (userResponse.ok) {
        const userData = await userResponse.json()
        setUser(userData)
      }

      // 获取需求列表
      const requestsResponse = await fetch('/api/requests', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (requestsResponse.ok) {
        const requestsData = await requestsResponse.json()
        setRequests(requestsData.requests || [])
      }

      // 获取订单列表
      const ordersResponse = await fetch('/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json()
        setOrders(Array.isArray(ordersData) ? ordersData : [])
      }
    } catch (error) {
      console.error('获取数据失败:', error)
      toast.error('获取数据失败')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/')
    toast.success('已退出登录')
  }

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { text: string; className: string } } = {
      PENDING: { text: '待处理', className: 'badge badge-warning' },
      PROCESSING: { text: '处理中', className: 'badge badge-info' },
      QUOTED: { text: '已报价', className: 'badge badge-success' },
      ACCEPTED: { text: '已接受', className: 'badge badge-success' },
      REJECTED: { text: '已拒绝', className: 'badge badge-danger' },
      COMPLETED: { text: '已完成', className: 'badge badge-success' },
      PAID: { text: '已支付', className: 'badge badge-success' },
      SHIPPING: { text: '发货中', className: 'badge badge-info' },
      DELIVERED: { text: '已送达', className: 'badge badge-success' },
    }
    return statusMap[status] || { text: status, className: 'badge badge-info' }
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
              <Link href="/" className="text-2xl font-bold text-primary-600">
                EasyBFC
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">欢迎，{user?.name}</span>
              <button
                onClick={handleLogout}
                className="btn btn-secondary"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 快速操作 */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">快速操作</h2>
            <div className="flex flex-wrap gap-4">
              <Link href="/dashboard/new-request" className="btn btn-primary flex items-center">
                <PlusIcon className="w-5 h-5 mr-2" />
                提交新需求
              </Link>
              <Link href="/dashboard/shipments" className="btn btn-secondary flex items-center">
                <ClockIcon className="w-5 h-5 mr-2" />
                发货管理
              </Link>
            </div>
          </div>
        </div>

        {/* 标签页 */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('requests')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'requests'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                我的需求 ({requests.length})
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'orders'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                我的订单 ({orders.length})
              </button>
            </nav>
          </div>
        </div>

        {/* 需求列表 */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            {requests.length === 0 ? (
              <div className="text-center py-12">
                <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">暂无需求</h3>
                <p className="text-gray-600 mb-4">您还没有提交任何商品需求</p>
                <Link href="/dashboard/new-request" className="btn btn-primary">
                  提交第一个需求
                </Link>
              </div>
            ) : (
              requests.map((request) => (
                <div key={request.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{request.title}</h3>
                      <p className="text-gray-600 mt-1">{request.description}</p>
                    </div>
                    <span className={getStatusBadge(request.status).className}>
                      {getStatusBadge(request.status).text}
                    </span>
                  </div>
                  
                  {request.quotes.length > 0 && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">报价信息</h4>
                      {request.quotes.map((quote) => (
                        <div key={quote.id} className="flex justify-between items-center py-2">
                          <div>
                            <span className="font-medium">{quote.productName}</span>
                            <span className="text-sm text-gray-500 ml-2">
                              有效期至: {new Date(quote.validUntil).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-semibold text-primary-600">
                              ¥{quote.totalPrice}
                            </span>
                            {quote.status === 'PENDING' && (
                              <div className="mt-1">
                                <Link
                                  href={`/dashboard/quote/${quote.id}`}
                                  className="btn btn-primary btn-sm"
                                >
                                  查看详情
                                </Link>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="mt-4 text-sm text-gray-500">
                    提交时间: {new Date(request.createdAt).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 订单列表 */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">暂无订单</h3>
                <p className="text-gray-600">您还没有任何订单</p>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        订单号: {order.orderNumber}
                      </h3>
                      <p className="text-gray-600 mt-1">
                        下单时间: {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-primary-600 mb-2">
                        ¥{order.totalAmount}
                      </div>
                      <div className="space-x-2">
                        <span className={getStatusBadge(order.paymentStatus).className}>
                          {getStatusBadge(order.paymentStatus).text}
                        </span>
                        <span className={getStatusBadge(order.orderStatus).className}>
                          {getStatusBadge(order.orderStatus).text}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Link
                      href={`/dashboard/order/${order.id}`}
                      className="btn btn-secondary"
                    >
                      查看详情
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}