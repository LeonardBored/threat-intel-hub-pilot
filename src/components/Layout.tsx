
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-cyber-gradient">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center border-b border-border bg-card/30 backdrop-blur-sm px-4">
            <SidebarTrigger className="text-primary hover:bg-primary/10" />
            <div className="ml-auto">
              <div className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString()} • Security Operations Center
              </div>
            </div>
          </header>
          
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
