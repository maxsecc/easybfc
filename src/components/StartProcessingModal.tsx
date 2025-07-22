'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import { 
  XMarkIcon, 
  CalendarIcon, 
  UserIcon, 
  ExclamationTriangleIcon,
  ChatBubbleLeftIcon 
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Label } from '@/components/ui/label'
import { storage } from '@/utils'

// 表单验证模式
const startProcessingSchema = z.object({
  assignedToId: z.string().optional(),
  priority: z.enum(['HIGH', 'NORMAL', 'LOW']),
  processingNotes: z.string().min(1, '处理备注不能为空').max(500, '备注不能超过500字符'),
  estimatedDays: z.number().min(1, '预估天数至少为1天').max(30, '预估天数不能超过30天'),
})

type StartProcessingFormValues = z.infer<typeof startProcessingSchema>

interface StartProcessingModalProps {
  isOpen: boolean
  onClose: () => void
  onStartProcessing: (data: StartProcessingFormValues) => Promise<void>
  requestId: string
  requestTitle: string
  currentUserId: string
  availableAdmins?: Array<{ id: string; name: string }>
}

export function StartProcessingModal({
  isOpen,
  onClose,
  onStartProcessing,
  requestId,
  requestTitle,
  currentUserId,
  availableAdmins = []
}: StartProcessingModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<StartProcessingFormValues>({
    resolver: zodResolver(startProcessingSchema),
    defaultValues: {
      assignedToId: currentUserId,
      priority: 'NORMAL',
      processingNotes: '',
      estimatedDays: 3,
    },
  })

  const priority = watch('priority')

  const onSubmit = async (data: StartProcessingFormValues) => {
    setIsSubmitting(true)
    try {
      await onStartProcessing(data)
      reset()
      onClose()
      toast.success('已开始处理请求')
    } catch (error) {
      console.error('开始处理失败:', error)
      toast.error(error instanceof Error ? error.message : '开始处理失败')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'LOW':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      default:
        return 'text-green-600 bg-green-50 border-green-200'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return <ExclamationTriangleIcon className="w-4 h-4" />
      case 'LOW':
        return <ChatBubbleLeftIcon className="w-4 h-4" />
      default:
        return <UserIcon className="w-4 h-4" />
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* 背景遮罩 */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* 居中trick */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        {/* 模态框 */}
        <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  开始处理请求
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {requestTitle}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* 分配给 */}
              <div>
                <Label htmlFor="assignedToId">分配给</Label>
                <select
                  id="assignedToId"
                  {...register('assignedToId')}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                >
                  <option value={currentUserId}>我自己</option>
                  {availableAdmins
                    .filter(admin => admin.id !== currentUserId)
                    .map(admin => (
                      <option key={admin.id} value={admin.id}>
                        {admin.name}
                      </option>
                    ))}
                </select>
                {errors.assignedToId && (
                  <p className="mt-1 text-sm text-red-600">{errors.assignedToId.message}</p>
                )}
              </div>

              {/* 优先级 */}
              <div>
                <Label>优先级</Label>
                <div className="mt-2 space-y-2">
                  {['HIGH', 'NORMAL', 'LOW'].map((priorityOption) => (
                    <label
                      key={priorityOption}
                      className={`relative flex cursor-pointer rounded-lg border p-3 focus:outline-none ${
                        priority === priorityOption
                          ? getPriorityColor(priorityOption)
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        {...register('priority')}
                        value={priorityOption}
                        className="sr-only"
                      />
                      <div className="flex items-center">
                        <div className="flex items-center space-x-2">
                          {getPriorityIcon(priorityOption)}
                          <span className="text-sm font-medium">
                            {priorityOption === 'HIGH' && '高优先级'}
                            {priorityOption === 'NORMAL' && '普通优先级'}
                            {priorityOption === 'LOW' && '低优先级'}
                          </span>
                        </div>
                      </div>
                      <div className="ml-auto">
                        {priority === priorityOption && (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-600">
                            <div className="h-2 w-2 rounded-full bg-white" />
                          </div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
                {errors.priority && (
                  <p className="mt-1 text-sm text-red-600">{errors.priority.message}</p>
                )}
              </div>

              {/* 预估完成天数 */}
              <div>
                <Label htmlFor="estimatedDays">
                  <CalendarIcon className="w-4 h-4 inline mr-1" />
                  预估完成天数
                </Label>
                <Input
                  id="estimatedDays"
                  type="number"
                  min="1"
                  max="30"
                  {...register('estimatedDays', { valueAsNumber: true })}
                  placeholder="输入预估天数"
                />
                {errors.estimatedDays && (
                  <p className="mt-1 text-sm text-red-600">{errors.estimatedDays.message}</p>
                )}
              </div>

              {/* 处理备注 */}
              <div>
                <Label htmlFor="processingNotes">处理备注</Label>
                <Textarea
                  id="processingNotes"
                  {...register('processingNotes')}
                  rows={3}
                  placeholder="描述处理计划、需要关注的点或其他备注信息..."
                  className="resize-none"
                />
                {errors.processingNotes && (
                  <p className="mt-1 text-sm text-red-600">{errors.processingNotes.message}</p>
                )}
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <Button
              type="submit"
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className="w-full sm:ml-3 sm:w-auto"
            >
              {isSubmitting ? '处理中...' : '开始处理'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="mt-3 w-full sm:mt-0 sm:w-auto"
            >
              取消
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}