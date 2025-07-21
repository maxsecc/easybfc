'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/utils'
import { Button } from '@/components/ui/Button'
import { storage } from '@/utils'
import { User } from '@/types'

export function Navbar() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isScrolled, setIsScrolled] = useState(false)

  // 检查用户登录状态
  useEffect(() => {
    const storedUser = storage.get('user')
    if (storedUser) {
      setUser(storedUser)
    }
  }, [])

  // 监听滚动事件，用于导航栏样式变化
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // 处理登出
  const handleLogout = () => {
    storage.remove('token')
    storage.remove('user')
    setUser(null)
    window.location.href = '/'
  }

  // 导航链接
  const navLinks = [
    { href: '/', label: '首页' },
    { href: '/about', label: '关于我们' },
    { href: '/how-it-works', label: '服务流程' },
    { href: '/faq', label: '常见问题' },
  ]

  // 用户菜单链接
  const userLinks = user ? (
    user.role === 'ADMIN' ? [
      { href: '/dashboard', label: '用户仪表板' },
      { href: '/admin', label: '管理后台' },
      { href: '#', label: '退出登录', onClick: handleLogout },
    ] : [
      { href: '/dashboard', label: '我的仪表板' },
      { href: '/dashboard/new-request', label: '提交新请求' },
      { href: '#', label: '退出登录', onClick: handleLogout },
    ]
  ) : [
    { href: '/auth/login', label: '登录' },
    { href: '/auth/register', label: '注册' },
  ]

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-white shadow-md py-2'
          : 'bg-transparent py-4'
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold text-primary">EasyBFC</span>
          </Link>

          {/* 桌面导航 */}
          <nav className="hidden md:flex items-center space-x-6">
            <ul className="flex space-x-6">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      'text-sm font-medium transition-colors hover:text-primary',
                      pathname === link.href
                        ? 'text-primary'
                        : 'text-gray-600'
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="flex items-center space-x-2">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-primary"
                  >
                    <span>你好，{user.name}</span>
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
                      className={cn(
                        'transition-transform duration-200',
                        isMenuOpen ? 'rotate-180' : ''
                      )}
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>

                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 py-1">
                      {userLinks.map((link) => (
                        <Link
                          key={link.href + link.label}
                          href={link.href}
                          onClick={link.onClick}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link href="/auth/login">
                    <Button variant="ghost" size="sm">
                      登录
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button size="sm">注册</Button>
                  </Link>
                </>
              )}
            </div>
          </nav>

          {/* 移动端菜单按钮 */}
          <button
            className="md:hidden flex items-center"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {isMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </>
              ) : (
                <>
                  <line x1="4" y1="12" x2="20" y2="12"></line>
                  <line x1="4" y1="6" x2="20" y2="6"></line>
                  <line x1="4" y1="18" x2="20" y2="18"></line>
                </>
              )}
            </svg>
          </button>
        </div>

        {/* 移动端菜单 */}
        {isMenuOpen && (
          <div className="md:hidden pt-4 pb-2">
            <ul className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      'block py-2 text-base font-medium transition-colors hover:text-primary',
                      pathname === link.href
                        ? 'text-primary'
                        : 'text-gray-600'
                    )}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="border-t border-gray-200 my-2 pt-2">
                {userLinks.map((link) => (
                  <Link
                    key={link.href + link.label}
                    href={link.href}
                    className="block py-2 text-base font-medium text-gray-600 hover:text-primary"
                    onClick={(e) => {
                      if (link.onClick) {
                        e.preventDefault()
                        link.onClick()
                      }
                      setIsMenuOpen(false)
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  )
}