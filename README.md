# EasyBFC - 跨境代购平台

一个简化的跨境代购平台，专注于为海外用户提供中国商品代购服务。

## 功能特性

### 用户功能
- 用户注册和登录
- 提交商品代购请求（支持URL、图片、文字描述）
- 查看报价和订单状态
- 物流信息跟踪

### 管理员功能
- 查看和管理用户请求
- 人工报价系统
- 订单状态管理
- 物流信息录入和更新

## 技术栈

- **前端框架**: Next.js 14 (App Router)
- **样式**: Tailwind CSS
- **数据库**: MySQL + Prisma ORM
- **认证**: JWT
- **表单验证**: Zod + React Hook Form
- **UI组件**: 自定义组件库
- **通知**: React Hot Toast
- **语言**: TypeScript

## 项目结构

```
easybfc/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API路由
│   │   │   ├── auth/           # 认证相关API
│   │   │   ├── requests/       # 请求管理API
│   │   │   ├── quotes/         # 报价管理API
│   │   │   ├── orders/         # 订单管理API
│   │   │   ├── shipping/       # 物流管理API
│   │   │   └── admin/          # 管理员API
│   │   ├── auth/               # 认证页面
│   │   ├── dashboard/          # 用户仪表板
│   │   ├── admin/              # 管理员页面
│   │   ├── globals.css         # 全局样式
│   │   ├── layout.tsx          # 根布局
│   │   └── page.tsx            # 首页
│   ├── components/             # 组件
│   │   └── ui/                 # UI组件
│   ├── lib/                    # 工具库
│   │   └── auth.ts             # 认证工具
│   ├── types/                  # 类型定义
│   │   └── index.ts            # 通用类型
│   └── utils/                  # 工具函数
│       └── index.ts            # 通用工具
├── prisma/                     # 数据库
│   └── schema.prisma           # 数据库模式
├── public/                     # 静态资源
│   └── uploads/                # 上传文件
├── package.json                # 项目配置
├── next.config.js              # Next.js配置
├── tailwind.config.ts          # Tailwind配置
├── tsconfig.json               # TypeScript配置
└── .env.example                # 环境变量示例
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 环境配置

复制 `.env.example` 为 `.env` 并配置环境变量：

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置以下变量：

```env
# 数据库连接
DATABASE_URL="mysql://username:password@localhost:3306/easybfc"

# NextAuth.js
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# JWT密钥
JWT_SECRET="your-jwt-secret"

# 应用配置
APP_NAME="EasyBFC"
APP_URL="http://localhost:3000"
```

### 3. 数据库设置

```bash
# 生成Prisma客户端
npx prisma generate

# 推送数据库模式
npx prisma db push

# (可选) 查看数据库
npx prisma studio
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 业务流程

### 用户流程
1. **注册/登录** - 用户创建账户或登录
2. **提交请求** - 用户提交商品代购请求
3. **等待报价** - 管理员审核并提供报价
4. **确认订单** - 用户查看并接受报价
5. **跟踪物流** - 查看订单状态和物流信息

### 管理员流程
1. **审核请求** - 查看用户提交的代购请求
2. **搜集报价** - 人工搜集商品价格信息
3. **提交报价** - 向用户提供详细报价
4. **处理订单** - 采购商品并安排发货
5. **更新物流** - 录入和更新物流跟踪信息

## API 接口

### 认证接口
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录

### 请求管理
- `GET /api/requests` - 获取用户请求列表
- `POST /api/requests` - 创建新请求
- `GET /api/admin/requests` - 管理员获取所有请求
- `PATCH /api/admin/requests` - 更新请求状态

### 报价管理
- `GET /api/quotes` - 获取报价列表
- `POST /api/quotes` - 创建报价（管理员）

### 订单管理
- `GET /api/orders` - 获取订单列表
- `POST /api/orders` - 创建订单（接受报价）
- `PATCH /api/orders` - 更新订单状态（管理员）

### 物流管理
- `GET /api/shipping` - 获取物流信息
- `POST /api/shipping` - 创建物流信息（管理员）
- `PATCH /api/shipping` - 更新物流信息（管理员）

## 数据库模型

### 用户 (User)
- 基本信息：姓名、邮箱、密码
- 角色：USER（普通用户）、ADMIN（管理员）

### 请求 (Request)
- 商品信息：URL、描述、图片
- 状态跟踪：从待处理到已完成

### 报价 (Quote)
- 价格明细：商品价格、服务费、运费
- 状态：待处理、已接受、已拒绝

### 订单 (Order)
- 订单信息：总金额、收货地址
- 状态：从待支付到已送达

### 物流 (Shipping)
- 物流信息：承运商、运单号
- 时间跟踪：预计送达、实际送达

## 开发指南

### 添加新功能
1. 在 `prisma/schema.prisma` 中定义数据模型
2. 在 `src/types/index.ts` 中添加TypeScript类型
3. 在 `src/app/api/` 中创建API路由
4. 在 `src/app/` 中创建页面组件
5. 在 `src/components/` 中创建可复用组件

### 代码规范
- 使用TypeScript进行类型检查
- 使用Zod进行数据验证
- 使用Prisma进行数据库操作
- 使用Tailwind CSS进行样式设计
- 遵循Next.js App Router约定

## 部署

### 生产构建

```bash
npm run build
npm start
```

### 环境要求
- Node.js 18+
- MySQL 8.0+
- 支持文件上传的服务器环境

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request来改进项目。

## 联系方式

如有问题，请通过以下方式联系：
- 项目Issues: [GitHub Issues](https://github.com/your-repo/easybfc/issues)
- 邮箱: your-email@example.com