'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, FormField, FormLabel, FormMessage, FormSection, FormDivider, FormActions } from '@/components/ui/Form'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Quote, Order } from '@/types'

// 订单表单验证模式
const orderSchema = z.object({
  // 收货地址信息
  recipientName: z.string().min(2, { message: '收件人姓名至少需要2个字符' }),
  recipientPhone: z.string().min(11, { message: '请输入有效的手机号码' }),
  province: z.string().min(1, { message: '请选择省份' }),
  city: z.string().min(1, { message: '请选择城市' }),
  district: z.string().min(1, { message: '请选择区/县' }),
  detailAddress: z.string().min(5, { message: '详细地址至少需要5个字符' }),
  postalCode: z.string().min(6, { message: '请输入有效的邮政编码' }),
  
  // 付款信息
  paymentMethod: z.enum(['BANK_TRANSFER', 'ALIPAY', 'WECHAT_PAY']),
  
  // 备注信息
  notes: z.string().optional(),
})

type OrderFormValues = z.infer<typeof orderSchema>

interface OrderFormProps {
  quote: Quote
  order?: Order
  onSubmit: (quoteId: string, data: OrderFormValues) => void
  onCancel: () => void
  isSubmitting?: boolean
}

// 省份列表（示例数据）
const provinces = [
  { value: '北京市', label: '北京市' },
  { value: '上海市', label: '上海市' },
  { value: '广东省', label: '广东省' },
  { value: '江苏省', label: '江苏省' },
  { value: '浙江省', label: '浙江省' },
  // 其他省份...
]

// 支付方式选项
const paymentMethods = [
  { value: 'BANK_TRANSFER', label: '银行转账' },
  { value: 'ALIPAY', label: '支付宝' },
  { value: 'WECHAT_PAY', label: '微信支付' },
]

export function OrderForm({
  quote,
  order,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: OrderFormProps) {
  // 根据省份获取城市列表（示例函数）
  const getCitiesByProvince = (province: string) => {
    // 这里应该根据选择的省份返回对应的城市列表
    // 示例数据
    if (province === '广东省') {
      return [
        { value: '广州市', label: '广州市' },
        { value: '深圳市', label: '深圳市' },
        { value: '东莞市', label: '东莞市' },
        // 其他城市...
      ]
    }
    return []
  }

  // 根据城市获取区县列表（示例函数）
  const getDistrictsByCity = (city: string) => {
    // 这里应该根据选择的城市返回对应的区县列表
    // 示例数据
    if (city === '广州市') {
      return [
        { value: '天河区', label: '天河区' },
        { value: '海珠区', label: '海珠区' },
        { value: '越秀区', label: '越秀区' },
        // 其他区县...
      ]
    }
    return []
  }

  // 设置默认值
  const defaultValues: OrderFormValues = {
    recipientName: order?.shippingAddress?.recipientName || '',
    recipientPhone: order?.shippingAddress?.recipientPhone || '',
    province: order?.shippingAddress?.province || '',
    city: order?.shippingAddress?.city || '',
    district: order?.shippingAddress?.district || '',
    detailAddress: order?.shippingAddress?.detailAddress || '',
    postalCode: order?.shippingAddress?.postalCode || '',
    paymentMethod: order?.paymentMethod || 'BANK_TRANSFER',
    notes: order?.notes || '',
  }

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues,
  })

  const { watch, handleSubmit, setValue } = form
  
  // 监听省份变化，更新城市列表
  const selectedProvince = watch('province')
  const selectedCity = watch('city')
  
  // 当省份变化时，重置城市和区县
  React.useEffect(() => {
    if (selectedProvince) {
      setValue('city', '')
      setValue('district', '')
    }
  }, [selectedProvince, setValue])
  
  // 当城市变化时，重置区县
  React.useEffect(() => {
    if (selectedCity) {
      setValue('district', '')
    }
  }, [selectedCity, setValue])

  // 提交表单
  const onFormSubmit = (data: OrderFormValues) => {
    onSubmit(quote.id, data)
  }

  return (
    <Form
      form={form}
      onSubmit={handleSubmit(onFormSubmit)}
      className="space-y-6"
    >
      <FormSection title="收货地址" description="请填写您的收货地址信息">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            name="recipientName"
            render={({ field }) => (
              <div>
                <FormLabel required>收件人姓名</FormLabel>
                <Input
                  {...field}
                  placeholder="请输入收件人姓名"
                />
                <FormMessage />
              </div>
            )}
          />

          <FormField
            name="recipientPhone"
            render={({ field }) => (
              <div>
                <FormLabel required>联系电话</FormLabel>
                <Input
                  {...field}
                  placeholder="请输入联系电话"
                />
                <FormMessage />
              </div>
            )}
          />

          <FormField
            name="province"
            render={({ field }) => (
              <div>
                <FormLabel required>省份</FormLabel>
                <Select
                  {...field}
                  placeholder="请选择省份"
                  options={provinces}
                />
                <FormMessage />
              </div>
            )}
          />

          <FormField
            name="city"
            render={({ field }) => (
              <div>
                <FormLabel required>城市</FormLabel>
                <Select
                  {...field}
                  placeholder="请选择城市"
                  options={getCitiesByProvince(selectedProvince)}
                  disabled={!selectedProvince}
                />
                <FormMessage />
              </div>
            )}
          />

          <FormField
            name="district"
            render={({ field }) => (
              <div>
                <FormLabel required>区/县</FormLabel>
                <Select
                  {...field}
                  placeholder="请选择区/县"
                  options={getDistrictsByCity(selectedCity)}
                  disabled={!selectedCity}
                />
                <FormMessage />
              </div>
            )}
          />

          <FormField
            name="postalCode"
            render={({ field }) => (
              <div>
                <FormLabel required>邮政编码</FormLabel>
                <Input
                  {...field}
                  placeholder="请输入邮政编码"
                />
                <FormMessage />
              </div>
            )}
          />
        </div>

        <FormField
          name="detailAddress"
          render={({ field }) => (
            <div>
              <FormLabel required>详细地址</FormLabel>
              <Textarea
                {...field}
                placeholder="请输入详细地址，如街道、门牌号等"
                rows={2}
              />
              <FormMessage />
            </div>
          )}
        />
      </FormSection>

      <FormDivider />

      <FormSection title="支付信息" description="请选择您的支付方式">
        <FormField
          name="paymentMethod"
          render={({ field }) => (
            <div>
              <FormLabel required>支付方式</FormLabel>
              <Select
                {...field}
                placeholder="请选择支付方式"
                options={paymentMethods}
              />
              <FormMessage />
            </div>
          )}
        />
      </FormSection>

      <FormDivider />

      <FormSection title="其他信息" description="如有其他需求，请在备注中说明">
        <FormField
          name="notes"
          render={({ field }) => (
            <div>
              <FormLabel>备注</FormLabel>
              <Textarea
                {...field}
                placeholder="请输入备注信息（可选）"
                rows={4}
              />
              <FormMessage />
            </div>
          )}
        />
      </FormSection>

      <FormActions>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '提交中...' : '提交订单'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
      </FormActions>
    </Form>
  )
}