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

// GET - 获取所有订阅
export async function GET() {
  try {
    const subscriptions = await prisma.subscription.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ subscriptions })
  } catch (error) {
    console.error('Failed to fetch subscriptions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - 创建订阅
export async function POST(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { accountName, accountId, isActive } = body

    if (!accountName) {
      return NextResponse.json(
        { error: 'accountName is required' },
        { status: 400 }
      )
    }

    const subscription = await prisma.subscription.create({
      data: {
        accountName,
        accountId: accountId || null,
        isActive: isActive ?? true,
      },
    })

    return NextResponse.json({ subscription })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Subscription already exists' },
        { status: 409 }
      )
    }
    console.error('Failed to create subscription:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - 更新订阅
export async function PUT(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { id, accountName, accountId, isActive } = body

    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      )
    }

    const subscription = await prisma.subscription.update({
      where: { id },
      data: {
        ...(accountName && { accountName }),
        ...(accountId !== undefined && { accountId }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    return NextResponse.json({ subscription })
  } catch (error) {
    console.error('Failed to update subscription:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - 删除订阅
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

    await prisma.subscription.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete subscription:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
