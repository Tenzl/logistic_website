'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { Building2, MapPin, Plus, Edit, Trash2, Save, X } from 'lucide-react'
import { apiClient } from '@/shared/utils/apiClient'
import { API_CONFIG } from '@/shared/config/api.config'
import { provinceService, type Province } from '@/modules/logistics/services/provinceService'
import type { ApiResponse } from '@/shared/types/api.types'

interface Office {
  id: number
  provinceId?: number
  name: string
  city: string
  region: string
  address: string
  latitude?: number
  longitude?: number
  manager: {
    name: string
    title: string
    mobile: string
    email: string
  }
  coordinates?: {
    lat?: number
    lng?: number
  }
  isHeadquarter: boolean
  isActive: boolean
}

export function ManageOffices() {
  const [offices, setOffices] = useState<Office[]>([])
  const [provinces, setProvinces] = useState<Province[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<number | null>(null)
  const [adding, setAdding] = useState(false)
  const [useManualCoordinates, setUseManualCoordinates] = useState(false)
  const [formData, setFormData] = useState({
    provinceId: '',
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    managerName: '',
    managerTitle: '',
    managerMobile: '',
    managerEmail: '',
    isHeadquarter: false
  })

  useEffect(() => {
    fetchOffices()
    fetchProvinces()
  }, [])

  const fetchOffices = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get<ApiResponse<Office[]>>(API_CONFIG.OFFICES.ADMIN_BASE)
      const data = await response.json()
      setOffices(data.data)
    } catch (error) {
      console.error('Error fetching offices:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProvinces = async () => {
    try {
      const data = await provinceService.getAllProvinces()
      setProvinces(data)
    } catch (error) {
      console.error('Error fetching provinces:', error)
    }
  }

  const handleAdd = () => {
    setAdding(true)
    setEditing(null)
    setUseManualCoordinates(false)
    setFormData({
      provinceId: '',
      name: '',
      address: '',
      latitude: '',
      longitude: '',
      managerName: '',
      managerTitle: '',
      managerMobile: '',
      managerEmail: '',
      isHeadquarter: false
    })
  }

  const handleEdit = (office: Office) => {
    setEditing(office.id)
    setAdding(false)
    const normalize = (value?: string) => (value || '').toLowerCase().trim()
    const matchedProvinceId = office.provinceId
      ?? provinces.find(p => normalize(p.name) === normalize(office.city) || normalize(p.name) === normalize(office.region))?.id
    
    // Set manual coordinates mode if office has coordinates
    const hasCoordinates = office.latitude != null && office.longitude != null && 
                          (office.latitude !== 0 || office.longitude !== 0)
    setUseManualCoordinates(hasCoordinates)
    
    setFormData({
      provinceId: matchedProvinceId ? matchedProvinceId.toString() : '',
      name: office.name,
      address: office.address,
      latitude: office.latitude?.toString() || '',
      longitude: office.longitude?.toString() || '',
      managerName: office.manager?.name || '',
      managerTitle: office.manager?.title || '',
      managerMobile: office.manager?.mobile || '',
      managerEmail: office.manager?.email || '',
      isHeadquarter: office.isHeadquarter
    })
  }

  const handleSave = async () => {
    // Validate required fields
    if (!formData.provinceId || !formData.name || !formData.address) {
      alert('Please fill in required fields (Province, Name, Address)')
      return
    }

    // Validate coordinates if manual mode is enabled
    if (useManualCoordinates && (!formData.latitude || !formData.longitude)) {
      alert('Please enter both Latitude and Longitude when using manual coordinates mode')
      return
    }

    try {
      const payload: Record<string, unknown> = {
        provinceId: parseInt(formData.provinceId),
        name: formData.name,
        address: formData.address,
        managerName: formData.managerName,
        managerTitle: formData.managerTitle,
        managerMobile: formData.managerMobile,
        managerEmail: formData.managerEmail,
        isHeadquarter: formData.isHeadquarter,
        isActive: true
      }

      // If manual coordinates enabled, send coordinates; otherwise send 0
      if (useManualCoordinates) {
        payload.latitude = formData.latitude ? parseFloat(formData.latitude) : 0
        payload.longitude = formData.longitude ? parseFloat(formData.longitude) : 0
      } else {
        payload.latitude = 0
        payload.longitude = 0
      }

      console.log('Saving office:', payload)

      const url = editing 
        ? API_CONFIG.OFFICES.ADMIN_BY_ID(editing)
        : API_CONFIG.OFFICES.ADMIN_BASE

      const response = editing
        ? await apiClient.put<ApiResponse<Office>>(url, payload)
        : await apiClient.post<ApiResponse<Office>>(url, payload)

      if (response.ok) {
        const data = await response.json()
        alert('Office saved successfully!')
        if (editing) {
          setOffices(prev => prev.map(item => item.id === editing ? data.data : item))
        } else {
          setOffices(prev => [...prev, data.data])
        }
        setEditing(null)
        setAdding(false)
      } else {
        let errorMessage = response.statusText
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorMessage
        } catch (e) {
          // Response body is empty or not JSON
        }
        console.error('Error response:', errorMessage)
        alert(`Failed to save office: ${errorMessage}`)
      }
    } catch (error) {
      console.error('Error saving office:', error)
      alert('An error occurred while saving the office. Check console for details.')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this office?')) return
    
    try {
      const response = await apiClient.delete(API_CONFIG.OFFICES.ADMIN_BY_ID(id))

      if (response.ok) {
        setOffices(prev => prev.filter(office => office.id !== id))
      }
    } catch (error) {
      console.error('Error deleting office:', error)
    }
  }

  const handleCancel = () => {
    setEditing(null)
    setAdding(false)
  }

  if (loading) {
    return <div className="p-8">Loading offices...</div>
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Manage Offices</h1>
          <p className="text-muted-foreground">Manage company office locations and contact information</p>
        </div>
        <Button onClick={handleAdd} disabled={adding || editing !== null}>
          <Plus className="mr-2 h-4 w-4" />
          Add Office
        </Button>
      </div>

      {/* Add/Edit Form */}
      {(adding || editing !== null) && (
        <div className="bg-card border rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {adding ? 'Add New Office' : 'Edit Office'}
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="provinceId">Province *</Label>
              <select
                id="provinceId"
                name="provinceId"
                aria-label="Select province"
                value={formData.provinceId}
                onChange={(e) => setFormData({ ...formData, provinceId: e.target.value })}
                className="w-full mt-2 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                required
              >
                <option value="">Select province...</option>
                {provinces.map(province => (
                  <option key={province.id} value={province.id}>
                    {province.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="name">Office Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., SEATRANS Head Office"
                required
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Full address"
                rows={2}
                required
              />
            </div>

            <div className="md:col-span-2 flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <input
                type="checkbox"
                id="useManualCoordinates"
                name="useManualCoordinates"
                aria-label="Use manual coordinates instead of address"
                checked={useManualCoordinates}
                onChange={(e) => {
                  setUseManualCoordinates(e.target.checked)
                  if (!e.target.checked) {
                    setFormData({ ...formData, latitude: '', longitude: '' })
                  }
                }}
                className="h-4 w-4"
              />
              <Label htmlFor="useManualCoordinates" className="!mb-0 cursor-pointer">
                Nhập tọa độ thủ công (Latitude/Longitude) thay vì dùng địa chỉ để hiển thị trên bản đồ Google
              </Label>
            </div>

            <div>
              <Label htmlFor="latitude">Latitude {useManualCoordinates && '*'}</Label>
              <Input
                id="latitude"
                type="number"
                step="0.00000001"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                placeholder="e.g., 10.7769"
                disabled={!useManualCoordinates}
                required={useManualCoordinates}
              />
            </div>

            <div>
              <Label htmlFor="longitude">Longitude {useManualCoordinates && '*'}</Label>
              <Input
                id="longitude"
                type="number"
                step="0.00000001"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                placeholder="e.g., 106.7009"
                disabled={!useManualCoordinates}
                required={useManualCoordinates}
              />
            </div>

            <div>
              <Label htmlFor="managerName">Manager Name</Label>
              <Input
                id="managerName"
                value={formData.managerName}
                onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                placeholder="e.g., Minh Khang (Mr)"
              />
            </div>

            <div>
              <Label htmlFor="managerTitle">Manager Title</Label>
              <Input
                id="managerTitle"
                value={formData.managerTitle}
                onChange={(e) => setFormData({ ...formData, managerTitle: e.target.value })}
                placeholder="e.g., Office Supervisor"
              />
            </div>

            <div>
              <Label htmlFor="managerMobile">Manager Mobile</Label>
              <Input
                id="managerMobile"
                value={formData.managerMobile}
                onChange={(e) => setFormData({ ...formData, managerMobile: e.target.value })}
                placeholder="e.g., +84 90-111-2233"
              />
            </div>

            <div>
              <Label htmlFor="managerEmail">Manager Email</Label>
              <Input
                id="managerEmail"
                type="email"
                value={formData.managerEmail}
                onChange={(e) => setFormData({ ...formData, managerEmail: e.target.value })}
                placeholder="e.g., office@seatrans.com.vn"
              />
            </div>

            <div className="md:col-span-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="isHeadquarter"
                name="isHeadquarter"
                aria-label="Mark as head office"
                checked={formData.isHeadquarter}
                onChange={(e) => setFormData({ ...formData, isHeadquarter: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="isHeadquarter" className="!mb-0 cursor-pointer">
                Mark as Head Office
              </Label>
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
            <Button onClick={handleCancel} variant="outline">
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Offices List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {offices.map(office => (
          <div
            key={office.id}
            className="bg-card border rounded-lg p-4 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  {office.city}
                  {office.isHeadquarter && (
                    <span className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 rounded">
                      HQ
                    </span>
                  )}
                </h3>
                <p className="text-sm text-muted-foreground">{office.name}</p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">{office.address}</p>
              </div>
              <div className="text-sm">
                <p className="font-medium">{office.manager.name}</p>
                <p className="text-muted-foreground">{office.manager.title}</p>
                <p className="text-primary">{office.manager.mobile}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleEdit(office)}
                disabled={adding || editing !== null}
                className="flex-1"
              >
                <Edit className="mr-1 h-3.5 w-3.5" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDelete(office.id)}
                disabled={adding || editing !== null}
                className="flex-1"
              >
                <Trash2 className="mr-1 h-3.5 w-3.5" />
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
