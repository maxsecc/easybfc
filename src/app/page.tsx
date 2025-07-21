import Link from 'next/link'
import { ShoppingCartIcon, GlobeAltIcon, TruckIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">EasyBFC</h1>
            </div>
            <nav className="flex space-x-4">
              <Link href="/auth/login" className="btn btn-secondary">
                登录
              </Link>
              <Link href="/auth/register" className="btn btn-primary">
                注册
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              专业中国商品代购服务
            </h2>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              为海外用户提供便捷、可靠的中国商品采购服务
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register" className="btn bg-white text-primary-600 hover:bg-gray-100 text-lg px-8 py-3">
                立即开始
              </Link>
              <Link href="#features" className="btn border-2 border-white text-white hover:bg-white hover:text-primary-600 text-lg px-8 py-3">
                了解更多
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              为什么选择 EasyBFC？
            </h3>
            <p className="text-lg text-gray-600">
              我们提供专业、透明、可靠的代购服务
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCartIcon className="w-8 h-8 text-primary-600" />
              </div>
              <h4 className="text-xl font-semibold mb-2">简单提交</h4>
              <p className="text-gray-600">
                只需提供商品链接、图片或描述，我们帮您找到最优商品
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <GlobeAltIcon className="w-8 h-8 text-primary-600" />
              </div>
              <h4 className="text-xl font-semibold mb-2">全球配送</h4>
              <p className="text-gray-600">
                支持全球多个国家和地区的配送服务
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TruckIcon className="w-8 h-8 text-primary-600" />
              </div>
              <h4 className="text-xl font-semibold mb-2">物流追踪</h4>
              <p className="text-gray-600">
                实时跟踪订单状态，从采购到配送全程透明
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheckIcon className="w-8 h-8 text-primary-600" />
              </div>
              <h4 className="text-xl font-semibold mb-2">安全保障</h4>
              <p className="text-gray-600">
                专业团队人工审核，确保商品质量和交易安全
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              如何使用？
            </h3>
            <p className="text-lg text-gray-600">
              简单四步，轻松完成代购
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h4 className="text-lg font-semibold mb-2">提交需求</h4>
              <p className="text-gray-600">
                提供商品链接、图片或详细描述
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h4 className="text-lg font-semibold mb-2">获取报价</h4>
              <p className="text-gray-600">
                我们为您找到最优商品并提供详细报价
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h4 className="text-lg font-semibold mb-2">确认支付</h4>
              <p className="text-gray-600">
                确认报价后安全支付，开始采购流程
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                4
              </div>
              <h4 className="text-lg font-semibold mb-2">收货完成</h4>
              <p className="text-gray-600">
                跟踪物流信息，安心等待商品送达
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h4 className="text-2xl font-bold mb-4">EasyBFC</h4>
            <p className="text-gray-400 mb-4">
              专业的中国商品海外代购服务平台
            </p>
            <p className="text-gray-500 text-sm">
              © 2024 EasyBFC. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}