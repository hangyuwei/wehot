'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Article {
  id: string
  title: string
  summary: string
  url: string
  coverUrl: string | null
  accountName: string
  readCount: number
  likeCount: number
  publishedAt: string
  category: string
  keywords: string[]
}

const CATEGORIES = ['all', '科技', '健康', '财经', '教育', '娱乐', '其他']

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('all')
  const [sortBy, setSortBy] = useState('hot')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchArticles()
  }, [category, sortBy, page])

  const fetchArticles = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        sort: sortBy,
        ...(category !== 'all' && { category }),
        ...(searchQuery && { keyword: searchQuery }),
      })

      const response = await fetch(`/api/articles?${params}`)
      const data = await response.json()

      setArticles(data.articles || [])
      setTotalPages(data.pagination?.totalPages || 1)
    } catch (error) {
      console.error('Failed to fetch articles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPage(1)
    fetchArticles()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">WeHot 微热</h1>
            <Link href="/settings">
              <Button variant="outline">设置</Button>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="搜索文章标题或内容..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch}>搜索</Button>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {CATEGORIES.map((cat) => (
              <Badge
                key={cat}
                variant={category === cat ? 'default' : 'outline'}
                className="cursor-pointer whitespace-nowrap"
                onClick={() => {
                  setCategory(cat)
                  setPage(1)
                }}
              >
                {cat === 'all' ? '全部' : cat}
              </Badge>
            ))}
          </div>
        </div>
      </header>

      {/* Sort Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <Tabs value={sortBy} onValueChange={setSortBy}>
          <TabsList>
            <TabsTrigger value="hot">热度优先</TabsTrigger>
            <TabsTrigger value="latest">最新优先</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Articles Grid */}
      <main className="max-w-7xl mx-auto px-4 pb-8">
        {loading ? (
          <div className="text-center py-12">加载中...</div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            暂无文章，请先在设置页面配置关键词或订阅公众号
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {articles.map((article) => (
                <Card key={article.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="p-0">
                    {article.coverUrl && (
                      <img
                        src={article.coverUrl}
                        alt={article.title}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                    )}
                  </CardHeader>
                  <CardContent className="p-4">
                    <CardTitle className="text-lg mb-2 line-clamp-2">
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-600"
                      >
                        {article.title}
                      </a>
                    </CardTitle>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {article.summary}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{article.accountName}</span>
                      <span>{article.readCount > 0 ? `${article.readCount} 阅读` : ''}</span>
                    </div>
                    <div className="mt-2">
                      <Badge variant="secondary">{article.category}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  上一页
                </Button>
                <span className="flex items-center px-4">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  下一页
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
