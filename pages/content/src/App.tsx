import { useState } from 'react';
import { presetPromptsStorage, hostPersonaStorage } from '@extension/storage';
import { useStorage } from '@extension/shared';

interface AppProps {
  inputElement: HTMLElement;
  markdown: string;
}

const App = ({ inputElement, markdown }: AppProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const personas = useStorage(presetPromptsStorage);
  const hostPersonas = useStorage(hostPersonaStorage);

  const getElementValue = (element: HTMLElement): string => {
    if (element instanceof HTMLTextAreaElement || element instanceof HTMLInputElement) {
      return element.value;
    }
    return element.innerHTML;
  };

  const simulateTextInput = async (element: HTMLElement, text: string) => {
    element.focus();

    // 1. Try to copy to clipboard for user convenience and as a fallback
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.warn('Clipboard write failed:', err);
    }

    // 2. Simulate a Paste Event (highly effective for modern editors like Twitter's Lexical/Draft.js)
    const dataTransfer = new DataTransfer();
    dataTransfer.setData('text/plain', text);

    const pasteEvent = new ClipboardEvent('paste', {
      clipboardData: dataTransfer,
      bubbles: true,
      cancelable: true,
    });

    // If the site handles the paste event and cancels it (calling preventDefault), 
    // it usually means they've handled the insertion themselves.
    const wasHandledByPaste = !element.dispatchEvent(pasteEvent);

    if (wasHandledByPaste) {
      return;
    }

    // 3. Fallback to execCommand 'insertText'
    if (document.execCommand('insertText', false, text)) {
      return;
    }

    // 4. Final fallback for standard inputs
    if (element instanceof HTMLTextAreaElement || element instanceof HTMLInputElement) {
      const start = element.selectionStart ?? 0;
      const end = element.selectionEnd ?? 0;
      element.setRangeText(text, start, end, 'end');
      element.dispatchEvent(new InputEvent('input', { bubbles: true, data: text, inputType: 'insertText' }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
    } else if (element.isContentEditable) {
      // Manual text insertion for contentEditable as a last resort
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(text));
        range.collapse(false);
        element.dispatchEvent(new InputEvent('input', { bubbles: true }));
      }
    }
  };

  const handleClick = async () => {
    setIsLoading(true);

    const currentHost = window.location.host;
    const personaId = hostPersonas[currentHost] || personas?.find(p => p.isDefault)?.id || personas?.[0]?.id;

    const systemPrompt =
      '你是一个基于上下文的快速评论助手。请根据提供的网页内容（Markdown格式），为标记为 [HERE_IS_THE_INPUT_BOX_I_WANT_TO_GENERATE_FOR] 的位置生成**一条**符合用户设定的风格的回复。确保回复内容与网页主题以及该位置的上下文高度相关，避免空洞的套话。';

    chrome.runtime.sendMessage(
      {
        type: 'generateReply',
        payload: {
          prompt: systemPrompt,
          domContent: markdown,
          currentValue: getElementValue(inputElement),
          personaId,
        },
      },
      async response => {
        if (response?.reply) {
          await simulateTextInput(inputElement, response.reply);
        }
        setIsLoading(false);
      },
    );
  };

  return (
    <div className="pointer-events-auto flex flex-col items-end font-sans">
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={cn(
          'group relative flex h-14 w-14 items-center justify-center rounded-full transition-all duration-500',
          'appearance-none border-none outline-none shadow-xl',
          isLoading
            ? 'cursor-not-allowed bg-slate-100'
            : 'bg-[#0095FF] hover:bg-[#0084E6] hover:scale-110 active:scale-95 shadow-blue-500/40 hover:shadow-[0_0_20px_rgba(138,43,226,0.6)]',
        )}
        style={{ border: 'none' }}
        title={isLoading ? 'Dashing...' : 'DashReply'}>
        {isLoading ? (
          <div className="relative flex h-6 w-6 items-center justify-center">
            <svg
              className="h-6 w-6 animate-spin text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24">
              <circle className="opacity-10" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
              <path
                className="opacity-80"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : (
          <div className="relative flex items-center justify-center">
            {/* Speed lines */}
            <div className="absolute -left-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="h-[1px] w-2 bg-white/50"></div>
                <div className="h-[1px] w-3 bg-white/80"></div>
                <div className="h-[1px] w-2 bg-white/50"></div>
            </div>
            <svg
              className="h-7 w-7 text-white opacity-90 transition-all duration-500 group-hover:rotate-[-10deg] group-hover:opacity-100"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </div>
        )}
        {!isLoading && (
          <span className="absolute inset-0 rounded-full opacity-0 group-hover:animate-pulse ring-4 ring-[#8A2BE2]/30 transition-all duration-500"></span>
        )}
      </button>
    </div>
  );
};

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

export default App;