const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('开始创建初始数据...')
  
  // 创建管理员用户
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@easybfc.com' },
    update: {},
    create: {
      email: 'admin@easybfc.com',
      password: hashedPassword,
      name: '系统管理员',
      role: 'ADMIN',
    },
  })
  
  console.log('管理员用户创建成功:', admin.email)
  
  // 创建测试用户
  const testUserPassword = await bcrypt.hash('test123', 12)
  
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      password: testUserPassword,
      name: '测试用户',
      role: 'USER',
    },
  })
  
  console.log('测试用户创建成功:', testUser.email)
  
  console.log('初始数据创建完成！')
  console.log('管理员账号: admin@easybfc.com / admin123')
  console.log('测试账号: test@example.com / test123')
}

main()
  .catch((e) => {
    console.error('创建初始数据时出错:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })