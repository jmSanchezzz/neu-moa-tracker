"use client";

import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  History, 
  LogOut,
  Trash2,
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
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const isAdmin = user.role === 'ADMIN';

  return (
    <Sidebar variant="sidebar" collapsible="icon" className="bg-slate-900 text-slate-200 border-r-0">
      <SidebarHeader className="h-16 flex items-center px-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500 rounded p-1.5">
            <ShieldAlert className="w-5 h-5 text-slate-900" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="font-black text-lg tracking-tighter text-white">NEU TRACKER</span>
            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest -mt-1">Academic Enterprise</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 pt-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] mb-2 px-4">Core Navigator</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Dashboard" className="hover:bg-slate-800 hover:text-white h-10 px-4 group">
                  <a href="/dashboard">
                    <LayoutDashboard className="group-hover:text-amber-500 transition-colors" />
                    <span className="font-bold">Command Center</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="MOAs" className="hover:bg-slate-800 hover:text-white h-10 px-4 group">
                  <a href="/dashboard/moas">
                    <FileText className="group-hover:text-amber-500 transition-colors" />
                    <span className="font-bold">Active Records</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Archived" className="hover:bg-slate-800 hover:text-white h-10 px-4 group">
                  <a href="/dashboard/moas?filter=deleted">
                    <Archive className="group-hover:text-amber-500 transition-colors" />
                    <span className="font-bold">Archived / Trash</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup className="mt-4">
            <SidebarGroupLabel className="text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] mb-2 px-4">Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Users" className="hover:bg-slate-800 hover:text-white h-10 px-4 group">
                    <a href="/dashboard/users">
                      <Users className="group-hover:text-amber-500 transition-colors" />
                      <span className="font-bold">IAM Management</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Audit Trails" className="hover:bg-slate-800 hover:text-white h-10 px-4 group">
                    <a href="/dashboard/audit">
                      <History className="group-hover:text-amber-500 transition-colors" />
                      <span className="font-bold">System Audit Logs</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Settings" className="hover:bg-slate-800 hover:text-white h-10 px-4 group">
                    <a href="/dashboard/settings">
                      <Settings className="group-hover:text-amber-500 transition-colors" />
                      <span className="font-bold">Control Panel</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-slate-800 mt-auto bg-slate-900/50">
        <div className="flex items-center gap-3 mb-4 group-data-[collapsible=icon]:hidden px-2">
          <Avatar className="h-10 w-10 border-2 border-amber-500/20">
            <AvatarFallback className="bg-amber-500 text-slate-900 font-black">
              {user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-bold truncate text-white">{user.name}</span>
            <span className="text-[10px] font-black uppercase text-amber-500 tracking-wider truncate">{user.role} ACCESS</span>
          </div>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={logout} 
              className="h-10 px-4 rounded-lg bg-slate-800/50 hover:bg-red-500 hover:text-white transition-all duration-300 group"
              tooltip="Logout"
            >
              <LogOut className="text-slate-400 group-hover:text-white" />
              <span className="font-bold">System Exit</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}