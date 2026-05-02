"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkBreaks from "remark-breaks";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import { cn } from "@/lib/utils";

interface MarkdownProps {
  content: string;
  className?: string;
}

export function Markdown({ content, className }: MarkdownProps) {
  return (
    <div
      className={cn(
        "markdown-content prose prose-sm dark:prose-invert max-w-none wrap-break-word",
        "prose-p:leading-relaxed prose-pre:p-0 prose-pre:bg-transparent prose-pre:border-none",
        "prose-code:bg-muted/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none",
        "prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5",
        "prose-headings:font-semibold prose-headings:tracking-tight",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath, remarkBreaks]}
        rehypePlugins={[rehypeKatex, [rehypeHighlight, { detect: true }]]}
        components={{
          a: ({ node: _node, ...props }) => (
            <a
              {...props}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline underline-offset-4"
            />
          ),
          pre: ({ node: _node, ...props }) => (
            <pre
              {...props}
              className="p-4 rounded-xl bg-muted/30 border border-border overflow-x-auto my-4 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent"
            />
          ),
          code: ({ node: _node, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            const isInline = !match;
            return isInline ? (
              <code
                {...props}
                className={cn(
                  "bg-muted/50 px-1.5 py-0.5 rounded-md font-mono text-[0.85em]",
                  className
                )}
              >
                {children}
              </code>
            ) : (
              <code
                {...props}
                className={cn("font-mono text-[0.9em]", className)}
              >
                {children}
              </code>
            );
          },
          table: ({ node: _node, ...props }) => (
            <div className="my-4 overflow-x-auto rounded-lg border border-border">
              <table {...props} className="w-full text-left border-collapse" />
            </div>
          ),
          th: ({ node: _node, ...props }) => (
            <th
              {...props}
              className="px-4 py-2 border-b border-border bg-muted/30 font-semibold"
            />
          ),
          td: ({ node: _node, ...props }) => (
            <td {...props} className="px-4 py-2 border-b border-border" />
          ),
          blockquote: ({ node: _node, ...props }) => (
            <blockquote
              {...props}
              className="border-l-4 border-primary/30 pl-4 italic my-4 text-muted-foreground"
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
