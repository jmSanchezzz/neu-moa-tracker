"use client";

import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  History, 
  LogOut,
  Trash2,
  ShieldAlert
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
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const isAdmin = user.role === 'ADMIN';

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader className="h-16 flex items-center px-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 rounded-lg p-2">
            <ShieldAlert className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg group-data-[collapsible=icon]:hidden text-sidebar-foreground">NEU MOA</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50">General</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Dashboard">
                  <a href="/dashboard">
                    <LayoutDashboard />
                    <span>Command Center</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="MOAs">
                  <a href="/dashboard/moas">
                    <FileText />
                    <span>All MOAs</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Archived">
                  <a href="/dashboard/moas?filter=deleted">
                    <Trash2 />
                    <span>Archived / Trash</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/50">Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Users">
                    <a href="/dashboard/users">
                      <Users />
                      <span>User Management</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Audit Trails">
                    <a href="/dashboard/audit">
                      <History />
                      <span>Audit Logs</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 mb-4 group-data-[collapsible=icon]:hidden">
          <Avatar className="h-9 w-9 border-2 border-primary/40">
            <AvatarFallback className="bg-primary text-white text-xs">
              {user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-semibold truncate text-sidebar-foreground">{user.name}</span>
            <span className="text-xs opacity-60 truncate text-sidebar-foreground">{user.role}</span>
          </div>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={logout} 
              className="text-white hover:bg-destructive transition-colors duration-200"
              tooltip="Logout"
            >
              <LogOut className="text-destructive" />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}