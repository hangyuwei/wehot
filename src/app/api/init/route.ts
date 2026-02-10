import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // 用原始 SQL 创建表结构
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "articles" (
        "id" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "summary" TEXT NOT NULL,
        "url" TEXT NOT NULL,
        "coverUrl" TEXT,
        "accountName" TEXT NOT NULL,
        "readCount" INTEGER NOT NULL DEFAULT 0,
        "likeCount" INTEGER NOT NULL DEFAULT 0,
        "publishedAt" TIMESTAMP(3) NOT NULL,
        "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "category" TEXT NOT NULL,
        "keywords" JSONB NOT NULL DEFAULT '[]',
        CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
      );
      CREATE UNIQUE INDEX IF NOT EXISTS "articles_url_key" ON "articles"("url");
      CREATE INDEX IF NOT EXISTS "articles_category_idx" ON "articles"("category");
      CREATE INDEX IF NOT EXISTS "articles_publishedAt_idx" ON "articles"("publishedAt");
      CREATE INDEX IF NOT EXISTS "articles_readCount_idx" ON "articles"("readCount");
    `)

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "subscriptions" (
        "id" TEXT NOT NULL,
        "accountName" TEXT NOT NULL,
        "accountId" TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
      );
      CREATE UNIQUE INDEX IF NOT EXISTS "subscriptions_accountName_key" ON "subscriptions"("accountName");
    `)

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "keyword_configs" (
        "id" TEXT NOT NULL,
        "keyword" TEXT NOT NULL,
        "category" TEXT NOT NULL,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "keyword_configs_pkey" PRIMARY KEY ("id")
      );
      CREATE UNIQUE INDEX IF NOT EXISTS "keyword_configs_keyword_key" ON "keyword_configs"("keyword");
      CREATE INDEX IF NOT EXISTS "keyword_configs_category_idx" ON "keyword_configs"("category");
    `)

    // 插入默认关键词
    const keywordsCount = await prisma.keywordConfig.count()
    if (keywordsCount === 0) {
      await prisma.keywordConfig.createMany({
        data: [
          { keyword: '健康', category: '健康养生' },
          { keyword: '养生', category: '健康养生' },
          { keyword: '科技', category: '科技数码' },
          { keyword: '互联网', category: '科技数码' },
          { keyword: '职场', category: '职场成长' },
          { keyword: '理财', category: '财经理财' },
        ],
        skipDuplicates: true,
      })
    }

    const counts = {
      articles: await prisma.article.count(),
      subscriptions: await prisma.subscription.count(),
      keywords: await prisma.keywordConfig.count(),
    }

    return NextResponse.json({
      success: true,
      message: '数据库初始化成功！',
      counts,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
