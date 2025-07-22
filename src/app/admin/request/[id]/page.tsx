'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { StartProcessingModal } from '@/components/StartProcessingModal'
import { 
  ArrowLeftIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  EyeIcon,
  PencilIcon,
  DocumentTextIcon,
  PhotoIcon
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { storage } from '@/utils'
import { useAuth } from '@/contexts/AuthContext'

interface Request {
  id: string
  title: string
  description: string
  productUrl?: string
  images?: string
  status: string
  priority?: string
  assignedToId?: string
  processingNotes?: string
  estimatedDate?: string
  processedAt?: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string
    email: string
  }
  assignedTo?: {
    id: string
    name: string
    email: string
  }
  quotes: Quote[]
  orders: Order[]
  activities?: RequestActivity[]
}

interface RequestActivity {
  id: string
  type: string
  title: string
  content?: string
  createdAt: string
  user: {
    id: string
    name: string
  }
}

interface Quote {
  id: string
  productName: string
  productPrice: number
  quantity: number
  serviceFee: number
  totalPrice: number
  status: string
  validUntil: string
  notes?: string
  createdAt: string
}

interface Order {
  id: string
  orderNumber: string
  totalAmount: number
  paymentStatus: string
  orderStatus: string
  createdAt: string
  shipping?: {
    id: string
    trackingNumber?: string
    carrier?: string
    status: string
  }
}

export default function AdminRequestDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [request, setRequest] = useState<Request | null>(null)
  const [loading, setLoading] = useState(true)
  const [showProcessingModal, setShowProcessingModal] = useState(false)
  const [availableAdmins, setAvailableAdmins] = useState<Array<{ id: string; name: string }>>([])

  useEffect(() => {
    checkAuth()
    fetchRequestDetail()
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

  const handleStartProcessing = () => {
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
          requestId: request?.id,
          ...data,
        }),
      })

      if (response.ok) {
        toast.success('已开始处理请求')
        fetchRequestDetail() // 重新获取数据
      } else {
        const error = await response.json()
        throw new Error(error.message || '开始处理失败')
      }
    } catch (error) {
      console.error('开始处理失败:', error)
      throw error // 重新抛出错误让模态框处理
    }
  }

  const updateRequestStatus = async (status: string) => {
    if (!request) return

    try {
      const token = storage.get('token')
      const response = await fetch('/api/admin/requests', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ requestId: request.id, status }),
      })

      if (response.ok) {
        toast.success('状态更新成功')
        fetchRequestDetail() // 重新获取数据
      } else {
        toast.error('状态更新失败')
      }
    } catch (error) {
      console.error('更新状态失败:', error)
      toast.error('状态更新失败')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { text: string; className: string } } = {
      PENDING: { text: '待处理', className: 'bg-yellow-100 text-yellow-800' },
      PROCESSING: { text: '处理中', className: 'bg-blue-100 text-blue-800' },
      QUOTED: { text: '已报价', className: 'bg-green-100 text-green-800' },
      ACCEPTED: { text: '已接受', className: 'bg-green-100 text-green-800' },
      REJECTED: { text: '已拒绝', className: 'bg-red-100 text-red-800' },
      COMPLETED: { text: '已完成', className: 'bg-gray-100 text-gray-800' },
      PAID: { text: '已支付', className: 'bg-green-100 text-green-800' },
      SHIPPING: { text: '发货中', className: 'bg-blue-100 text-blue-800' },
      DELIVERED: { text: '已送达', className: 'bg-green-100 text-green-800' },
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
                href="/admin"
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                返回管理后台
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">请求详情</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 主要内容 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 请求基本信息 */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>请求信息</CardTitle>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(request.status).className}`}>
                    {getStatusBadge(request.status).text}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {request.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {request.description}
                  </p>
                </div>

                {request.productUrl && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">商品链接</h4>
                    <a
                      href={request.productUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:underline break-all"
                    >
                      {request.productUrl}
                    </a>
                  </div>
                )}

                {images.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">用户上传的图片</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`商品图片 ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded-lg flex items-center justify-center">
                            <EyeIcon className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                  <div>
                    <span className="font-medium">提交时间:</span>
                    <br />
                    {new Date(request.createdAt).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">最后更新:</span>
                    <br />
                    {new Date(request.updatedAt).toLocaleString()}
                  </div>
                  {request.processedAt && (
                    <div>
                      <span className="font-medium">开始处理时间:</span>
                      <br />
                      {new Date(request.processedAt).toLocaleString()}
                    </div>
                  )}
                  {request.estimatedDate && (
                    <div>
                      <span className="font-medium">预估完成时间:</span>
                      <br />
                      {new Date(request.estimatedDate).toLocaleString()}
                    </div>
                  )}
                </div>

                {/* 处理信息 */}
                {(request.assignedTo || request.processingNotes || request.priority) && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">处理信息</h4>
                    <div className="space-y-2 text-sm">
                      {request.assignedTo && (
                        <div>
                          <span className="text-blue-700">负责人:</span>
                          <span className="ml-2 text-blue-900 font-medium">{request.assignedTo.name}</span>
                        </div>
                      )}
                      {request.priority && request.priority !== 'NORMAL' && (
                        <div>
                          <span className="text-blue-700">优先级:</span>
                          <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                            request.priority === 'HIGH' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {request.priority === 'HIGH' ? '高优先级' : '低优先级'}
                          </span>
                        </div>
                      )}
                      {request.processingNotes && (
                        <div>
                          <span className="text-blue-700">处理备注:</span>
                          <p className="mt-1 text-blue-900">{request.processingNotes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 报价记录 */}
            {request.quotes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>报价记录</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {request.quotes.map((quote) => (
                      <div key={quote.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-semibold text-gray-900">{quote.productName}</h4>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(quote.status).className}`}>
                            {getStatusBadge(quote.status).text}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">商品价格:</span>
                            <p className="font-semibold">¥{quote.productPrice}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">数量:</span>
                            <p className="font-semibold">{quote.quantity}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">服务费:</span>
                            <p className="font-semibold">¥{quote.serviceFee}</p>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
                          <div>
                            <span className="text-gray-500">总金额:</span>
                            <span className="text-lg font-bold text-primary-600 ml-2">¥{quote.totalPrice}</span>
                          </div>
                          <div className="text-sm text-gray-500">
                            有效期至: {new Date(quote.validUntil).toLocaleDateString()}
                          </div>
                        </div>
                        {quote.notes && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <span className="text-gray-500 text-sm">备注:</span>
                            <p className="mt-1 text-sm text-gray-700">{quote.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 订单记录 */}
            {request.orders.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>订单记录</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {request.orders.map((order) => (
                      <div key={order.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900">订单号: {order.orderNumber}</h4>
                            <p className="text-lg font-bold text-primary-600 mt-1">¥{order.totalAmount}</p>
                          </div>
                          <div className="text-right space-y-1">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(order.paymentStatus).className}`}>
                              {getStatusBadge(order.paymentStatus).text}
                            </span>
                            <br />
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(order.orderStatus).className}`}>
                              {getStatusBadge(order.orderStatus).text}
                            </span>
                          </div>
                        </div>
                        {order.shipping && (
                          <div className="mt-3 pt-3 border-t border-gray-200 text-sm">
                            <div className="grid grid-cols-2 gap-4">
                              {order.shipping.trackingNumber && (
                                <div>
                                  <span className="text-gray-500">快递单号:</span>
                                  <p className="font-semibold">{order.shipping.trackingNumber}</p>
                                </div>
                              )}
                              {order.shipping.carrier && (
                                <div>
                                  <span className="text-gray-500">快递公司:</span>
                                  <p className="font-semibold">{order.shipping.carrier}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        <div className="mt-3 pt-3 border-t border-gray-200 text-sm text-gray-500">
                          创建时间: {new Date(order.createdAt).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 活动记录 */}
            {request.activities && request.activities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>处理记录</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {request.activities.map((activity) => (
                      <div key={activity.id} className="flex space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="text-sm font-medium text-gray-900">{activity.title}</h4>
                            <span className="text-xs text-gray-500">
                              {activity.user.name}
                            </span>
                          </div>
                          {activity.content && (
                            <p className="text-sm text-gray-700 mb-2">{activity.content}</p>
                          )}
                          <p className="text-xs text-gray-500">
                            {new Date(activity.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 侧边栏 */}
          <div className="space-y-6">
            {/* 用户信息 */}
            <Card>
              <CardHeader>
                <CardTitle>用户信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-gray-500 text-sm">用户姓名:</span>
                  <p className="font-semibold">{request.user.name}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">邮箱地址:</span>
                  <p className="font-semibold">{request.user.email}</p>
                </div>
              </CardContent>
            </Card>

            {/* 操作按钮 */}
            <Card>
              <CardHeader>
                <CardTitle>操作</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {request.status === 'PENDING' && (
                  <Button
                    onClick={handleStartProcessing}
                    className="w-full"
                  >
                    开始处理
                  </Button>
                )}
                {request.status === 'PROCESSING' && (
                  <Link
                    href={`/admin/quote/${request.id}`}
                    className="block w-full"
                  >
                    <Button className="w-full">
                      创建报价
                    </Button>
                  </Link>
                )}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.print()}
                >
                  <DocumentTextIcon className="w-4 h-4 mr-2" />
                  打印详情
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* 开始处理模态框 */}
      <StartProcessingModal
        isOpen={showProcessingModal}
        onClose={() => setShowProcessingModal(false)}
        onStartProcessing={handleStartProcessingSubmit}
        requestId={request?.id || ''}
        requestTitle={request?.title || ''}
        currentUserId={user?.id || ''}
        availableAdmins={availableAdmins}
      />
    </div>
  )
}