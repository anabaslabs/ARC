"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { IconFilesFilled } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "../_components/app-sidebar";
import { UploadView } from "../_components/upload-view";
import { FilesView } from "../_components/files-view";
import { ChatView } from "../_components/chat-view";
import { RightPanel } from "../_components/right-panel";
import { ViewState, Message, ChatSession, UploadedFile } from "../types";
import {
  MAX_FILE_SIZE,
  MAX_FILE_COUNT,
  getUserId,
  formatChatTitle,
} from "../utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function ChatInterface({
  initialChatId,
  chats,
  setChats,
  userId,
}: {
  initialChatId?: string;
  chats: ChatSession[];
  setChats: React.Dispatch<React.SetStateAction<ChatSession[]>>;
  userId: string;
}) {
  const router = useRouter();

  const [view, setView] = React.useState<ViewState>(
    initialChatId ? "chat" : "upload"
  );

  const [uploadedFiles, setUploadedFiles] = React.useState<UploadedFile[]>(
    () => {
      if (typeof window === "undefined" || !initialChatId) return [];
      const saved = localStorage.getItem(`arc_files_${initialChatId}`);
      return saved ? JSON.parse(saved) : [];
    }
  );

  const [messages, setMessages] = React.useState<Message[]>(() => {
    if (typeof window === "undefined" || !initialChatId) return [];
    const saved = localStorage.getItem(`arc_messages_${initialChatId}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [inputValue, setInputValue] = React.useState("");
  const [isRightPanelOpen, setIsRightPanelOpen] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [isAsking, setIsAsking] = React.useState(false);

  const abortControllerRef = React.useRef<AbortController | null>(null);

  React.useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const currentFilesCount = uploadedFiles.length;
    const selectedFiles = Array.from(files);

    if (currentFilesCount + selectedFiles.length > MAX_FILE_COUNT) {
      toast.warning(`Maximum of ${MAX_FILE_COUNT} files allowed.`);
      return;
    }

    const filteredFiles = selectedFiles.filter((f) => {
      if (f.size > MAX_FILE_SIZE) {
        toast.error(`"${f.name}" is too large (max 5MB).`);
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
    const newChatId = Date.now().toString();
    const formData = new FormData();
    uploadedFiles.forEach((f) => {
      if (f.file) {
        formData.append("files", f.file);
      }
    });
    formData.append("session_id", newChatId);

    try {
      const response = await fetch(`${API_URL}/upload`, {
        method: "POST",
        headers: {
          "X-User-ID": userId,
        },
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const newChat: ChatSession = {
        id: newChatId,
        title: formatChatTitle(newChatId),
        date: "Just now",
      };

      setChats([newChat, ...chats]);

      const initMessages: Message[] = [
        {
          id: "1",
          role: "assistant",
          content: "I've processed your files. How can I help you today?",
        },
      ];

      setMessages(initMessages);
      localStorage.setItem(
        `arc_messages_${newChatId}`,
        JSON.stringify(initMessages)
      );

      const fileMetadata = uploadedFiles.map((f) => ({
        name: f.name,
        size: f.size,
      }));
      localStorage.setItem(
        `arc_files_${newChatId}`,
        JSON.stringify(fileMetadata)
      );

      router.push(`/chat/${newChatId}`);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to process files. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isAsking) return;

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    localStorage.setItem(
      `arc_messages_${initialChatId}`,
      JSON.stringify(newMessages)
    );
    setInputValue("");
    setIsAsking(true);

    try {
      const response = await fetch(`${API_URL}/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-ID": userId,
        },
        body: JSON.stringify({
          question: inputValue,
          session_id: initialChatId || "default_index",
        }),
        signal: controller.signal,
      });

      if (!response.ok) throw new Error("Failed to get answer");

      const data = await response.json();
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.answer,
      };
      const updatedMessages = [...newMessages, aiMessage];
      setMessages(updatedMessages);
      localStorage.setItem(
        `arc_messages_${initialChatId}`,
        JSON.stringify(updatedMessages)
      );
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      console.error("Ask error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error while processing your request.",
      };
      const updatedMessages = [...newMessages, errorMessage];
      setMessages(updatedMessages);
      localStorage.setItem(
        `arc_messages_${initialChatId}`,
        JSON.stringify(updatedMessages)
      );
    } finally {
      if (abortControllerRef.current === controller) {
        setIsAsking(false);
      }
    }
  };

  return (
    <>
      <SidebarInset className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <header className="bg-sidebar border-border/50 flex h-14 shrink-0 items-center justify-between gap-2 border-b px-2 shadow-sm">
          <div className="flex items-center gap-1">
            <SidebarTrigger className="md:hidden" />
            <div className="flex items-center gap-2 px-2">
              <Image
                src="/logo.png"
                alt="ARC Logo"
                height={512}
                width={512}
                priority
                className="size-7 object-contain"
              />
              <h1 className="font-lexend text-lg font-bold">ARC</h1>
            </div>
          </div>
          {view === "chat" && !isRightPanelOpen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsRightPanelOpen(true)}
              className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
              <IconFilesFilled className="h-4 w-4" />
            </Button>
          )}
        </header>

        <main className="relative flex min-h-0 flex-1 overflow-hidden">
          <div className="flex min-h-0 flex-1 flex-col">
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

      {view === "chat" && (
        <RightPanel
          files={uploadedFiles}
          onClose={() => setIsRightPanelOpen(false)}
          isOpen={isRightPanelOpen}
        />
      )}
    </>
  );
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const initialChatId = (params.id as string[] | undefined)?.[0];

  const [chats, setChats] = React.useState<ChatSession[]>([]);
  const [userId, setUserId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const initAuth = async () => {
      let id = getUserId();
      if (!id) {
        try {
          const res = await fetch(`${API_URL}/auth/guest`);
          if (!res.ok) throw new Error("Failed to get guest ID");
          const data = await res.json();
          id = data.user_id;
          if (id) localStorage.setItem("arc_user_id", id);
        } catch (error) {
          console.error("Auth error:", error);
          toast.error("Failed to initialize session. Please refresh.");
          return;
        }
      }
      setUserId(id);
    };
    initAuth();
  }, []);

  React.useEffect(() => {
    if (!userId) return;

    const fetchChats = async () => {
      try {
        const response = await fetch(`${API_URL}/chats`, {
          headers: { "X-User-ID": userId },
        });
        if (response.ok) {
          const data = await response.json();
          const fetchedChats = (data.chats || []).map((chat: ChatSession) => ({
            ...chat,
            title: formatChatTitle(chat.id),
          }));
          setChats(fetchedChats);
        }
      } catch (error) {
        console.error("Failed to fetch chats:", error);
      }
    };
    fetchChats();
  }, [userId]);

  const handleChatSelect = (id: string) => {
    router.push(`/chat/${id}`);
  };

  const handleNewChat = () => {
    router.push("/chat");
  };

  const deleteChat = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/delete/${id}`, {
        method: "DELETE",
        headers: { "X-User-ID": userId || "" },
      });

      if (!response.ok) throw new Error("Failed to delete chat");

      setChats((prev) => prev.filter((c) => c.id !== id));
      localStorage.removeItem(`arc_messages_${id}`);
      localStorage.removeItem(`arc_files_${id}`);

      if (initialChatId === id) {
        handleNewChat();
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete chat data.");
    }
  };

  const deleteAllChats = async () => {
    try {
      const response = await fetch(`${API_URL}/clear`, {
        method: "DELETE",
        headers: { "X-User-ID": userId || "" },
      });

      if (!response.ok) throw new Error("Failed to clear index");

      setChats([]);
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("arc_messages_") || key.startsWith("arc_files_")) {
          localStorage.removeItem(key);
        }
      });
      handleNewChat();
    } catch (error) {
      console.error("Clear error:", error);
      toast.error("Failed to clear backend data.");
    }
  };

  return (
    <SidebarProvider>
      <div className="bg-background flex h-screen w-full overflow-hidden">
        <AppSidebar
          chats={chats}
          activeChatId={initialChatId || null}
          onChatSelect={handleChatSelect}
          onNewChat={handleNewChat}
          onDeleteAll={deleteAllChats}
          onDeleteChat={deleteChat}
        />

        {userId ? (
          <ChatInterface
            key={initialChatId || "new"}
            initialChatId={initialChatId}
            chats={chats}
            setChats={setChats}
            userId={userId}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-muted-foreground animate-pulse">
              Initializing session...
            </p>
          </div>
        )}
      </div>
    </SidebarProvider>
  );
}
