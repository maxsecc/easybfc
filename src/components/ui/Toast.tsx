'use client'

import React from 'react'
import { Toaster as HotToaster } from 'react-hot-toast'

export function Toaster() {
  return (
    <HotToaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        // 默认样式
        className: '',
        duration: 5000,
        style: {
          background: '#fff',
          color: '#363636',
          border: '1px solid #e2e8f0',
          padding: '16px',
          borderRadius: '0.375rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
        // 成功样式
        success: {
          duration: 3000,
          iconTheme: {
            primary: '#10B981',
            secondary: '#FFFFFF',
          },
          style: {
            border: '1px solid #D1FAE5',
            padding: '16px',
            color: '#065F46',
            background: '#ECFDF5',
          },
        },
        // 错误样式
        error: {
          duration: 4000,
          iconTheme: {
            primary: '#EF4444',
            secondary: '#FFFFFF',
          },
          style: {
            border: '1px solid #FEE2E2',
            padding: '16px',
            color: '#B91C1C',
            background: '#FEF2F2',
          },
        },
        // 加载样式
        loading: {
          duration: Infinity,
          style: {
            border: '1px solid #E2E8F0',
            padding: '16px',
            background: '#F8FAFC',
          },
        },
      }}
    />
  )
}