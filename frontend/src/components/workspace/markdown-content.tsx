import type { ReactNode } from "react";

function inline(text: string): ReactNode[] {
  const pattern = /(\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_|`[^`]+`|\[[^\]]+\]\(https?:\/\/[^\s)]+\)|https?:\/\/[^\s]+)/g;
  const parts = text.split(pattern).filter(Boolean);
  return parts.map((part, index) => {
    if ((part.startsWith("**") && part.endsWith("**")) || (part.startsWith("__") && part.endsWith("__"))) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if ((part.startsWith("*") && part.endsWith("*")) || (part.startsWith("_") && part.endsWith("_"))) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith("`") && part.endsWith("`")) return <code key={index}>{part.slice(1, -1)}</code>;
    const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/);
    const url = link?.[2] ?? (part.startsWith("http") ? part.replace(/[),.]+$/, "") : null);
    if (url) {
      const label = link?.[1] ?? url;
      return <a key={index} href={url} target="_blank" rel="noreferrer">{label}</a>;
    }
    return <span key={index}>{part}</span>;
  });
}

export function MarkdownContent({ text }: { text: string }) {
  const lines = text.replace(/\\n/g, "\n").split(/\r?\n/);
  const blocks: ReactNode[] = [];
  let paragraph: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;

  const flushParagraph = () => {
    if (paragraph.length) blocks.push(<p key={`p-${blocks.length}`}>{inline(paragraph.join(" "))}</p>);
    paragraph = [];
  };
  const flushList = () => {
    if (!list) return;
    const Tag = list.ordered ? "ol" : "ul";
    blocks.push(<Tag key={`list-${blocks.length}`}>{list.items.map((item, i) => <li key={i}>{inline(item)}</li>)}</Tag>);
    list = null;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) { flushParagraph(); flushList(); continue; }
    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      flushParagraph(); flushList();
      blocks.push(<h4 key={`h-${blocks.length}`}>{inline(heading[2].replace(/\s+#+$/, ""))}</h4>);
      continue;
    }
    const item = line.match(/^(?:[-*+]\s+|(\d+)[.)]\s+)(.+)$/);
    if (item) {
      flushParagraph();
      const ordered = Boolean(item[1]);
      if (list && list.ordered !== ordered) flushList();
      list ??= { ordered, items: [] };
      list.items.push(item[2]);
      continue;
    }
    flushList();
    paragraph.push(line);
  }
  flushParagraph(); flushList();
  return <div className="report-markdown">{blocks}</div>;
}
