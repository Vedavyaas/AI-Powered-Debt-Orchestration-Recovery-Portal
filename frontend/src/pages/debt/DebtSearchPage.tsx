import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { debtApi } from '@/services/api-client'
import { DataTable, type Column } from '@/components/common/DataTable'
import { AutoForm, type FormField } from '@/components/common/AutoForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { type DebtCaseEntity, type CaseSearchRequest, type StatusType, Status, Service } from '@/types/debt'
import { Search, Eye, Users, CheckCircle } from 'lucide-react'

export default function DebtSearchPage() {
  const [searchFilters, setSearchFilters] = useState<CaseSearchRequest>({})
  const [selectedCases, setSelectedCases] = useState<DebtCaseEntity[]>([])
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [activeTab, setActiveTab] = useState('all')

  // Fetch debt cases with search filters
  const { data: cases, isLoading, refetch } = useQuery({
    queryKey: ['debt-cases', searchFilters],
    queryFn: () => debtApi.searchCases(searchFilters),
    enabled: Object.keys(searchFilters).length > 0
  })

  // Get filtered cases based on active tab
  const filteredCases = useMemo(() => {
    if (!cases?.data) return []

    switch (activeTab) {
      case 'assigned':
        return cases.data.filter(c => c.status === Status.ASSIGNED)
      case 'unassigned':
        return cases.data.filter(c => c.status === Status.UN_ASSIGNED)
      case 'overdue':
        return cases.data.filter(c => c.daysOverdue && c.daysOverdue > 30)
      case 'high-value':
        return cases.data.filter(c => c.amount && c.amount > 10000)
      default:
        return cases.data
    }
  }, [cases?.data, activeTab])

  const handleSearch = (filters: CaseSearchRequest) => {
    setSearchFilters(filters)
  }

  const handleBulkStatusUpdate = async (status: StatusType) => {
    if (selectedCases.length === 0) return

    try {
      await debtApi.bulkUpdateStatus({
        invoiceNumbers: selectedCases.map(c => c.invoiceNumber),
        status
      })
      setSelectedCases([])
      setShowBulkActions(false)
      refetch()
    } catch (error) {
      console.error('Bulk update failed:', error)
    }
  }

  const handleBulkAssign = async (agentEmail: string) => {
    if (selectedCases.length === 0) return

    try {
      await debtApi.bulkAssign({
        invoiceNumbers: selectedCases.map(c => c.invoiceNumber),
        agentEmail
      })
      setSelectedCases([])
      setShowBulkActions(false)
      refetch()
    } catch (error) {
      console.error('Bulk assignment failed:', error)
    }
  }

  const searchFields: FormField[] = [
    {
      name: 'customerName',
      label: 'Customer Name',
      type: 'text',
      placeholder: 'Search by customer name'
    },
    {
      name: 'invoiceNumber',
      label: 'Invoice Number',
      type: 'text',
      placeholder: 'Search by invoice number'
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: Status.UN_ASSIGNED, label: 'Unassigned' },
        { value: Status.ASSIGNED, label: 'Assigned' },
        { value: Status.ASSIGNED_AND_WAITING, label: 'Assigned & Waiting' }
      ]
    },
    {
      name: 'serviceType',
      label: 'Service Type',
      type: 'select',
      options: [
        { value: Service.EXPRESS, label: 'Express' },
        { value: Service.GROUND, label: 'Ground' },
        { value: Service.FREIGHT, label: 'Freight' }
      ]
    },
    {
      name: 'minAmount',
      label: 'Min Amount',
      type: 'number',
      placeholder: 'Minimum amount'
    },
    {
      name: 'maxAmount',
      label: 'Max Amount',
      type: 'number',
      placeholder: 'Maximum amount'
    },
    {
      name: 'minDaysOverdue',
      label: 'Min Days Overdue',
      type: 'number',
      placeholder: 'Minimum days overdue'
    }
  ]

  const columns: Column<DebtCaseEntity>[] = [
    {
      key: 'invoiceNumber',
      header: 'Invoice #',
      render: (value) => (
        <span className="font-mono text-sm">{value}</span>
      )
    },
    {
      key: 'customerName',
      header: 'Customer',
      sortable: true
    },
    {
      key: 'amount',
      header: 'Amount',
      sortable: true,
      render: (value) => (
        <span className="font-medium">${value?.toLocaleString()}</span>
      )
    },
    {
      key: 'daysOverdue',
      header: 'Days Overdue',
      sortable: true,
      render: (value) => (
        <span className={value && value > 30 ? 'text-red-600 font-medium' : ''}>
          {value || 0}
        </span>
      )
    },
    {
      key: 'serviceType',
      header: 'Service',
      render: (value) => (
        <Badge variant="outline">{value}</Badge>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => {
        const statusColors = {
          [Status.UN_ASSIGNED]: 'bg-gray-100 text-gray-800',
          [Status.ASSIGNED]: 'bg-blue-100 text-blue-800',
          [Status.ASSIGNED_AND_WAITING]: 'bg-yellow-100 text-yellow-800'
        }
        return (
          <Badge className={statusColors[value as keyof typeof Status] || 'bg-gray-100'}>
            {value?.replace('_', ' ')}
          </Badge>
        )
      }
    },
    {
      key: 'assignedTo',
      header: 'Assigned To',
      render: (value) => value || <span className="text-gray-400">Unassigned</span>
    }
  ]

  const actions = [
    {
      label: 'Mark as Assigned',
      onClick: () => handleBulkStatusUpdate(Status.ASSIGNED)
    },
    {
      label: 'Mark as Unassigned',
      onClick: () => handleBulkStatusUpdate(Status.UN_ASSIGNED)
    },
    {
      label: 'Bulk Assign',
      onClick: () => setShowBulkActions(true)
    }
  ]

  return (
    <div className="space-y-6">
      {/* Search Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Debt Cases
          </CardTitle>
          <CardDescription>
            Filter and search through debt cases using multiple criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AutoForm
            fields={searchFields}
            onSubmit={handleSearch}
            submitLabel="Search"
            layout="horizontal"
          />
        </CardContent>
      </Card>

      {/* Results Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Cases</TabsTrigger>
          <TabsTrigger value="assigned">Assigned</TabsTrigger>
          <TabsTrigger value="unassigned">Unassigned</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
          <TabsTrigger value="high-value">High Value</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <DataTable
            data={filteredCases}
            columns={columns}
            loading={isLoading}
            selectable={true}
            onSelectionChange={setSelectedCases}
            actions={selectedCases.length > 0 ? actions : []}
            search={{
              placeholder: 'Search cases...',
              onSearch: (query) => {
                // Implement client-side search if needed
                console.log('Search query:', query)
              }
            }}
          />

          {/* Bulk Assignment Dialog */}
          <Dialog open={showBulkActions} onOpenChange={setShowBulkActions}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Bulk Assign Cases</DialogTitle>
                <DialogDescription>
                  Assign {selectedCases.length} selected cases to an agent
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <AutoForm
                  fields={[
                    {
                      name: 'agentEmail',
                      label: 'Agent Email',
                      type: 'email',
                      required: true,
                      placeholder: 'Enter agent email address'
                    }
                  ]}
                  onSubmit={(data) => handleBulkAssign(data.agentEmail)}
                  submitLabel="Assign Cases"
                />
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Total Cases</span>
            </div>
            <div className="text-2xl font-bold">{filteredCases.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Assigned</span>
            </div>
            <div className="text-2xl font-bold">
              {filteredCases.filter(c => c.status === Status.ASSIGNED).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Unassigned</span>
            </div>
            <div className="text-2xl font-bold">
              {filteredCases.filter(c => c.status === Status.UN_ASSIGNED).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Selected</span>
            </div>
            <div className="text-2xl font-bold">{selectedCases.length}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
