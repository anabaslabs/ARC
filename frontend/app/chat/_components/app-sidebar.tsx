"use client";

import { IconPlus, IconTrash } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuAction,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { ChatSession } from "@/app/chat/types";
import { useEffect, useRef } from "react";

interface AppSidebarProps {
  chats: ChatSession[];
  activeChatId: string | null;
  onChatSelect: (id: string) => void;
  onNewChat: () => void;
  onDeleteAll: () => void;
  onDeleteChat: (id: string) => void;
}

export function AppSidebar({
  chats,
  activeChatId,
  onChatSelect,
  onNewChat,
  onDeleteAll,
  onDeleteChat,
}: AppSidebarProps) {
  const { state, open, isMobile, setOpen } = useSidebar();
  const isCollapsed = state === "collapsed" && !isMobile;

  const openRef = useRef(open);
  useEffect(() => {
    openRef.current = open;
  }, [open]);

  const userLargeScreenPreference = useRef(true);

  const lastWidth = useRef(
    typeof window !== "undefined" ? window.innerWidth : 1280
  );

  useEffect(() => {
    if (isMobile) return;

    const handleResize = () => {
      const width = window.innerWidth;
      const wasLarge = lastWidth.current >= 1280;
      const isLarge = width >= 1280;

      if (!isLarge && wasLarge) {
        userLargeScreenPreference.current = openRef.current;
        setOpen(false);
      } else if (isLarge && !wasLarge) {
        setOpen(userLargeScreenPreference.current);
      }
      lastWidth.current = width;
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMobile, setOpen]);

  return (
    <Sidebar variant="sidebar" collapsible="icon" className="border-r">
      <SidebarHeader
        className={cn(
          "flex h-14 flex-row items-center justify-between px-4",
          isCollapsed && "justify-center px-0"
        )}
      >
        <SidebarTrigger
          className={cn("size-10 [&_svg]:size-5.5", !isCollapsed && "-ml-1")}
        />
        {!isCollapsed && (
          <AnimatedThemeToggler
            variant="rectangle"
            className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex size-10 items-center justify-center transition-colors"
          />
        )}
      </SidebarHeader>
      <SidebarContent className="space-y-4 p-2">
        <Button
          onClick={onNewChat}
          variant="ghost"
          className={cn(
            "hover:bg-sidebar-accent h-10 w-full justify-start gap-3 px-2 text-sm font-bold",
            isCollapsed && "justify-center p-0"
          )}
          title={isCollapsed ? "New Chat" : undefined}
        >
          <IconPlus size={20} stroke={2.5} />
          {!isCollapsed && <span>New Chat</span>}
        </Button>

        {!isCollapsed && (
          <div className="mt-2 space-y-1">
            <p className="text-muted-foreground px-2 text-[10px] font-medium tracking-wider uppercase">
              Recent Chats
            </p>
            <SidebarMenu>
              {chats.map((chat) => (
                <SidebarMenuItem key={chat.id}>
                  <SidebarMenuButton
                    isActive={activeChatId === chat.id}
                    onClick={() => onChatSelect(chat.id)}
                    className={cn(
                      "h-10 px-2 text-sm transition-colors",
                      "font-normal data-active:bg-transparent data-active:font-normal",
                      activeChatId === chat.id
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span>{chat.title}</span>
                  </SidebarMenuButton>
                  <SidebarMenuAction
                    className="hover:text-destructive size-7 opacity-0 group-hover/menu-item:opacity-100 hover:bg-transparent data-active:bg-transparent"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChat(chat.id);
                    }}
                  >
                    <IconTrash size={14} />
                    <span className="sr-only">Delete Chat</span>
                  </SidebarMenuAction>
                </SidebarMenuItem>
              ))}
              {chats.length === 0 && (
                <p className="text-muted-foreground px-2 py-4 text-center text-xs italic">
                  No chats yet
                </p>
              )}
            </SidebarMenu>
          </div>
        )}
      </SidebarContent>
      <SidebarFooter className="border-t p-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "text-destructive hover:text-destructive hover:bg-destructive/10 h-10 w-full justify-start gap-3 px-2 text-sm font-bold",
                isCollapsed && "justify-center p-0"
              )}
              disabled={chats.length === 0}
              title={isCollapsed ? "Delete All" : undefined}
            >
              <IconTrash size={20} stroke={2.5} />
              {!isCollapsed && <span>Delete All</span>}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete all your chat history and uploaded
                files context.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={onDeleteAll}
                variant="destructive"
                className=""
              >
                Delete All
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SidebarFooter>
    </Sidebar>
  );
}
