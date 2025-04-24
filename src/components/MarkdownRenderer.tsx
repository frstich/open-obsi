
import React from 'react';
import { useNotes, Note } from '../context/NotesContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MarkdownRendererProps {
  content: string;
}

// Regex to detect internal links - [[Link]]
const INTERNAL_LINK_REGEX = /\[\[(.*?)\]\]/g;

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const { notes, setActiveNote } = useNotes();

  // Process content to transform internal links
  const processedContent = content.replace(
    INTERNAL_LINK_REGEX,
    (match, linkText) => `[${linkText}](#internal-link-${linkText.replace(/ /g, '-')})`
  );

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    
    // Check if it's an internal link
    if (href.startsWith('#internal-link-')) {
      const linkText = href.replace('#internal-link-', '').replace(/-/g, ' ');
      const targetNote = notes.find(note => note.title === linkText);
      
      if (targetNote) {
        setActiveNote(targetNote);
      }
    } else {
      // For external links, open in a new tab
      window.open(href, '_blank');
    }
  };

  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => (
            <a
              href={href || '#'}
              onClick={(e) => handleLinkClick(e, href || '#')}
              className={href?.startsWith('#internal-link-') ? 'internal-link' : undefined}
            >
              {children}
            </a>
          ),
          code: ({ node, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || '');
            return !props.inline && match ? (
              <SyntaxHighlighter
                style={atomDark}
                language={match[1]}
                PreTag="div"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          }
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
