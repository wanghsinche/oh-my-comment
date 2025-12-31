import { useState } from 'react';

interface AppProps {
  inputElement: HTMLElement;
  markdown: string;
}

const App = ({ inputElement, markdown }: AppProps) => {
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

    const systemPrompt =
      '你是一个社交媒体评论助手。请根据提供的网页内容（Markdown格式），为标记为 [HERE_IS_THE_INPUT_BOX_I_WANT_TO_GENERATE_FOR] 的位置生成一条简短、幽默且富有洞察力的评论。确保评论与网页主题以及该位置的上下文高度相关，避免空洞的套话。';

    chrome.runtime.sendMessage(
      {
        type: 'generateReply',
        payload: {
          prompt: systemPrompt,
          domContent: markdown,
          currentValue: getElementValue(inputElement),
        },
      },
      response => {
        if (response?.reply) {
          simulateTextInput(inputElement, response.reply);
        }
        setIsLoading(false);
      },
    );
  };

  return (
    <div className="pointer-events-auto flex flex-col items-end font-serif">
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={cn(
          'group relative flex h-12 w-12 items-center justify-center rounded-full shadow-md transition-all duration-700',
          'appearance-none border-none outline-none ring-1 ring-[#EBD9B4]/60',
          isLoading
            ? 'cursor-not-allowed bg-[#F5F5F0]'
            : 'bg-[#FDF6E3] shadow-[0_4px_12px_rgba(62,39,35,0.1)] hover:scale-110 hover:bg-[#F5E6C4] hover:shadow-[0_8px_20px_rgba(62,39,35,0.15)] active:scale-95',
        )}
        style={{ border: 'none' }}
        title={isLoading ? 'Consulting the Codex...' : 'Draft an Insight'}>
        {isLoading ? (
          <div className="relative flex h-6 w-6 items-center justify-center">
            <svg
              className="h-5 w-5 animate-spin text-[#3E2723]"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24">
              <circle className="opacity-10" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
              <path
                className="opacity-60"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : (
          <svg
            className="h-7 w-7 text-[#3E2723] opacity-70 transition-all duration-500 group-hover:rotate-[-10deg] group-hover:opacity-100"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.2}
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
        )}
        {!isLoading && (
          <span className="group-hover:animate-ping-slow absolute inset-0 rounded-full opacity-0 ring-1 ring-[#D4AF37]"></span>
        )}
      </button>
    </div>
  );
};

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

export default App;
