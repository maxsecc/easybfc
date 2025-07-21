'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { formatDate, formatPrice } from '@/utils'
import { StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/Modal'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Request, Quote, RequestStatus } from '@/types'

interface RequestDetailsProps {
  request: Request
  quote?: Quote
  showActions?: boolean
  onAcceptQuote?: (quoteId: string) => void
  onRejectQuote?: (quoteId: string) => void
  onUpdateStatus?: (requestId: string, status: RequestStatus) => void
  onCreateQuote?: (requestId: string) => void
}

export function RequestDetails({
  request,
  quote,
  showActions = false,
  onAcceptQuote,
  onRejectQuote,
  onUpdateStatus,
  onCreateQuote,
}: RequestDetailsProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  // 处理图片点击，打开大图预览
  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl)
  }

  // 关闭图片预览
  const handleClosePreview = () => {
    setSelectedImage(null)
  }

  return (
    <div className="space-y-6">
      {/* 请求基本信息 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>请求详情</CardTitle>
            <StatusBadge status={request.status} type="request" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">请求编号</h4>
              <p className="mt-1">{request.id}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">创建时间</h4>
              <p className="mt-1">{formatDate(request.createdAt)}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">更新时间</h4>
              <p className="mt-1">{formatDate(request.updatedAt)}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">用户</h4>
              <p className="mt-1">{request.user?.name || '未知用户'}</p>
            </div>
          </div>

          {/* 产品链接 */}
          {request.productUrl && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-500">产品链接</h4>
              <a
                href={request.productUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 text-primary hover:underline block break-all"
              >
                {request.productUrl}
              </a>
            </div>
          )}

          {/* 产品描述 */}
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-500">产品描述</h4>
            <p className="mt-1 whitespace-pre-line">{request.description}</p>
          </div>

          {/* 产品图片 */}
          {request.images && request.images.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-500">产品图片</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-2">
                {request.images.map((image, index) => (
                  <div
                    key={index}
                    className="relative aspect-square rounded-md overflow-hidden border border-gray-200 cursor-pointer"
                    onClick={() => handleImageClick(image)}
                  >
                    <Image
                      src={image}
                      alt={`产品图片 ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 管理员操作按钮 */}
          {showActions && onUpdateStatus && (
            <div className="mt-6 flex flex-wrap gap-2">
              {request.status === 'PENDING' && (
                <>
                  <Button
                    onClick={() => onUpdateStatus(request.id, 'PROCESSING')}
                    size="sm"
                  >
                    开始处理
                  </Button>
                  <Button
                    onClick={() => onUpdateStatus(request.id, 'REJECTED')}
                    variant="outline"
                    size="sm"
                  >
                    拒绝请求
                  </Button>
                </>
              )}
              {request.status === 'PROCESSING' && !quote && onCreateQuote && (
                <Button onClick={() => onCreateQuote(request.id)} size="sm">
                  创建报价
                </Button>
              )}
              {request.status === 'PROCESSING' && (
                <Button
                  onClick={() => onUpdateStatus(request.id, 'CANCELLED')}
                  variant="outline"
                  size="sm"
                >
                  取消请求
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 报价信息 */}
      {quote && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>报价信息</CardTitle>
              <StatusBadge status={quote.status} type="quote" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">报价编号</h4>
                <p className="mt-1">{quote.id}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">创建时间</h4>
                <p className="mt-1">{formatDate(quote.createdAt)}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">有效期至</h4>
                <p className="mt-1">{formatDate(quote.validUntil)}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">产品价格</h4>
                <p className="mt-1">{formatPrice(quote.productPrice)}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">服务费</h4>
                <p className="mt-1">{formatPrice(quote.serviceFee)}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">运费</h4>
                <p className="mt-1">{formatPrice(quote.shippingFee)}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">税费</h4>
                <p className="mt-1">{formatPrice(quote.taxFee)}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 text-lg font-bold">总价</h4>
                <p className="mt-1 text-lg font-bold text-primary">
                  {formatPrice(quote.totalPrice)}
                </p>
              </div>
            </div>

            {/* 备注 */}
            {quote.notes && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-500">备注</h4>
                <p className="mt-1 whitespace-pre-line">{quote.notes}</p>
              </div>
            )}

            {/* 用户操作按钮 */}
            {showActions && quote.status === 'PENDING' && onAcceptQuote && onRejectQuote && (
              <div className="mt-6 flex flex-wrap gap-2">
                <Button onClick={() => onAcceptQuote(quote.id)}>
                  接受报价
                </Button>
                <Button
                  onClick={() => onRejectQuote(quote.id)}
                  variant="outline"
                >
                  拒绝报价
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 图片预览模态框 */}
      <Modal
        isOpen={!!selectedImage}
        onClose={handleClosePreview}
        size="lg"
      >
        <ModalBody className="p-0">
          {selectedImage && (
            <div className="relative w-full h-[80vh]">
              <Image
                src={selectedImage}
                alt="产品图片预览"
                fill
                className="object-contain"
              />
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button onClick={handleClosePreview}>关闭</Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}