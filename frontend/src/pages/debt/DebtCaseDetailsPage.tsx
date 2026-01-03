import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { debtApi } from '@/services/api-client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, User } from 'lucide-react'

export default function DebtCaseDetailsPage() {
  const { invoiceNumber } = useParams()

  const { data: caseDetails, isLoading } = useQuery({
    queryKey: ['case-details', invoiceNumber],
    queryFn: () => debtApi.getCaseDetails(invoiceNumber!),
    enabled: !!invoiceNumber
  })

  if (isLoading) {
    return <div className="p-8 text-center">Loading case details...</div>
  }

  const caseData = caseDetails?.data

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Case Details</h1>
          <p className="text-muted-foreground">Invoice: {invoiceNumber}</p>
        </div>
        <Button>Update Case</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Case Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Customer</label>
                <p className="font-medium">{caseData?.customerName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Amount</label>
                <p className="font-medium text-green-600">${caseData?.amount?.toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <Badge variant="outline">{caseData?.status}</Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Service Type</label>
                <p className="font-medium">{caseData?.serviceType}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Assignment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Assigned Agent</label>
              <p className="font-medium">{caseData?.assignedTo || 'Unassigned'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Days Overdue</label>
              <p className="font-medium">{caseData?.daysOverdue || 0}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Propensity Score</label>
              <p className="font-medium">{caseData?.propensityScore?.toFixed(2) || 'N/A'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
