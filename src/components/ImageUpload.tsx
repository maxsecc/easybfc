'use client'

import React, { useState, useRef } from 'react'
import { cn, formatFileSize, isImageFile, compressImage } from '@/utils'

interface ImageUploadProps {
  maxFiles?: number
  maxSizeInMB?: number
  onChange: (files: File[]) => void
  value?: File[]
  error?: string
  helperText?: string
  acceptedTypes?: string[]
}

export function ImageUpload({
  maxFiles = 5,
  maxSizeInMB = 5,
  onChange,
  value = [],
  error,
  helperText,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [uploadError, setUploadError] = useState<string>('')
  const [isCompressing, setIsCompressing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // 处理文件选择
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFiles(Array.from(e.target.files))
    }
  }

  // 处理拖放
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  // 处理拖放文件
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFiles(Array.from(e.dataTransfer.files))
    }
  }

  // 处理文件验证和压缩
  const processFiles = async (newFiles: File[]) => {
    setUploadError('')
    
    // 检查文件数量限制
    if (value.length + newFiles.length > maxFiles) {
      setUploadError(`最多只能上传${maxFiles}个文件`)
      return
    }
    
    // 验证文件类型和大小
    const validFiles: File[] = []
    const invalidFiles: string[] = []
    
    for (const file of newFiles) {
      // 检查文件类型
      if (!acceptedTypes.includes(file.type)) {
        invalidFiles.push(`${file.name}：不支持的文件类型`)
        continue
      }
      
      // 检查文件大小
      if (file.size > maxSizeInMB * 1024 * 1024) {
        // 尝试压缩图片
        if (isImageFile(file)) {
          try {
            setIsCompressing(true)
            const compressedFile = await compressImage(file, maxSizeInMB)
            validFiles.push(compressedFile)
          } catch (error) {
            invalidFiles.push(`${file.name}：文件过大，压缩失败`)
          } finally {
            setIsCompressing(false)
          }
        } else {
          invalidFiles.push(`${file.name}：文件大小超过${maxSizeInMB}MB`)
        }
      } else {
        validFiles.push(file)
      }
    }
    
    // 显示错误信息
    if (invalidFiles.length > 0) {
      setUploadError(invalidFiles.join('\n'))
    }
    
    // 更新文件列表
    if (validFiles.length > 0) {
      onChange([...value, ...validFiles])
    }
    
    // 清空文件输入框，允许重新选择相同的文件
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  // 删除文件
  const handleRemoveFile = (index: number) => {
    const newFiles = [...value]
    newFiles.splice(index, 1)
    onChange(newFiles)
  }

  // 触发文件选择对话框
  const handleButtonClick = () => {
    inputRef.current?.click()
  }

  return (
    <div className="space-y-2">
      {/* 拖放区域 */}
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-4 text-center transition-colors',
          dragActive ? 'border-primary bg-primary/5' : 'border-gray-300',
          error ? 'border-red-500' : '',
          'relative'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileChange}
          className="hidden"
        />
        
        <div className="py-6 flex flex-col items-center justify-center">
          <svg
            className={cn(
              'w-12 h-12 mb-2',
              dragActive ? 'text-primary' : 'text-gray-400'
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            ></path>
          </svg>
          
          <p className="text-sm text-gray-600 mb-1">
            拖放文件到此处，或
            <button
              type="button"
              onClick={handleButtonClick}
              className="text-primary hover:text-primary-dark font-medium mx-1"
            >
              浏览文件
            </button>
          </p>
          
          <p className="text-xs text-gray-500">
            支持 {acceptedTypes.map(type => type.split('/')[1]).join(', ')} 格式，
            每个文件最大 {maxSizeInMB}MB，最多 {maxFiles} 个文件
          </p>
        </div>
        
        {isCompressing && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <svg
                className="animate-spin h-8 w-8 text-primary mb-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <p className="text-sm text-gray-600">正在压缩图片...</p>
            </div>
          </div>
        )}
      </div>
      
      {/* 错误信息 */}
      {(error || uploadError) && (
        <p className="text-sm text-red-500 mt-1">{error || uploadError}</p>
      )}
      
      {/* 帮助文本 */}
      {helperText && !error && !uploadError && (
        <p className="text-sm text-gray-500 mt-1">{helperText}</p>
      )}
      
      {/* 预览区域 */}
      {value.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">已上传文件 ({value.length}/{maxFiles})</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {value.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="relative group border rounded-lg overflow-hidden"
              >
                <div className="aspect-square w-full relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="bg-red-500 text-white p-1 rounded-full"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        ></path>
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="p-2 text-xs truncate">
                  <p className="truncate" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}