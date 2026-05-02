"use client";

import { useRef } from "react";
import { IconUpload, IconRotateRectangle } from "@tabler/icons-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface UploadViewProps {
  onUpload: (files: FileList | null) => void;
  isUploading: boolean;
}

export function UploadView({ onUpload, isUploading }: UploadViewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          "w-full max-w-2xl aspect-2/1 border-2 border-dashed flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-accent/50 transition-all group",
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
