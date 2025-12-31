import { useState, useEffect } from 'react';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { ErrorDisplay, LoadingSpinner, ToggleButton } from '@extension/ui';
import { presetPromptsStorage, apiKeyStorage, exampleThemeStorage } from '@extension/storage';

const Options = () => {
  const [prompts, setPrompts] = useState('');
  const [apiKey, setApiKey] = useState('');
  const theme = useStorage(exampleThemeStorage);
  const isLight = theme === 'light';

  const savedPrompts = useStorage(presetPromptsStorage);
  const savedApiKey = useStorage(apiKeyStorage);

  useEffect(() => {
    if (savedPrompts) setPrompts(savedPrompts);
  }, [savedPrompts]);

  useEffect(() => {
    if (savedApiKey) setApiKey(savedApiKey);
  }, [savedApiKey]);

  const handleSavePrompts = () => presetPromptsStorage.set(prompts);
  const handleSaveApiKey = () => apiKeyStorage.set(apiKey);

  const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

  return (
    <div className={cn(
      'min-h-screen font-serif p-8 flex flex-col items-center transition-colors duration-700',
      isLight ? 'bg-[#FDF6E3]' : 'bg-[#1C1C1A]'
    )}>
      <div className="max-w-2xl w-full flex flex-col gap-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        
        {/* Header Section */}
        <header className={cn('flex flex-col items-center text-center gap-2 border-b pb-8', isLight ? 'border-[#3E2723]/20' : 'border-[#F5E6C4]/20')}>
          <h1 className={cn('text-4xl font-serif tracking-tight', isLight ? 'text-[#3E2723]' : 'text-[#F5E6C4]')}>
            Studio Codex Settings
          </h1>
          <p className={cn('text-[10px] uppercase tracking-[0.4em] opacity-40', isLight ? 'text-[#3E2723]' : 'text-[#F5E6C4]')}>
            Architectural Schematics for Oh My Comment
          </p>
        </header>

        {/* API Key Section */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <h2 className={cn('text-lg font-bold uppercase tracking-widest', isLight ? 'text-[#3E2723]/70' : 'text-[#F5E6C4]/60')}>
              The Key of Knowledge
            </h2>
            <div className="h-[1px] flex-grow bg-[#EBD9B4]/30"></div>
          </div>
          
          <div className="flex flex-col gap-3">
            <label className={cn('text-xs italic opacity-60 ml-1', isLight ? 'text-[#3E2723]' : 'text-[#F5E6C4]')}>Secure your ARK API Key below:</label>
            <div className="flex gap-2">
              <input
                type="password"
                className={cn(
                  'flex-grow p-3 rounded-none border outline-none transition-all duration-300',
                  isLight 
                    ? 'bg-[#F5E6C4]/20 border-[#3E2723]/10 focus:border-[#3E2723] text-[#3E2723]' 
                    : 'bg-[#1C1C1A] border-[#F5E6C4]/20 focus:border-[#F5E6C4] text-[#F5E6C4]'
                )}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your secret key..."
              />
              <button
                className={cn(
                  'px-6 py-2 rounded-none font-bold uppercase text-xs tracking-widest transition-all active:scale-95',
                  isLight 
                    ? 'bg-[#3E2723] text-[#FDF6E3] hover:bg-[#5D4037]' 
                    : 'bg-[#EBD9B4] text-[#3E2723] hover:bg-[#F5E6C4]'
                )}
                onClick={handleSaveApiKey}
              >
                Seal Key
              </button>
            </div>
          </div>
        </section>

        {/* Preset Prompts Section */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <h2 className={cn('text-lg font-bold uppercase tracking-widest', isLight ? 'text-[#3E2723]/70' : 'text-[#F5E6C4]/60')}>
              The Muse's Instructions
            </h2>
            <div className="h-[1px] flex-grow bg-[#EBD9B4]/30"></div>
          </div>

          <div className="flex flex-col gap-3">
            <label className={cn('text-xs italic opacity-60 ml-1', isLight ? 'text-[#3E2723]' : 'text-[#F5E6C4]')}>Guide the LLM with your personalized persona:</label>
            <textarea
              className={cn(
                'w-full p-4 rounded-none border outline-none transition-all duration-300 min-h-[300px] leading-relaxed',
                isLight 
                  ? 'bg-[#F5E6C4]/10 border-[#3E2723]/10 focus:border-[#3E2723] text-[#3E2723]' 
                  : 'bg-[#1C1C1A] border-[#F5E6C4]/20 focus:border-[#F5E6C4] text-[#F5E6C4]'
              )}
              value={prompts}
              onChange={(e) => setPrompts(e.target.value)}
              placeholder="Tell the Muse how to behave when analyzing communities..."
            />
            <button
              className={cn(
                'self-end px-10 py-3 rounded-none font-bold uppercase text-xs tracking-[0.2em] transition-all active:scale-95 shadow-lg',
                isLight 
                  ? 'bg-[#3E2723] text-[#FDF6E3] hover:bg-[#5D4037] shadow-[#3E2723]/10' 
                  : 'bg-[#EBD9B4] text-[#3E2723] hover:bg-[#F5E6C4] shadow-black/40'
              )}
              onClick={handleSavePrompts}
            >
              Preserve Codex
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-8 pt-8 border-t border-[#EBD9B4]/30 flex justify-center items-center gap-4 opacity-60">
          <span className={cn('text-[10px] font-bold uppercase tracking-widest', isLight ? 'text-[#3E2723]' : 'text-[#F5E6C4]')}>Toggle Ambient</span>
          <ToggleButton>{isLight ? 'Sun' : 'Moon'}</ToggleButton>
        </footer>
      </div>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Options, <LoadingSpinner />), ErrorDisplay);