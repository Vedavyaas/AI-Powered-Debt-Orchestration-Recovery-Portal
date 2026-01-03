import { useQuery } from '@tanstack/react-query'
import { agentManagementApi } from '@/services/api-client'
import { DataTable, type Column } from '@/components/common/DataTable'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, TrendingUp, Clock, Target } from 'lucide-react'

interface Agent {
  email: string
  name: string
  phone?: string
  status: 'ACTIVE' | 'INACTIVE'
  assignedCases: number
  resolvedCases: number
  successRate: number
  averageResolutionTime: number
  totalCollections: number
  lastActivity: string
}

export default function AgentListPage() {
  const { data: agents, isLoading } = useQuery({
    queryKey: ['agents'],
    queryFn: agentManagementApi.getAgentList
  })

  const columns: Column<Agent>[] = [
    {
      key: 'name',
      header: 'Agent Name',
      sortable: true,
      render: (value, item) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-muted-foreground">{item.email}</div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => (
        <Badge variant={value === 'ACTIVE' ? 'default' : 'secondary'}>
          {value}
        </Badge>
      )
    },
    {
      key: 'assignedCases',
      header: 'Assigned',
      sortable: true
    },
    {
      key: 'resolvedCases',
      header: 'Resolved',
      sortable: true
    },
    {
      key: 'successRate',
      header: 'Success Rate',
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <div className="w-16 bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full"
              style={{ width: `${value}%` }}
            />
          </div>
          <span className="text-sm font-medium">{value}%</span>
        </div>
      )
    },
    {
      key: 'totalCollections',
      header: 'Collections',
      sortable: true,
      render: (value) => `$${value?.toLocaleString() || 0}`
    },
    {
      key: 'averageResolutionTime',
      header: 'Avg Resolution',
      render: (value) => `${value || 0} days`
    },
    {
      key: 'lastActivity',
      header: 'Last Activity',
      render: (value) => new Date(value).toLocaleDateString()
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            Agent Management
          </h1>
          <p className="text-muted-foreground">
            Monitor and manage DCA agents performance and assignments
          </p>
        </div>
        <Button>
          <Users className="h-4 w-4 mr-2" />
          Add Agent
        </Button>
      </div>

      {/* Performance Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agents?.data?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active DCA agents
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <p className="text-xs text-muted-foreground">
              Collection success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Collections</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(agents?.data?.reduce((sum: number, agent: any) => sum + (agent.totalCollections || 0), 0) || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Resolution</CardTitle>
            <Clock className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12 days</div>
            <p className="text-xs text-muted-foreground">
              Case resolution time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Agents Table */}
      <Card>
        <CardHeader>
          <CardTitle>DCA Agents</CardTitle>
          <CardDescription>
            Comprehensive view of agent performance and case assignments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={agents?.data || []}
            columns={columns}
            loading={isLoading}
            search={{
              placeholder: 'Search agents...',
              onSearch: (query) => console.log('Search:', query)
            }}
            exportable={true}
            onExport={() => console.log('Export agents')}
          />
        </CardContent>
      </Card>
    </div>
  )
}
