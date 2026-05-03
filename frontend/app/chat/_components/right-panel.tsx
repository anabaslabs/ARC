"use client";

import { IconFilesOff } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UploadedFile } from "@/app/chat/types";
import {
  truncateFileName,
  formatFileSize,
  getFileIcon,
} from "@/app/chat/utils";
import { cn } from "@/lib/utils";

interface RightPanelProps {
  files: UploadedFile[];
  onClose: () => void;
  isOpen: boolean;
}

export function RightPanel({ files, onClose, isOpen }: RightPanelProps) {
  return (
    <div
      className="group/right-panel peer text-sidebar-foreground hidden md:block"
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
          "bg-muted dark:bg-muted/30 fixed inset-y-0 right-0 z-10 flex h-svh w-(--sidebar-width) flex-col border-l shadow-sm transition-[left,right,width] duration-200 ease-linear",
          !isOpen && "-right-(--sidebar-width)"
        )}
      >
        <div className="flex h-14 shrink-0 items-center justify-between p-4">
          <h2 className="text-sm font-bold">{files.length} Files</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground size-10 transition-colors"
          >
            <IconFilesOff className="h-4 w-4" />
          </Button>
        </div>
        <ScrollArea className="flex-1 p-2">
          <div className="space-y-1">
            {files.map((file, i) => (
              <div key={i} className="group flex h-12 items-center gap-3 p-2">
                <div className="bg-background border-border/50 flex size-10 shrink-0 items-center justify-center border">
                  {(() => {
                    const Icon = getFileIcon(file.name);
                    return <Icon size={20} className="text-muted-foreground" />;
                  })()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium" title={file.name}>
                    {truncateFileName(file.name, 25)}
                  </p>
                  <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
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
