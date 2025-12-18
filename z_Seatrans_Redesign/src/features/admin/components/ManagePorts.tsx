'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Loader2, Anchor } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { useToast } from '@/shared/hooks/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'

interface Port {
  id: number
  name: string
  provinceId: number
}

interface Province {
  id: number
  name: string
}

export function ManagePorts() {
  const { toast } = useToast()
  const [provinces, setProvinces] = useState<Province[]>([])
  const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(null)
  const [ports, setPorts] = useState<Port[]>([])
  const [loading, setLoading] = useState(false)
  const [newPortName, setNewPortName] = useState('')
  const [editingPortId, setEditingPortId] = useState<number | null>(null)
  const [editingPortName, setEditingPortName] = useState('')

  useEffect(() => {
    fetchProvinces()
  }, [])

  useEffect(() => {
    if (selectedProvinceId) {
      fetchPorts(selectedProvinceId)
    } else {
      setPorts([])
    }
  }, [selectedProvinceId])

  const fetchProvinces = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('http://localhost:8080/api/provinces', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const result = await response.json()
        setProvinces(result.data || result)
      }
    } catch (error) {
      console.error('Error fetching provinces:', error)
      toast({
        title: 'Error',
        description: 'Failed to load provinces',
        variant: 'destructive'
      })
    }
  }

  const fetchPorts = async (provinceId: number) => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`http://localhost:8080/api/ports/province/${provinceId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const result = await response.json()
        setPorts(result.data || result)
      }
    } catch (error) {
      console.error('Error fetching ports:', error)
      toast({
        title: 'Error',
        description: 'Failed to load ports',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddPort = async () => {
    if (!selectedProvinceId) {
      toast({
        title: 'Error',
        description: 'Please select a province first',
        variant: 'destructive'
      })
      return
    }
    
    if (!newPortName.trim()) {
      toast({
        title: 'Error',
        description: 'Port name cannot be empty',
        variant: 'destructive'
      })
      return
    }

    try {
      setLoading(true)
      const token = localStorage.getItem('auth_token')
      const response = await fetch('http://localhost:8080/api/ports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newPortName.trim(),
          provinceId: selectedProvinceId
        })
      })

      if (response.ok) {
        const newPort = await response.json()
        setPorts([...ports, newPort])
        setNewPortName('')
        toast({
          title: 'Success',
          description: 'Port added successfully'
        })
      } else {
        throw new Error('Failed to add port')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add port',
        variant: 'destructive'
      })
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
      toast({
        title: 'Error',
        description: 'Port name cannot be empty',
        variant: 'destructive'
      })
      return
    }

    try {
      setLoading(true)
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`http://localhost:8080/api/ports/${portId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editingPortName.trim(),
          provinceId: selectedProvinceId
        })
      })

      if (response.ok) {
        const updatedPort = await response.json()
        setPorts(ports.map(p => p.id === portId ? updatedPort : p))
        setEditingPortId(null)
        setEditingPortName('')
        toast({
          title: 'Success',
          description: 'Port updated successfully'
        })
      } else {
        throw new Error('Failed to update port')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update port',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePort = async (portId: number, portName: string) => {
    if (!confirm(`Are you sure you want to delete port "${portName}"?`)) return

    try {
      setLoading(true)
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`http://localhost:8080/api/ports/${portId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setPorts(ports.filter(p => p.id !== portId))
        toast({
          title: 'Success',
          description: 'Port deleted successfully'
        })
      } else {
        throw new Error('Failed to delete port')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete port',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Row 1: Province Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Anchor className="w-5 h-5" />
            Manage Ports
          </CardTitle>
          <CardDescription>
            Add, edit, and remove ports in your database
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="province">Select Province</Label>
            <Select
              value={selectedProvinceId?.toString() || ''}
              onValueChange={(value) => setSelectedProvinceId(value ? Number(value) : null)}
            >
              <SelectTrigger id="province">
                <SelectValue placeholder="-- Select Province --" />
              </SelectTrigger>
              <SelectContent>
                {provinces.map((province) => (
                  <SelectItem key={province.id} value={province.id.toString()}>
                    {province.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {!selectedProvinceId ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Anchor className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Select a province to manage its ports</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Row 2: Add New Port */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add New Port</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter port name..."
                  value={newPortName}
                  onChange={(e) => setNewPortName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddPort()}
                  disabled={loading}
                />
                <Button onClick={handleAddPort} disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Row 3: Ports List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Ports in {provinces.find(p => p.id === selectedProvinceId)?.name} ({ports.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading && ports.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : ports.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No ports found. Add one above.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Port Name</TableHead>
                      <TableHead className="text-right w-32">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ports.map((port) => (
                      <TableRow key={port.id}>
                        <TableCell>
                          {editingPortId === port.id ? (
                            <Input
                              value={editingPortName}
                              onChange={(e) => setEditingPortName(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && handleSavePort(port.id)}
                              autoFocus
                            />
                          ) : (
                            port.name
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {editingPortId === port.id ? (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleSavePort(port.id)}
                                  disabled={loading}
                                >
                                  Save
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setEditingPortId(null)
                                    setEditingPortName('')
                                  }}
                                  disabled={loading}
                                >
                                  Cancel
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditPort(port)}
                                  disabled={loading}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeletePort(port.id, port.name)}
                                  disabled={loading}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

