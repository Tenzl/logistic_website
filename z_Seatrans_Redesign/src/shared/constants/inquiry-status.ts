export type InquiryStatus = 'PENDING' | 'PROCESSING' | 'QUOTED' | 'COMPLETED' | 'CANCELLED'

export const INQUIRY_STATUS_OPTIONS: InquiryStatus[] = [
  'PENDING',
  'PROCESSING',
  'QUOTED',
  'COMPLETED',
  'CANCELLED',
]

export interface StatusStyle {
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
  className?: string
}

export const INQUIRY_STATUS_STYLES: Record<InquiryStatus, StatusStyle> = {
  PENDING: {
    variant: 'secondary',
  },
  PROCESSING: {
    variant: 'default',
    className: 'bg-yellow-500 hover:bg-yellow-600 text-white',
  },
  QUOTED: {
    variant: 'default',
    className: 'bg-primary hover:bg-primary/90',
  },
  COMPLETED: {
    variant: 'default',
    className: 'bg-green-600 hover:bg-green-700 text-white',
  },
  CANCELLED: {
    variant: 'destructive',
  },
}
