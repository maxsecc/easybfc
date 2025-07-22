// 用户相关类型
export interface User {
  id: string
  name: string
  email: string
  role: 'USER' | 'ADMIN'
  createdAt: Date
  updatedAt: Date
}

// 请求相关类型
export interface Request {
  id: string
  userId: string
  title: string
  productUrl?: string
  description: string
  images: string[]
  status: RequestStatus
  priority: RequestPriority
  assignedToId?: string
  processingNotes?: string
  estimatedDate?: Date
  processedAt?: Date
  createdAt: Date
  updatedAt: Date
  user?: User
  assignedTo?: User
  quotes?: Quote[]
  orders?: Order[]
  activities?: RequestActivity[]
}

export type RequestStatus = 
  | 'PENDING'     // 待处理
  | 'REVIEWING'   // 审核中
  | 'QUOTED'      // 已报价
  | 'PAID'        // 已支付
  | 'PROCESSING'  // 处理中
  | 'SHIPPED'     // 已发货
  | 'COMPLETED'   // 已完成
  | 'CANCELLED'   // 已取消

export type RequestPriority = 
  | 'HIGH'        // 高优先级
  | 'NORMAL'      // 普通优先级
  | 'LOW'         // 低优先级

// 请求活动类型
export interface RequestActivity {
  id: string
  requestId: string
  userId: string
  type: RequestActivityType
  title: string
  content?: string
  metadata?: string
  createdAt: Date
  user?: User
}

export type RequestActivityType = 
  | 'STATUS_CHANGE'   // 状态变更
  | 'NOTE_ADDED'      // 添加备注
  | 'ASSIGNED'        // 任务分配
  | 'QUOTE_CREATED'   // 创建报价
  | 'ORDER_CREATED'   // 创建订单
  | 'PRIORITY_CHANGED' // 优先级变更
  | 'USER_MESSAGE'    // 用户留言
  | 'ADMIN_MESSAGE'   // 管理员备注

// 报价相关类型
export interface Quote {
  id: string
  requestId: string
  productPrice: number
  serviceFee: number
  shippingFee: number
  totalPrice: number
  notes: string
  status: QuoteStatus
  createdAt: Date
  updatedAt: Date
  request?: Request
}

export type QuoteStatus = 
  | 'PENDING'   // 待处理
  | 'ACCEPTED'  // 已接受
  | 'REJECTED'  // 已拒绝
  | 'EXPIRED'   // 已过期

// 订单相关类型
export interface Order {
  id: string
  quoteId: string
  totalAmount: number
  shippingAddress: string // JSON字符串
  status: OrderStatus
  createdAt: Date
  updatedAt: Date
  quote?: Quote
  shipping?: Shipping
}

export type OrderStatus = 
  | 'PENDING'     // 待支付
  | 'PAID'        // 已支付
  | 'PROCESSING'  // 处理中
  | 'SHIPPED'     // 已发货
  | 'DELIVERED'   // 已送达
  | 'CANCELLED'   // 已取消

// 物流相关类型
export interface Shipping {
  id: string
  orderId: string
  carrier: string
  trackingNumber: string
  status: ShippingStatus
  estimatedDelivery?: Date
  actualDelivery?: Date
  notes: string
  createdAt: Date
  updatedAt: Date
  order?: Order
}

export type ShippingStatus = 
  | 'PENDING'           // 待发货
  | 'PICKED_UP'         // 已揽收
  | 'IN_TRANSIT'        // 运输中
  | 'OUT_FOR_DELIVERY'  // 派送中
  | 'DELIVERED'         // 已送达
  | 'EXCEPTION'         // 异常

// 收货地址类型
export interface ShippingAddress {
  name: string
  phone: string
  address: string
  city: string
  state: string
  country: string
  zipCode: string
}

// API响应类型
export interface ApiResponse<T = any> {
  message: string
  data?: T
  errors?: Array<{
    field: string
    message: string
  }>
}

// 分页类型
export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: Pagination
}

// 表单类型
export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  name: string
  email: string
  password: string
}

export interface RequestForm {
  productUrl?: string
  description: string
  images?: FileList
}

export interface QuoteForm {
  requestId: string
  productPrice: number
  serviceFee: number
  shippingFee: number
  notes?: string
}

export interface OrderForm {
  quoteId: string
  shippingAddress: ShippingAddress
}

export interface ShippingForm {
  orderId: string
  carrier: string
  trackingNumber: string
  estimatedDelivery?: string
  notes?: string
}

// 状态映射
export const REQUEST_STATUS_MAP: Record<RequestStatus, string> = {
  PENDING: '待处理',
  REVIEWING: '审核中',
  QUOTED: '已报价',
  PAID: '已支付',
  PROCESSING: '处理中',
  SHIPPED: '已发货',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
}

export const QUOTE_STATUS_MAP: Record<QuoteStatus, string> = {
  PENDING: '待处理',
  ACCEPTED: '已接受',
  REJECTED: '已拒绝',
  EXPIRED: '已过期',
}

export const ORDER_STATUS_MAP: Record<OrderStatus, string> = {
  PENDING: '待支付',
  PAID: '已支付',
  PROCESSING: '处理中',
  SHIPPED: '已发货',
  DELIVERED: '已送达',
  CANCELLED: '已取消',
}

export const SHIPPING_STATUS_MAP: Record<ShippingStatus, string> = {
  PENDING: '待发货',
  PICKED_UP: '已揽收',
  IN_TRANSIT: '运输中',
  OUT_FOR_DELIVERY: '派送中',
  DELIVERED: '已送达',
  EXCEPTION: '异常',
}

export const REQUEST_PRIORITY_MAP: Record<RequestPriority, string> = {
  HIGH: '高优先级',
  NORMAL: '普通',
  LOW: '低优先级',
}

export const REQUEST_ACTIVITY_TYPE_MAP: Record<RequestActivityType, string> = {
  STATUS_CHANGE: '状态变更',
  NOTE_ADDED: '添加备注',
  ASSIGNED: '任务分配',
  QUOTE_CREATED: '创建报价',
  ORDER_CREATED: '创建订单',
  PRIORITY_CHANGED: '优先级变更',
  USER_MESSAGE: '用户留言',
  ADMIN_MESSAGE: '管理员备注',
}