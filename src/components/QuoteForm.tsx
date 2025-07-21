'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, FormField, FormLabel, FormMessage, FormSection, FormActions } from '@/components/ui/Form'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/utils'
import { Request, Quote } from '@/types'

// 报价表单验证模式
const quoteSchema = z.object({
  productPrice: z.coerce
    .number()
    .min(0.01, { message: '产品价格必须大于0' }),
  serviceFee: z.coerce
    .number()
    .min(0, { message: '服务费不能为负数' }),
  shippingFee: z.coerce
    .number()
    .min(0, { message: '运费不能为负数' }),
  taxFee: z.coerce
    .number()
    .min(0, { message: '税费不能为负数' }),
  validDays: z.coerce
    .number()
    .int()
    .min(1, { message: '有效期至少为1天' })
    .max(90, { message: '有效期最多为90天' }),
  notes: z.string().optional(),
})

type QuoteFormValues = z.infer<typeof quoteSchema>

interface QuoteFormProps {
  request: Request
  quote?: Quote
  onSubmit: (requestId: string, data: QuoteFormValues) => void
  onCancel: () => void
  isSubmitting?: boolean
}

export function QuoteForm({
  request,
  quote,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: QuoteFormProps) {
  const [totalPrice, setTotalPrice] = useState<number>(0)

  // 设置默认值
  const defaultValues: QuoteFormValues = {
    productPrice: quote?.productPrice || 0,
    serviceFee: quote?.serviceFee || 0,
    shippingFee: quote?.shippingFee || 0,
    taxFee: quote?.taxFee || 0,
    validDays: quote?.validUntil
      ? Math.ceil(
          (new Date(quote.validUntil).getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 7,
    notes: quote?.notes || '',
  }

  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteSchema),
    defaultValues,
  })

  const { watch, handleSubmit } = form

  // 监听价格变化，计算总价
  const productPrice = watch('productPrice') || 0
  const serviceFee = watch('serviceFee') || 0
  const shippingFee = watch('shippingFee') || 0
  const taxFee = watch('taxFee') || 0

  useEffect(() => {
    const total = productPrice + serviceFee + shippingFee + taxFee
    setTotalPrice(total)
  }, [productPrice, serviceFee, shippingFee, taxFee])

  // 提交表单
  const onFormSubmit = (data: QuoteFormValues) => {
    onSubmit(request.id, data)
  }

  return (
    <Form
      form={form}
      onSubmit={handleSubmit(onFormSubmit)}
      className="space-y-6"
    >
      <FormSection title="报价信息" description="请填写产品报价的详细信息">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            name="productPrice"
            render={({ field }) => (
              <div>
                <FormLabel required>产品价格</FormLabel>
                <Input
                  {...field}
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="请输入产品价格"
                />
                <FormMessage />
              </div>
            )}
          />

          <FormField
            name="serviceFee"
            render={({ field }) => (
              <div>
                <FormLabel required>服务费</FormLabel>
                <Input
                  {...field}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="请输入服务费"
                />
                <FormMessage />
              </div>
            )}
          />

          <FormField
            name="shippingFee"
            render={({ field }) => (
              <div>
                <FormLabel required>运费</FormLabel>
                <Input
                  {...field}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="请输入运费"
                />
                <FormMessage />
              </div>
            )}
          />

          <FormField
            name="taxFee"
            render={({ field }) => (
              <div>
                <FormLabel required>税费</FormLabel>
                <Input
                  {...field}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="请输入税费"
                />
                <FormMessage />
              </div>
            )}
          />

          <FormField
            name="validDays"
            render={({ field }) => (
              <div>
                <FormLabel required>有效期(天)</FormLabel>
                <Input
                  {...field}
                  type="number"
                  min="1"
                  max="90"
                  placeholder="请输入有效期天数"
                />
                <FormMessage />
              </div>
            )}
          />

          <div className="flex items-end">
            <div className="w-full">
              <FormLabel>总价</FormLabel>
              <div className="h-10 px-3 py-2 rounded-md border border-gray-300 bg-gray-100 flex items-center text-lg font-bold text-primary">
                {formatPrice(totalPrice)}
              </div>
            </div>
          </div>
        </div>

        <FormField
          name="notes"
          render={({ field }) => (
            <div className="col-span-full">
              <FormLabel>备注</FormLabel>
              <Textarea
                {...field}
                placeholder="请输入报价备注信息"
                rows={4}
              />
              <FormMessage />
            </div>
          )}
        />
      </FormSection>

      <FormActions>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '提交中...' : quote ? '更新报价' : '创建报价'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
      </FormActions>
    </Form>
  )
}