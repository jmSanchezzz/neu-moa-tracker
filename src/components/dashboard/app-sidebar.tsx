"use client";

import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  History, 
  LogOut,
  ShieldAlert,
  Settings,
  Archive
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function AppSidebar() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const isAdmin = user.role === 'ADMIN';
  const isStudent = user.role === 'STUDENT';

  return (
    <Sidebar variant="sidebar" collapsible="icon" className="bg-sidebar text-sidebar-foreground border-r-0">
      <SidebarHeader className="h-16 flex items-center px-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="bg-accent rounded p-1.5 shadow-sm">
            <ShieldAlert className="w-5 h-5 text-sidebar-background" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="font-black text-lg tracking-tighter text-white">NEU MOA TRACKER</span>
            <span className="text-[10px] font-bold text-accent uppercase tracking-widest -mt-1">Institutional use</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 pt-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/40 font-black text-[10px] uppercase tracking-[0.2em] mb-2 px-4">Core Navigator</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {!isStudent && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Dashboard" className="hover:bg-sidebar-accent hover:text-white h-10 px-4 group">
                    <a href="/dashboard">
                      <LayoutDashboard className="group-hover:text-accent transition-colors" />
                      <span className="font-bold">Command Center</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="MOAs" className="hover:bg-sidebar-accent hover:text-white h-10 px-4 group">
                  <a href="/dashboard/moas">
                    <FileText className="group-hover:text-accent transition-colors" />
                    <span className="font-bold">MOA Directory</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {!isStudent && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Archived" className="hover:bg-sidebar-accent hover:text-white h-10 px-4 group">
                    <a href="/dashboard/moas?filter=deleted">
                      <Archive className="group-hover:text-accent transition-colors" />
                      <span className="font-bold">Archived / Trash</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup className="mt-4">
            <SidebarGroupLabel className="text-white/40 font-black text-[10px] uppercase tracking-[0.2em] mb-2 px-4">Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Users" className="hover:bg-sidebar-accent hover:text-white h-10 px-4 group">
                    <a href="/dashboard/users">
                      <Users className="group-hover:text-accent transition-colors" />
                      <span className="font-bold">IAM Management</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Audit Trails" className="hover:bg-sidebar-accent hover:text-white h-10 px-4 group">
                    <a href="/dashboard/audit">
                      <History className="group-hover:text-accent transition-colors" />
                      <span className="font-bold">System Audit Logs</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Settings" className="hover:bg-sidebar-accent hover:text-white h-10 px-4 group">
                    <a href="/dashboard/settings">
                      <Settings className="group-hover:text-accent transition-colors" />
                      <span className="font-bold">Control Panel</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border mt-auto bg-sidebar-accent/30">
        <div className="flex items-center gap-3 mb-4 group-data-[collapsible=icon]:hidden px-2">
          <Avatar className="h-10 w-10 border-2 border-accent/20">
            <AvatarFallback className="bg-accent text-sidebar-background font-black">
              {user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-bold truncate text-white">{user.name}</span>
            <span className="text-[10px] font-black uppercase text-accent tracking-wider truncate">{user.role} ACCESS</span>
          </div>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={logout} 
              className="h-10 px-4 rounded-lg bg-white/5 hover:bg-red-500 hover:text-white transition-all duration-300 group"
              tooltip="Logout"
            >
              <LogOut className="text-white/60 group-hover:text-white" />
              <span className="font-bold">System Exit</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}