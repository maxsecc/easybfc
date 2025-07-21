'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, FormField, FormLabel, FormMessage, FormSection, FormActions } from '@/components/ui/Form'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { Order, Shipping } from '@/types'

// 物流表单验证模式
const shippingSchema = z.object({
  carrier: z.string().min(2, { message: '物流公司名称至少需要2个字符' }),
  trackingNumber: z.string().min(5, { message: '物流单号至少需要5个字符' }),
  notes: z.string().optional(),
})

type ShippingFormValues = z.infer<typeof shippingSchema>

interface ShippingFormProps {
  order: Order
  shipping?: Shipping
  onSubmit: (orderId: string, data: ShippingFormValues) => void
  onCancel: () => void
  isSubmitting?: boolean
}

export function ShippingForm({
  order,
  shipping,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: ShippingFormProps) {
  // 设置默认值
  const defaultValues: ShippingFormValues = {
    carrier: shipping?.carrier || '',
    trackingNumber: shipping?.trackingNumber || '',
    notes: shipping?.notes || '',
  }

  const form = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingSchema),
    defaultValues,
  })

  const { handleSubmit } = form

  // 提交表单
  const onFormSubmit = (data: ShippingFormValues) => {
    onSubmit(order.id, data)
  }

  return (
    <Form
      form={form}
      onSubmit={handleSubmit(onFormSubmit)}
      className="space-y-6"
    >
      <FormSection title="物流信息" description="请填写物流发货的详细信息">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            name="carrier"
            render={({ field }) => (
              <div>
                <FormLabel required>物流公司</FormLabel>
                <Input
                  {...field}
                  placeholder="请输入物流公司名称"
                />
                <FormMessage />
              </div>
            )}
          />

          <FormField
            name="trackingNumber"
            render={({ field }) => (
              <div>
                <FormLabel required>物流单号</FormLabel>
                <Input
                  {...field}
                  placeholder="请输入物流单号"
                />
                <FormMessage />
              </div>
            )}
          />
        </div>

        <FormField
          name="notes"
          render={({ field }) => (
            <div>
              <FormLabel>备注</FormLabel>
              <Textarea
                {...field}
                placeholder="请输入物流备注信息（可选）"
                rows={4}
              />
              <FormMessage />
            </div>
          )}
        />
      </FormSection>

      <FormActions>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '提交中...' : shipping ? '更新物流信息' : '创建物流信息'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
      </FormActions>
    </Form>
  )
}