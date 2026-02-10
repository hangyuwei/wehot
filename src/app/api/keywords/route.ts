import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 验证管理员密码
function checkAuth(request: Request) {
  const authHeader = request.headers.get('authorization')
  const password = authHeader?.replace('Bearer ', '')

  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    return false
  }
  return true
}

// GET - 获取所有关键词
export async function GET() {
  try {
    const keywords = await prisma.keywordConfig.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ keywords })
  } catch (error) {
    console.error('Failed to fetch keywords:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - 创建关键词
export async function POST(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { keyword, category, isActive } = body

    if (!keyword || !category) {
      return NextResponse.json(
        { error: 'keyword and category are required' },
        { status: 400 }
      )
    }

    const keywordConfig = await prisma.keywordConfig.create({
      data: {
        keyword,
        category,
        isActive: isActive ?? true,
      },
    })

    return NextResponse.json({ keyword: keywordConfig })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Keyword already exists' },
        { status: 409 }
      )
    }
    console.error('Failed to create keyword:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - 更新关键词
export async function PUT(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { id, keyword, category, isActive } = body

    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      )
    }

    const keywordConfig = await prisma.keywordConfig.update({
      where: { id },
      data: {
        ...(keyword && { keyword }),
        ...(category && { category }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    return NextResponse.json({ keyword: keywordConfig })
  } catch (error) {
    console.error('Failed to update keyword:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - 删除关键词
export async function DELETE(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      )
    }

    await prisma.keywordConfig.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete keyword:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
