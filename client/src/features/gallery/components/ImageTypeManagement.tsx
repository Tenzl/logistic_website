import { useState, useEffect } from 'react'
import { Package, Plus, Edit2, Trash2, Save, X, Check, AlertCircle } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog'
import { serviceTypeService, ServiceType } from '@/features/services-config/services/serviceTypeService'
import { imageTypeService, ImageType, CreateImageTypeRequest } from '@/features/gallery/services/imageTypeService'

export function ManageImageTypes() {
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([])
  const [selectedServiceType, setSelectedServiceType] = useState<number | null>(null)
  const [imageTypes, setImageTypes] = useState<ImageType[]>([])
  const [loading, setLoading] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; type: ImageType | null }>({
    isOpen: false,
    type: null,
  })
  
  const [newImageType, setNewImageType] = useState({
    name: '',
    displayName: '',
    requiredImageCount: 18,
  })
  
  const [editingTypeId, setEditingTypeId] = useState<number | null>(null)
  const [editingData, setEditingData] = useState({
    name: '',
    displayName: '',
    requiredImageCount: 18,
  })
  
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  useEffect(() => {
    loadServiceTypes()
  }, [])

  useEffect(() => {
    if (selectedServiceType) {
      loadImageTypes(selectedServiceType)
    } else {
      setImageTypes([])
    }
  }, [selectedServiceType])

  const loadServiceTypes = async () => {
    try {
      const data = await serviceTypeService.getAllServiceTypes()
      setServiceTypes(data)
    } catch (error) {
      console.error('Error loading service types:', error)
      showAlert('error', 'Failed to load service types')
    }
  }

  const loadImageTypes = async (serviceTypeId: number) => {
    try {
      setLoading(true)
      const data = await imageTypeService.getImageTypesByServiceType(serviceTypeId)
      setImageTypes(data)
    } catch (error) {
      console.error('Error loading image types:', error)
      showAlert('error', 'Failed to load image types')
    } finally {
      setLoading(false)
    }
  }

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message })
    setTimeout(() => setAlert(null), 3000)
  }

  const normalizeImageTypeName = (name: string): string => {
    return name.toUpperCase().replace(/\s+/g, '_').trim()
  }

  const handleAddImageType = async () => {
    if (!selectedServiceType) {
      showAlert('error', 'Please select a service type first')
      return
    }
    if (!newImageType.name.trim() || !newImageType.displayName.trim()) {
      showAlert('error', 'Name and Display Name are required')
      return
    }
    if (newImageType.requiredImageCount < 1) {
      showAlert('error', 'Required count must be at least 1')
      return
    }

    const normalizedName = normalizeImageTypeName(newImageType.name)
    
    // Check for duplicate name
    if (imageTypes.some(t => t.name === normalizedName)) {
      showAlert('error', `Image type "${normalizedName}" already exists`)
      return
    }

    try {
      setLoading(true)
      const requestData: CreateImageTypeRequest = {
        name: normalizedName,
        displayName: newImageType.displayName.trim(),
        requiredImageCount: newImageType.requiredImageCount,
        serviceTypeId: selectedServiceType,
      }
      
      const newType = await imageTypeService.createImageType(requestData)
      setImageTypes([...imageTypes, newType])
      setNewImageType({ name: '', displayName: '', requiredImageCount: 18 })
      showAlert('success', `Commodity type "${newType.displayName}" added successfully`)
    } catch (error) {
      console.error('Error adding image type:', error)
      showAlert('error', 'Failed to add commodity type')
    } finally {
      setLoading(false)
    }
  }

  const handleEditImageType = (type: ImageType) => {
    setEditingTypeId(type.id)
    setEditingData({
      name: type.name,
      displayName: type.displayName,
      requiredImageCount: type.requiredImageCount,
    })
  }

  const handleSaveImageType = async (typeId: number) => {
    if (!editingData.name.trim() || !editingData.displayName.trim()) {
      showAlert('error', 'Name and Display Name are required')
      return
    }
    if (editingData.requiredImageCount < 1) {
      showAlert('error', 'Required count must be at least 1')
      return
    }

    if (!selectedServiceType) {
      showAlert('error', 'Service type not selected')
      return
    }

    const normalizedName = normalizeImageTypeName(editingData.name)

    try {
      setLoading(true)
      const requestData: CreateImageTypeRequest = {
        name: normalizedName,
        displayName: editingData.displayName.trim(),
        requiredImageCount: editingData.requiredImageCount,
        serviceTypeId: selectedServiceType,
      }
      
      const updatedType = await imageTypeService.updateImageType(typeId, requestData)
      setImageTypes(imageTypes.map(t => t.id === typeId ? updatedType : t))
      setEditingTypeId(null)
      showAlert('success', 'Commodity type updated successfully')
    } catch (error) {
      console.error('Error updating image type:', error)
      showAlert('error', 'Failed to update commodity type')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingTypeId(null)
    setEditingData({ name: '', displayName: '', requiredImageCount: 18 })
  }

  const handleDeleteImageType = (type: ImageType) => {
    setDeleteDialog({ isOpen: true, type })
  }

  const confirmDeleteImageType = async () => {
    if (!deleteDialog.type) return

    try {
      setLoading(true)
      await imageTypeService.deleteImageType(deleteDialog.type.id)
      setImageTypes(imageTypes.filter(t => t.id !== deleteDialog.type!.id))
      showAlert('success', `Commodity type "${deleteDialog.type.displayName}" deleted successfully`)
    } catch (error) {
      console.error('Error deleting image type:', error)
      showAlert('error', 'Failed to delete commodity type')
    } finally {
      setLoading(false)
      setDeleteDialog({ isOpen: false, type: null })
    }
  }

  return (
    <div className="space-y-6">
      {/* Service Type Selector */}
      <div className="bg-card border rounded-lg p-6">
        <h2 className="mb-4 flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          Manage Commodity Types
        </h2>
        
        <div>
          <label className="block text-sm font-medium mb-2">Select Service Type</label>
          <select
            value={selectedServiceType || ''}
            onChange={(e) => setSelectedServiceType(e.target.value ? Number(e.target.value) : null)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">-- Select Service Type --</option>
            {serviceTypes.map(service => (
              <option key={service.id} value={service.id}>{service.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Empty State */}
      {!selectedServiceType ? (
        <div className="bg-card border rounded-lg p-12 text-center">
          <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Select a service type to manage its commodity types</p>
        </div>
      ) : (
        <>
          {/* Add New Image Type */}
          <div className="bg-card border rounded-lg p-6">
            <h3 className="mb-4 font-semibold">Add New Commodity Type</h3>
            
            {/* Alert - Moved here from top */}
            {alert && (
              <Alert variant={alert.type === 'success' ? 'default' : 'destructive'} className="mb-4">
                {alert.type === 'success' ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription className="flex items-center justify-between">
                  <span>{alert.message}</span>
                  <button onClick={() => setAlert(null)} className="ml-auto">
                    <X className="h-4 w-4" />
                  </button>
                </AlertDescription>
              </Alert>
            )}

            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name (Technical) *</label>
                <input
                  type="text"
                  value={newImageType.name}
                  onChange={(e) => setNewImageType({ ...newImageType, name: e.target.value })}
                  placeholder="e.g., BULK CARRIER"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Will be converted to: {normalizeImageTypeName(newImageType.name) || 'EXAMPLE_NAME'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Display Name *</label>
                <input
                  type="text"
                  value={newImageType.displayName}
                  onChange={(e) => setNewImageType({ ...newImageType, displayName: e.target.value })}
                  placeholder="e.g., Bulk Carrier"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Required Image Count *</label>
                <input
                  type="number"
                  value={newImageType.requiredImageCount}
                  onChange={(e) => setNewImageType({ ...newImageType, requiredImageCount: parseInt(e.target.value) || 18 })}
                  min="1"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <Button onClick={handleAddImageType}>
              <Plus className="mr-2 h-4 w-4" />
              Add Commodity Type
            </Button>
          </div>

          {/* Image Types List */}
          <div className="bg-card border rounded-lg overflow-hidden">
            <div className="p-4 border-b bg-muted/30">
              <h3 className="font-semibold">
                Commodity Types for {serviceTypes.find(s => s.id === selectedServiceType)?.name} ({imageTypes.length})
              </h3>
            </div>

            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4" />
                <p className="text-muted-foreground">Loading commodity types...</p>
              </div>
            ) : imageTypes.length === 0 ? (
              <div className="p-12 text-center">
                <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No commodity types found. Add one above.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium">Name</th>
                      <th className="text-left py-3 px-4 font-medium">Display Name</th>
                      <th className="text-left py-3 px-4 font-medium">Required Count</th>
                      <th className="text-right py-3 px-4 font-medium w-32">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {imageTypes.map((type) => (
                      <tr key={type.id} className="border-t hover:bg-muted/20">
                        <td className="py-3 px-4">
                          {editingTypeId === type.id ? (
                            <div>
                              <input
                                type="text"
                                value={editingData.name}
                                onChange={(e) => setEditingData({ ...editingData, name: e.target.value })}
                                className="w-full px-3 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                → {normalizeImageTypeName(editingData.name)}
                              </p>
                            </div>
                          ) : (
                            <span className="font-mono text-sm">{type.name}</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {editingTypeId === type.id ? (
                            <input
                              type="text"
                              value={editingData.displayName}
                              onChange={(e) => setEditingData({ ...editingData, displayName: e.target.value })}
                              className="w-full px-3 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          ) : (
                            <span>{type.displayName}</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {editingTypeId === type.id ? (
                            <input
                              type="number"
                              value={editingData.requiredImageCount}
                              onChange={(e) => setEditingData({ ...editingData, requiredImageCount: parseInt(e.target.value) || 18 })}
                              min="1"
                              className="w-full px-3 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          ) : (
                            <span>{type.requiredImageCount}</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2 justify-end">
                            {editingTypeId === type.id ? (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleSaveImageType(type.id)}
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                >
                                  <Save className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={handleCancelEdit}
                                  className="text-muted-foreground hover:text-foreground hover:bg-muted"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditImageType(type)}
                                  className="text-primary hover:text-primary/90 hover:bg-primary/10"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteImageType(type)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      <AlertDialog open={deleteDialog.isOpen} onOpenChange={(open) => !open && setDeleteDialog({ isOpen: false, type: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete commodity type "<strong>{deleteDialog.type?.displayName}</strong>"? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteImageType} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
