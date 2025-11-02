import React from 'react';

interface MarkdownContentProps {
  content: string;
}

export const MarkdownContent: React.FC<MarkdownContentProps> = ({ content }) => {
    // Process inline formats like **bold**
    const applyInlineFormatting = (text: string): React.ReactNode => {
        const boldRegex = /\*\*(.*?)\*\*/g;
        const parts = text.split(boldRegex);
        return (
            <>
                {parts.map((part, index) => 
                    index % 2 === 1 ? <strong key={index}>{part}</strong> : part
                )}
            </>
        );
    };

    // Split content into blocks (paragraphs or lists)
    const blocks = content.split('\n\n');

    return (
        <div className="space-y-3 prose prose-invert prose-sm max-w-none">
            {blocks.map((block, blockIndex) => {
                const lines = block.split('\n').filter(line => line.trim() !== '');
                if (lines.length === 0) return null;

                // Check if the entire block is a list
                const isList = lines.every(line => line.trim().startsWith('* '));

                if (isList) {
                    return (
                        <ul key={blockIndex} className="list-disc pl-5 space-y-1">
                            {lines.map((item, itemIndex) => (
                                <li key={itemIndex}>{applyInlineFormatting(item.trim().substring(2))}</li>
                            ))}
                        </ul>
                    );
                }

                // Otherwise, treat as a paragraph, preserving line breaks
                return (
                    <p key={blockIndex}>
                        {lines.map((line, lineIndex) => (
                            <React.Fragment key={lineIndex}>
                                {applyInlineFormatting(line)}
                                {lineIndex < lines.length - 1 && <br />}
                            </React.Fragment>
                        ))}
                    </p>
                );
            })}
        </div>
    );
};