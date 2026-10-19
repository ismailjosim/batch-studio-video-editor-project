"use client";

import {
  ChevronLeft,
  ChevronRight,
  Film,
  FolderGit2,
  LayoutDashboard,
  LogOut,
  Mic,
  Scissors,
  Sparkles,
  User,
  Wand2,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "@/lib/auth-client";

interface DashboardSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenProjectsModal: () => void;
}

export function DashboardSidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  onOpenProjectsModal,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const navItems = [
    {
      href: "/dashboard/overview",
      label: "Studio Overview",
      sublabel: "App Metrics & Health",
      icon: LayoutDashboard,
      badge: "Home",
      isActive: pathname === "/dashboard/overview" || pathname === "/dashboard",
    },
    {
      href: "/dashboard/video-editor",
      label: "SRT Video Generator",
      sublabel: "2K Hardware GPU MP4",
      icon: Film,
      badge: "2K",
      isActive: pathname.startsWith("/dashboard/video-editor"),
    },
    {
      href: "/dashboard/subtitle-splitter",
      label: "SRT Batch Splitter",
      sublabel: "Split & ZIP Subtitles",
      icon: Scissors,
      badge: "Batch",
      isActive: pathname.startsWith("/dashboard/subtitle-splitter"),
    },
    {
      href: "/dashboard/image-generator",
      label: "Nano Banana AI",
      sublabel: "Character & 2K Storyboard",
      icon: Wand2,
      badge: "Gemini",
      isActive: pathname.startsWith("/dashboard/image-generator"),
    },
  ];

  const comingSoonItems = [
    {
      label: "Audio & Voice Studio",
      icon: Mic,
      badge: "Soon",
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 flex flex-col justify-between border-r border-white/10 bg-[#0c0d14]/95 backdrop-blur-2xl transition-all duration-300 ${
          collapsed ? "w-20" : "w-72"
        } ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Top: Logo & Branding */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <Link
              href="/dashboard/overview"
              onClick={onCloseMobile}
              className="flex items-center gap-3 overflow-hidden cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-400 via-teal-500 to-emerald-600 flex items-center justify-center text-black font-extrabold shadow-lg shadow-emerald-500/20 shrink-0 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 text-black" />
              </div>
              {!collapsed && (
                <div className="flex flex-col leading-tight animate-in fade-in duration-200">
                  <span className="font-heading font-black text-white text-sm tracking-tight truncate">
                    Studio Suite
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase">
                    Dollar Doodles 2K
                  </span>
                </div>
              )}
            </Link>

            {/* Desktop Collapse Toggle */}
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1.5 rounded-lg border border-white/10 hover:border-white/20 text-slate-400 hover:text-white transition-all cursor-pointer"
              title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {collapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col gap-6 p-3 overflow-y-auto max-h-[calc(100vh-180px)] scrollbar-none">
            {/* Primary Section */}
            <div className="flex flex-col gap-1.5">
              {!collapsed && (
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 px-3 py-1">
                  Creative Tools
                </span>
              )}

              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onCloseMobile}
                    className={`flex items-center gap-3 w-full p-2.5 rounded-xl transition-all cursor-pointer text-left ${
                      item.isActive
                        ? "bg-linear-to-r from-emerald-500/20 to-teal-500/10 border border-emerald-500/40 text-white shadow-lg shadow-emerald-500/10"
                        : "hover:bg-white/5 border border-transparent text-slate-400 hover:text-slate-200"
                    }`}
                    title={collapsed ? item.label : undefined}
                  >
                    <div
                      className={`p-2 rounded-lg shrink-0 transition-all ${
                        item.isActive
                          ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/30"
                          : "bg-white/5 text-slate-400 group-hover:text-white"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    {!collapsed && (
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold truncate">
                            {item.label}
                          </span>
                          {item.badge && (
                            <span
                              className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded ${
                                item.isActive
                                  ? "bg-emerald-500/30 text-emerald-300"
                                  : "bg-white/10 text-slate-400"
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 block truncate">
                          {item.sublabel}
                        </span>
                      </div>
                    )}
                  </Link>
                );
              })}

              {/* Cloud Projects Modal Trigger */}
              <button
                type="button"
                onClick={() => {
                  onCloseMobile();
                  onOpenProjectsModal();
                }}
                className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-white/5 border border-transparent text-slate-400 hover:text-slate-200 transition-all cursor-pointer text-left"
                title={collapsed ? "Cloud Projects & History" : undefined}
              >
                <div className="p-2 rounded-lg shrink-0 bg-white/5 text-slate-400">
                  <FolderGit2 className="w-4 h-4" />
                </div>
                {!collapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold truncate">
                        Cloud Projects
                      </span>
                      <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-white/10 text-slate-400">
                        Cloud
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block truncate">
                      Database History
                    </span>
                  </div>
                )}
              </button>
            </div>

            {/* Coming Soon Section */}
            {!collapsed && (
              <div className="flex flex-col gap-1.5 pt-2 border-t border-white/5">
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 px-3 py-1">
                  More Tools (Upcoming)
                </span>
                {comingSoonItems.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <div
                      key={tool.label}
                      className="flex items-center gap-3 p-2.5 rounded-xl border border-white/5 bg-white/2 opacity-60 cursor-not-allowed text-slate-400"
                    >
                      <div className="p-2 rounded-lg bg-white/5 text-slate-400 shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0 flex items-center justify-between">
                        <span className="text-xs font-medium truncate">
                          {tool.label}
                        </span>
                        <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-white/10 text-slate-400 font-bold">
                          {tool.badge}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Bottom User Profile Section */}
        <div className="p-3 border-t border-white/10 bg-black/40">
          <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white/3 border border-white/5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0">
                <User className="w-4 h-4" />
              </div>
              {!collapsed && (
                <div className="flex flex-col min-w-0 leading-tight">
                  <span className="text-xs font-bold text-white truncate">
                    {session?.user?.name || "Studio User"}
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                      {(session?.user as { role?: string })?.role || "CUSTOMER"}
                    </span>
                    <span className="text-[10px] text-slate-500 truncate max-w-24">
                      {session?.user?.email}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() =>
                signOut({
                  fetchOptions: { onSuccess: () => window.location.reload() },
                })
              }
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
