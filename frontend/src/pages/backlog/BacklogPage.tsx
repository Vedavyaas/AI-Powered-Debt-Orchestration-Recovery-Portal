import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { backlogApi } from '@/services/api-client'
import { DataTable, type Column } from '@/components/common/DataTable'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Database, Activity, AlertCircle, CheckCircle, Clock, Settings } from 'lucide-react'

interface BacklogEntry {
  id: number
  action: string
  module: string
  description: string
  performedBy: string
  timestamp: string
  durationMs: number
  success: boolean
  errorMessage?: string
  endpoint?: string
  ipAddress?: string
}

export default function BacklogPage() {
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [filter, setFilter] = useState<'all' | 'success' | 'failed' | 'recent'>('all')

  const { data: backlogData, isLoading } = useQuery({
    queryKey: ['backlog', currentPage, pageSize, filter],
    queryFn: () => {
      switch (filter) {
        case 'success':
          return backlogApi.getLogsByRange('2024-01-01', new Date().toISOString().split('T')[0], currentPage, pageSize)
        case 'failed':
          return backlogApi.getFailedLogs(currentPage, pageSize)
        case 'recent':
          return backlogApi.getRecentLogs('current-user@example.com', 24)
        default:
          return backlogApi.getAllLogs(currentPage, pageSize)
      }
    }
  })

  const columns: Column<BacklogEntry>[] = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      sortable: true,
      render: (value) => new Date(value).toLocaleString()
    },
    {
      key: 'action',
      header: 'Action',
      sortable: true,
      render: (value) => (
        <Badge variant="outline" className="font-mono text-xs">
          {value}
        </Badge>
      )
    },
    {
      key: 'module',
      header: 'Module',
      sortable: true,
      render: (value) => (
        <Badge variant="secondary" className="text-xs">
          {value}
        </Badge>
      )
    },
    {
      key: 'performedBy',
      header: 'User',
      render: (value) => (
        <span className="font-medium">{value}</span>
      )
    },
    {
      key: 'description',
      header: 'Description',
      render: (value) => (
        <span className="text-sm text-gray-600 max-w-xs truncate" title={value}>
          {value}
        </span>
      )
    },
    {
      key: 'endpoint',
      header: 'Endpoint',
      render: (value) => value ? (
        <span className="font-mono text-xs text-blue-600">{value}</span>
      ) : <span className="text-gray-400">-</span>
    },
    {
      key: 'success',
      header: 'Status',
      render: (value, item) => (
        <div className="flex items-center gap-2">
          {value ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-500" />
          )}
          <span className={value ? 'text-green-700' : 'text-red-700'}>
            {value ? 'Success' : 'Failed'}
          </span>
          {item.errorMessage && (
            <span className="text-xs text-red-600 max-w-32 truncate" title={item.errorMessage}>
              {item.errorMessage}
            </span>
          )}
        </div>
      )
    },
    {
      key: 'durationMs',
      header: 'Duration',
      sortable: true,
      render: (value) => (
        <span className="font-mono text-sm">
          {value}ms
        </span>
      )
    },
    {
      key: 'ipAddress',
      header: 'IP Address',
      render: (value) => (
        <span className="font-mono text-xs">{value || '-'}</span>
      )
    }
  ]

  const pagination = backlogData ? {
    currentPage: currentPage,
    totalPages: Math.ceil((backlogData.data?.totalElements || 0) / pageSize),
    totalItems: backlogData.data?.totalElements || 0,
    pageSize,
    onPageChange: setCurrentPage,
    onPageSizeChange: setPageSize
  } : undefined

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Database className="h-6 w-6" />
            System Backlog
          </h1>
          <p className="text-muted-foreground">
            Complete audit trail of all system activities and operations
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter logs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Logs</SelectItem>
              <SelectItem value="success">Success Only</SelectItem>
              <SelectItem value="failed">Failed Only</SelectItem>
              <SelectItem value="recent">Recent (24h)</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {backlogData?.data?.totalElements || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              All system activities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              98.5%
            </div>
            <p className="text-xs text-muted-foreground">
              Operations completed successfully
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Today</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {backlogData?.data?.content?.filter((log: any) =>
                new Date(log.timestamp).toDateString() === new Date().toDateString()
              ).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Today's activities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
            <Clock className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {backlogData?.data?.content?.reduce((acc: number, log: any) => acc + (log.durationMs || 0), 0) /
               (backlogData?.data?.content?.length || 1)}ms
            </div>
            <p className="text-xs text-muted-foreground">
              Average operation time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Backlog Table */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Logs</CardTitle>
          <CardDescription>
            Detailed audit trail of all system operations and user activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={backlogData?.data?.content || []}
            columns={columns}
            loading={isLoading}
            pagination={pagination}
            exportable={true}
            onExport={() => console.log('Export functionality')}
          />
        </CardContent>
      </Card>
    </div>
  )
}
