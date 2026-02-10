import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    // 分页参数
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // 筛选参数
    const category = searchParams.get('category')
    const keyword = searchParams.get('keyword')
    const accountName = searchParams.get('account')
    const sortBy = searchParams.get('sort') || 'hot' // hot | latest

    // 构建查询条件
    const where: any = {}

    if (category && category !== 'all') {
      where.category = category
    }

    if (keyword) {
      where.OR = [
        { title: { contains: keyword, mode: 'insensitive' } },
        { summary: { contains: keyword, mode: 'insensitive' } },
      ]
    }

    if (accountName) {
      where.accountName = { contains: accountName, mode: 'insensitive' }
    }

    // 排序
    const orderBy: any = sortBy === 'latest'
      ? { publishedAt: 'desc' }
      : { readCount: 'desc' }

    // 查询文章
    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.article.count({ where }),
    ])

    return NextResponse.json({
      articles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Failed to fetch articles:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
