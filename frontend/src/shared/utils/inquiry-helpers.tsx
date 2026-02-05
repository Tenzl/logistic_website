import { Badge } from '@/shared/components/ui/badge'
import { STATUS_BADGE_CONFIG, InquiryStatus } from '@/shared/constants/inquiry-status'

/**
 * Renders a status badge with consistent styling across all inquiry types
 */
export const renderInquiryStatusBadge = (status?: string) => {
  if (!status) return <Badge variant="secondary">Unknown</Badge>

  const config = STATUS_BADGE_CONFIG[status as InquiryStatus] || { variant: 'outline' as const, label: status }
  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  )
}
