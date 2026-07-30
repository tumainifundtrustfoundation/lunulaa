import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) return null;

  // Split lines to parse structurally
  const lines = content.split('\n');
  const renderedElements: React.ReactNode[] = [];
  
  let currentList: { type: 'ul' | 'ol'; items: React.ReactNode[] } | null = null;
  let inCodeBlock = false;
  let codeLines: string[] = [];
  let codeLanguage = '';

  const flushList = (key: string | number) => {
    if (!currentList) return null;
    const listType = currentList.type;
    const items = currentList.items;
    currentList = null;

    if (listType === 'ul') {
      return (
        <ul key={`ul-${key}`} className="list-disc pl-5 sm:pl-6 my-2 space-y-1 text-slate-700 text-xs sm:text-sm font-medium">
          {items.map((item, idx) => (
            <li key={idx} className="leading-relaxed">{item}</li>
          ))}
        </ul>
      );
    } else {
      return (
        <ol key={`ol-${key}`} className="list-decimal pl-5 sm:pl-6 my-2 space-y-1 text-slate-700 text-xs sm:text-sm font-medium">
          {items.map((item, idx) => (
            <li key={idx} className="leading-relaxed">{item}</li>
          ))}
        </ol>
      );
    }
  };

  // Helper to parse bold, italics, and inline code
  const formatText = (text: string) => {
    // Escape or preserve double asterisks for bold
    const boldRegex = /\*\*(.*?)\*\*/g;
    const inlineCodeRegex = /`(.*?)`/g;
    const italicRegex = /\*(.*?)\*/g;

    let parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let combinedRegex = /(\*\*.*?\*\*|`.*?`|\*.*?\*)/g;
    let match;

    const matches: { index: number; content: string; type: 'bold' | 'code' | 'italic' }[] = [];

    while ((match = combinedRegex.exec(text)) !== null) {
      const matchText = match[0];
      if (matchText.startsWith('**') && matchText.endsWith('**')) {
        matches.push({
          index: match.index,
          content: matchText.slice(2, -2),
          type: 'bold'
        });
      } else if (matchText.startsWith('`') && matchText.endsWith('`')) {
        matches.push({
          index: match.index,
          content: matchText.slice(1, -1),
          type: 'code'
        });
      } else if (matchText.startsWith('*') && matchText.endsWith('*')) {
        matches.push({
          index: match.index,
          content: matchText.slice(1, -1),
          type: 'italic'
        });
      }
    }

    if (matches.length === 0) {
      return text;
    }

    matches.forEach((m, idx) => {
      // Add text leading up to match
      if (m.index > lastIndex) {
        parts.push(text.substring(lastIndex, m.index));
      }

      // Add styled component
      if (m.type === 'bold') {
        parts.push(<strong key={idx} className="font-extrabold text-slate-900">{m.content}</strong>);
      } else if (m.type === 'code') {
        parts.push(
          <code key={idx} className="bg-slate-100 border border-slate-200 text-cyan-800 text-[11px] sm:text-xs font-mono px-1.5 py-0.5 rounded-md font-semibold">
            {m.content}
          </code>
        );
      } else if (m.type === 'italic') {
        parts.push(<em key={idx} className="italic text-slate-800">{m.content}</em>);
      }

      lastIndex = m.index + (m.type === 'bold' ? m.content.length + 4 : m.type === 'code' ? m.content.length + 2 : m.content.length + 2);
    });

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts;
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // 1. Code block handling
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        // Close code block
        inCodeBlock = false;
        renderedElements.push(
          <div key={`code-${i}`} className="bg-slate-950 text-slate-100 rounded-xl p-4 my-3 font-mono text-xs overflow-x-auto border border-slate-800 shadow-inner leading-relaxed">
            {codeLanguage && (
              <div className="text-[10px] uppercase text-cyan-400 font-extrabold tracking-widest border-b border-white/10 pb-1.5 mb-2 select-none">
                {codeLanguage}
              </div>
            )}
            <pre className="whitespace-pre">{codeLines.join('\n')}</pre>
          </div>
        );
        codeLines = [];
        codeLanguage = '';
      } else {
        // Open code block
        inCodeBlock = true;
        codeLanguage = line.slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(rawLine);
      continue;
    }

    // 2. Heading level 1, 2, 3
    if (line.startsWith('#')) {
      // Flush previous lists if any
      const fl = flushList(i);
      if (fl) renderedElements.push(fl);

      const level = line.match(/^#+/)?.[0].length || 1;
      const text = line.replace(/^#+\s*/, '');
      const formattedText = formatText(text);

      if (level === 1) {
        renderedElements.push(
          <h1 key={i} className="text-lg sm:text-xl font-display font-black text-cyan-900 uppercase tracking-tight mt-4 mb-2 border-b-2 border-cyan-500/10 pb-1">
            {formattedText}
          </h1>
        );
      } else if (level === 2) {
        renderedElements.push(
          <h2 key={i} className="text-base sm:text-lg font-display font-extrabold text-cyan-800 uppercase tracking-wide mt-3.5 mb-1.5">
            {formattedText}
          </h2>
        );
      } else {
        renderedElements.push(
          <h3 key={i} className="text-xs sm:text-sm font-extrabold text-slate-800 uppercase tracking-wider mt-3 mb-1">
            {formattedText}
          </h3>
        );
      }
      continue;
    }

    // 3. Block quotes
    if (line.startsWith('>')) {
      const fl = flushList(i);
      if (fl) renderedElements.push(fl);

      const text = line.replace(/^>\s*/, '');
      renderedElements.push(
        <div key={i} className="border-l-4 border-cyan-500 bg-slate-50/80 rounded-r-xl px-4 py-2.5 my-3 text-slate-600 text-xs sm:text-sm italic font-medium leading-relaxed">
          {formatText(text)}
        </div>
      );
      continue;
    }

    // 4. Horizontal Rule
    if (line === '---' || line === '***') {
      const fl = flushList(i);
      if (fl) renderedElements.push(fl);

      renderedElements.push(<hr key={i} className="my-4 border-slate-200" />);
      continue;
    }

    // 5. Unordered List Items
    if (line.startsWith('- ') || line.startsWith('* ') || line.startsWith('• ')) {
      const text = line.replace(/^[-*•]\s+/, '');
      if (!currentList || currentList.type !== 'ul') {
        const fl = flushList(i);
        if (fl) renderedElements.push(fl);
        currentList = { type: 'ul', items: [] };
      }
      currentList.items.push(formatText(text));
      continue;
    }

    // 6. Ordered List Items
    if (/^\d+\.\s+/.test(line)) {
      const text = line.replace(/^\d+\.\s+/, '');
      if (!currentList || currentList.type !== 'ol') {
        const fl = flushList(i);
        if (fl) renderedElements.push(fl);
        currentList = { type: 'ol', items: [] };
      }
      currentList.items.push(formatText(text));
      continue;
    }

    // 7. Plain Paragraph (or blank space)
    if (line === '') {
      const fl = flushList(i);
      if (fl) renderedElements.push(fl);
      // Retain simple paragraph spacings
      continue;
    }

    // Standard paragraph line
    const fl = flushList(i);
    if (fl) renderedElements.push(fl);

    renderedElements.push(
      <p key={i} className="text-slate-700 text-xs sm:text-sm font-medium leading-relaxed mb-2.5">
        {formatText(rawLine)}
      </p>
    );
  }

  // Flush any final unclosed lists at EOF
  const fl = flushList('final');
  if (fl) renderedElements.push(fl);

  return <div className="space-y-1 text-slate-800">{renderedElements}</div>;
}
