'use client'

import React from 'react'
import { formatDate, formatPrice } from '@/utils'
import { StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Order, OrderStatus, ShippingStatus } from '@/types'

interface OrderDetailsProps {
  order: Order
  showActions?: boolean
  onUpdateStatus?: (orderId: string, status: OrderStatus) => void
  onCreateShipping?: (orderId: string) => void
}

export function OrderDetails({
  order,
  showActions = false,
  onUpdateStatus,
  onCreateShipping,
}: OrderDetailsProps) {
  // 获取支付方式显示文本
  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'BANK_TRANSFER':
        return '银行转账'
      case 'ALIPAY':
        return '支付宝'
      case 'WECHAT_PAY':
        return '微信支付'
      default:
        return method
    }
  }

  return (
    <div className="space-y-6">
      {/* 订单基本信息 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>订单详情</CardTitle>
            <StatusBadge status={order.status} type="order" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">订单编号</h4>
              <p className="mt-1">{order.id}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">创建时间</h4>
              <p className="mt-1">{formatDate(order.createdAt)}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">更新时间</h4>
              <p className="mt-1">{formatDate(order.updatedAt)}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">支付方式</h4>
              <p className="mt-1">{getPaymentMethodText(order.paymentMethod)}</p>
            </div>
          </div>

          {/* 价格信息 */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-500 mb-2">价格明细</h4>
            <div className="border rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-2 text-sm">产品价格</td>
                    <td className="px-4 py-2 text-sm text-right">
                      {formatPrice(order.quote?.productPrice || 0)}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-sm">服务费</td>
                    <td className="px-4 py-2 text-sm text-right">
                      {formatPrice(order.quote?.serviceFee || 0)}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-sm">运费</td>
                    <td className="px-4 py-2 text-sm text-right">
                      {formatPrice(order.quote?.shippingFee || 0)}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-sm">税费</td>
                    <td className="px-4 py-2 text-sm text-right">
                      {formatPrice(order.quote?.taxFee || 0)}
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-4 py-2 font-medium">总价</td>
                    <td className="px-4 py-2 font-medium text-right text-primary">
                      {formatPrice(order.totalAmount)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 收货地址 */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-500 mb-2">收货地址</h4>
            <div className="border rounded-md p-4">
              <p className="font-medium">
                {order.shippingAddress?.recipientName} {order.shippingAddress?.recipientPhone}
              </p>
              <p className="mt-1 text-gray-600">
                {order.shippingAddress?.province} {order.shippingAddress?.city} {order.shippingAddress?.district}
              </p>
              <p className="mt-1 text-gray-600">
                {order.shippingAddress?.detailAddress}
              </p>
              <p className="mt-1 text-gray-600">
                邮编: {order.shippingAddress?.postalCode}
              </p>
            </div>
          </div>

          {/* 备注 */}
          {order.notes && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-500">备注</h4>
              <p className="mt-1 whitespace-pre-line">{order.notes}</p>
            </div>
          )}

          {/* 管理员操作按钮 */}
          {showActions && onUpdateStatus && (
            <div className="mt-6 flex flex-wrap gap-2">
              {order.status === 'PENDING' && (
                <>
                  <Button
                    onClick={() => onUpdateStatus(order.id, 'PROCESSING')}
                    size="sm"
                  >
                    开始处理
                  </Button>
                  <Button
                    onClick={() => onUpdateStatus(order.id, 'CANCELLED')}
                    variant="outline"
                    size="sm"
                  >
                    取消订单
                  </Button>
                </>
              )}
              {order.status === 'PROCESSING' && (
                <>
                  <Button
                    onClick={() => onUpdateStatus(order.id, 'PAID')}
                    size="sm"
                  >
                    标记为已支付
                  </Button>
                  <Button
                    onClick={() => onUpdateStatus(order.id, 'CANCELLED')}
                    variant="outline"
                    size="sm"
                  >
                    取消订单
                  </Button>
                </>
              )}
              {order.status === 'PAID' && onCreateShipping && !order.shipping && (
                <Button
                  onClick={() => onCreateShipping(order.id)}
                  size="sm"
                >
                  创建物流信息
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 物流信息 */}
      {order.shipping && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>物流信息</CardTitle>
              <StatusBadge status={order.shipping.status} type="shipping" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">物流单号</h4>
                <p className="mt-1">{order.shipping.trackingNumber}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">物流公司</h4>
                <p className="mt-1">{order.shipping.carrier}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">发货时间</h4>
                <p className="mt-1">{formatDate(order.shipping.shippedAt)}</p>
              </div>
              {order.shipping.deliveredAt && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">送达时间</h4>
                  <p className="mt-1">{formatDate(order.shipping.deliveredAt)}</p>
                </div>
              )}
            </div>

            {/* 物流备注 */}
            {order.shipping.notes && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-500">物流备注</h4>
                <p className="mt-1 whitespace-pre-line">{order.shipping.notes}</p>
              </div>
            )}

            {/* 管理员操作按钮 - 物流状态更新 */}
            {showActions && order.shipping.status === 'SHIPPED' && (
              <div className="mt-6">
                <Button
                  onClick={() =>
                    onUpdateStatus && onUpdateStatus(order.id, 'DELIVERED')
                  }
                  size="sm"
                >
                  标记为已送达
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}