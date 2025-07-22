# EasyBFC 项目启动指南

## 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 环境配置
项目已包含 `.env` 文件，使用 SQLite 数据库进行开发。

### 3. 初始化数据库
```bash
# 生成 Prisma 客户端
npx prisma generate

# 推送数据库模式
npx prisma db push

# 创建初始用户
node scripts/seed.js
```

### 4. 启动开发服务器
```bash
npm run dev
```

访问 http://localhost:3000

## 测试账号

### 管理员账号
- 邮箱: `admin@easybfc.com`
- 密码: `admin123`
- 访问: http://localhost:3000/admin

### 测试用户账号
- 邮箱: `test@example.com`
- 密码: `test123`
- 访问: http://localhost:3000/dashboard

## 功能测试

### 登录功能
1. 访问 http://localhost:3000/auth/login
2. 使用上述测试账号登录
3. 验证登录成功后跳转到对应的仪表板

### 用户功能
- ✅ 用户注册和登录
- ✅ 商品需求提交（支持图片上传）
- ✅ 查看报价和订单状态
- ✅ 物流信息跟踪

### 管理员功能
- ✅ 查看所有用户请求
- ✅ 创建和管理报价
- ✅ 订单状态管理
- ✅ 物流信息录入

## 最近修复的问题

### ✅ 已修复
1. **登录表单显示问题** - 修复了自定义Form组件导致的显示问题
2. **登录状态丢失** - 实现了全局AuthContext状态管理，登录状态现在会在页面间保持
3. **提交需求认证失败** - 修复了API认证逻辑和数据字段问题
4. **数据库兼容性** - 改用SQLite并修复了Prisma schema的兼容性问题

### 功能确认
- ✅ 登录后在首页和其他页面都能看到登录状态
- ✅ 提交商品需求功能正常工作
- ✅ JWT认证和权限控制正常
- ✅ 角色区分（用户/管理员）正常

## 故障排除

### 登录问题
如果登录时出现"服务器内部错误"，请确保：
1. 数据库已正确初始化
2. 环境变量已设置（`.env` 文件存在）
3. 初始用户已创建

### 数据库问题
如果需要重置数据库：
```bash
rm -f prisma/dev.db
npx prisma db push
node scripts/seed.js
```

## 开发说明

- 数据库: SQLite (开发环境)
- 认证: JWT
- 前端: Next.js 14 + TypeScript + Tailwind CSS
- 后端: Next.js API Routes + Prisma ORM