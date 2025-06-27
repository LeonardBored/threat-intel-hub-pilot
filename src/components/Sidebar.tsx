
import { Shield, Home, Search, Link, Book, Settings, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';

const menuItems = [
  { title: 'Dashboard', url: '/', icon: Home },
  { title: 'VirusTotal', url: '/virustotal', icon: Shield },
  { title: 'URLScan.io', url: '/urlscan', icon: Search },
  { title: 'Threat Intel', url: '/threat-intel', icon: Shield },
  { title: 'Security News', url: '/news', icon: Book },
  { title: 'Documentation', url: '/docs', icon: Book },
  { title: 'AI Assistant', url: '/ai-chat', icon: User },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  return (
    <Sidebar
      className={`${collapsed ? 'w-14' : 'w-64'} bg-sidebar border-r border-sidebar-border`}
      collapsible="offcanvas"
    >
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary animate-pulse-glow" />
          {!collapsed && (
            <div>
              <h1 className="text-lg font-bold text-primary">CyberOps</h1>
              <p className="text-xs text-muted-foreground">Security Platform</p>
            </div>
          )}
        </div>
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-primary/70">Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className={({ isActive }) =>
                        `flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                          isActive
                            ? 'bg-primary/20 text-primary border border-primary/30'
                            : 'hover:bg-sidebar-accent text-sidebar-foreground'
                        }`
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
