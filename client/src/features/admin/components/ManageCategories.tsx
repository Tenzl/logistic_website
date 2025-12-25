'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { Loader2, Plus, Edit, Trash2, FolderOpen, AlertCircle, CheckCircle2 } from 'lucide-react'
import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

interface Category {
  id: number
  name: string
  description?: string
  slug: string
  postCount?: number
  createdAt: string
  updatedAt: string
}

export function ManageCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState<number | null>(null)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    slug: ''
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('auth_token')
      const response = await axios.get(`${API_BASE_URL}/api/admin/categories`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      })
      const payload = response.data?.data ?? response.data
      setCategories(Array.isArray(payload) ? payload : [])
    } catch (error) {
      console.error('Error fetching categories:', error)
      setMessage({ type: 'error', text: 'Failed to load categories' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const token = localStorage.getItem('auth_token')
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined
      if (editingCategory) {
        await axios.put(`${API_BASE_URL}/api/admin/categories/${editingCategory.id}`, formData, { headers })
        setCategories(prev => prev.map(cat => 
          cat.id === editingCategory.id ? { ...cat, ...formData } : cat
        ))
        setMessage({ type: 'success', text: 'Category updated successfully' })
      } else {
        const response = await axios.post(`${API_BASE_URL}/api/admin/categories`, formData, { headers })
        const created = response.data?.data ?? response.data
        setCategories(prev => [...prev, created])
        setMessage({ type: 'success', text: 'Category created successfully' })
      }
      
      setIsDialogOpen(false)
      resetForm()
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error('Error saving category:', error)
      setMessage({ type: 'error', text: 'Failed to save category' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category? Posts in this category will be uncategorized.')) return

    setIsDeleting(id)
    try {
      const token = localStorage.getItem('auth_token')
      await axios.delete(`${API_BASE_URL}/api/admin/categories/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      })
      setCategories(prev => prev.filter(cat => cat.id !== id))
      setMessage({ type: 'success', text: 'Category deleted successfully' })
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error('Error deleting category:', error)
      setMessage({ type: 'error', text: 'Failed to delete category' })
    } finally {
      setIsDeleting(null)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || '',
      slug: category.slug
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setEditingCategory(null)
    setFormData({
      name: '',
      description: '',
      slug: ''
    })
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleNameChange = (name: string) => {
    const capitalized = name.charAt(0).toUpperCase() + name.slice(1)
    setFormData(prev => ({
      ...prev,
      name: capitalized,
      slug: editingCategory ? prev.slug : generateSlug(capitalized)
    }))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
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
          <h2 className="text-2xl font-bold tracking-tight">Manage Categories</h2>
          <p className="text-muted-foreground">
            Organize your content with categories
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </DialogTitle>
              <DialogDescription>
                {editingCategory 
                  ? 'Update category information' 
                  : 'Add a new category to organize your posts'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Category Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Enter category name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  placeholder="category-slug"
                  disabled
                  readOnly
                />
                <p className="text-xs text-muted-foreground">
                  URL-friendly version of the name
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of this category"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    editingCategory ? 'Update' : 'Create'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
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
          <CardTitle>All Categories ({categories.length})</CardTitle>
          <CardDescription>
            Manage post categories and tags
          </CardDescription>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No categories yet. Create your first category!</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Posts</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {category.slug}
                        </code>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="text-sm text-muted-foreground truncate">
                          {category.description || '—'}
                        </p>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{category.postCount || 0}</span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(category.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(category)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(category.id)}
                            disabled={isDeleting === category.id}
                          >
                            {isDeleting === category.id ? (
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
