import { useEffect, useState } from 'react';
import '@src/Popup.css';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage, disabledHostsStorage } from '@extension/storage';
import { cn, ErrorDisplay, LoadingSpinner, ToggleButton } from '@extension/ui';

const Popup = () => {
  const theme = useStorage(exampleThemeStorage);
  const isLight = theme === 'light';
  const disabledHosts = useStorage(disabledHostsStorage);
  const [currentHost, setCurrentHost] = useState<string>('');

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      if (tab?.url) {
        try {
          const url = new URL(tab.url);
          setCurrentHost(url.host);
        } catch (e) {
          console.error('Invalid URL', e);
        }
      }
    });
  }, []);

  const isCurrentHostDisabled = disabledHosts.includes(currentHost);

  const toggleDisableCurrentHost = async () => {
    if (!currentHost) return;
    
    if (isCurrentHostDisabled) {
      await disabledHostsStorage.set(disabledHosts.filter(h => h !== currentHost));
    } else {
      await disabledHostsStorage.set([...disabledHosts, currentHost]);
    }
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      if (tab.id) chrome.tabs.reload(tab.id);
    });
  };

  const openOptions = () => {
    chrome.runtime.openOptionsPage();
  };

  return (
    <div className={cn('mx-auto p-5 w-full flex flex-col items-center border border-[#EBD9B4]', isLight ? 'bg-[#FDF6E3]' : 'bg-[#1C1C1A]')}>
      <div className="flex flex-col gap-6 w-full items-center text-center">
        {/* Header Section */}
        <div className={cn('flex flex-col items-center gap-1 border-b pb-4 w-full', isLight ? 'border-[#3E2723]/20' : 'border-[#F5E6C4]/20')}>
          <h1 className={cn('text-2xl font-serif tracking-tight', isLight ? 'text-[#3E2723]' : 'text-[#F5E6C4]')}>
            Oh My Comment
          </h1>
          <span className={cn('text-[10px] uppercase tracking-[0.2em] opacity-50', isLight ? 'text-[#3E2723]' : 'text-[#F5E6C4]')}>Studio Codex</span>
        </div>

        {/* Action Section */}
        <div className="flex flex-col gap-4 w-full items-center">
          <button
            onClick={openOptions}
            className={cn(
              'w-full py-3 rounded-none font-serif text-lg transition-all border flex items-center justify-center gap-2 active:scale-95 shadow-sm',
              isLight 
                ? 'bg-[#3E2723] text-[#FDF6E3] hover:bg-[#5D4037] border-[#3E2723]/20' 
                : 'bg-[#EBD9B4] text-[#3E2723] hover:bg-[#F5E6C4] border-[#F5E6C4]/20'
            )}
          >
            Preferences
          </button>

          {currentHost && (
            <div className="flex flex-col gap-2 w-full items-center">
              <div className="flex items-center gap-2 w-full">
                <div className="h-[1px] bg-[#EBD9B4] flex-grow opacity-30"></div>
                <span className={cn('text-[10px] font-bold uppercase tracking-widest opacity-40', isLight ? 'text-[#3E2723]' : 'text-[#F5E6C4]')}>
                  Manuscript
                </span>
                <div className="h-[1px] bg-[#EBD9B4] flex-grow opacity-30"></div>
              </div>
              
              <span className={cn('text-sm font-serif italic mb-2 truncate max-w-full px-2', isLight ? 'text-[#5D4037]' : 'text-[#F5E6C4]/80')}>
                {currentHost}
              </span>
              
              <button
                onClick={toggleDisableCurrentHost}
                className={cn(
                  'w-full py-2.5 rounded-none font-bold text-xs uppercase tracking-[0.15em] transition-all border flex items-center justify-center gap-2 active:scale-95',
                  isCurrentHostDisabled
                    ? 'bg-transparent border-[#3E2723]/30 text-[#3E2723]/60 hover:border-[#3E2723]'
                    : 'bg-transparent border-rose-900/20 text-rose-900/70 hover:border-rose-900 hover:text-rose-900'
                )}
              >
                {isCurrentHostDisabled ? 'Recall the Muse' : 'Silence the Muse'}
              </button>
            </div>
          )}
        </div>

        {/* Footer Toggle */}
        <div className="w-full pt-4 border-t border-[#3E2723]/10 flex justify-center items-center gap-3">
          <span className={cn('text-[10px] font-bold uppercase tracking-widest opacity-40', isLight ? 'text-[#3E2723]' : 'text-[#F5E6C4]')}>Theme</span>
          <ToggleButton>{isLight ? 'Sun' : 'Moon'}</ToggleButton>
        </div>
      </div>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <LoadingSpinner />), ErrorDisplay);