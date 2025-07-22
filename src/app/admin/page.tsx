'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { storage } from '@/utils'
import { StartProcessingModal } from '@/components/StartProcessingModal'
import { 
  ClockIcon, 
  EyeIcon, 
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

interface Request {
  id: string
  title: string
  description: string
  productUrl?: string
  images?: string[]
  status: string
  createdAt: string
  user: {
    id: string
    name: string
    email: string
  }
  quotes: Quote[]
}

interface Quote {
  id: string
  productName: string
  totalPrice: number
  status: string
  createdAt: string
}

interface Order {
  id: string
  orderNumber: string
  totalAmount: number
  paymentStatus: string
  orderStatus: string
  createdAt: string
  user: {
    name: string
    email: string
  }
}

export default function AdminPage() {
  const router = useRouter()
  const { user, isLoading, logout } = useAuth()
  const [requests, setRequests] = useState<Request[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('requests')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [showProcessingModal, setShowProcessingModal] = useState(false)
  const [selectedRequestId, setSelectedRequestId] = useState('')
  const [selectedRequestTitle, setSelectedRequestTitle] = useState('')
  const [availableAdmins, setAvailableAdmins] = useState<Array<{ id: string; name: string }>>([])

  useEffect(() => {
    checkAuth()
    fetchData()
    fetchAdmins()
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

  const fetchData = async () => {
    try {
      const token = storage.get('token')
      if (!token) return

      // 获取所有需求
      const requestsResponse = await fetch('/api/admin/requests', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (requestsResponse.ok) {
        const requestsData = await requestsResponse.json()
        setRequests(requestsData.requests || [])
      } else {
        setRequests([])
      }

      // 获取所有订单
      const ordersResponse = await fetch('/api/admin/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json()
        setOrders(Array.isArray(ordersData) ? ordersData : [])
      } else {
        setOrders([])
      }
    } catch (error) {
      console.error('获取数据失败:', error)
      toast.error('获取数据失败')
      setRequests([])
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const fetchAdmins = async () => {
    try {
      const token = storage.get('token')
      if (!token) return

      const response = await fetch('/api/admin/users?role=ADMIN', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const adminsData = await response.json()
        setAvailableAdmins(adminsData)
      }
    } catch (error) {
      console.error('获取管理员列表失败:', error)
    }
  }

  const handleLogout = () => {
    logout()
    toast.success('已退出登录')
  }

  const handleStartProcessing = (requestId: string, requestTitle: string) => {
    setSelectedRequestId(requestId)
    setSelectedRequestTitle(requestTitle)
    setShowProcessingModal(true)
  }

  const handleStartProcessingSubmit = async (data: any) => {
    try {
      const token = storage.get('token')
      const response = await fetch('/api/admin/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          requestId: selectedRequestId,
          ...data,
        }),
      })

      if (response.ok) {
        toast.success('已开始处理请求')
        fetchData() // 重新获取数据
      } else {
        const error = await response.json()
        throw new Error(error.message || '开始处理失败')
      }
    } catch (error) {
      console.error('开始处理失败:', error)
      throw error // 重新抛出错误让模态框处理
    }
  }

  const updateRequestStatus = async (requestId: string, status: string) => {
    try {
      const token = storage.get('token')
      const response = await fetch(`/api/admin/requests`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ requestId, status }),
      })

      if (response.ok) {
        toast.success('状态更新成功')
        fetchData() // 重新获取数据
      } else {
        throw new Error('更新失败')
      }
    } catch (error) {
      console.error('更新状态失败:', error)
      toast.error('更新状态失败')
    }
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

  const filteredRequests = statusFilter === 'ALL' 
    ? requests 
    : requests.filter(request => request.status === statusFilter)

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-primary-600">
                EasyBFC 管理后台
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">管理员：{user?.name}</span>
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
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <ClockIcon className="w-8 h-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">待处理需求</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {requests.filter(r => r.status === 'PENDING').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <CurrencyDollarIcon className="w-8 h-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">已报价需求</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {requests.filter(r => r.status === 'QUOTED').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <CheckCircleIcon className="w-8 h-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">进行中订单</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {orders.filter(o => ['PAID', 'PURCHASING', 'SHIPPING'].includes(o.orderStatus)).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <XCircleIcon className="w-8 h-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">已完成订单</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {orders.filter(o => o.orderStatus === 'COMPLETED').length}
                </p>
              </div>
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
                用户需求 ({requests.length})
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'orders'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                订单管理 ({orders.length})
              </button>
            </nav>
          </div>
        </div>

        {/* 需求管理 */}
        {activeTab === 'requests' && (
          <div>
            {/* 筛选器 */}
            <div className="mb-6 flex justify-between items-center">
              <div className="flex space-x-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input w-auto"
                >
                  <option value="ALL">全部状态</option>
                  <option value="PENDING">待处理</option>
                  <option value="PROCESSING">处理中</option>
                  <option value="QUOTED">已报价</option>
                  <option value="ACCEPTED">已接受</option>
                  <option value="REJECTED">已拒绝</option>
                  <option value="COMPLETED">已完成</option>
                </select>
              </div>
            </div>
            
            {/* 需求列表 */}
            <div className="space-y-4">
              {filteredRequests.length === 0 ? (
                <div className="text-center py-12">
                  <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">暂无需求</h3>
                  <p className="text-gray-600">当前筛选条件下没有找到需求</p>
                </div>
              ) : (
                filteredRequests.map((request) => (
                  <div key={request.id} className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{request.title}</h3>
                          <span className={getStatusBadge(request.status).className}>
                            {getStatusBadge(request.status).text}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-2">{request.description}</p>
                        {request.productUrl && (
                          <p className="text-sm text-blue-600 mb-2">
                            商品链接: <a href={request.productUrl} target="_blank" rel="noopener noreferrer" className="underline">{request.productUrl}</a>
                          </p>
                        )}
                        <div className="text-sm text-gray-500">
                          <p>用户: {request.user.name} ({request.user.email})</p>
                          <p>提交时间: {new Date(request.createdAt).toLocaleString()}</p>
                          {request.assignedTo && (
                            <p>负责人: {request.assignedTo.name}</p>
                          )}
                          {request.priority && request.priority !== 'NORMAL' && (
                            <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-medium ${
                              request.priority === 'HIGH' 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {request.priority === 'HIGH' ? '高优先级' : '低优先级'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* 图片预览 */}
                    {(() => {
                      const images = parseImages(request.images)
                      return images.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">用户上传的图片:</p>
                          <div className="flex space-x-2">
                            {images.map((image, index) => (
                              <img
                                key={index}
                                src={image}
                                alt={`商品图片 ${index + 1}`}
                                className="w-16 h-16 object-cover rounded border border-gray-200"
                              />
                            ))}
                          </div>
                        </div>
                      )
                    })()}
                    
                    {/* 报价信息 */}
                    {request.quotes.length > 0 && (
                      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">报价记录</h4>
                        {request.quotes.map((quote) => (
                          <div key={quote.id} className="flex justify-between items-center py-2">
                            <div>
                              <span className="font-medium">{quote.productName}</span>
                              <span className="text-sm text-gray-500 ml-2">
                                {new Date(quote.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-lg font-semibold text-primary-600">
                                ¥{quote.totalPrice}
                              </span>
                              <span className={`ml-2 ${getStatusBadge(quote.status).className}`}>
                                {getStatusBadge(quote.status).text}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* 操作按钮 */}
                    <div className="flex justify-end space-x-2">
                      {request.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleStartProcessing(request.id, request.title)}
                            className="btn btn-primary btn-sm"
                          >
                            开始处理
                          </button>
                        </>
                      )}
                      {request.status === 'PROCESSING' && (
                        <Link
                          href={`/admin/quote/${request.id}`}
                          className="btn btn-primary btn-sm"
                        >
                          创建报价
                        </Link>
                      )}
                      <Link
                        href={`/admin/request/${request.id}`}
                        className="btn btn-secondary btn-sm flex items-center"
                      >
                        <EyeIcon className="w-4 h-4 mr-1" />
                        查看详情
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 订单管理 */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">暂无订单</h3>
                <p className="text-gray-600">还没有任何订单</p>
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
                        用户: {order.user.name} ({order.user.email})
                      </p>
                      <p className="text-gray-600">
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
                  
                  <div className="flex justify-end space-x-2">
                    <Link
                      href={`/admin/order/${order.id}`}
                      className="btn btn-secondary btn-sm flex items-center"
                    >
                      <EyeIcon className="w-4 h-4 mr-1" />
                      管理订单
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* 开始处理模态框 */}
      <StartProcessingModal
        isOpen={showProcessingModal}
        onClose={() => {
          setShowProcessingModal(false)
          setSelectedRequestId('')
          setSelectedRequestTitle('')
        }}
        onStartProcessing={handleStartProcessingSubmit}
        requestId={selectedRequestId}
        requestTitle={selectedRequestTitle}
        currentUserId={user?.id || ''}
        availableAdmins={availableAdmins}
      />
    </div>
  )
}