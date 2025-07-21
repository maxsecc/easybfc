import React from 'react'
import { cn } from '@/utils'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
  showPageNumbers?: boolean
  showFirstLast?: boolean
  siblingCount?: number
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
  showPageNumbers = true,
  showFirstLast = true,
  siblingCount = 1,
}: PaginationProps) {
  // 生成页码数组
  const getPageNumbers = () => {
    if (!showPageNumbers) return []
    
    const pageNumbers: (number | string)[] = []
    const totalNumbers = siblingCount * 2 + 3 // 当前页 + 两侧的页码 + 首尾两个省略号
    
    // 如果总页数小于需要显示的页码数，直接显示所有页码
    if (totalPages <= totalNumbers) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      // 计算左右两侧的起始和结束页码
      const leftSiblingIndex = Math.max(currentPage - siblingCount, 1)
      const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages)
      
      // 是否显示左侧省略号
      const shouldShowLeftDots = leftSiblingIndex > 2
      // 是否显示右侧省略号
      const shouldShowRightDots = rightSiblingIndex < totalPages - 1
      
      // 始终显示第一页
      if (shouldShowLeftDots) {
        pageNumbers.push(1)
        pageNumbers.push('...')
      }
      
      // 生成中间的页码
      for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
        pageNumbers.push(i)
      }
      
      // 始终显示最后一页
      if (shouldShowRightDots) {
        pageNumbers.push('...')
        pageNumbers.push(totalPages)
      }
    }
    
    return pageNumbers
  }

  // 处理页码变化
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return
    onPageChange(page)
  }

  // 如果总页数小于等于1，不显示分页
  if (totalPages <= 1) return null

  return (
    <nav
      className={cn('flex items-center justify-center space-x-1', className)}
      aria-label="分页"
    >
      {/* 首页按钮 */}
      {showFirstLast && (
        <button
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className={cn(
            'inline-flex items-center justify-center rounded-md text-sm font-medium h-9 w-9',
            currentPage === 1
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-gray-500 hover:bg-gray-100'
          )}
          aria-label="首页"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="11 17 6 12 11 7"></polyline>
            <polyline points="18 17 13 12 18 7"></polyline>
          </svg>
        </button>
      )}

      {/* 上一页按钮 */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={cn(
          'inline-flex items-center justify-center rounded-md text-sm font-medium h-9 w-9',
          currentPage === 1
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-gray-500 hover:bg-gray-100'
        )}
        aria-label="上一页"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>

      {/* 页码按钮 */}
      {showPageNumbers &&
        getPageNumbers().map((page, index) => {
          if (page === '...') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="inline-flex items-center justify-center h-9 w-9 text-sm text-gray-500"
              >
                ...
              </span>
            )
          }

          return (
            <button
              key={`page-${page}`}
              onClick={() => handlePageChange(page as number)}
              className={cn(
                'inline-flex items-center justify-center rounded-md text-sm font-medium h-9 w-9',
                currentPage === page
                  ? 'bg-primary text-white'
                  : 'text-gray-500 hover:bg-gray-100'
              )}
              aria-label={`第 ${page} 页`}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              {page}
            </button>
          )
        })}

      {/* 下一页按钮 */}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={cn(
          'inline-flex items-center justify-center rounded-md text-sm font-medium h-9 w-9',
          currentPage === totalPages
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-gray-500 hover:bg-gray-100'
        )}
        aria-label="下一页"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>

      {/* 末页按钮 */}
      {showFirstLast && (
        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={cn(
            'inline-flex items-center justify-center rounded-md text-sm font-medium h-9 w-9',
            currentPage === totalPages
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-gray-500 hover:bg-gray-100'
          )}
          aria-label="末页"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="13 17 18 12 13 7"></polyline>
            <polyline points="6 17 11 12 6 7"></polyline>
          </svg>
        </button>
      )}
    </nav>
  )
}