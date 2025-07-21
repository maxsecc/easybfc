'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, FormField, FormLabel, FormMessage, FormSection, FormActions } from '@/components/ui/Form'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { ImageUpload } from '@/components/ImageUpload'
import { isValidUrl } from '@/utils'
import { Request } from '@/types'

// 请求表单验证模式
const requestSchema = z.object({
  productUrl: z
    .string()
    .min(1, { message: '产品链接不能为空' })
    .refine((url) => isValidUrl(url), {
      message: '请输入有效的URL',
    }),
  description: z
    .string()
    .min(10, { message: '产品描述至少需要10个字符' })
    .max(1000, { message: '产品描述最多1000个字符' }),
})

type RequestFormValues = z.infer<typeof requestSchema>

interface RequestFormProps {
  request?: Request
  onSubmit: (data: RequestFormValues, images: string[]) => void
  onCancel: () => void
  isSubmitting?: boolean
}

export function RequestForm({
  request,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: RequestFormProps) {
  // 图片上传状态
  const [images, setImages] = useState<string[]>(request?.images || [])
  const [isUploading, setIsUploading] = useState(false)

  // 设置默认值
  const defaultValues: RequestFormValues = {
    productUrl: request?.productUrl || '',
    description: request?.description || '',
  }

  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema),
    defaultValues,
  })

  const { handleSubmit } = form

  // 处理图片上传
  const handleImagesChange = (newImages: string[]) => {
    setImages(newImages)
  }

  // 处理图片上传状态变化
  const handleUploadingChange = (uploading: boolean) => {
    setIsUploading(uploading)
  }

  // 提交表单
  const onFormSubmit = (data: RequestFormValues) => {
    onSubmit(data, images)
  }

  return (
    <Form
      form={form}
      onSubmit={handleSubmit(onFormSubmit)}
      className="space-y-6"
    >
      <FormSection title="产品信息" description="请填写您想要采购的产品信息">
        <FormField
          name="productUrl"
          render={({ field }) => (
            <div>
              <FormLabel required>产品链接</FormLabel>
              <Input
                {...field}
                placeholder="请输入产品链接，如淘宝、阿里巴巴等电商平台的商品链接"
              />
              <FormMessage />
            </div>
          )}
        />

        <FormField
          name="description"
          render={({ field }) => (
            <div>
              <FormLabel required>产品描述</FormLabel>
              <Textarea
                {...field}
                placeholder="请详细描述您需要的产品，包括规格、数量、颜色等信息"
                rows={5}
              />
              <FormMessage />
            </div>
          )}
        />

        <div>
          <FormLabel>产品图片</FormLabel>
          <div className="mt-1">
            <ImageUpload
              images={images}
              onChange={handleImagesChange}
              onUploadingChange={handleUploadingChange}
              maxImages={5}
              maxSizeMB={5}
              acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            最多上传5张图片，每张图片不超过5MB，支持JPG、PNG、WEBP格式
          </p>
        </div>
      </FormSection>

      <FormActions>
        <Button
          type="submit"
          disabled={isSubmitting || isUploading}
        >
          {isSubmitting
            ? '提交中...'
            : isUploading
            ? '图片上传中...'
            : request
            ? '更新请求'
            : '提交请求'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
      </FormActions>
    </Form>
  )
}