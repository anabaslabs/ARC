"use client";

import { useEffect, useRef } from "react";
import { IconRotateRectangle, IconArrowRight } from "@tabler/icons-react";
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
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-sidebar relative">
      <ScrollArea className="flex-1 min-h-0 px-4 md:px-6" ref={scrollRef}>
        <div className="max-w-4xl mx-auto space-y-6 py-4 pb-40">
          {messages.map((message) => (
            <div
              key={message.id}
              className="flex animate-in fade-in slide-in-from-bottom-2 duration-300 w-full"
            >
              <div
                className={cn(
                  "text-sm max-w-[90%] leading-relaxed",
                  message.role === "user"
                    ? "bg-primary/10 text-foreground border border-primary/20 rounded-2xl px-4 py-2.5 ml-auto"
                    : "bg-transparent"
                )}
              >
                <Markdown content={message.content} />
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="absolute bottom-0 left-0 right-0 pointer-events-none flex flex-col">
        <div className="h-10 bg-linear-to-t from-sidebar to-transparent" />
        <div className="bg-sidebar px-4 pb-3 pointer-events-auto">
          <div className="max-w-4xl mx-auto relative group">
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
              className="pl-4 pr-12 text-sm min-h-14 max-h-40 py-4.5 rounded-2xl border-2 border-border/40 bg-background/98 backdrop-blur-sm focus-visible:ring-0 focus-visible:border-primary/50 transition-all resize-none overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            />
            <div className="absolute right-3 top-0 bottom-0 flex items-center">
              <Button
                size="icon"
                className="size-8 rounded-md"
                disabled={!inputValue.trim() || isAsking}
                onClick={onSendMessage}
              >
                {isAsking ? (
                  <IconRotateRectangle className="size-4 animate-spin" />
                ) : (
                  <IconArrowRight size={18} />
                )}
              </Button>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-3">
            <span className="font-bungee">ARC</span> is AI and can make
            mistakes. Please double-check important info.
          </p>
        </div>
      </div>
    </div>
  );
}
