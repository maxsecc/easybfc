import React from 'react'
import Link from 'next/link'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 公司信息 */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-lg font-bold text-gray-900 mb-4">EasyBFC</h3>
            <p className="text-gray-600 mb-4">
              专业的代购服务平台，为您提供高效、便捷的海外商品采购解决方案。
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary">
                <span className="sr-only">微信</span>
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.5,4C5.36,4,2,6.69,2,10c0,1.89,1.08,3.56,2.78,4.66l-0.8,2.32l2.96-1.5c0.76,0.21,1.57,0.32,2.4,0.32 c0.17,0,0.34-0.01,0.51-0.02c-0.11-0.35-0.17-0.72-0.17-1.1c0-2.96,2.87-5.35,6.42-5.35c0.15,0,0.3,0.01,0.44,0.02 C16.21,6.08,13.12,4,9.5,4z M7.21,8.19c-0.55,0-1-0.45-1-1s0.45-1,1-1s1,0.45,1,1S7.76,8.19,7.21,8.19z M12.04,8.19 c-0.55,0-1-0.45-1-1s0.45-1,1-1s1,0.45,1,1S12.59,8.19,12.04,8.19z M17.5,19c3.04,0,5.5-2.1,5.5-4.69 c0-2.59-2.46-4.69-5.5-4.69s-5.5,2.1-5.5,4.69C12,16.9,14.46,19,17.5,19z M15.34,14.3c0.39,0,0.7,0.31,0.7,0.7 c0,0.39-0.31,0.7-0.7,0.7c-0.39,0-0.7-0.31-0.7-0.7C14.64,14.61,14.95,14.3,15.34,14.3z M19.67,14.3c0.39,0,0.7,0.31,0.7,0.7 c0,0.39-0.31,0.7-0.7,0.7c-0.39,0-0.7-0.31-0.7-0.7C18.97,14.61,19.28,14.3,19.67,14.3z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-primary">
                <span className="sr-only">微博</span>
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.096 18.857c-3.882.081-7.088-1.842-7.088-4.337 0-2.495 4.412-4.509 8.294-4.59 3.881-.08 7.088 1.842 7.088 4.337 0 2.495-4.412 4.509-8.294 4.59zm.351-7.22c-2.58-.055-4.663 1.267-4.663 2.938 0 1.67 2.083 3.027 4.663 3.082 2.58.055 4.664-1.267 4.664-2.938 0-1.67-2.084-3.027-4.664-3.082zm8.15-3.644c-.78-.925-1.92-1.332-2.96-1.23-.32.03-.526.354-.459.723.067.37.38.65.7.62.643-.063 1.32.18 1.79.68.47.5.67 1.18.56 1.83-.08.37.16.73.52.8.36.08.72-.16.8-.53.18-1.08-.13-2.17-.96-3.09zm-1.91-2.89c-1.68-2-4.15-2.76-6.42-2.54-.53.05-.91.53-.86 1.06.05.53.53.91 1.06.86 1.63-.16 3.39.36 4.59 1.78 1.2 1.42 1.53 3.35.95 5.07-.19.52.08 1.1.6 1.29.52.19 1.1-.08 1.29-.6.82-2.23.4-4.78-1.2-6.86z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-primary">
                <span className="sr-only">QQ</span>
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.003 2c-2.265 0-6.29 1.364-6.29 7.325v1.195S3.55 14.96 3.55 17.474c0 .665.17 1.025.281 1.025.114 0 .902-.484 1.748-2.072 0 0-.18 2.197 1.904 3.967 0 0-1.77.495-1.77 1.182 0 .686 2.342 1.18 4.467 1.18 2.127 0 4.468-.494 4.468-1.18 0-.687-1.77-1.182-1.77-1.182 2.085-1.77 1.905-3.967 1.905-3.967.845 1.588 1.634 2.072 1.746 2.072.111 0 .283-.36.283-1.025 0-2.514-2.166-6.954-2.166-6.954V9.325C14.29 3.364 14.268 2 12.003 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </div>
          </div>

          {/* 快速链接 */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              快速链接
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-base text-gray-600 hover:text-primary">
                  首页
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-base text-gray-600 hover:text-primary">
                  关于我们
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-base text-gray-600 hover:text-primary">
                  服务流程
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-base text-gray-600 hover:text-primary">
                  常见问题
                </Link>
              </li>
            </ul>
          </div>

          {/* 用户服务 */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              用户服务
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/auth/register" className="text-base text-gray-600 hover:text-primary">
                  注册账号
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="text-base text-gray-600 hover:text-primary">
                  用户登录
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-base text-gray-600 hover:text-primary">
                  用户中心
                </Link>
              </li>
              <li>
                <Link href="/dashboard/new-request" className="text-base text-gray-600 hover:text-primary">
                  提交请求
                </Link>
              </li>
            </ul>
          </div>

          {/* 联系我们 */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              联系我们
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <svg
                  className="h-6 w-6 text-gray-400 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-gray-600">support@easybfc.com</span>
              </li>
              <li className="flex items-start">
                <svg
                  className="h-6 w-6 text-gray-400 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <span className="text-gray-600">400-123-4567</span>
              </li>
              <li className="flex items-start">
                <svg
                  className="h-6 w-6 text-gray-400 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="text-gray-600">上海市浦东新区张江高科技园区</span>
              </li>
            </ul>
          </div>
        </div>

        {/* 版权信息 */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-base text-gray-500 text-center">
            &copy; {currentYear} EasyBFC. 保留所有权利。
          </p>
        </div>
      </div>
    </footer>
  )
}