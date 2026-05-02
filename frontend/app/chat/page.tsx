"use client";

import * as React from "react";
import {
  IconPlus,
  IconTrash,
  IconUpload,
  IconFiles,
  IconX,
  IconArrowRight,
  IconFileText,
  IconRobot,
  IconUser,
  IconMessage,
  IconSend2,
  IconRotateRectangle,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { Card } from "@/components/ui/card";
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

interface UploadedFile {
  name: string;
  size: number;
  file?: File;
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

const truncateFileName = (name: string, maxLength = 24) => {
  if (name.length <= maxLength) return name;
  const extensionIndex = name.lastIndexOf(".");
  const extension = extensionIndex !== -1 ? name.substring(extensionIndex) : "";
  const nameWithoutExtension =
    extensionIndex !== -1 ? name.substring(0, extensionIndex) : name;

  const charsToShow = maxLength - extension.length - 3; // 3 for "..."
  if (charsToShow <= 0) return name; // Fallback if extension is too long

  const frontChars = Math.ceil(charsToShow * 0.7);
  const backChars = Math.floor(charsToShow * 0.3);

  return (
    nameWithoutExtension.substring(0, frontChars) +
    "..." +
    nameWithoutExtension.substring(nameWithoutExtension.length - backChars) +
    extension
  );
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ChatPage() {
  const [view, setView] = React.useState<ViewState>("upload");
  const [chats, setChats] = React.useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = React.useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = React.useState<UploadedFile[]>([]);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [inputValue, setInputValue] = React.useState("");
  const [isRightPanelOpen, setIsRightPanelOpen] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [isAsking, setIsAsking] = React.useState(false);

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const MAX_FILE_COUNT = 6;

    const currentFilesCount = uploadedFiles.length;
    const selectedFiles = Array.from(files);

    if (currentFilesCount + selectedFiles.length > MAX_FILE_COUNT) {
      alert(`You can only upload a maximum of ${MAX_FILE_COUNT} files.`);
      return;
    }

    const filteredFiles = selectedFiles.filter((f) => {
      if (f.size > MAX_FILE_SIZE) {
        alert(`File "${f.name}" is too large. Maximum size is 5MB.`);
        return false;
      }
      return true;
    });

    if (filteredFiles.length === 0) return;

    const newFiles = filteredFiles.map((f) => ({
      name: f.name,
      size: f.size,
      file: f,
    }));

    setUploadedFiles((prev) => [...prev, ...newFiles]);
    setView("files");
  };

  const handleRemoveFile = (index: number) => {
    if (isUploading) return;
    const newFiles = [...uploadedFiles];
    newFiles.splice(index, 1);
    setUploadedFiles(newFiles);
    if (newFiles.length === 0) setView("upload");
  };

  const startChat = async () => {
    if (uploadedFiles.length === 0 || isUploading) return;

    setIsUploading(true);
    const formData = new FormData();
    uploadedFiles.forEach((f) => {
      if (f.file) {
        formData.append("files", f.file);
      }
    });

    try {
      const response = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      // Once uploaded and processed, we can start the chat session
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
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to process files. Please try again.");
    } finally {
      setIsUploading(false);
    }
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

  const handleNewChat = () => {
    setView("upload");
    setUploadedFiles([]);
    setMessages([]);
    setActiveChatId(null);
    setInputValue("");
    setIsRightPanelOpen(false);
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
          onNewChat={handleNewChat}
          onDeleteAll={deleteAllChats}
        />

        <SidebarInset className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <header className="flex h-14 shrink-0 items-center gap-2 px-4 justify-between">
            <div className="flex items-center gap-2">
              <h1 className="font-lexend font-bold text-lg">ARC</h1>
            </div>
            {view === "chat" && !isRightPanelOpen && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsRightPanelOpen(true)}
              >
                <IconFiles className="h-4 w-4" />
              </Button>
            )}
          </header>

          <main className="flex flex-1 min-h-0 overflow-hidden relative">
            <div className="flex-1 flex flex-col min-h-0">
              {view === "upload" && (
                <UploadView
                  onUpload={handleFileSelect}
                  isUploading={isUploading}
                />
              )}
              {view === "files" && (
                <FilesView
                  files={uploadedFiles}
                  onAddFile={handleFileSelect}
                  onStartChat={startChat}
                  onRemoveFile={handleRemoveFile}
                  isUploading={isUploading}
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
          </main>
        </SidebarInset>

        {/* Right Panel for Files */}
        {view === "chat" && isRightPanelOpen && (
          <aside className="w-64 border-l bg-muted/30 flex flex-col animate-in slide-in-from-right duration-300 h-full">
            <div className="p-4 flex items-center justify-between h-14">
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
                    className="flex items-center gap-3 p-2 rounded-md"
                  >
                    <IconFileText className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p
                        className="text-sm font-medium truncate"
                        title={file.name}
                      >
                        {truncateFileName(file.name, 20)}
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </aside>
        )}
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
        accept=".pdf,.docx,.xlsx,.csv,.pptx,.txt,.md,.json,.png,.jpg,.jpeg"
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
            <IconRotateRectangle className="size-8 text-primary animate-spin" />
          ) : (
            <IconUpload className="size-8 text-primary" />
          )}
        </div>
        <div className="space-y-2">
          <p className="font-semibold text-lg">
            {isUploading ? "Uploading..." : "Click or drag files here"}
          </p>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>PDF, DOCX, XLSX, CSV, PPTX, TXT, MD, JSON, PNG, JPG</p>
            <p>(Up to 6 files • Max 5MB per file)</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function FilesView({
  files,
  onAddFile,
  onStartChat,
  onRemoveFile,
  isUploading,
}: {
  files: UploadedFile[];
  onAddFile: (files: FileList | null) => void;
  onStartChat: () => void;
  onRemoveFile: (index: number) => void;
  isUploading: boolean;
}) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <h2 className="text-3xl font-bold tracking-tight">Upload & Ask</h2>

      <input
        type="file"
        multiple
        className="hidden"
        ref={fileInputRef}
        onChange={(e) => onAddFile(e.target.files)}
        accept=".pdf,.docx,.xlsx,.csv,.pptx,.txt,.md,.json,.png,.jpg,.jpeg"
      />

      <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {files.map((file, i) => (
          <Card
            key={i}
            className={cn(
              "p-4 flex flex-col items-center justify-center gap-3 relative group text-center h-36 transition-all",
              isUploading && "opacity-50 grayscale-[0.5]"
            )}
          >
            <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <IconFileText size={24} />
            </div>
            <div className="min-w-0 w-full px-2">
              <p className="text-sm font-semibold truncate" title={file.name}>
                {truncateFileName(file.name, 28)}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider font-medium">
                {formatFileSize(file.size)}
              </p>
            </div>
            {!isUploading && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-1.5 right-1.5 size-6 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                onClick={() => onRemoveFile(i)}
              >
                <IconX className="size-3.5" />
              </Button>
            )}
          </Card>
        ))}
        {!isUploading && files.length < 6 && (
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="h-36 border-2 border-dashed flex flex-col gap-2 items-center justify-center hover:bg-accent/50 transition-all"
          >
            <IconPlus size={24} />
            <span className="text-xs font-medium">Add more</span>
          </Button>
        )}
      </div>

      <div className="flex flex-col items-center gap-4">
        <Button
          size="lg"
          className="px-8 gap-2 group min-w-[200px]"
          onClick={onStartChat}
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <IconRotateRectangle className="size-4 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <span>Analyze Documents</span>
              <IconArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </>
          )}
        </Button>

        {isUploading && (
          <p className="text-xs text-muted-foreground animate-pulse">
            Please wait while we process your documents...
          </p>
        )}
      </div>
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
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    const scrollToBottom = () => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    };

    // Use a small timeout to ensure the DOM has updated
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [messages]);

  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <ScrollArea className="flex-1 min-h-0 p-4 md:p-6" ref={scrollRef}>
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

      <div className="p-4 bg-background/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto relative group">
          <Textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSendMessage();
              }
            }}
            placeholder="Ask a question about your documents..."
            className="pl-4 pr-12 min-h-[56px] max-h-40 py-4 rounded-md border-2 focus-visible:ring-0 focus-visible:border-primary/50 transition-all resize-none overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full"
          />
          <div className="absolute right-2 bottom-3">
            <Button
              size="icon"
              className="size-8 rounded-md"
              disabled={!inputValue.trim() || isAsking}
              onClick={onSendMessage}
            >
              {isAsking ? (
                <IconRotateRectangle className="size-4 animate-spin" />
              ) : (
                <IconSend2 size={22} />
              )}
            </Button>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground text-center mt-2">
          <span className="font-bungee">ARC</span> is AI and can make mistakes.
          Please double-check important info.
        </p>
      </div>
    </div>
  );
}
