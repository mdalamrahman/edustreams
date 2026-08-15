import React from 'react';

interface FormattedChatTextProps {
  text: string;
}

/**
 * Renders AI chat messages without raw markdown artifacts (* and #).
 * Formats bold text, headers, code blocks, bullet points, and inline code cleanly.
 */
export const FormattedChatText: React.FC<FormattedChatTextProps> = ({ text }) => {
  if (!text) return null;

  // Split into paragraphs / lines
  const lines = text.split('\n');

  const renderFormattedLine = (line: string, lineIdx: number) => {
    let trimmed = line.trim();
    if (!trimmed) {
      return <div key={lineIdx} className="h-2" />;
    }

    // Dividers (--- or ***)
    if (/^(\-\-\-|\*\*\*|___)$/.test(trimmed)) {
      return <hr key={lineIdx} className="border-slate-800 my-2" />;
    }

    // Headers (#, ##, ###, ####)
    if (trimmed.startsWith('#')) {
      const cleanHeading = trimmed.replace(/^#+\s*/, '').replace(/\*\*/g, '').replace(/\*/g, '');
      return (
        <h4 key={lineIdx} className="text-xs font-bold text-indigo-300 mt-2 mb-1 uppercase tracking-wider">
          {cleanHeading}
        </h4>
      );
    }

    // Bullet points (-, *, •)
    const isBullet = /^(\-|\*|•)\s+/.test(trimmed);
    if (isBullet) {
      trimmed = trimmed.replace(/^(\-|\*|•)\s+/, '');
    }

    // Parse inline formatting: **bold**, `code`, *italic*
    const parts: React.ReactNode[] = [];
    const regex = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(trimmed)) !== null) {
      if (match.index > lastIndex) {
        parts.push(trimmed.substring(lastIndex, match.index));
      }

      const raw = match[0];
      if (raw.startsWith('**') && raw.endsWith('**')) {
        parts.push(
          <strong key={match.index} className="font-bold text-white">
            {raw.slice(2, -2)}
          </strong>
        );
      } else if (raw.startsWith('`') && raw.endsWith('`')) {
        parts.push(
          <code key={match.index} className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-purple-300 font-mono text-[11px]">
            {raw.slice(1, -1)}
          </code>
        );
      } else if (raw.startsWith('*') && raw.endsWith('*')) {
        parts.push(
          <em key={match.index} className="italic text-slate-200">
            {raw.slice(1, -1)}
          </em>
        );
      }
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < trimmed.length) {
      parts.push(trimmed.substring(lastIndex));
    }

    if (isBullet) {
      return (
        <div key={lineIdx} className="flex items-start space-x-2 my-0.5">
          <span className="text-purple-400 font-bold text-xs mt-0.5">•</span>
          <div className="flex-1 text-slate-200 text-xs leading-relaxed">{parts}</div>
        </div>
      );
    }

    return (
      <p key={lineIdx} className="text-xs text-slate-200 leading-relaxed my-0.5">
        {parts}
      </p>
    );
  };

  return <div className="space-y-1">{lines.map((l, i) => renderFormattedLine(l, i))}</div>;
};
