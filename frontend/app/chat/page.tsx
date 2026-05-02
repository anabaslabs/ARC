"use client";

import * as React from "react";
import { IconFiles } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import { AppSidebar } from "./_components/app-sidebar";
import { UploadView } from "./_components/upload-view";
import { FilesView } from "./_components/files-view";
import { ChatView } from "./_components/chat-view";
import { RightPanel } from "./_components/right-panel";

import { ViewState, Message, ChatSession, UploadedFile } from "./types";

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
          <header className="flex h-14 shrink-0 items-center gap-2 px-4 justify-between bg-sidebar border-b border-border/50 shadow-sm">
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

        {view === "chat" && isRightPanelOpen && (
          <RightPanel
            files={uploadedFiles}
            onClose={() => setIsRightPanelOpen(false)}
          />
        )}
      </div>
    </SidebarProvider>
  );
}
