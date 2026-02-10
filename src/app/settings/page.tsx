'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Subscription {
  id: string
  accountName: string
  accountId: string | null
  isActive: boolean
  createdAt: string
}

interface KeywordConfig {
  id: string
  keyword: string
  category: string
  isActive: boolean
  createdAt: string
}

const CATEGORIES = ['科技', '健康', '财经', '教育', '娱乐', '其他']

export default function SettingsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [keywords, setKeywords] = useState<KeywordConfig[]>([])
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // 新增订阅表单
  const [newSubName, setNewSubName] = useState('')
  const [newSubId, setNewSubId] = useState('')

  // 新增关键词表单
  const [newKeyword, setNewKeyword] = useState('')
  const [newCategory, setNewCategory] = useState('科技')

  useEffect(() => {
    if (isAuthenticated) {
      fetchData()
    }
  }, [isAuthenticated])

  const fetchData = async () => {
    try {
      const [subsRes, kwRes] = await Promise.all([
        fetch('/api/subscriptions'),
        fetch('/api/keywords'),
      ])

      const subsData = await subsRes.json()
      const kwData = await kwRes.json()

      setSubscriptions(subsData.subscriptions || [])
      setKeywords(kwData.keywords || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }

  const handleAuth = () => {
    if (password) {
      setIsAuthenticated(true)
    }
  }

  const addSubscription = async () => {
    if (!newSubName) return

    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${password}`,
        },
        body: JSON.stringify({
          accountName: newSubName,
          accountId: newSubId || null,
        }),
      })

      if (response.ok) {
        setNewSubName('')
        setNewSubId('')
        fetchData()
      } else {
        alert('添加失败')
      }
    } catch (error) {
      console.error('Failed to add subscription:', error)
    }
  }

  const toggleSubscription = async (id: string, isActive: boolean) => {
    try {
      await fetch('/api/subscriptions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${password}`,
        },
        body: JSON.stringify({ id, isActive: !isActive }),
      })
      fetchData()
    } catch (error) {
      console.error('Failed to toggle subscription:', error)
    }
  }

  const deleteSubscription = async (id: string) => {
    if (!confirm('确定删除？')) return

    try {
      await fetch(`/api/subscriptions?id=${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${password}`,
        },
      })
      fetchData()
    } catch (error) {
      console.error('Failed to delete subscription:', error)
    }
  }

  const addKeyword = async () => {
    if (!newKeyword) return

    try {
      const response = await fetch('/api/keywords', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${password}`,
        },
        body: JSON.stringify({
          keyword: newKeyword,
          category: newCategory,
        }),
      })

      if (response.ok) {
        setNewKeyword('')
        fetchData()
      } else {
        alert('添加失败')
      }
    } catch (error) {
      console.error('Failed to add keyword:', error)
    }
  }

  const toggleKeyword = async (id: string, isActive: boolean) => {
    try {
      await fetch('/api/keywords', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${password}`,
        },
        body: JSON.stringify({ id, isActive: !isActive }),
      })
      fetchData()
    } catch (error) {
      console.error('Failed to toggle keyword:', error)
    }
  }

  const deleteKeyword = async (id: string) => {
    if (!confirm('确定删除？')) return

    try {
      await fetch(`/api/keywords?id=${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${password}`,
        },
      })
      fetchData()
    } catch (error) {
      console.error('Failed to delete keyword:', error)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>管理员验证</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                type="password"
                placeholder="请输入管理员密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
              />
              <Button onClick={handleAuth} className="w-full">
                登录
              </Button>
              <Link href="/">
                <Button variant="outline" className="w-full">
                  返回首页
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">设置</h1>
          <Link href="/">
            <Button variant="outline">返回首页</Button>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 订阅公众号 */}
          <Card>
            <CardHeader>
              <CardTitle>订阅公众号</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="公众号名称"
                    value={newSubName}
                    onChange={(e) => setNewSubName(e.target.value)}
                  />
                  <Input
                    placeholder="ID (可选)"
                    value={newSubId}
                    onChange={(e) => setNewSubId(e.target.value)}
                  />
                  <Button onClick={addSubscription}>添加</Button>
                </div>

                <div className="space-y-2">
                  {subscriptions.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded"
                    >
                      <div className="flex items-center gap-2">
                        <span>{sub.accountName}</span>
                        <Badge variant={sub.isActive ? 'default' : 'secondary'}>
                          {sub.isActive ? '启用' : '禁用'}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleSubscription(sub.id, sub.isActive)}
                        >
                          {sub.isActive ? '禁用' : '启用'}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteSubscription(sub.id)}
                        >
                          删除
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 关键词管理 */}
          <Card>
            <CardHeader>
              <CardTitle>关键词管理</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="关键词"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                  />
                  <Select value={newCategory} onValueChange={setNewCategory}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={addKeyword}>添加</Button>
                </div>

                <div className="space-y-2">
                  {keywords.map((kw) => (
                    <div
                      key={kw.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded"
                    >
                      <div className="flex items-center gap-2">
                        <span>{kw.keyword}</span>
                        <Badge variant="outline">{kw.category}</Badge>
                        <Badge variant={kw.isActive ? 'default' : 'secondary'}>
                          {kw.isActive ? '启用' : '禁用'}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleKeyword(kw.id, kw.isActive)}
                        >
                          {kw.isActive ? '禁用' : '启用'}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteKeyword(kw.id)}
                        >
                          删除
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
