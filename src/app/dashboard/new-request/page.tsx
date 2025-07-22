'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import { PhotoIcon, LinkIcon, DocumentTextIcon, ArrowLeftIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Label } from '@/components/ui/label'
import { storage } from '@/utils'

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
      const token = storage.get('token')
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard">
                  <ArrowLeftIcon className="w-4 h-4 mr-2" />
                  返回
                </Link>
              </Button>
              <div className="h-6 w-px bg-border"></div>
              <Link href="/dashboard" className="text-xl font-bold text-primary">
                EasyBFC
              </Link>
            </div>
            <Button asChild variant="outline">
              <Link href="/dashboard">
                仪表板
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">提交新的商品需求</h1>
          <p className="text-muted-foreground">
            请详细描述您想要购买的商品，我们的专业团队会为您找到最优质的产品和价格
          </p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center">
              <DocumentTextIcon className="w-5 h-5 mr-2" />
              需求详情
            </CardTitle>
            <CardDescription>
              填写详细信息有助于我们为您提供更精准的服务
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* 需求标题 */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  需求标题 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="例如：iPhone 15 Pro Max 256GB 深空黑色"
                  className={errors.title ? "border-destructive" : ""}
                  {...register('title')}
                  disabled={isLoading}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>

              {/* 商品链接 */}
              <div className="space-y-2">
                <Label htmlFor="productUrl" className="flex items-center">
                  <LinkIcon className="w-4 h-4 mr-2" />
                  商品链接（可选）
                </Label>
                <Input
                  id="productUrl"
                  type="url"
                  placeholder="https://item.taobao.com/item.htm?id=..."
                  className={errors.productUrl ? "border-destructive" : ""}
                  {...register('productUrl')}
                  disabled={isLoading}
                />
                {errors.productUrl && (
                  <p className="text-sm text-destructive">{errors.productUrl.message}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  如果您有具体的商品链接（淘宝、天猫、1688等），请粘贴在这里
                </p>
              </div>

              {/* 商品图片 */}
              <div className="space-y-4">
                <Label className="flex items-center">
                  <PhotoIcon className="w-4 h-4 mr-2" />
                  商品图片（可选）
                </Label>
                
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg hover:border-muted-foreground/50 transition-colors">
                  <div className="flex justify-center px-6 py-8">
                    <div className="space-y-2 text-center">
                      <PhotoIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                      <div className="flex text-sm text-muted-foreground">
                        <label
                          htmlFor="images"
                          className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
                        >
                          <span>点击上传图片</span>
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
                        <span className="pl-1">或拖拽到这里</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        支持 PNG、JPG、GIF、WebP 格式，最多5张，每张不超过5MB
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* 图片预览 */}
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`预览 ${index + 1}`}
                          className="w-full h-24 object-cover rounded-md border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index)}
                          disabled={isLoading}
                        >
                          <XMarkIcon className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 详细描述 */}
              <div className="space-y-2">
                <Label htmlFor="description" className="flex items-center">
                  <DocumentTextIcon className="w-4 h-4 mr-2" />
                  详细描述 <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  rows={6}
                  placeholder="请详细描述您想要的商品，包括：&#10;- 品牌、型号、规格&#10;- 颜色、尺寸等具体要求&#10;- 数量需求&#10;- 其他特殊要求"
                  className={`resize-none ${errors.description ? 'border-destructive' : ''}`}
                  {...register('description')}
                  disabled={isLoading}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description.message}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  描述越详细，我们越能为您找到合适的商品和优惠的价格
                </p>
              </div>

              {/* 提交按钮 */}
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-4 pt-6 border-t">
                <Button asChild variant="outline" className="sm:w-auto">
                  <Link href="/dashboard">
                    取消
                  </Link>
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="sm:w-auto"
                >
                  {isLoading ? '提交中...' : '提交需求'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        {/* 提示信息 */}
        <Card className="mt-8 bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <h3 className="font-medium text-primary mb-3 flex items-center">
              💡 温馨提示
            </h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                我们会在24小时内为您处理需求并提供报价
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                报价包含商品价格、服务费和国际运费
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                您可以在仪表板中查看需求处理进度
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                如有疑问，请联系客服获取帮助
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}