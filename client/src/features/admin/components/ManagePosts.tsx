'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table'
import { Badge } from '@/shared/components/ui/badge'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { Loader2, Edit, Trash2, Plus, Eye, FileText, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

interface Post {
  id: number
  title: string
  content: string
  excerpt: string
  status?: 'DRAFT' | 'PUBLISHED'
  isPublished?: boolean
  categoryId: number
  categoryName?: string
  categories?: { id?: number; name: string }[]
  authorId: number
  authorName?: string
  imageUrl?: string
  createdAt: string
  updatedAt: string
  publishedAt?: string
}

export function ManagePosts() {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState<number | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('auth_token')
      const response = await axios.get(`${API_BASE_URL}/api/admin/posts`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      })
      const payload = response.data?.data ?? response.data
      const normalized = Array.isArray(payload)
        ? payload.map((p: any) => ({
            ...p,
            categories: Array.isArray(p.categories) ? p.categories : [],
            status: p.status ?? (p.isPublished ? 'PUBLISHED' : 'DRAFT'),
            isPublished: p.isPublished ?? (p.status === 'PUBLISHED'),
          }))
        : []
      setPosts(normalized)
    } catch (error) {
      console.error('Error fetching posts:', error)
      setMessage({ type: 'error', text: 'Failed to load posts' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) return

    setIsDeleting(id)
    try {
      const token = localStorage.getItem('auth_token')
      await axios.delete(`${API_BASE_URL}/api/admin/posts/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      })
      setPosts(prev => prev.filter(post => post.id !== id))
      setMessage({ type: 'success', text: 'Post deleted successfully' })
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error('Error deleting post:', error)
      setMessage({ type: 'error', text: 'Failed to delete post' })
    } finally {
      setIsDeleting(null)
    }
  }

  const handleStatusToggle = async (id: number, currentStatus: string | undefined, isPublished?: boolean) => {
    const current = currentStatus ?? (isPublished ? 'PUBLISHED' : 'DRAFT')
    const newStatus = current === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED'
    try {
      const token = localStorage.getItem('auth_token')
      const endpoint = newStatus === 'PUBLISHED'
        ? `${API_BASE_URL}/api/admin/posts/${id}/publish`
        : `${API_BASE_URL}/api/admin/posts/${id}/unpublish`
      await axios.post(endpoint, {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      })
      setPosts(prev => prev.map(post => 
        post.id === id
          ? { ...post, status: newStatus as Post['status'], isPublished: newStatus === 'PUBLISHED' }
          : post
      ))
      setMessage({ type: 'success', text: `Post ${newStatus.toLowerCase()} successfully` })
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error('Error updating post status:', error)
      setMessage({ type: 'error', text: 'Failed to update post status' })
    }
  }

  const getStatusBadge = (status?: string, isPublished?: boolean) => {
    const effective = status ?? (isPublished ? 'PUBLISHED' : 'DRAFT')
    return effective === 'PUBLISHED' 
      ? <Badge variant="default">Published</Badge>
      : <Badge variant="secondary">Draft</Badge>
  }

  const isPublishedEffective = (post: Post) => {
    const effective = post.status ?? (post.isPublished ? 'PUBLISHED' : 'DRAFT')
    return effective === 'PUBLISHED'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Manage Posts</h2>
          <p className="text-muted-foreground">
            Create and manage blog posts and articles
          </p>
        </div>
        <Button onClick={() => router.push('/admin/post-editor/new')}>
          <Plus className="mr-2 h-4 w-4" />
          New Post
        </Button>
      </div>

      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          {message.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Posts ({posts.length})</CardTitle>
          <CardDescription>
            View and manage all blog posts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {posts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No posts yet. Create your first post!</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => router.push('/admin/post-editor/new')}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Post
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Categories</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{truncateText(post.title, 50)}</p>
                          {post.excerpt && (
                            <p className="text-sm text-muted-foreground">
                              {truncateText(post.excerpt, 80)}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {post.categories && post.categories.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {post.categories.map((cat: any) => (
                              <Badge key={cat.id || cat.name} variant="outline">{cat.name}</Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <button
                          type="button"
                          onClick={() => handleStatusToggle(post.id, post.status, post.isPublished)}
                          className="inline-flex items-center"
                        >
                          {getStatusBadge(post.status, post.isPublished)}
                        </button>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {post.publishedAt ? formatDate(post.publishedAt) : formatDate(post.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {isPublishedEffective(post) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/insights/${post.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/admin/post-editor/${post.id}`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(post.id)}
                            disabled={isDeleting === post.id}
                          >
                            {isDeleting === post.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 text-destructive" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
