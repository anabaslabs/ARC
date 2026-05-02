"use client";

import { IconFileText, IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UploadedFile } from "@/app/chat/types";
import { truncateFileName, formatFileSize } from "@/app/chat/utils";

interface RightPanelProps {
  files: UploadedFile[];
  onClose: () => void;
}

export function RightPanel({ files, onClose }: RightPanelProps) {
  return (
    <aside className="flex flex-col h-full w-64 border-l bg-muted dark:bg-muted/30">
      <div className="p-4 flex items-center justify-between h-14">
        <h2 className="text-sm font-semibold">{files.length} Files</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <IconX className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1 p-2">
        <div className="space-y-1">
          {files.map((file, i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-md">
              <IconFileText className="h-5 w-5 text-muted-foreground shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate" title={file.name}>
                  {truncateFileName(file.name, 20)}
                </p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  {formatFileSize(file.size)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </aside>
  );
}
