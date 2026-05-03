"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  IconRotateRectangle,
  IconArrowRight,
  IconMicrophone,
} from "@tabler/icons-react";
import { Markdown } from "@/components/markdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Message } from "@/app/chat/types";

// Speech Recognition Types
interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResult {
  readonly length: number;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  [index: number]: SpeechRecognitionResult;
  item(index: number): SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly results: SpeechRecognitionResultList;
  readonly resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

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
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (
        (window as unknown as { SpeechRecognition: SpeechRecognitionConstructor })
          .SpeechRecognition ||
        (
          window as unknown as {
            webkitSpeechRecognition: SpeechRecognitionConstructor;
          }
        ).webkitSpeechRecognition
      );

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = Array.from(
            event.results as unknown as SpeechRecognitionResult[]
          )
            .map((result: SpeechRecognitionResult) => result[0].transcript)
            .join("");
          onInputChange(transcript);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [onInputChange]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsListening(true);
      } else {
        alert("Speech recognition is not supported in your browser.");
      }
    }
  }, [isListening]);

  const handleSend = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
    }
    onSendMessage();
  }, [isListening, onSendMessage]);

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
    <div className="bg-sidebar relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <ScrollArea className="min-h-0 flex-1 px-4 md:px-6" ref={scrollRef}>
        <div className="mx-auto max-w-4xl space-y-6 py-4 pb-40">
          {messages.map((message) => (
            <div
              key={message.id}
              className="animate-in fade-in slide-in-from-bottom-2 flex w-full duration-300"
            >
              <div
                className={cn(
                  "max-w-[90%] text-sm leading-relaxed",
                  message.role === "user"
                    ? "bg-primary/10 text-foreground border-primary/20 ml-auto border px-4 py-2.5"
                    : "bg-transparent"
                )}
              >
                <Markdown content={message.content} />
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="pointer-events-none absolute right-0 bottom-0 left-0 flex flex-col">
        <div className="from-sidebar h-10 bg-linear-to-t to-transparent" />
        <div className="bg-sidebar pointer-events-auto px-4 pb-3">
          <div className="group relative mx-auto max-w-4xl">
            <div className="absolute top-0 bottom-0 left-3 z-10 flex items-center">
              <Button
                size="icon"
                variant="ghost"
                className={cn(
                  "size-8 rounded-xl border-none shadow-none transition-none",
                  isListening
                    ? "bg-red-500/10 text-red-500 hover:!bg-red-500/10 hover:!text-red-500"
                    : "bg-transparent text-white hover:!bg-transparent hover:!text-white"
                )}
                onClick={toggleListening}
                title={isListening ? "Stop listening" : "Start voice input"}
              >
                <IconMicrophone size={18} />
              </Button>
            </div>
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask a question about your documents..."
              className="border-border/40 bg-background/98 focus-visible:border-primary/50 max-h-40 min-h-14 resize-none overflow-y-auto rounded-xl border-2 py-4.5 pr-12 pl-12 text-sm backdrop-blur-sm transition-all [-ms-overflow-style:none] [scrollbar-width:none] focus-visible:ring-0 [&::-webkit-scrollbar]:hidden"
            />
            <div className="absolute top-0 right-3 bottom-0 flex items-center">
              <Button
                size="icon"
                className="size-8 rounded-xl"
                disabled={!inputValue.trim() || isAsking}
                onClick={handleSend}
              >
                {isAsking ? (
                  <IconRotateRectangle className="size-4 animate-spin" />
                ) : (
                  <IconArrowRight size={18} />
                )}
              </Button>
            </div>
          </div>
          <p className="text-muted-foreground mt-3 text-center text-[10px]">
            <span className="font-bungee">ARC</span> is AI and can make
            mistakes. Please double-check important info.
          </p>
        </div>
      </div>
    </div>
  );
}
