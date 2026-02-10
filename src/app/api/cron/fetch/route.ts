import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import * as cheerio from 'cheerio'

// 搜狗微信搜索爬虫
async function fetchFromSogou(query: string, type: 'keyword' | 'account') {
  const baseUrl = 'https://weixin.sogou.com/weixin'
  const params = new URLSearchParams({
    type: type === 'keyword' ? '2' : '1', // 2=文章搜索, 1=公众号搜索
    query: query,
    ie: 'utf8',
  })

  try {
    const response = await fetch(`${baseUrl}?${params.toString()}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)
    const articles: any[] = []

    // 解析文章列表
    $('.news-box').each((_, element) => {
      const $el = $(element)
      const title = $el.find('.txt-box h3 a').text().trim()
      const url = $el.find('.txt-box h3 a').attr('href') || ''
      const summary = $el.find('.txt-box p').text().trim()
      const accountName = $el.find('.account a').text().trim()
      const publishedAtStr = $el.find('.s-p').text().trim()
      const coverUrl = $el.find('.img-box img').attr('src') || null

      if (title && url) {
        articles.push({
          title,
          url,
          summary: summary.substring(0, 200),
          accountName,
          coverUrl,
          publishedAt: parsePublishDate(publishedAtStr),
          readCount: 0, // 搜狗不提供阅读量，默认0
          likeCount: 0,
          category: 'unknown',
          keywords: [query],
        })
      }
    })

    return articles
  } catch (error) {
    console.error(`Failed to fetch from Sogou for query: ${query}`, error)
    return []
  }
}

// 解析发布时间
function parsePublishDate(dateStr: string): Date {
  // 搜狗格式示例: "2小时前", "昨天", "2024-02-10"
  const now = new Date()

  if (dateStr.includes('小时前')) {
    const hours = parseInt(dateStr)
    return new Date(now.getTime() - hours * 60 * 60 * 1000)
  } else if (dateStr.includes('分钟前')) {
    const minutes = parseInt(dateStr)
    return new Date(now.getTime() - minutes * 60 * 1000)
  } else if (dateStr === '昨天') {
    return new Date(now.getTime() - 24 * 60 * 60 * 1000)
  } else {
    // 尝试解析日期字符串
    const parsed = new Date(dateStr)
    return isNaN(parsed.getTime()) ? now : parsed
  }
}

export async function GET(request: Request) {
  try {
    // 验证 Cron Secret（可选，增强安全性）
    const authHeader = request.headers.get('authorization')
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 获取所有启用的关键词
    const keywords = await prisma.keywordConfig.findMany({
      where: { isActive: true },
    })

    // 获取所有启用的订阅公众号
    const subscriptions = await prisma.subscription.findMany({
      where: { isActive: true },
    })

    let totalFetched = 0
    let totalSaved = 0

    // 按关键词抓取
    for (const kw of keywords) {
      const articles = await fetchFromSogou(kw.keyword, 'keyword')
      totalFetched += articles.length

      for (const article of articles) {
        try {
          await prisma.article.upsert({
            where: { url: article.url },
            update: {
              readCount: article.readCount,
              likeCount: article.likeCount,
            },
            create: {
              ...article,
              category: kw.category,
            },
          })
          totalSaved++
        } catch (error) {
          console.error('Failed to save article:', article.url, error)
        }
      }

      // 避免请求过快被封
      await new Promise(resolve => setTimeout(resolve, 2000))
    }

    // 按公众号抓取
    for (const sub of subscriptions) {
      const articles = await fetchFromSogou(sub.accountName, 'account')
      totalFetched += articles.length

      for (const article of articles) {
        try {
          await prisma.article.upsert({
            where: { url: article.url },
            update: {
              readCount: article.readCount,
              likeCount: article.likeCount,
            },
            create: article,
          })
          totalSaved++
        } catch (error) {
          console.error('Failed to save article:', article.url, error)
        }
      }

      await new Promise(resolve => setTimeout(resolve, 2000))
    }

    return NextResponse.json({
      success: true,
      totalFetched,
      totalSaved,
      keywords: keywords.length,
      subscriptions: subscriptions.length,
    })
  } catch (error) {
    console.error('Cron job failed:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
