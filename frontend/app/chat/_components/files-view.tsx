"use client";

import { useRef } from "react";
import {
  IconFileText,
  IconX,
  IconPlus,
  IconRotateRectangle,
  IconArrowRight,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { UploadedFile } from "@/app/chat/types";
import { truncateFileName, formatFileSize } from "@/app/chat/utils";

interface FilesViewProps {
  files: UploadedFile[];
  onAddFile: (files: FileList | null) => void;
  onStartChat: () => void;
  onRemoveFile: (index: number) => void;
  isUploading: boolean;
}

export function FilesView({
  files,
  onAddFile,
  onStartChat,
  onRemoveFile,
  isUploading,
}: FilesViewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          className="px-8 gap-2 group min-w-50"
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
