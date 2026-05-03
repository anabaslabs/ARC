"use client";

import * as React from "react";
import { IconFiles } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import { useParams } from "next/navigation";
import { AppSidebar } from "../_components/app-sidebar";
import { UploadView } from "../_components/upload-view";
import { FilesView } from "../_components/files-view";
import { ChatView } from "../_components/chat-view";
import { RightPanel } from "../_components/right-panel";

import { ViewState, Message, ChatSession, UploadedFile } from "../types";
import { MAX_FILE_SIZE, MAX_FILE_COUNT } from "../utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ChatPage() {
  const params = useParams();
  const initialChatId = (params.id as string[] | undefined)?.[0];

  const [view, setView] = React.useState<ViewState>(
    initialChatId ? "chat" : "upload"
  );
  const [chats, setChats] = React.useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = React.useState<string | null>(
    initialChatId ?? null
  );
  const [uploadedFiles, setUploadedFiles] = React.useState<UploadedFile[]>([]);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [inputValue, setInputValue] = React.useState("");
  const [isRightPanelOpen, setIsRightPanelOpen] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [isAsking, setIsAsking] = React.useState(false);

  // Load saved data on mount to avoid hydration mismatch
  React.useEffect(() => {
    if (initialChatId) {
      const savedFiles = localStorage.getItem(`arc_files_${initialChatId}`);
      const savedMessages = localStorage.getItem(
        `arc_messages_${initialChatId}`
      );
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (savedFiles) setUploadedFiles(JSON.parse(savedFiles));
      if (savedMessages) setMessages(JSON.parse(savedMessages));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch chats on initial mount
  React.useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await fetch(`${API_URL}/chats`);
        if (response.ok) {
          const data = await response.json();
          setChats(data.chats || []);
        }
      } catch (error) {
        console.error("Failed to fetch chats:", error);
      }
    };
    fetchChats();
  }, []);

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

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
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      // Once uploaded and processed, we can start the chat session
      const newChat: ChatSession = {
        id: newChatId,
        title: `Analysis ${new Date().toLocaleTimeString()}`,
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
      setActiveChatId(newChatId);
      setView("chat");
      window.history.pushState(null, "", `/chat/${newChatId}`);
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

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    localStorage.setItem(
      `arc_messages_${activeChatId}`,
      JSON.stringify(newMessages)
    );
    setInputValue("");
    setIsAsking(true);

    try {
      const response = await fetch(`${API_URL}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: inputValue,
          session_id: activeChatId || "default_index",
        }),
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
        `arc_messages_${activeChatId}`,
        JSON.stringify(updatedMessages)
      );
    } catch (error) {
      console.error("Ask error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error while processing your request.",
      };
      const updatedMessages = [...newMessages, errorMessage];
      setMessages(updatedMessages);
      localStorage.setItem(
        `arc_messages_${activeChatId}`,
        JSON.stringify(updatedMessages)
      );
    } finally {
      setIsAsking(false);
    }
  };

  const handleNewChat = () => {
    setView("upload");
    setActiveChatId(null);
    setUploadedFiles([]);
    setMessages([]);
    setInputValue("");
    setIsRightPanelOpen(false);
    window.history.pushState(null, "", "/chat");
  };

  const deleteAllChats = async () => {
    try {
      const response = await fetch(`${API_URL}/clear`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to clear index");

      setView("upload");
      setActiveChatId(null);
      setChats([]);
      setUploadedFiles([]);
      setMessages([]);
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("arc_messages_") || key.startsWith("arc_files_")) {
          localStorage.removeItem(key);
        }
      });
      window.history.pushState(null, "", "/chat");
    } catch (error) {
      console.error("Clear error:", error);
      alert("Failed to clear backend data. Index might still be there.");
    }
  };

  const deleteChat = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/delete/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete chat");

      setChats((prev) => prev.filter((c) => c.id !== id));
      localStorage.removeItem(`arc_messages_${id}`);
      localStorage.removeItem(`arc_files_${id}`);
      if (activeChatId === id) {
        handleNewChat();
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete chat data.");
    }
  };

  const handleChatSelect = (id: string) => {
    setActiveChatId(id);
    setView("chat");
    const savedMessages = localStorage.getItem(`arc_messages_${id}`);
    setMessages(savedMessages ? JSON.parse(savedMessages) : []);
    const savedFiles = localStorage.getItem(`arc_files_${id}`);
    setUploadedFiles(savedFiles ? JSON.parse(savedFiles) : []);
    window.history.pushState(null, "", `/chat/${id}`);
  };

  return (
    <SidebarProvider>
      <div className="bg-background flex h-screen w-full overflow-hidden">
        <AppSidebar
          chats={chats}
          activeChatId={activeChatId}
          onChatSelect={handleChatSelect}
          onNewChat={handleNewChat}
          onDeleteAll={deleteAllChats}
          onDeleteChat={deleteChat}
        />

        <SidebarInset className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <header className="bg-sidebar border-border/50 flex h-14 shrink-0 items-center justify-between gap-2 border-b px-4 shadow-sm">
            <div className="flex items-center gap-2">
              <h1 className="font-lexend text-lg font-bold">ARC</h1>
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
      </div>
    </SidebarProvider>
  );
}
