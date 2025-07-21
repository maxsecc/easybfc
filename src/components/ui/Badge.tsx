import React from 'react'
import { cn } from '@/utils'
import { RequestStatus, QuoteStatus, OrderStatus, ShippingStatus } from '@/types'

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center rounded-full font-medium'
    
    const variantClasses = {
      default: 'bg-gray-100 text-gray-800',
      secondary: 'bg-gray-100 text-gray-600',
      success: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      danger: 'bg-red-100 text-red-800',
      info: 'bg-blue-100 text-blue-800',
    }
    
    const sizeClasses = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-2.5 py-0.5 text-sm',
      lg: 'px-3 py-1 text-base',
    }
    
    return (
      <div
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Badge.displayName = 'Badge'

// 状态徽章组件
interface StatusBadgeProps {
  status: RequestStatus | QuoteStatus | OrderStatus | ShippingStatus
  className?: string
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      // 请求状态
      case 'PENDING':
        return { variant: 'warning' as const, text: '待处理' }
      case 'REVIEWING':
        return { variant: 'info' as const, text: '审核中' }
      case 'QUOTED':
        return { variant: 'info' as const, text: '已报价' }
      case 'PAID':
        return { variant: 'success' as const, text: '已支付' }
      case 'PROCESSING':
        return { variant: 'info' as const, text: '处理中' }
      case 'SHIPPED':
        return { variant: 'info' as const, text: '已发货' }
      case 'COMPLETED':
        return { variant: 'success' as const, text: '已完成' }
      case 'CANCELLED':
        return { variant: 'danger' as const, text: '已取消' }
      
      // 报价状态
      case 'ACCEPTED':
        return { variant: 'success' as const, text: '已接受' }
      case 'REJECTED':
        return { variant: 'danger' as const, text: '已拒绝' }
      case 'EXPIRED':
        return { variant: 'secondary' as const, text: '已过期' }
      
      // 订单状态
      case 'DELIVERED':
        return { variant: 'success' as const, text: '已送达' }
      
      // 物流状态
      case 'PICKED_UP':
        return { variant: 'info' as const, text: '已揽收' }
      case 'IN_TRANSIT':
        return { variant: 'info' as const, text: '运输中' }
      case 'OUT_FOR_DELIVERY':
        return { variant: 'warning' as const, text: '派送中' }
      case 'EXCEPTION':
        return { variant: 'danger' as const, text: '异常' }
      
      default:
        return { variant: 'default' as const, text: status }
    }
  }
  
  const config = getStatusConfig(status)
  
  return (
    <Badge variant={config.variant} className={className}>
      {config.text}
    </Badge>
  )
}

export { Badge, StatusBadge }