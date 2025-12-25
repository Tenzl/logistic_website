'use client'

import { useEffect, useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, Loader2, ListChecks } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { Badge } from '@/shared/components/ui/badge'
import { Checkbox } from '@/shared/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table'
import { useToast } from '@/shared/hooks/use-toast'

interface ServiceTypeOption {
  id: number
  name: string
  displayName?: string
}

interface FormField {
  id: number
  key: string
  label: string
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'number' | 'date'
  required: boolean
  placeholder?: string | null
  gridSpan: number
  options?: string | null
  position: number
  isActive: boolean
  meta?: string | null
}

type FieldType = FormField['type']

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'email', label: 'Email' },
  { value: 'tel', label: 'Phone' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'select', label: 'Select' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
]

export function ManageFormFields() {
  const { toast } = useToast()
  const [services, setServices] = useState<ServiceTypeOption[]>([])
  const [selectedService, setSelectedService] = useState<string>('')
  const [fields, setFields] = useState<FormField[]>([])
  const [loadingServices, setLoadingServices] = useState(true)
  const [loadingFields, setLoadingFields] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<FormField | null>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    key: '',
    label: '',
    type: 'text' as FieldType,
    required: false,
    placeholder: '',
    gridSpan: 12,
    optionsText: '',
    position: 1,
    isActive: true,
    meta: '',
  })

  const nextPosition = useMemo(() => (fields.length > 0 ? fields[fields.length - 1].position + 1 : 1), [fields])

  useEffect(() => {
    fetchServices()
  }, [])

  useEffect(() => {
    if (selectedService) {
      fetchFields(selectedService)
    }
  }, [selectedService])

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`${API_BASE_URL}/api/service-types`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      if (!response.ok) throw new Error('Failed to load services')
      const data = await response.json()
      const payload = data.data || data
      setServices(Array.isArray(payload) ? payload : [])
    } catch (error) {
      toast({ title: 'Load failed', description: 'Could not load service types', variant: 'destructive' })
    } finally {
      setLoadingServices(false)
    }
  }

  const fetchFields = async (serviceId: string) => {
    setLoadingFields(true)
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`${API_BASE_URL}/api/admin/service-types/${serviceId}/form-fields`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      if (!response.ok) throw new Error('Failed to load form fields')
      const data = await response.json()
      const payload = data.data || data
      setFields(Array.isArray(payload) ? payload : [])
    } catch (error) {
      toast({ title: 'Load failed', description: 'Could not load form fields', variant: 'destructive' })
    } finally {
      setLoadingFields(false)
    }
  }

  const parseOptionsText = (options?: string | null) => {
    if (!options) return ''
    try {
      const parsed = JSON.parse(options)
      if (Array.isArray(parsed)) return parsed.join('\n')
      if (typeof parsed === 'object') return JSON.stringify(parsed, null, 2)
    } catch (error) {
      return options
    }
    return options
  }

  const resetForm = () => {
    setEditing(null)
    setFormData({
      key: '',
      label: '',
      type: 'text',
      required: false,
      placeholder: '',
      gridSpan: 12,
      optionsText: '',
      position: nextPosition,
      isActive: true,
      meta: '',
    })
  }

  const openEditor = (field?: FormField) => {
    if (field) {
      setEditing(field)
      setFormData({
        key: field.key,
        label: field.label,
        type: field.type,
        required: !!field.required,
        placeholder: field.placeholder || '',
        gridSpan: field.gridSpan ?? 12,
        optionsText: parseOptionsText(field.options),
        position: field.position ?? 1,
        isActive: field.isActive ?? true,
        meta: field.meta || '',
      })
    } else {
      resetForm()
    }
    setDialogOpen(true)
  }

  const buildOptionsPayload = () => {
    if (formData.type !== 'select') return null
    const raw = formData.optionsText.trim()
    if (!raw) return null

    try {
      const parsed = JSON.parse(raw)
      return JSON.stringify(parsed)
    } catch (error) {
      const lines = raw.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
      if (lines.length === 0) return null
      return JSON.stringify(lines)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedService) {
      toast({ title: 'Choose a service', description: 'Select a service type first', variant: 'destructive' })
      return
    }

    const optionsPayload = buildOptionsPayload()
    const payload = {
      key: formData.key.trim(),
      label: formData.label.trim(),
      type: formData.type,
      required: formData.required,
      placeholder: formData.placeholder || null,
      gridSpan: Number(formData.gridSpan) || 12,
      options: optionsPayload,
      position: Number(formData.position) || 1,
      isActive: formData.isActive,
      meta: formData.meta || null,
    }

    setSaving(true)
    try {
      const token = localStorage.getItem('auth_token')
      const baseUrl = `${API_BASE_URL}/api/admin/service-types/${selectedService}/form-fields`
      const response = await fetch(editing ? `${baseUrl}/${editing.id}` : baseUrl, {
        method: editing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const result = await response.json().catch(() => ({}))
        const message = result.message || result.error || 'Save failed'
        throw new Error(message)
      }

      toast({ title: 'Saved', description: `Field ${editing ? 'updated' : 'created'} successfully` })
      setDialogOpen(false)
      resetForm()
      fetchFields(selectedService)
    } catch (error: any) {
      toast({ title: 'Save failed', description: error?.message || 'Could not save field', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!selectedService) return
    if (!confirm('Delete this form field?')) return

    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`${API_BASE_URL}/api/admin/service-types/${selectedService}/form-fields/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        const message = payload.message || payload.error || 'Delete failed'
        throw new Error(message)
      }

      toast({ title: 'Deleted', description: 'Field removed successfully' })
      fetchFields(selectedService)
    } catch (error: any) {
      toast({ title: 'Delete failed', description: error?.message || 'Could not delete field', variant: 'destructive' })
    }
  }

  if (loadingServices) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ListChecks className="h-5 w-5" /> Form Fields
              </CardTitle>
              <CardDescription>Configure dynamic inquiry fields per service</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Select value={selectedService} onValueChange={setSelectedService}>
                <SelectTrigger className="w-56">
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((s) => (
                    <SelectItem key={s.id} value={s.id.toString()}>
                      {s.displayName || s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => openEditor()} disabled={!selectedService}>
                <Plus className="mr-2 h-4 w-4" /> Add Field
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!selectedService && (
            <div className="text-sm text-muted-foreground">Select a service to view and edit its form fields.</div>
          )}

          {selectedService && (
            <div className="space-y-4">
              {loadingFields ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading fields...
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Label</TableHead>
                        <TableHead>Key</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Required</TableHead>
                        <TableHead>Grid</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Active</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fields.map((field) => (
                        <TableRow key={field.id}>
                          <TableCell className="font-medium">{field.label}</TableCell>
                          <TableCell className="text-muted-foreground">{field.key}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{field.type}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={field.required ? 'default' : 'secondary'}>
                              {field.required ? 'Yes' : 'No'}
                            </Badge>
                          </TableCell>
                          <TableCell>{field.gridSpan}</TableCell>
                          <TableCell>{field.position}</TableCell>
                          <TableCell>
                            <Badge variant={field.isActive ? 'default' : 'secondary'}>
                              {field.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={() => openEditor(field)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(field.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {fields.length === 0 && (
                    <div className="text-sm text-muted-foreground py-6">No fields configured for this service.</div>
                  )}
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Field' : 'Add Field'}</DialogTitle>
            <DialogDescription>Define non-identity inquiry fields for this service.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="label">Label</Label>
                <Input
                  id="label"
                  value={formData.label}
                  onChange={(e) => setFormData((prev) => ({ ...prev, label: e.target.value }))}
                  placeholder="e.g., Cargo type"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="key">Key</Label>
                <Input
                  id="key"
                  value={formData.key}
                  onChange={(e) => setFormData((prev) => ({ ...prev, key: e.target.value }))}
                  placeholder="cargotype"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: FieldType) => setFormData((prev) => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {FIELD_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="placeholder">Placeholder</Label>
                <Input
                  id="placeholder"
                  value={formData.placeholder}
                  onChange={(e) => setFormData((prev) => ({ ...prev, placeholder: e.target.value }))}
                  placeholder="Optional placeholder"
                />
              </div>
            </div>

            {formData.type === 'select' && (
              <div className="space-y-2">
                <Label htmlFor="options">Options</Label>
                <Textarea
                  id="options"
                  value={formData.optionsText}
                  onChange={(e) => setFormData((prev) => ({ ...prev, optionsText: e.target.value }))}
                  placeholder="One option per line or JSON array"
                  rows={4}
                />
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="gridSpan">Grid Span (1-12)</Label>
                <Input
                  id="gridSpan"
                  type="number"
                  min={1}
                  max={12}
                  value={formData.gridSpan}
                  onChange={(e) => setFormData((prev) => ({ ...prev, gridSpan: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  type="number"
                  min={1}
                  value={formData.position}
                  onChange={(e) => setFormData((prev) => ({ ...prev, position: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meta">Meta (optional)</Label>
                <Input
                  id="meta"
                  value={formData.meta}
                  onChange={(e) => setFormData((prev) => ({ ...prev, meta: e.target.value }))}
                  placeholder="JSON or notes"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-6 pt-2">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={formData.required}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, required: !!checked }))}
                />
                Required
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: !!checked }))}
                />
                Active
              </label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
