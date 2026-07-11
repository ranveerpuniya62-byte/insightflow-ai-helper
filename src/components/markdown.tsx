import { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

const REMARK = [remarkGfm, remarkMath];
const REHYPE = [rehypeKatex];

export const Markdown = memo(function Markdown({ children }: { children: string }) {
  return (
    <div className="prose-chat text-sm leading-relaxed">
      <ReactMarkdown remarkPlugins={REMARK} rehypePlugins={REHYPE}>
        {children}
      </ReactMarkdown>
    </div>
  );
});
