"use client";

import { IconFileText, IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UploadedFile } from "@/app/chat/types";
import { truncateFileName, formatFileSize } from "@/app/chat/utils";
import { cn } from "@/lib/utils";

interface RightPanelProps {
  files: UploadedFile[];
  onClose: () => void;
  isOpen: boolean;
}

export function RightPanel({ files, onClose, isOpen }: RightPanelProps) {
  return (
    <div
      className="group/right-panel peer hidden text-sidebar-foreground md:block"
      data-state={isOpen ? "expanded" : "collapsed"}
    >
      <div
        className={cn(
          "relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear",
          !isOpen && "w-0"
        )}
      />

      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-10 flex h-svh w-(--sidebar-width) flex-col border-l bg-muted dark:bg-muted/30 transition-[left,right,width] duration-200 ease-linear shadow-sm",
          !isOpen && "-right-(--sidebar-width)"
        )}
      >
        <div className="p-4 flex items-center justify-between h-14 shrink-0">
          <h2 className="text-sm font-bold">{files.length} Files</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="size-10">
            <IconX size={20} />
          </Button>
        </div>
        <ScrollArea className="flex-1 p-2">
          <div className="space-y-1">
            {files.map((file, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-2 rounded-md h-12 group"
              >
                <div className="size-10 rounded bg-background border border-border/50 flex items-center justify-center shrink-0">
                  <IconFileText size={20} className="text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium truncate" title={file.name}>
                    {truncateFileName(file.name, 25)}
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
    </div>
  );
}
