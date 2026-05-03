"use client";

import { useRef, useState, DragEvent } from "react";
import { IconUpload, IconRotateRectangle } from "@tabler/icons-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface UploadViewProps {
  onUpload: (files: FileList | null) => void;
  isUploading: boolean;
}

export function UploadView({ onUpload, isUploading }: UploadViewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isUploading) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (
      !isUploading &&
      e.dataTransfer.files &&
      e.dataTransfer.files.length > 0
    ) {
      onUpload(e.dataTransfer.files);
    }
  };

  return (
    <div className="bg-sidebar flex flex-1 flex-col items-center justify-center space-y-6 p-4 text-center sm:p-8">
      <div className="mb-6 sm:mb-10">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
          Let's get to work...
        </h2>
      </div>

      <input
        type="file"
        multiple
        className="hidden"
        ref={fileInputRef}
        onChange={(e) => {
          onUpload(e.target.files);
          e.target.value = "";
        }}
        accept=".pdf,.docx,.xlsx,.csv,.pptx,.txt,.md,.json"
      />

      <Card
        onClick={() => !isUploading && fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "hover:bg-accent/50 group flex aspect-video w-[90%] max-w-md cursor-pointer flex-col items-center justify-center gap-4 border-2 border-dashed transition-all sm:aspect-2/1 sm:w-full sm:max-w-2xl",
          isUploading && "cursor-not-allowed opacity-50",
          isDragging && "border-primary bg-primary/5"
        )}
      >
        <div className="bg-primary/10 flex size-16 items-center justify-center transition-transform group-hover:scale-110">
          {isUploading ? (
            <IconRotateRectangle className="text-primary size-8 animate-spin" />
          ) : (
            <IconUpload className="text-primary size-8" />
          )}
        </div>
        <div className="space-y-2">
          <p className="text-base font-semibold sm:text-lg">
            {isUploading ? "Uploading..." : "Click or drag files here"}
          </p>
          <div className="text-muted-foreground space-y-1 text-xs sm:text-sm">
            <p>PDF, DOCX, XLSX, CSV, PPTX, TXT, MD, JSON</p>
            <p>(Up to 6 files • Max 5MB per file)</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
