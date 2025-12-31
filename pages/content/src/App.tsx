import { useState } from 'react';
import TurndownService from 'turndown';

interface AppProps {
  inputElement: HTMLElement;
}

const App = ({ inputElement }: AppProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const getElementValue = (element: HTMLElement): string => {
    if (element instanceof HTMLTextAreaElement || element instanceof HTMLInputElement) {
      return element.value;
    }
    return element.innerHTML;
  };

  const simulateTextInput = (element: HTMLElement, text: string) => {
    element.focus();
    
    if (element.isContentEditable) {
      document.execCommand('insertText', false, text);
    } else if (element instanceof HTMLTextAreaElement || element instanceof HTMLInputElement) {
      const event = new InputEvent('input', {
        bubbles: true,
        cancelable: true,
        data: text,
        inputType: 'insertText',
      });
      element.value = text;
      element.dispatchEvent(event);
    }
  };


  const handleClick = async () => {
    setIsLoading(true);

    const turndownService = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
      bulletListMarker: '-',
    });

    // Clean noise
    turndownService.addRule('remove-noise', {
      filter: ['script', 'style', 'noscript', 'iframe', 'head', 'canvas', 'svg'],
      replacement: () => '',
    });

    turndownService.addRule('strip-img-src', {
      filter: 'img',
      replacement: (content, node) => {
        const img = node as HTMLImageElement;
        const alt = img.alt ? ` (alt: ${img.alt})` : '';
        return `[image${alt}]`;
      },
    });

    turndownService.addRule('strip-media-src', {
      filter: ['video', 'audio'],
      replacement: (content, node) => {
        return `[${node.nodeName.toLowerCase()}]`;
      },
    });

    turndownService.addRule('strip-link-href', {
      filter: 'a',
      replacement: (content) => content,
    });

    // 10-level ancestor context extraction
    const getContextHtml = (element: HTMLElement, levels: number): string => {
      let current: HTMLElement | null = element;
      for (let i = 0; i < levels; i++) {
        if (current?.parentElement) {
          current = current.parentElement;
        } else {
          break;
        }
      }
      return current?.outerHTML || '';
    };

    const mainContent = document.querySelector('main') || document.querySelector('[role="main"]') || document.body;
    const contextHtml = getContextHtml(inputElement, 10);
    
    const originalHtml = `
      <!-- Page Main Content -->
      ${mainContent.outerHTML}
      
      <!-- Immediate Context Around Input -->
      ${contextHtml}
    `;

    console.log('[Oh My Comment] Original HTML:', originalHtml);

    const rawMarkdown = turndownService.turndown(originalHtml);

    // URL cleaning
    const markdown = rawMarkdown.replace(/(https?:\/\/|\/)[^\s)]+/g, (url) => {
      return url.length > 20 ? '[url]' : url;
    });

    console.log('[Oh My Comment] Final Markdown Payload:', markdown);

    const systemPrompt = "你是一个社交媒体评论助手。请根据提供的网页内容（Markdown格式），为当前的输入框生成一条简短、幽默且富有洞察力的评论。确保评论与网页主题高度相关，避免空洞的套话。";

    chrome.runtime.sendMessage(
      {
        type: 'generateReply',
        payload: {
          prompt: systemPrompt,
          domContent: markdown,
          currentValue: getElementValue(inputElement),
        },
      },
      (response) => {
        if (response?.reply) {
          simulateTextInput(inputElement, response.reply);
        }
        setIsLoading(false);
      },
    );
  };

  return (
    <div className="flex flex-col items-end pointer-events-auto font-serif">
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={cn(
          'group relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-700 shadow-md',
          'appearance-none outline-none border-none ring-1 ring-[#EBD9B4]/60',
          isLoading 
            ? 'bg-[#F5F5F0] cursor-not-allowed' 
            : 'bg-[#FDF6E3] hover:bg-[#F5E6C4] hover:scale-110 active:scale-95 shadow-[0_4px_12px_rgba(62,39,35,0.1)] hover:shadow-[0_8px_20px_rgba(62,39,35,0.15)]'
        )}
        style={{ border: 'none' }}
        title={isLoading ? 'Consulting the Codex...' : 'Draft an Insight'}
      >
        {isLoading ? (
          <div className="relative w-6 h-6 flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 text-[#3E2723]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-10" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
              <path className="opacity-60" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : (
          <svg 
            className="w-7 h-7 text-[#3E2723] opacity-70 transition-all duration-500 group-hover:opacity-100 group-hover:rotate-[-10deg]" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.2} 
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" 
            />
          </svg>
        )}
        {!isLoading && (
          <span className="absolute inset-0 rounded-full ring-1 ring-[#D4AF37] opacity-0 group-hover:animate-ping-slow"></span>
        )}
      </button>
    </div>
  );
};

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export default App;