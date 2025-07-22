import Link from 'next/link'
import { ShoppingCartIcon, GlobeAltIcon, TruckIcon, ShieldCheckIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Navbar } from '@/components/Navbar'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white pt-24 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4">
          <div className="w-96 h-96 rounded-full bg-white/5"></div>
        </div>
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4">
          <div className="w-80 h-80 rounded-full bg-white/5"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="mb-8">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-medium mb-8">
                🚀 专业代购服务，全球配送
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
              <span className="block text-white">专业中国商品</span>
              <span className="block bg-gradient-to-r from-white to-primary-100 bg-clip-text text-transparent">
                代购服务
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-12 text-primary-100 max-w-3xl mx-auto">
              为海外用户提供便捷、可靠的中国商品采购服务，专业团队，透明价格，全程跟踪
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-primary-600 hover:bg-gray-100 text-lg px-8 py-3 h-auto">
                <Link href="/auth/register">
                  立即开始
                  <ArrowRightIcon className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-primary-600 text-lg px-8 py-3 h-auto bg-transparent">
                <Link href="#features">
                  了解更多
                </Link>
              </Button>
            </div>
            
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold">10000+</div>
                <div className="text-primary-200">成功订单</div>
              </div>
              <div>
                <div className="text-3xl font-bold">50+</div>
                <div className="text-primary-200">服务国家</div>
              </div>
              <div>
                <div className="text-3xl font-bold">99%</div>
                <div className="text-primary-200">客户满意度</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              为什么选择 EasyBFC？
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              我们提供专业、透明、可靠的代购服务，让跨境购物变得简单安全
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingCartIcon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">简单提交</h3>
                <p className="text-muted-foreground leading-relaxed">
                  只需提供商品链接、图片或描述，我们帮您找到最优商品
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <GlobeAltIcon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">全球配送</h3>
                <p className="text-muted-foreground leading-relaxed">
                  支持全球多个国家和地区的配送服务
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <TruckIcon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">物流追踪</h3>
                <p className="text-muted-foreground leading-relaxed">
                  实时跟踪订单状态，从采购到配送全程透明
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShieldCheckIcon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">安全保障</h3>
                <p className="text-muted-foreground leading-relaxed">
                  专业团队人工审核，确保商品质量和交易安全
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-muted/30 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              如何使用？
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              简单四步，轻松完成代购，让您的海外购物体验更加便捷
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="relative text-center bg-white border-0 shadow-md hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-lg">
                    1
                  </div>
                </div>
                <div className="pt-4">
                  <h3 className="text-lg font-semibold mb-3">提交需求</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    提供商品链接、图片或详细描述
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="relative text-center bg-white border-0 shadow-md hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-lg">
                    2
                  </div>
                </div>
                <div className="pt-4">
                  <h3 className="text-lg font-semibold mb-3">获取报价</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    我们为您找到最优商品并提供详细报价
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="relative text-center bg-white border-0 shadow-md hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-lg">
                    3
                  </div>
                </div>
                <div className="pt-4">
                  <h3 className="text-lg font-semibold mb-3">确认支付</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    确认报价后安全支付，开始采购流程
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="relative text-center bg-white border-0 shadow-md hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-lg">
                    4
                  </div>
                </div>
                <div className="pt-4">
                  <h3 className="text-lg font-semibold mb-3">收货完成</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    跟踪物流信息，安心等待商品送达
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center mt-12">
            <Button asChild size="lg">
              <Link href="/auth/register">
                开始您的代购之旅
                <ArrowRightIcon className="ml-2 w-4 h-4" />
              </Link>
            </Button>
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