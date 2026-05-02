"use client";

import { IconPlus, IconTrash, IconMessage } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
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

interface AppSidebarProps {
  chats: ChatSession[];
  activeChatId: string | null;
  onChatSelect: (id: string) => void;
  onNewChat: () => void;
  onDeleteAll: () => void;
}

export function AppSidebar({
  chats,
  activeChatId,
  onChatSelect,
  onNewChat,
  onDeleteAll,
}: AppSidebarProps) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar variant="sidebar" collapsible="icon" className="border-r">
      <SidebarHeader
        className={cn(
          "h-14 flex flex-row items-center px-4",
          isCollapsed && "justify-center px-0"
        )}
      >
        <SidebarTrigger
          className={cn("size-9 [&_svg]:size-5", !isCollapsed && "-ml-1")}
        />
      </SidebarHeader>
      <SidebarContent className="p-2 space-y-4">
        <Button
          onClick={onNewChat}
          variant="outline"
          className={cn(
            "w-full justify-start gap-2 h-9 border-dashed",
            isCollapsed && "justify-center p-0"
          )}
          title={isCollapsed ? "New Chat" : undefined}
        >
          <IconPlus size={isCollapsed ? 20 : 16} />
          {!isCollapsed && <span>New Chat</span>}
        </Button>

        <div className="space-y-1">
          {!isCollapsed && (
            <p className="px-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              Recent Chats
            </p>
          )}
          <SidebarMenu>
            {chats.map((chat) => (
              <SidebarMenuItem key={chat.id}>
                <SidebarMenuButton
                  isActive={activeChatId === chat.id}
                  onClick={() => onChatSelect(chat.id)}
                  className="rounded-md"
                  tooltip={isCollapsed ? chat.title : undefined}
                >
                  <IconMessage
                    size={isCollapsed ? 18 : 14}
                    className="opacity-70"
                  />
                  {!isCollapsed && <span>{chat.title}</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            {chats.length === 0 && !isCollapsed && (
              <p className="px-2 py-4 text-xs text-muted-foreground text-center italic">
                No chats yet
              </p>
            )}
          </SidebarMenu>
        </div>
      </SidebarContent>
      <SidebarFooter className="p-2 border-t">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 h-9",
                isCollapsed && "justify-center p-0"
              )}
              disabled={chats.length === 0}
              title={isCollapsed ? "Delete All" : undefined}
            >
              <IconTrash size={isCollapsed ? 18 : 16} />
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
                className="rounded-md"
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
