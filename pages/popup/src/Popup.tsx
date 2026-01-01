import '@src/Popup.css';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage, disabledHostsStorage, presetPromptsStorage } from '@extension/storage';
import { cn, ErrorDisplay, LoadingSpinner, ToggleButton } from '@extension/ui';
import { useEffect, useState } from 'react';

const Popup = () => {
  const theme = useStorage(exampleThemeStorage);
  const isLight = theme === 'light';
  const disabledHosts = useStorage(disabledHostsStorage);
  const personas = useStorage(presetPromptsStorage);
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

  const handleSelectPersona = async (id: string) => {
    const newPersonas = personas.map(p => ({
      ...p,
      isDefault: p.id === id,
    }));
    await presetPromptsStorage.set(newPersonas);
  };

  const openOptions = () => {
    chrome.runtime.openOptionsPage();
  };

  return (
    <div
      className={cn(
        'mx-auto flex w-[280px] flex-col items-center border border-[#EBD9B4] p-5',
        isLight ? 'bg-[#FDF6E3]' : 'bg-[#1C1C1A]',
      )}>
      <div className="flex w-full flex-col items-center gap-6 text-center">
        {/* Header Section */}
        <div
          className={cn(
            'flex w-full flex-col items-center gap-1 border-b pb-4',
            isLight ? 'border-[#3E2723]/20' : 'border-[#F5E6C4]/20',
          )}>
          <h1 className={cn('font-serif text-2xl tracking-tight', isLight ? 'text-[#3E2723]' : 'text-[#F5E6C4]')}>
            Oh My Comment
          </h1>
          <span
            className={cn(
              'text-[10px] uppercase tracking-[0.2em] opacity-50',
              isLight ? 'text-[#3E2723]' : 'text-[#F5E6C4]',
            )}>
            Community Booster
          </span>
        </div>

        {/* Action Section */}
        <div className="flex w-full flex-col items-center gap-4">
          <button
            onClick={openOptions}
            className={cn(
              'flex w-full items-center justify-center gap-2 rounded-none border py-3 font-serif text-lg shadow-sm transition-all active:scale-95',
              isLight
                ? 'border-[#3E2723]/20 bg-[#3E2723] text-[#FDF6E3] hover:bg-[#5D4037]'
                : 'border-[#F5E6C4]/20 bg-[#EBD9B4] text-[#3E2723] hover:bg-[#F5E6C4]',
            )}>
            Settings
          </button>

          {/* Persona Selection Section */}
          <div className="flex w-full flex-col items-center gap-2">
            <div className="flex w-full items-center gap-2">
              <div className="h-[1px] flex-grow bg-[#EBD9B4] opacity-30"></div>
              <span
                className={cn(
                  'text-[10px] font-bold uppercase tracking-widest opacity-40',
                  isLight ? 'text-[#3E2723]' : 'text-[#F5E6C4]',
                )}>
                Reply Persona
              </span>
              <div className="h-[1px] flex-grow bg-[#EBD9B4] opacity-30"></div>
            </div>

            <div className="flex w-full flex-col gap-1">
              {personas?.map(p => (
                <button
                  key={p.id}
                  onClick={() => handleSelectPersona(p.id)}
                  className={cn(
                    'group flex w-full items-center justify-between border px-3 py-2 text-left transition-all',
                    p.isDefault
                      ? isLight
                        ? 'border-[#3E2723] bg-[#3E2723]/5'
                        : 'border-[#F5E6C4] bg-[#F5E6C4]/10'
                      : isLight
                      ? 'border-[#3E2723]/10 hover:bg-[#3E2723]/5'
                      : 'border-[#F5E6C4]/10 hover:bg-[#F5E6C4]/5',
                  )}>
                  <span
                    className={cn(
                      'truncate text-xs',
                      isLight ? 'text-[#3E2723]' : 'text-[#F5E6C4]',
                      p.isDefault ? 'font-bold' : 'opacity-70',
                    )}>
                    {p.name}
                  </span>
                  {p.isDefault && (
                    <span
                      className={cn(
                        'h-1.5 w-1.5 rounded-full',
                        isLight ? 'bg-[#3E2723]' : 'bg-[#F5E6C4]',
                      )}></span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {currentHost && (
            <div className="flex w-full flex-col items-center gap-2">
              <div className="flex w-full items-center gap-2">
                <div className="h-[1px] flex-grow bg-[#EBD9B4] opacity-30"></div>
                <span
                  className={cn(
                    'text-[10px] font-bold uppercase tracking-widest opacity-40',
                    isLight ? 'text-[#3E2723]' : 'text-[#F5E6C4]',
                  )}>
                  Active Channel
                </span>
                <div className="h-[1px] flex-grow bg-[#EBD9B4] opacity-30"></div>
              </div>

              <span
                className={cn(
                  'mb-2 max-w-full truncate px-2 font-serif text-sm italic',
                  isLight ? 'text-[#5D4037]' : 'text-[#F5E6C4]/80',
                )}>
                {currentHost}
              </span>

              <button
                onClick={toggleDisableCurrentHost}
                className={cn(
                  'flex w-full items-center justify-center gap-2 rounded-none border py-2.5 text-xs font-bold uppercase tracking-[0.15em] transition-all active:scale-95',
                  isCurrentHostDisabled
                    ? 'border-[#3E2723]/30 bg-transparent text-[#3E2723]/60 hover:border-[#3E2723]'
                    : 'border-rose-900/20 bg-transparent text-rose-900/70 hover:border-rose-900 hover:text-rose-900',
                )}>
                {isCurrentHostDisabled ? 'Enable here' : 'Disable here'}
              </button>
            </div>
          )}
        </div>

        {/* Footer Toggle */}
        <div className="flex w-full items-center justify-center gap-3 border-t border-[#3E2723]/10 pt-4">
          <span
            className={cn(
              'text-[10px] font-bold uppercase tracking-widest opacity-40',
              isLight ? 'text-[#3E2723]' : 'text-[#F5E6C4]',
            )}>
            Theme
          </span>
          <ToggleButton>{isLight ? 'Sun' : 'Moon'}</ToggleButton>
        </div>
      </div>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <LoadingSpinner />), ErrorDisplay);
