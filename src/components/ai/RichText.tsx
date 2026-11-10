import Link from "next/link";
import { Fragment, type ReactNode } from "react";

// Tiny, safe formatter for assistant replies: **bold**, "- " bullets, and
// internal links like /tours/some-slug. Everything is rendered as React text
// nodes (never HTML), so model output can't inject markup or external links.
const INLINE = /(\*\*[^*]+\*\*|\/(?:tours|destinations|hotels|safaris|portal|contact|assistant)(?:\/[a-z0-9-]+)?)/g;

function inline(text: string): ReactNode[] {
  return text.split(INLINE).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("/")) {
      return (
        <Link key={i} href={part} className="underline decoration-dotted underline-offset-2 font-semibold hover:text-gold-600">
          {part}
        </Link>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

export default function RichText({ text }: { text: string }) {
  const blocks: ReactNode[] = [];
  let bullets: string[] = [];
  const flush = () => {
    if (!bullets.length) return;
    blocks.push(
      <ul key={`ul-${blocks.length}`} className="list-disc pl-5 space-y-1 my-1.5">
        {bullets.map((b, i) => <li key={i}>{inline(b)}</li>)}
      </ul>
    );
    bullets = [];
  };
  text.split("\n").forEach((line) => {
    const m = line.match(/^\s*[-*•]\s+(.*)$/);
    if (m) return void bullets.push(m[1]);
    flush();
    if (line.trim()) blocks.push(<p key={`p-${blocks.length}`} className="my-1.5">{inline(line)}</p>);
  });
  flush();
  return <>{blocks}</>;
}
