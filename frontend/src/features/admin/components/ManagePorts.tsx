'use client'

import React, { type FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  type ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Anchor, ArrowUpDown, Loader2, Pencil, Plus, Trash2, Upload } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { queryKeys } from '@/shared/config/react-query.config'
import { useQueryListCache } from '@/shared/hooks/useQueryListCache'
import { toast } from '@/shared/utils/toast'
import { apiClient } from '@/shared/utils/apiClient'
import { API_CONFIG } from '@/shared/config/api.config'
import { provinceService, type Province } from '@/modules/logistics/services/provinceService'
import type { ApiResponse } from '@/shared/types/api.types'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'

const AREA_OPTIONS = ['NORTHERN', 'MIDDLE', 'SOUTHERN'] as const
const NONE_VALUE = '__NONE__'

interface PortImportResult {
  imported: number
  duplicates: number
  skipped: number
  failed: number
  errors: string[]
}

interface Port {
  id: number
  name: string
  portOfCall?: string
  provinceId: number | null
  hasInfo?: number
  code?: string
  zoneCode?: string
  countryCode?: string
  latitude?: number
  longitude?: number
}

interface PortTableRow extends Port {
  area: string
  provinceName: string
}

const COLUMN_CLASS_NAMES: Record<string, string> = {
  area: 'hidden md:table-cell w-32',
  provinceName: 'hidden lg:table-cell w-48',
  code: 'hidden md:table-cell w-32',
  zoneCode: 'hidden lg:table-cell w-32',
  countryCode: 'hidden lg:table-cell w-32',
  latitude: 'hidden xl:table-cell w-32',
  longitude: 'hidden xl:table-cell w-32',
  hasInfo: 'w-40',
  actions: 'text-right w-32',
}

export function ManagePorts() {
  const portsKey = queryKeys.ports()
  const portsListCache = useQueryListCache<Port>(portsKey)

  const { data: provinces = [] } = useQuery({
    queryKey: queryKeys.provinces(),
    queryFn: async () => {
      try {
        return await provinceService.getAllProvinces()
      } catch (e) {
        toast.error('Failed to load provinces')
        throw e
      }
    },
  })

  const { data: ports = [], isLoading: isPortsQueryLoading } = useQuery({
    queryKey: portsKey,
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Port[]>>(API_CONFIG.PORTS.BASE)
      if (!response.ok) {
        toast.error('Failed to load ports')
        throw new Error('Failed to load ports')
      }
      const result = await response.json()
      return result.data
    },
  })

  const [isBusy, setIsBusy] = useState(false)
  const isLoading = isPortsQueryLoading || isBusy
  const [isImporting, setIsImporting] = useState(false)

  const importInputRef = useRef<HTMLInputElement | null>(null)

  const [selectedArea, setSelectedArea] = useState<string>('')
  const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(null)

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 })

  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [addPortName, setAddPortName] = useState('')
  const [addPortOfCall, setAddPortOfCall] = useState('')
  const [addCode, setAddCode] = useState('')
  const [addZoneCode, setAddZoneCode] = useState('')
  const [addCountryCode, setAddCountryCode] = useState('')
  const [addLatitude, setAddLatitude] = useState('')
  const [addLongitude, setAddLongitude] = useState('')

  const [editingPortId, setEditingPortId] = useState<number | null>(null)
  const [editingPortName, setEditingPortName] = useState('')
  const [editingPortOfCall, setEditingPortOfCall] = useState('')
  const [editingCode, setEditingCode] = useState('')
  const [editingZoneCode, setEditingZoneCode] = useState('')
  const [editingCountryCode, setEditingCountryCode] = useState('')
  const [editingLatitude, setEditingLatitude] = useState('')
  const [editingLongitude, setEditingLongitude] = useState('')
  const [editingProvinceId, setEditingProvinceId] = useState<number | null>(null)
  const [editingArea, setEditingArea] = useState<string>(NONE_VALUE)

  useEffect(() => {
    if (!selectedArea) {
      setSelectedProvinceId(null)
      return
    }

    const provinceStillValid = provinces.some(
      (province) => province.id === selectedProvinceId && province.area === selectedArea
    )

    if (!provinceStillValid) {
      setSelectedProvinceId(null)
    }
  }, [selectedArea, selectedProvinceId, provinces])

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }, [selectedArea, selectedProvinceId, columnFilters])

  const parseOptionalNumber = (rawValue: string, fieldLabel: string): number | undefined => {
    const trimmed = rawValue.trim()
    if (!trimmed) return undefined

    const value = Number(trimmed)
    if (!Number.isFinite(value)) {
      throw new Error(`${fieldLabel} must be a valid number`)
    }
    return value
  }

  const handleImportClick = () => {
    importInputRef.current?.click()
  }

  const handleImportFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const filename = file.name.toLowerCase()
    if (!filename.endsWith('.csv') && !filename.endsWith('.xlsx') && !filename.endsWith('.xls')) {
      toast.error('Unsupported file format. Only .csv, .xlsx, .xls are accepted.')
      event.target.value = ''
      return
    }

    try {
      setIsImporting(true)
      const formData = new FormData()
      formData.append('file', file)

      const response = await apiClient.post<ApiResponse<PortImportResult>>(
        API_CONFIG.PORTS.IMPORT,
        formData
      )

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null)
        throw new Error(errorBody?.message ?? 'Import failed')
      }

      const result = await response.json()
      const data = result.data

      if (data.imported > 0) {
        await portsListCache.invalidate()
      }

      const parts: string[] = []
      if (data.imported > 0) parts.push(`${data.imported} imported`)
      if (data.duplicates > 0) parts.push(`${data.duplicates} duplicates skipped`)
      if (data.skipped > 0) parts.push(`${data.skipped} empty rows skipped`)
      if (data.failed > 0) parts.push(`${data.failed} failed`)

      const summary = parts.length > 0 ? parts.join(', ') : 'Nothing imported'

      if (data.imported > 0) {
        toast.success(`Import completed: ${summary}`)
      } else {
        toast.error(`Import completed: ${summary}`)
      }

      if (data.errors && data.errors.length > 0) {
        console.warn('Import errors:', data.errors)
        toast.error(`Errors: ${data.errors.slice(0, 3).join(' | ')}`)
      }
    } catch (error) {
      console.error('Import error:', error)
      const message = error instanceof Error ? error.message : 'Failed to import file'
      toast.error(message)
    } finally {
      setIsImporting(false)
      event.target.value = ''
    }
  }

  const resetEditingState = () => {
    setEditingPortId(null)
    setEditingPortName('')
    setEditingPortOfCall('')
    setEditingCode('')
    setEditingZoneCode('')
    setEditingCountryCode('')
    setEditingLatitude('')
    setEditingLongitude('')
    setEditingProvinceId(null)
    setEditingArea(NONE_VALUE)
  }

  const resetAddForm = () => {
    setAddPortName('')
    setAddPortOfCall('')
    setAddCode('')
    setAddZoneCode('')
    setAddCountryCode('')
    setAddLatitude('')
    setAddLongitude('')
  }

  const openAddDialog = () => {
    setAddPortName('')
    setAddPortOfCall('')
    setAddCode('')
    setAddZoneCode('')
    setAddCountryCode('')
    setAddLatitude('')
    setAddLongitude('')
    setAddDialogOpen(true)
  }

  const handleAddPort = async () => {
    if (!addPortName.trim()) {
      toast.error('Port name cannot be empty')
      return
    }

    try {
      setIsBusy(true)
      const payload: Record<string, unknown> = {
        name: addPortName.trim(),
        provinceId: null,
      }

      const maybePortOfCall = addPortOfCall.trim()
      if (maybePortOfCall) payload.portOfCall = maybePortOfCall

      const maybeCode = addCode.trim()
      if (maybeCode) payload.code = maybeCode

      const maybeZoneCode = addZoneCode.trim()
      if (maybeZoneCode) payload.zoneCode = maybeZoneCode

      const maybeCountryCode = addCountryCode.trim()
      if (maybeCountryCode) payload.countryCode = maybeCountryCode

      const maybeLatitude = parseOptionalNumber(addLatitude, 'Latitude')
      if (maybeLatitude !== undefined) payload.latitude = maybeLatitude

      const maybeLongitude = parseOptionalNumber(addLongitude, 'Longitude')
      if (maybeLongitude !== undefined) payload.longitude = maybeLongitude

      const response = await apiClient.post<ApiResponse<Port>>(API_CONFIG.PORTS.BASE, payload)

      if (!response.ok) {
        throw new Error('Failed to add port')
      }

      const created = await response.json()
      portsListCache.append(created.data)
      setAddDialogOpen(false)
      resetAddForm()
      toast.success('Port added successfully')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add port'
      toast.error(message)
    } finally {
      setIsBusy(false)
    }
  }

  const handleSubmitAddPort = async (event: FormEvent) => {
    event.preventDefault()
    await handleAddPort()
  }

  const handleEditPort = (port: Port) => {
    setEditingPortId(port.id)
    setEditingPortName(port.name)
    setEditingPortOfCall(port.portOfCall || '')
    setEditingProvinceId(port.provinceId)

    const matchedProvince = port.provinceId != null
      ? provinces.find((province) => province.id === port.provinceId)
      : undefined
    setEditingArea(matchedProvince?.area || NONE_VALUE)

    setEditingCode(port.code || '')
    setEditingZoneCode(port.zoneCode || '')
    setEditingCountryCode(port.countryCode || '')
    setEditingLatitude(port.latitude != null ? String(port.latitude) : '')
    setEditingLongitude(port.longitude != null ? String(port.longitude) : '')
  }

  const handleSavePort = async (portId: number) => {
    if (!editingPortName.trim()) {
      toast.error('Port name cannot be empty')
      return
    }

    try {
      setIsBusy(true)
      const payload: Record<string, unknown> = {
        name: editingPortName.trim(),
        portOfCall: editingPortOfCall.trim(),
      }

      if (editingProvinceId != null) {
        payload.provinceId = editingProvinceId
      }

      const maybeCode = editingCode.trim()
      if (maybeCode) payload.code = maybeCode

      const maybeZoneCode = editingZoneCode.trim()
      if (maybeZoneCode) payload.zoneCode = maybeZoneCode

      const maybeCountryCode = editingCountryCode.trim()
      if (maybeCountryCode) payload.countryCode = maybeCountryCode

      const maybeLatitude = parseOptionalNumber(editingLatitude, 'Latitude')
      if (maybeLatitude !== undefined) payload.latitude = maybeLatitude

      const maybeLongitude = parseOptionalNumber(editingLongitude, 'Longitude')
      if (maybeLongitude !== undefined) payload.longitude = maybeLongitude

      const response = await apiClient.put<ApiResponse<Port>>(API_CONFIG.PORTS.BY_ID(portId), payload)

      if (!response.ok) {
        throw new Error('Failed to update port')
      }

      const updated = await response.json()
      portsListCache.upsertById(updated.data)
      resetEditingState()
      toast.success('Port updated successfully')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update port'
      toast.error(message)
    } finally {
      setIsBusy(false)
    }
  }

  const handleDeletePort = async (portId: number, portName: string) => {
    if (!confirm(`Are you sure you want to delete port "${portName}"?`)) return

    try {
      setIsBusy(true)
      const response = await apiClient.delete(API_CONFIG.PORTS.BY_ID(portId))

      if (!response.ok) {
        throw new Error('Failed to delete port')
      }

      portsListCache.removeById(portId)
      toast.success('Port deleted successfully')
    } catch (error) {
      toast.error('Failed to delete port')
    } finally {
      setIsBusy(false)
    }
  }

  const handleToggleHasInfo = async (port: Port) => {
    const nextHasInfo = port.hasInfo === 1 ? 0 : 1

    try {
      setIsBusy(true)
      const response = await apiClient.patch<ApiResponse<Port>>(
        `${API_CONFIG.PORTS.BY_ID(port.id)}/has-info`,
        { hasInfo: nextHasInfo }
      )

      if (!response.ok) {
        throw new Error('Failed to update has info')
      }

      const patched = await response.json()
      portsListCache.upsertById(patched.data)
      toast.success(`Has info set to ${nextHasInfo === 1 ? 'Active' : 'Inactive'}`)
    } catch (error) {
      toast.error('Failed to update has info')
    } finally {
      setIsBusy(false)
    }
  }

  const clearFilters = () => {
    setSelectedArea('')
    setSelectedProvinceId(null)
    setColumnFilters([])
  }

  const provincesByArea = useMemo(
    () => provinces.filter((province) => province.area === selectedArea),
    [provinces, selectedArea]
  )

  const provincesForEditingArea = useMemo(
    () => provinces.filter((province) => province.area === editingArea),
    [provinces, editingArea]
  )

  const provinceMap = useMemo(() => {
    return new Map(provinces.map((province) => [province.id, province]))
  }, [provinces])

  const portsForTable = useMemo<PortTableRow[]>(() => {
    return ports
      .map((port: Port) => {
        const province = port.provinceId != null ? provinceMap.get(port.provinceId) : undefined
        return {
          ...port,
          area: province?.area || 'UNKNOWN',
          provinceName: province?.displayName || province?.name || '-',
        }
      })
      .filter((port: PortTableRow) => {
        if (selectedArea && port.area !== selectedArea) return false
        if (selectedProvinceId && port.provinceId !== selectedProvinceId) return false
        return true
      })
  }, [ports, provinceMap, selectedArea, selectedProvinceId])

  /** Khi số trang giảm (xóa dòng cuối trang), không để kẹt trang trống */
  useEffect(() => {
    const total = portsForTable.length
    const pageSize = pagination.pageSize
    const pageCount = Math.max(1, Math.ceil(total / pageSize))
    if (pagination.pageIndex >= pageCount) {
      setPagination((p) => ({ ...p, pageIndex: Math.max(0, pageCount - 1) }))
    }
  }, [portsForTable.length, pagination.pageIndex, pagination.pageSize])

  const tableTitle = selectedProvinceId
    ? `Ports in ${provinceMap.get(selectedProvinceId)?.displayName || provinceMap.get(selectedProvinceId)?.name || 'Selected Province'} (${portsForTable.length})`
    : selectedArea
      ? `Ports in ${selectedArea} (${portsForTable.length})`
      : `All Ports (${portsForTable.length})`

  const columns: ColumnDef<PortTableRow>[] = [
    {
      accessorKey: 'area',
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="h-auto p-0 font-medium hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Area
          <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
        </Button>
      ),
      cell: ({ row }) => {
        const port = row.original
        if (editingPortId !== port.id) return port.area

        return (
          <Select
            value={editingArea || NONE_VALUE}
            onValueChange={(value) => {
              setEditingArea(value)
              setEditingProvinceId(null)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select area" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE_VALUE}>No Area</SelectItem>
              {AREA_OPTIONS.map((area) => (
                <SelectItem key={area} value={area}>
                  {area}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      },
    },
    {
      accessorKey: 'provinceName',
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="h-auto p-0 font-medium hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Province
          <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
        </Button>
      ),
      cell: ({ row }) => {
        const port = row.original
        if (editingPortId !== port.id) return port.provinceName

        return (
          <Select
            value={editingProvinceId != null ? editingProvinceId.toString() : NONE_VALUE}
            onValueChange={(value) => setEditingProvinceId(value === NONE_VALUE ? null : Number(value))}
            disabled={editingArea === NONE_VALUE}
          >
            <SelectTrigger>
              <SelectValue placeholder={editingArea === NONE_VALUE ? 'Select area first' : 'Select province'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE_VALUE}>No Province</SelectItem>
              {provincesForEditingArea.map((province) => (
                <SelectItem key={province.id} value={province.id.toString()}>
                  {province.displayName || province.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      },
    },
    {
      accessorKey: 'name',
      filterFn: (row, _columnId, filterValue) => {
        const q = String(filterValue ?? '')
          .trim()
          .toLowerCase()
        if (!q) return true
        const name = String(row.original.name ?? '')
          .toLowerCase()
        const code = String(row.original.code ?? '')
          .toLowerCase()
        return name.includes(q) || code.includes(q)
      },
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="h-auto p-0 font-medium hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Port Name
          <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
        </Button>
      ),
      cell: ({ row }) => {
        const port = row.original
        if (editingPortId !== port.id) return port.name

        return (
          <Input
            value={editingPortName}
            onChange={(e) => setEditingPortName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSavePort(port.id)}
            autoFocus
          />
        )
      },
    },
    {
      accessorKey: 'portOfCall',
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="h-auto p-0 font-medium hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Port of Call
          <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
        </Button>
      ),
      cell: ({ row }) => {
        const port = row.original
        if (editingPortId !== port.id) return port.portOfCall || '-'

        return (
          <Input
            value={editingPortOfCall}
            onChange={(e) => setEditingPortOfCall(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSavePort(port.id)}
            placeholder="Port of call"
          />
        )
      },
    },
    {
      accessorKey: 'code',
      header: 'Code',
      cell: ({ row }) => {
        const port = row.original
        if (editingPortId !== port.id) return port.code || '-'

        return (
          <Input
            value={editingCode}
            onChange={(e) => setEditingCode(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSavePort(port.id)}
            placeholder="Code"
          />
        )
      },
    },
    {
      accessorKey: 'zoneCode',
      header: 'Zone',
      cell: ({ row }) => {
        const port = row.original
        if (editingPortId !== port.id) return port.zoneCode || '-'

        return (
          <Input
            value={editingZoneCode}
            onChange={(e) => setEditingZoneCode(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSavePort(port.id)}
            placeholder="Zone code"
          />
        )
      },
    },
    {
      accessorKey: 'countryCode',
      header: 'Country',
      cell: ({ row }) => {
        const port = row.original
        if (editingPortId !== port.id) return port.countryCode || '-'

        return (
          <Input
            value={editingCountryCode}
            onChange={(e) => setEditingCountryCode(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSavePort(port.id)}
            placeholder="Country code"
          />
        )
      },
    },
    {
      accessorKey: 'latitude',
      header: 'Latitude',
      cell: ({ row }) => {
        const port = row.original
        if (editingPortId !== port.id) return port.latitude != null ? port.latitude : '-'

        return (
          <Input
            value={editingLatitude}
            onChange={(e) => setEditingLatitude(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSavePort(port.id)}
            type="number"
            step="any"
            placeholder="Latitude"
          />
        )
      },
    },
    {
      accessorKey: 'longitude',
      header: 'Longitude',
      cell: ({ row }) => {
        const port = row.original
        if (editingPortId !== port.id) return port.longitude != null ? port.longitude : '-'

        return (
          <Input
            value={editingLongitude}
            onChange={(e) => setEditingLongitude(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSavePort(port.id)}
            type="number"
            step="any"
            placeholder="Longitude"
          />
        )
      },
    },
    {
      id: 'hasInfo',
      header: 'Has Info',
      enableSorting: false,
      cell: ({ row }) => {
        const port = row.original
        return (
          <Button
            variant={port.hasInfo === 1 ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleToggleHasInfo(port)}
            disabled={isLoading || editingPortId === port.id}
          >
            {port.hasInfo === 1 ? 'Active' : 'Inactive'}
          </Button>
        )
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      cell: ({ row }) => {
        const port = row.original
        return (
          <div className="flex justify-end gap-2">
            {editingPortId === port.id ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSavePort(port.id)}
                  disabled={isLoading}
                >
                  Save
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetEditingState}
                  disabled={isLoading}
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
                  disabled={isLoading}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeletePort(port.id, port.name)}
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </>
            )}
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: portsForTable,
    columns,
    state: {
      sorting,
      columnFilters,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    /** Tránh reset về trang 1 mỗi khi patch cache sau edit — reset trang chỉ khi đổi filter (useEffect phía trên) */
    autoResetPageIndex: false,
  })

  return (
    <>
      <input
        ref={importInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        aria-label="Import ports from CSV or XLSX"
        title="Import ports from CSV or XLSX"
        onChange={handleImportFileChange}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Anchor className="h-5 w-5" />
                Manage Ports
              </CardTitle>
              <CardDescription>Manage all ports with search, sort, and pagination.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleImportClick}
                className="gap-2"
                disabled={isImporting || isLoading}
              >
                {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Import CSV/XLSX
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={openAddDialog}
                className="gap-2"
                disabled={isImporting}
              >
                <Plus className="h-4 w-4" />
                Add New
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && ports.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="w-full">
              <div className="flex flex-wrap items-center gap-2 py-4">
                <Input
                  placeholder="Search by port name or code..."
                  value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
                  onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
                  className="w-full md:w-[280px]"
                />

                <Select value={selectedArea} onValueChange={setSelectedArea}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by area" />
                  </SelectTrigger>
                  <SelectContent>
                    {AREA_OPTIONS.map((area) => (
                      <SelectItem key={area} value={area}>
                        {area}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={selectedProvinceId?.toString() || ''}
                  onValueChange={(value) => setSelectedProvinceId(value ? Number(value) : null)}
                  disabled={!selectedArea}
                >
                  <SelectTrigger className="w-full md:w-[260px]">
                    <SelectValue placeholder={selectedArea ? 'Filter by province' : 'Select area first'} />
                  </SelectTrigger>
                  <SelectContent>
                    {provincesByArea.map((province) => (
                      <SelectItem key={province.id} value={province.id.toString()}>
                        {province.displayName || province.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {(selectedArea || selectedProvinceId || columnFilters.length > 0) && (
                  <Button variant="ghost" onClick={clearFilters}>
                    Clear
                  </Button>
                )}
              </div>

              <div className="mb-2 text-sm text-muted-foreground">{tableTitle}</div>

              <div className="max-h-[430px] overflow-y-auto rounded-md border">
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead
                            key={header.id}
                            className={COLUMN_CLASS_NAMES[header.column.id] || ''}
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(header.column.columnDef.header, header.getContext())}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows.length > 0 ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow key={row.id}>
                          {row.getVisibleCells().map((cell) => (
                            <TableCell
                              key={cell.id}
                              className={COLUMN_CLASS_NAMES[cell.column.id] || ''}
                            >
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={columns.length} className="h-24 text-center">
                          No results.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                  Page {table.getState().pagination.pageIndex + 1} / {Math.max(table.getPageCount(), 1)} -
                  {' '}Showing {table.getRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s).
                  {' '}Page size: 20. Scroll to view more rows in this page.
                </div>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={addDialogOpen}
        onOpenChange={(open) => {
          setAddDialogOpen(open)
          if (!open) {
            resetAddForm()
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Port</DialogTitle>
            <DialogDescription>Enter port information in the form below.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitAddPort}>
            <div className="grid grid-cols-1 gap-3 py-2 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="add-port-name">Port Name</Label>
                <Input
                  id="add-port-name"
                  value={addPortName}
                  onChange={(e) => setAddPortName(e.target.value)}
                  placeholder="Enter port name"
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="add-port-of-call">Port of Call</Label>
                <Input
                  id="add-port-of-call"
                  value={addPortOfCall}
                  onChange={(e) => setAddPortOfCall(e.target.value)}
                  placeholder="Optional"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-code">Code</Label>
                <Input
                  id="add-code"
                  value={addCode}
                  onChange={(e) => setAddCode(e.target.value)}
                  placeholder="e.g., 123"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-zone-code">Zone Code</Label>
                <Input
                  id="add-zone-code"
                  value={addZoneCode}
                  onChange={(e) => setAddZoneCode(e.target.value)}
                  placeholder="e.g., SOUTHERN"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-country-code">Country Code</Label>
                <Input
                  id="add-country-code"
                  value={addCountryCode}
                  onChange={(e) => setAddCountryCode(e.target.value)}
                  placeholder="e.g., VN"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-latitude">Latitude</Label>
                <Input
                  id="add-latitude"
                  type="number"
                  inputMode="decimal"
                  step="any"
                  value={addLatitude}
                  onChange={(e) => setAddLatitude(e.target.value)}
                  placeholder="e.g., 10.73"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="add-longitude">Longitude</Label>
                <Input
                  id="add-longitude"
                  type="number"
                  inputMode="decimal"
                  step="any"
                  value={addLongitude}
                  onChange={(e) => setAddLongitude(e.target.value)}
                  placeholder="e.g., 106.71"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="gap-2">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Add New
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
