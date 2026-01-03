import { useState } from 'react'
import {
  Home,
  Users,
  FileText,
  BarChart3,
  Settings,
  Shield,
  Database,
  Activity,
  Bot,
  Upload,
  UserCog,
  FileSpreadsheet,
  LogOut,
  ChevronDown
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter
} from '@/components/ui/sidebar'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

interface MenuItem {
  title: string
  icon?: any
  href?: string
  badge?: string
  children?: MenuItem[]
}

const menuItems: MenuItem[] = [
  {
    title: 'Dashboard',
    icon: Home,
    href: '/dashboard'
  },
  {
    title: 'Authentication',
    icon: Shield,
    children: [
      { title: 'Login', href: '/auth/login', icon: Shield },
      { title: 'Register', href: '/auth/register', icon: Shield },
      { title: 'Forgot Password', href: '/auth/forgot-password', icon: Shield },
      { title: 'Change Password', href: '/auth/change-password', icon: Shield }
    ]
  },
  {
    title: 'Debt Management',
    icon: FileText,
    children: [
      { title: 'Search Cases', href: '/debt/search', icon: FileText },
      { title: 'High Value Cases', href: '/debt/high-value', icon: FileText },
      { title: 'Overdue Cases', href: '/debt/overdue', icon: FileText },
      { title: 'Bulk Operations', href: '/debt/bulk', icon: FileText },
      { title: 'Case Details', href: '/debt/details', icon: FileText },
      { title: 'Statistics', href: '/debt/stats', icon: FileText }
    ]
  },
  {
    title: 'Agent Management',
    icon: Users,
    children: [
      { title: 'Agent List', href: '/agents/list', icon: Users },
      { title: 'Performance', href: '/agents/performance', icon: Users },
      { title: 'Workload', href: '/agents/workload', icon: Users },
      { title: 'Agent Details', href: '/agents/details', icon: Users }
    ]
  },
  {
    title: 'Reports & Analytics',
    icon: BarChart3,
    children: [
      { title: 'Summary Report', href: '/reports/summary', icon: BarChart3 },
      { title: 'By Status', href: '/reports/by-status', icon: BarChart3 },
      { title: 'By Stage', href: '/reports/by-stage', icon: BarChart3 },
      { title: 'High Value', href: '/reports/high-value', icon: BarChart3 },
      { title: 'Overdue', href: '/reports/overdue', icon: BarChart3 },
      { title: 'Collection Trend', href: '/reports/trend', icon: BarChart3 },
      { title: 'Manager Summary', href: '/reports/manager', icon: BarChart3 },
      { title: 'Trend Analysis', href: '/reports/analysis', icon: BarChart3 },
      { title: 'Custom Report', href: '/reports/custom', icon: BarChart3 }
    ]
  },
  {
    title: 'AI & Scoring',
    icon: Bot,
    children: [
      { title: 'Health Check', href: '/ai/health', icon: Bot },
      { title: 'Score Case', href: '/ai/score', icon: Bot },
      { title: 'Batch Scoring', href: '/ai/batch', icon: Bot },
      { title: 'Top Scored Cases', href: '/ai/top', icon: Bot },
      { title: 'Statistics', href: '/ai/statistics', icon: Bot }
    ]
  },
  {
    title: 'Data Export',
    icon: Upload,
    children: [
      { title: 'Export to CSV', href: '/export/csv', icon: Upload },
      { title: 'Export to JSON', href: '/export/json', icon: Upload },
      { title: 'Export Summary', href: '/export/summary', icon: Upload },
      { title: 'All Data', href: '/export/all', icon: Upload }
    ]
  },
  {
    title: 'Audit & Logs',
    icon: Activity,
    children: [
      { title: 'My Activity', href: '/audit/my-activity', icon: Activity },
      { title: 'User Activity', href: '/audit/user', icon: Activity },
      { title: 'Entity Activity', href: '/audit/entity', icon: Activity },
      { title: 'Range Search', href: '/audit/range', icon: Activity },
      { title: 'Statistics', href: '/audit/stats', icon: Activity }
    ]
  },
  {
    title: 'Backlog',
    icon: Database,
    children: [
      { title: 'All Logs', href: '/backlog/all', icon: Database },
      { title: 'By User', href: '/backlog/user', icon: Database },
      { title: 'By Module', href: '/backlog/module', icon: Database },
      { title: 'By Action', href: '/backlog/action', icon: Database },
      { title: 'Search', href: '/backlog/search', icon: Database },
      { title: 'Statistics', href: '/backlog/stats', icon: Database }
    ]
  },
  {
    title: 'Admin',
    icon: UserCog,
    children: [
      { title: 'User Management', href: '/admin/users', icon: UserCog },
      { title: 'Collections Stats', href: '/admin/collections', icon: UserCog },
      { title: 'Agent Performance', href: '/admin/agents', icon: UserCog }
    ]
  },
  {
    title: 'CSV Operations',
    icon: FileSpreadsheet,
    children: [
      { title: 'Upload CSV', href: '/csv/upload', icon: FileSpreadsheet },
      { title: 'View CSV Data', href: '/csv/view', icon: FileSpreadsheet },
      { title: 'Update Assignments', href: '/csv/assign', icon: FileSpreadsheet }
    ]
  },
  {
    title: 'Profile',
    icon: Settings,
    href: '/profile'
  }
]

export function AppSidebar() {
  const [openItems, setOpenItems] = useState<string[]>([])

  const toggleItem = (title: string) => {
    setOpenItems(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    )
  }

  return (
    <Sidebar className="border-r bg-gradient-to-b from-slate-50 to-white shadow-lg">
      <SidebarHeader className="border-b border-slate-200 px-6 py-6 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm shadow-lg">
            <span className="text-white font-bold text-lg">FX</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-white">FedEx</span>
            <span className="text-xs text-blue-100">Debt Management System</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4 py-4">
        {menuItems.map((item) => (
          <SidebarGroup key={item.title}>
            {item.children ? (
              <Collapsible
                open={openItems.includes(item.title)}
                onOpenChange={() => toggleItem(item.title)}
              >
                <SidebarGroupLabel asChild>
                  <CollapsibleTrigger className="flex w-full items-center justify-between p-2 hover:bg-accent rounded-md">
                    <div className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{item.title}</span>
                    </div>
                    <ChevronDown className="h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-180" />
                  </CollapsibleTrigger>
                </SidebarGroupLabel>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {item.children.map((child) => (
                        <SidebarMenuItem key={child.title}>
                          <SidebarMenuButton asChild>
                            <a href={child.href} className="flex items-center gap-3 px-4 py-2">
                              <span className="text-sm">{child.title}</span>
                              {child.badge && (
                                <Badge variant="secondary" className="ml-auto text-xs">
                                  {child.badge}
                                </Badge>
                              )}
                            </a>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </Collapsible>
            ) : (
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href={item.href} className="flex items-center gap-3 p-2">
                      <item.icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{item.title}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-auto text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            )}
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src="" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium">John Doe</span>
            <span className="text-xs text-muted-foreground">DCA Manager</span>
          </div>
        </div>
        <Button variant="outline" size="sm" className="w-full">
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
