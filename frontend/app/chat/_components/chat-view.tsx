"use client";

import { useEffect, useRef } from "react";
import {
  IconUser,
  IconRobot,
  IconRotateRectangle,
  IconSend2,
} from "@tabler/icons-react";
import { Markdown } from "@/components/markdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Message } from "@/app/chat/types";

interface ChatViewProps {
  messages: Message[];
  inputValue: string;
  isAsking: boolean;
  onInputChange: (val: string) => void;
  onSendMessage: () => void;
}

export function ChatView({
  messages,
  inputValue,
  isAsking,
  onInputChange,
  onSendMessage,
}: ChatViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const scrollToBottom = () => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    };

    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [messages]);

  useEffect(() => {
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
                <Markdown content={message.content} />
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
            className="pl-4 pr-12 min-h-14 max-h-40 py-4 rounded-md border-2 focus-visible:ring-0 focus-visible:border-primary/50 transition-all resize-none overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full"
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
