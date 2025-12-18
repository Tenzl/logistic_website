import { useState, useEffect } from 'react'
import { Anchor, Plus, Edit2, Trash2, Save, X, Check, AlertCircle } from 'lucide-react'
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
import { provinceService, Province } from '@/features/logistics/services/provinceService'
import { portService, Port } from '@/features/logistics/services/portService'

export function ManagePorts() {
  const [provinces, setProvinces] = useState<Province[]>([])
  const [selectedProvince, setSelectedProvince] = useState<number | null>(null)
  const [ports, setPorts] = useState<Port[]>([])
  const [newPortName, setNewPortName] = useState('')
  const [editingPortId, setEditingPortId] = useState<number | null>(null)
  const [editingPortName, setEditingPortName] = useState('')
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; port: Port | null }>({
    isOpen: false,
    port: null,
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadProvinces()
  }, [])

  useEffect(() => {
    if (selectedProvince) {
      loadPorts(selectedProvince)
    } else {
      setPorts([])
    }
  }, [selectedProvince])

  const loadProvinces = async () => {
    try {
      const data = await provinceService.getAllProvinces()
      setProvinces(data)
    } catch (error) {
      console.error('Error loading provinces:', error)
      showAlert('error', 'Failed to load provinces')
    }
  }

  const loadPorts = async (provinceId: number) => {
    try {
      setLoading(true)
      const data = await portService.getPortsByProvince(provinceId)
      setPorts(data)
    } catch (error) {
      console.error('Error loading ports:', error)
      showAlert('error', 'Failed to load ports')
    } finally {
      setLoading(false)
    }
  }

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message })
    setTimeout(() => setAlert(null), 3000)
  }

  const handleAddPort = async () => {
    if (!selectedProvince) {
      showAlert('error', 'Please select a province first')
      return
    }
    if (!newPortName.trim()) {
      showAlert('error', 'Port name cannot be empty')
      return
    }

    try {
      setLoading(true)
      const newPort = await portService.createPort({
        name: newPortName.trim(),
        provinceId: selectedProvince,
      })
      
      setPorts([...ports, newPort])
      setNewPortName('')
      showAlert('success', `Port "${newPort.name}" added successfully`)
    } catch (error) {
      console.error('Error adding port:', error)
      showAlert('error', 'Failed to add port')
    } finally {
      setLoading(false)
    }
  }

  const handleEditPort = (port: Port) => {
    setEditingPortId(port.id)
    setEditingPortName(port.name)
  }

  const handleSavePort = async (portId: number) => {
    if (!editingPortName.trim()) {
      showAlert('error', 'Port name cannot be empty')
      return
    }

    if (!selectedProvince) {
      showAlert('error', 'Province not selected')
      return
    }

    try {
      setLoading(true)
      const updatedPort = await portService.updatePort(portId, {
        name: editingPortName.trim(),
        provinceId: selectedProvince,
      })
      
      setPorts(ports.map(p => p.id === portId ? updatedPort : p))
      setEditingPortId(null)
      setEditingPortName('')
      showAlert('success', 'Port updated successfully')
    } catch (error) {
      console.error('Error updating port:', error)
      showAlert('error', 'Failed to update port')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingPortId(null)
    setEditingPortName('')
  }

  const handleDeletePort = (port: Port) => {
    setDeleteDialog({ isOpen: true, port })
  }

  const confirmDeletePort = async () => {
    if (!deleteDialog.port) return

    try {
      setLoading(true)
      await portService.deletePort(deleteDialog.port.id)
      setPorts(ports.filter(p => p.id !== deleteDialog.port!.id))
      showAlert('success', `Port "${deleteDialog.port.name}" deleted successfully`)
    } catch (error) {
      console.error('Error deleting port:', error)
      showAlert('error', 'Failed to delete port')
    } finally {
      setLoading(false)
      setDeleteDialog({ isOpen: false, port: null })
    }
  }

  return (
    <div className="space-y-6">
      {/* Alert */}
      {alert && (
        <Alert variant={alert.type === 'success' ? 'default' : 'destructive'}>
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

      {/* Province Selector */}
      <div className="bg-card border rounded-lg p-6">
        <h2 className="mb-4 flex items-center gap-2">
          <Anchor className="h-5 w-5 text-primary" />
          Manage Ports
        </h2>
        
        <div>
          <label className="block text-sm font-medium mb-2">Select Province</label>
          <select
            value={selectedProvince || ''}
            onChange={(e) => setSelectedProvince(e.target.value ? Number(e.target.value) : null)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">-- Select Province --</option>
            {provinces.map(province => (
              <option key={province.id} value={province.id}>{province.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Empty State */}
      {!selectedProvince ? (
        <div className="bg-card border rounded-lg p-12 text-center">
          <Anchor className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Select a province to manage its ports</p>
        </div>
      ) : (
        <>
          {/* Add New Port */}
          <div className="bg-card border rounded-lg p-6">
            <h3 className="mb-4 font-semibold">Add New Port</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newPortName}
                onChange={(e) => setNewPortName(e.target.value)}
                placeholder="Enter port name..."
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                onKeyPress={(e) => e.key === 'Enter' && handleAddPort()}
              />
              <Button onClick={handleAddPort}>
                <Plus className="mr-2 h-4 w-4" />
                Add Port
              </Button>
            </div>
          </div>

          {/* Ports List */}
          <div className="bg-card border rounded-lg overflow-hidden">
            <div className="p-4 border-b bg-muted/30">
              <h3 className="font-semibold">
                Ports in {provinces.find(p => p.id === selectedProvince)?.name} ({ports.length})
              </h3>
            </div>

            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4" />
                <p className="text-muted-foreground">Loading ports...</p>
              </div>
            ) : ports.length === 0 ? (
              <div className="p-12 text-center">
                <Anchor className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No ports found. Add one above.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium">Port Name</th>
                      <th className="text-right py-3 px-4 font-medium w-32">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ports.map((port) => (
                      <tr key={port.id} className="border-t hover:bg-muted/20">
                        <td className="py-3 px-4">
                          {editingPortId === port.id ? (
                            <input
                              type="text"
                              value={editingPortName}
                              onChange={(e) => setEditingPortName(e.target.value)}
                              className="w-full px-3 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                              autoFocus
                            />
                          ) : (
                            <span>{port.name}</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2 justify-end">
                            {editingPortId === port.id ? (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleSavePort(port.id)}
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
                                  onClick={() => handleEditPort(port)}
                                  className="text-primary hover:text-primary/90 hover:bg-primary/10"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeletePort(port)}
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

      <AlertDialog open={deleteDialog.isOpen} onOpenChange={(open) => !open && setDeleteDialog({ isOpen: false, port: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete port "<strong>{deleteDialog.port?.name}</strong>"?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeletePort} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
