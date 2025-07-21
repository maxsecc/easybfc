'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import { PhotoIcon, LinkIcon, DocumentTextIcon } from '@heroicons/react/24/outline'

// 表单验证模式
const requestSchema = z.object({
  title: z.string().min(5, '标题至少需要5个字符').max(100, '标题不能超过100个字符'),
  description: z.string().min(10, '描述至少需要10个字符').max(2000, '描述不能超过2000个字符'),
  productUrl: z.string().url('请输入有效的URL').optional().or(z.literal('')),
})

type RequestFormValues = z.infer<typeof requestSchema>

export default function NewRequestPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      title: '',
      description: '',
      productUrl: '',
    },
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    // 限制最多5张图片
    if (files.length + selectedImages.length > 5) {
      toast.error('最多只能上传5张图片')
      return
    }
    
    // 检查文件大小（限制每张图片5MB）
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024)
    if (oversizedFiles.length > 0) {
      toast.error('图片大小不能超过5MB')
      return
    }
    
    // 检查文件类型
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    const invalidFiles = files.filter(file => !validTypes.includes(file.type))
    if (invalidFiles.length > 0) {
      toast.error('只支持 JPEG、PNG、GIF、WebP 格式的图片')
      return
    }
    
    setSelectedImages(prev => [...prev, ...files])
    
    // 生成预览
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: RequestFormValues) => {
    setIsLoading(true)
    
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/auth/login')
        return
      }

      // 创建FormData用于文件上传
      const formData = new FormData()
      formData.append('title', data.title)
      formData.append('description', data.description)
      if (data.productUrl) {
        formData.append('productUrl', data.productUrl)
      }
      
      // 添加图片文件
      selectedImages.forEach((file, index) => {
        formData.append(`images`, file)
      })

      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || '提交失败')
      }

      toast.success('需求提交成功！我们会尽快为您处理。')
      router.push('/dashboard')
    } catch (error) {
      console.error('提交错误:', error)
      toast.error(error instanceof Error ? error.message : '提交失败，请稍后再试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-2xl font-bold text-primary-600">
                EasyBFC
              </Link>
            </div>
            <Link href="/dashboard" className="btn btn-secondary">
              返回仪表板
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">提交新的商品需求</h1>
            <p className="mt-1 text-gray-600">
              请详细描述您想要购买的商品，我们会为您找到最优质的产品和价格
            </p>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            {/* 需求标题 */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                需求标题 *
              </label>
              <input
                id="title"
                type="text"
                placeholder="例如：iPhone 15 Pro Max 256GB 深空黑色"
                className={`input ${errors.title ? 'border-red-500 focus:ring-red-500' : ''}`}
                {...register('title')}
                disabled={isLoading}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            {/* 商品链接 */}
            <div>
              <label htmlFor="productUrl" className="block text-sm font-medium text-gray-700 mb-2">
                <LinkIcon className="w-4 h-4 inline mr-1" />
                商品链接（可选）
              </label>
              <input
                id="productUrl"
                type="url"
                placeholder="https://item.taobao.com/item.htm?id=..."
                className={`input ${errors.productUrl ? 'border-red-500 focus:ring-red-500' : ''}`}
                {...register('productUrl')}
                disabled={isLoading}
              />
              {errors.productUrl && (
                <p className="mt-1 text-sm text-red-600">{errors.productUrl.message}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                如果您有具体的商品链接（淘宝、天猫、1688等），请粘贴在这里
              </p>
            </div>

            {/* 商品图片 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <PhotoIcon className="w-4 h-4 inline mr-1" />
                商品图片（可选）
              </label>
              
              <div className="mt-2">
                <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors">
                  <div className="space-y-1 text-center">
                    <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="images"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                      >
                        <span>上传图片</span>
                        <input
                          id="images"
                          name="images"
                          type="file"
                          className="sr-only"
                          multiple
                          accept="image/*"
                          onChange={handleImageChange}
                          disabled={isLoading}
                        />
                      </label>
                      <p className="pl-1">或拖拽到这里</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      支持 PNG、JPG、GIF、WebP 格式，最多5张，每张不超过5MB
                    </p>
                  </div>
                </div>
              </div>
              
              {/* 图片预览 */}
              {imagePreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`预览 ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        disabled={isLoading}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 详细描述 */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                <DocumentTextIcon className="w-4 h-4 inline mr-1" />
                详细描述 *
              </label>
              <textarea
                id="description"
                rows={6}
                placeholder="请详细描述您想要的商品，包括：&#10;- 品牌、型号、规格&#10;- 颜色、尺寸等具体要求&#10;- 数量需求&#10;- 其他特殊要求"
                className={`input resize-none ${errors.description ? 'border-red-500 focus:ring-red-500' : ''}`}
                {...register('description')}
                disabled={isLoading}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                描述越详细，我们越能为您找到合适的商品和优惠的价格
              </p>
            </div>

            {/* 提交按钮 */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Link href="/dashboard" className="btn btn-secondary">
                取消
              </Link>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? '提交中...' : '提交需求'}
              </button>
            </div>
          </form>
        </div>
        
        {/* 提示信息 */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">温馨提示</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 我们会在24小时内为您处理需求并提供报价</li>
            <li>• 报价包含商品价格、服务费和国际运费</li>
            <li>• 您可以在仪表板中查看需求处理进度</li>
            <li>• 如有疑问，请联系客服获取帮助</li>
          </ul>
        </div>
      </div>
    </div>
  )
}