import { Badge } from '@/shared/components/ui/badge'
import { INQUIRY_STATUS_STYLES, InquiryStatus } from '@/shared/constants/inquiry-status'

/**
 * Renders a status badge with consistent styling across all inquiry types
 */
export const renderInquiryStatusBadge = (status?: string) => {
  if (!status) return <Badge variant="secondary">Unknown</Badge>

  const style = INQUIRY_STATUS_STYLES[status as InquiryStatus] || { variant: 'outline' as const }
  return (
    <Badge variant={style.variant} className={style.className}>
      {status}
    </Badge>
  )
}
