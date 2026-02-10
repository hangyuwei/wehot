# WeHot（微热）— 爆款微信公众号内容发现平台

定期从搜狗微信搜索抓取爆款公众号文章，支持按关键词+指定公众号两种维度筛选内容方向。

## 功能特性

- 🔥 自动抓取爆款微信公众号文章
- 🎯 支持关键词和公众号两种订阅方式
- 📊 热度排序和时间排序
- 🏷️ 分类标签筛选
- ⏰ 定时任务（每6小时自动抓取）
- 🔒 管理员密码保护

## 技术栈

- **前端**: Next.js 14 (App Router) + Tailwind CSS + shadcn/ui
- **数据库**: Vercel Postgres + Prisma ORM
- **定时任务**: Vercel Cron Jobs
- **爬虫**: 搜狗微信搜索
- **部署**: Vercel

## 快速开始

### 1. 克隆项目

```bash
git clone <your-repo-url>
cd wehot
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制 `.env.example` 为 `.env`：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
# Vercel Postgres 连接字符串（部署到 Vercel 后自动生成）
DATABASE_URL="postgresql://user:password@localhost:5432/wehot?schema=public"

# 管理员密码（用于访问设置页面）
ADMIN_PASSWORD="your-secure-password"

# Cron Secret（可选，增强安全性）
CRON_SECRET="your-cron-secret"
```

### 4. 初始化数据库

```bash
npx prisma generate
npx prisma db push
```

### 5. 本地开发

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

## 部署到 Vercel

### 1. 推送到 GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. 在 Vercel 上导入项目

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "Add New Project"
3. 导入你的 GitHub 仓库
4. 配置环境变量：
   - `ADMIN_PASSWORD`: 设置管理员密码
   - `CRON_SECRET`: （可选）设置 Cron 密钥

### 3. 添加 Vercel Postgres

1. 在项目设置中，进入 "Storage" 标签
2. 创建 Postgres 数据库
3. Vercel 会自动添加 `DATABASE_URL` 环境变量

### 4. 运行数据库迁移

部署后，在 Vercel 项目中运行：

```bash
npx prisma generate && npx prisma db push
```

### 5. 部署完成

Vercel 会自动部署项目，Cron 任务会每6小时自动运行。

## 使用说明

### 配置订阅

1. 访问 `/settings` 页面
2. 输入管理员密码登录
3. 添加关注的公众号或关键词
4. 启用/禁用订阅

### 查看文章

1. 访问首页
2. 使用分类标签筛选
3. 切换热度/时间排序
4. 点击文章卡片跳转到原文

### 手动触发抓取

访问 `/api/cron/fetch` 可手动触发一次抓取（需要配置 CRON_SECRET）。

## 项目结构

```
wehot/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── articles/route.ts      # 文章查询 API
│   │   │   ├── cron/fetch/route.ts    # 爬虫定时任务
│   │   │   ├── keywords/route.ts      # 关键词管理 API
│   │   │   └── subscriptions/route.ts # 订阅管理 API
│   │   ├── settings/page.tsx          # 设置页面
│   │   └── page.tsx                   # 首页
│   ├── components/ui/                 # shadcn/ui 组件
│   └── lib/
│       ├── prisma.ts                  # Prisma 客户端
│       └── utils.ts                   # 工具函数
├── prisma/
│   └── schema.prisma                  # 数据库模型
├── docs/
│   └── plans/                         # 设计文档
├── vercel.json                        # Vercel 配置
└── package.json
```

## 注意事项

- 搜狗微信搜索有反爬机制，建议设置合理的请求间隔
- 免费版 Vercel Postgres 有存储限制，定期清理旧数据
- 管理员密码请使用强密码
- 生产环境建议配置 CRON_SECRET

## License

MIT
