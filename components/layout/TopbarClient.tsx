"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  Bell,
  ChevronDown,
  Command,
  CreditCard,
  HelpCircle,
  LogOut,
  Settings,
  Sparkles,
  UserCircle
} from "lucide-react";

import { logoutAction } from "@/app/(auth)/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { SearchBar } from "@/components/common/SearchBar";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { ThemeToggle } from "@/components/theme-toggle";

type Notification = {
  id: string;
  title: string;
  body: string | null;
  created_at: string | null;
  read_at: string | null;
};

type TopbarClientProps = {
  name: string;
  email: string;
  role: string;
  avatarUrl: string | null;
  notifications: Notification[];
  unreadCount: number;
  showBilling: boolean;
};

function formatRole(value: string) {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getInitials(name: string, email: string) {
  const source = name || email;
  const parts = source.split(" ").filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  }
  return (source[0] ?? "U").toUpperCase();
}

export function TopbarClient({
  name,
  email,
  role,
  avatarUrl,
  notifications,
  unreadCount,
  showBilling
}: TopbarClientProps) {
  const initials = useMemo(() => getInitials(name, email), [name, email]);
  const displayRole = formatRole(role || "member");

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-[28px] border border-border/60 bg-card/60 px-6 py-4 shadow-glass">
      <CommandPalette />
      <div className="flex w-full max-w-xl items-center gap-3 rounded-full border border-border/60 bg-background/40 px-4 py-2 md:w-auto">
        <Command className="h-4 w-4 text-foreground/50" />
        <SearchBar
          placeholder="Search patients, appointments, records..."
          showButton={false}
          className="w-full"
          inputClassName="h-8 border-none bg-transparent px-0 text-sm focus-visible:ring-0"
        />
        <span className="hidden rounded-full border border-border/60 px-2 py-1 text-[10px] uppercase tracking-[0.3em] text-foreground/50 md:inline-flex">
          ⌘ K
        </span>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="secondary" size="sm" className="hidden md:inline-flex">
          <Sparkles className="h-4 w-4" />
          Quick Actions
        </Button>

        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-card/60 text-foreground/80 transition hover:bg-card/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 ? (
                <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-foreground">
                  {unreadCount}
                </span>
              ) : null}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <div className="px-3 py-4 text-sm text-foreground/60">No new notifications.</div>
            ) : (
              notifications.map((item) => (
                <DropdownMenuItem key={item.id} className="flex flex-col items-start gap-1">
                  <span className="text-sm text-foreground">{item.title}</span>
                  {item.body ? <span className="text-xs text-foreground/50">{item.body}</span> : null}
                </DropdownMenuItem>
              ))
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/notifications">View all</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="group flex items-center gap-3 rounded-2xl border border-border/60 bg-card/60 px-3 py-2 transition duration-300 hover:scale-[1.01] hover:bg-card/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              aria-label="Open profile menu"
            >
              <Avatar className="h-10 w-10">
                {avatarUrl ? <AvatarImage src={avatarUrl} alt={name} /> : null}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="hidden flex-col text-left text-xs text-foreground/70 sm:flex">
                <span className="text-sm font-semibold text-foreground">{name || email}</span>
                <span>{displayRole}</span>
              </div>
              <ChevronDown className="hidden h-4 w-4 text-foreground/50 sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-foreground">{name || email}</span>
              <span className="text-xs text-foreground/50">{email}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <UserCircle className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                Account Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/notifications">
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </Link>
            </DropdownMenuItem>
            {showBilling ? (
              <DropdownMenuItem asChild>
                <Link href="/billing">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Billing
                </Link>
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuItem asChild>
              <Link href="/support">
                <HelpCircle className="mr-2 h-4 w-4" />
                Help Center
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <form action={logoutAction} className="w-full">
                <button type="submit" className="flex w-full items-center">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
