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
    <div className="bg-sidebar flex flex-1 flex-col items-center justify-center space-y-6 p-8 text-center">
      <div className="space-y-2">
        <h2 className="text-4xl font-bold tracking-tight">Upload & Ask</h2>
        <p className="text-muted-foreground mx-auto max-w-md text-lg">
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
          "hover:bg-accent/50 group flex aspect-2/1 w-full max-w-2xl cursor-pointer flex-col items-center justify-center gap-4 border-2 border-dashed transition-all",
          isUploading && "cursor-not-allowed opacity-50"
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
          <p className="text-lg font-semibold">
            {isUploading ? "Uploading..." : "Click or drag files here"}
          </p>
          <div className="text-muted-foreground space-y-1 text-sm">
            <p>PDF, DOCX, XLSX, CSV, PPTX, TXT, MD, JSON, PNG, JPG</p>
            <p>(Up to 6 files • Max 5MB per file)</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
