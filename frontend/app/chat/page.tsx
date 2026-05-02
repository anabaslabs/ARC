"use client";

import * as React from "react";
import {
  IconPlus,
  IconTrash,
  IconUpload,
  IconSend,
  IconPaperclip,
  IconFiles,
  IconX,
  IconArrowRight,
  IconFileText,
  IconRobot,
  IconUser,
  IconMessage,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
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
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ViewState = "upload" | "files" | "chat";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatSession {
  id: string;
  title: string;
  date: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ChatPage() {
  const [view, setView] = React.useState<ViewState>("upload");
  const [chats, setChats] = React.useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = React.useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = React.useState<string[]>([]);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [inputValue, setInputValue] = React.useState("");
  const [isRightPanelOpen, setIsRightPanelOpen] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [isAsking, setIsAsking] = React.useState(false);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });

    try {
      const response = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      const fileNames = data.details.map((d: any) => d.source);
      setUploadedFiles(fileNames);
      setView("files");
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload files. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const startChat = () => {
    const newChatId = Date.now().toString();
    const newChat: ChatSession = {
      id: newChatId,
      title: `Analysis ${new Date().toLocaleTimeString()}`,
      date: "Just now",
    };
    setChats([newChat, ...chats]);
    setActiveChatId(newChatId);
    setView("chat");
    setMessages([
      {
        id: "1",
        role: "assistant",
        content: "I've processed your files. How can I help you today?",
      },
    ]);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isAsking) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsAsking(true);

    try {
      const response = await fetch(`${API_URL}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: inputValue }),
      });

      if (!response.ok) throw new Error("Failed to get answer");

      const data = await response.json();
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.answer,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Ask error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error while processing your request.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsAsking(false);
    }
  };

  const deleteAllChats = async () => {
    try {
      const response = await fetch(`${API_URL}/delete`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete index");

      setChats([]);
      setActiveChatId(null);
      setView("upload");
      setUploadedFiles([]);
      setMessages([]);
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete backend data. Index might still be there.");
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <AppSidebar
          chats={chats}
          activeChatId={activeChatId}
          onChatSelect={(id) => {
            setActiveChatId(id);
            setView("chat");
          }}
          onNewChat={() => setView("upload")}
          onDeleteAll={deleteAllChats}
        />

        <SidebarInset className="flex flex-col flex-1 overflow-hidden">
          <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 justify-between">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <h1 className="text-sm font-semibold">Upload & Ask</h1>
            </div>
            {view === "chat" && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
                className={cn(isRightPanelOpen && "bg-accent")}
              >
                <IconFiles className="h-4 w-4" />
              </Button>
            )}
          </header>

          <main className="flex flex-1 overflow-hidden relative">
            <div className="flex-1 flex flex-col min-w-0">
              {view === "upload" && (
                <UploadView onUpload={handleUpload} isUploading={isUploading} />
              )}
              {view === "files" && (
                <FilesView
                  files={uploadedFiles}
                  onAddFile={() => setView("upload")}
                  onStartChat={startChat}
                />
              )}
              {view === "chat" && (
                <ChatView
                  messages={messages}
                  inputValue={inputValue}
                  isAsking={isAsking}
                  onInputChange={setInputValue}
                  onSendMessage={handleSendMessage}
                />
              )}
            </div>

            {/* Right Panel for Files */}
            {view === "chat" && isRightPanelOpen && (
              <aside className="w-64 border-l bg-muted/30 flex flex-col animate-in slide-in-from-right duration-300">
                <div className="p-4 border-b flex items-center justify-between">
                  <h2 className="text-sm font-semibold">
                    {uploadedFiles.length} Files
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsRightPanelOpen(false)}
                  >
                    <IconX className="h-4 w-4" />
                  </Button>
                </div>
                <ScrollArea className="flex-1 p-2">
                  <div className="space-y-1">
                    {uploadedFiles.map((file, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 p-2 rounded-md hover:bg-accent text-sm group"
                      >
                        <IconFileText className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate flex-1">{file}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </aside>
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

function AppSidebar({
  chats,
  activeChatId,
  onChatSelect,
  onNewChat,
  onDeleteAll,
}: {
  chats: ChatSession[];
  activeChatId: string | null;
  onChatSelect: (id: string) => void;
  onNewChat: () => void;
  onDeleteAll: () => void;
}) {
  return (
    <Sidebar variant="sidebar" className="border-r">
      <SidebarHeader className="h-14 border-b flex items-center px-4">
        <div className="flex items-center gap-2 font-bold">
          <div className="size-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
            <IconRobot size={14} />
          </div>
          <span>ARC RAG</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2 space-y-4">
        <Button
          onClick={onNewChat}
          variant="outline"
          className="w-full justify-start gap-2 h-9 border-dashed"
        >
          <IconPlus size={16} />
          <span>New Chat</span>
        </Button>

        <div className="space-y-1">
          <p className="px-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Recent Chats
          </p>
          <SidebarMenu>
            {chats.map((chat) => (
              <SidebarMenuItem key={chat.id}>
                <SidebarMenuButton
                  isActive={activeChatId === chat.id}
                  onClick={() => onChatSelect(chat.id)}
                  className="rounded-md"
                >
                  <IconMessage size={14} className="opacity-70" />
                  <span>{chat.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            {chats.length === 0 && (
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
              className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 h-9"
              disabled={chats.length === 0}
            >
              <IconTrash size={16} />
              <span>Delete All</span>
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
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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

function UploadView({
  onUpload,
  isUploading,
}: {
  onUpload: (files: FileList | null) => void;
  isUploading: boolean;
}) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6 animate-in fade-in zoom-in duration-500">
      <div className="space-y-2">
        <h2 className="text-4xl font-bold tracking-tight">Upload & Ask</h2>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">
          Upload your documents and let AI help you find insights instantly.
        </p>
      </div>

      <input
        type="file"
        multiple
        className="hidden"
        ref={fileInputRef}
        onChange={(e) => onUpload(e.target.files)}
        accept=".pdf,.docx,.xlsx,.csv,.pptx,.txt,.md,.json"
      />

      <Card
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={cn(
          "w-full max-w-2xl aspect-[2/1] border-2 border-dashed flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-accent/50 transition-all group",
          isUploading && "opacity-50 cursor-not-allowed"
        )}
      >
        <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
          {isUploading ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          ) : (
            <IconUpload className="size-8 text-primary" />
          )}
        </div>
        <div className="space-y-1">
          <p className="font-semibold text-lg">
            {isUploading ? "Uploading..." : "Click or drag files here"}
          </p>
          <p className="text-sm text-muted-foreground">
            PDF, DOCX, TXT or CSV up to 10MB
          </p>
        </div>
      </Card>
    </div>
  );
}

function FilesView({
  files,
  onAddFile,
  onStartChat,
}: {
  files: string[];
  onAddFile: () => void;
  onStartChat: () => void;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-3xl font-bold tracking-tight">Upload & Ask</h2>

      <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-4">
        {files.map((file, i) => (
          <Card key={i} className="p-4 flex items-center gap-3 relative group">
            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <IconFileText size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{file}</p>
              <p className="text-[10px] text-muted-foreground">
                Ready to index
              </p>
            </div>
            <Badge
              variant="secondary"
              className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {i + 1}
            </Badge>
          </Card>
        ))}
        <Button
          variant="outline"
          onClick={onAddFile}
          className="h-[72px] border-dashed flex flex-col gap-1 items-center justify-center"
        >
          <IconPlus size={20} />
          <span className="text-xs">Add more</span>
        </Button>
      </div>

      <Button size="lg" className="px-8 gap-2 group" onClick={onStartChat}>
        <span>Analyze Documents</span>
        <IconArrowRight
          size={18}
          className="group-hover:translate-x-1 transition-transform"
        />
      </Button>
    </div>
  );
}

function ChatView({
  messages,
  inputValue,
  isAsking,
  onInputChange,
  onSendMessage,
}: {
  messages: Message[];
  inputValue: string;
  isAsking: boolean;
  onInputChange: (val: string) => void;
  onSendMessage: () => void;
}) {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <ScrollArea className="flex-1 p-4 md:p-6" ref={scrollRef}>
        <div className="max-w-3xl mx-auto space-y-6 py-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300",
                message.role === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div
                className={cn(
                  "size-8 rounded-full flex items-center justify-center shrink-0 border",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {message.role === "user" ? (
                  <IconUser size={16} />
                ) : (
                  <IconRobot size={16} />
                )}
              </div>
              <div
                className={cn(
                  "rounded-2xl px-4 py-2.5 max-w-[85%] text-sm shadow-sm",
                  message.role === "user"
                    ? "bg-primary/10 text-foreground border border-primary/20 rounded-tr-none"
                    : "bg-card border rounded-tl-none"
                )}
              >
                {message.content}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-background/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto relative group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground hover:text-primary"
            >
              <IconPaperclip size={18} />
            </Button>
          </div>
          <Input
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSendMessage()}
            placeholder="Ask a question about your documents..."
            className="pl-12 pr-12 h-12 rounded-xl border-2 focus-visible:ring-0 focus-visible:border-primary/50 transition-all"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <Button
              size="icon"
              className="size-8 rounded-lg"
              disabled={!inputValue.trim() || isAsking}
              onClick={onSendMessage}
            >
              {isAsking ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground" />
              ) : (
                <IconSend size={16} />
              )}
            </Button>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground text-center mt-2">
          AI can make mistakes. Check important info.
        </p>
      </div>
    </div>
  );
}
