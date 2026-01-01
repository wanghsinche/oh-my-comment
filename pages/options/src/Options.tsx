import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { presetPromptsStorage, apiKeyStorage, exampleThemeStorage, usageStorage } from '@extension/storage';
import { ErrorDisplay, LoadingSpinner, ToggleButton } from '@extension/ui';
import { useState, useEffect } from 'react';

const Options = () => {
  const [prompts, setPrompts] = useState('You are my digital twin. help me craft engaging, witty, and contextually relevant comments on social media posts. Adopt a friendly and approachable tone, while ensuring professionalism and respectfulness in your replies. Always consider the content of the post and the likely audience when generating comments. Avoid controversial topics and maintain a positive online presence.');
  const [apiKey, setApiKey] = useState('');
  const theme = useStorage(exampleThemeStorage);
  const isLight = theme === 'light';

  const savedPrompts = useStorage(presetPromptsStorage);
  const savedApiKey = useStorage(apiKeyStorage);
  const usage = useStorage(usageStorage);

  useEffect(() => {
    if (savedPrompts) setPrompts(savedPrompts);
  }, [savedPrompts]);

  useEffect(() => {
    if (savedApiKey) setApiKey(savedApiKey);
  }, [savedApiKey]);

  const handleSavePrompts = () => presetPromptsStorage.set(prompts);
  const handleSaveApiKey = () => apiKeyStorage.set(apiKey);
  const handleResetUsage = () =>
    usageStorage.set({
      requestCount: 0,
      totalInputTokens: 0,
      totalOutputTokens: 0,
    });

  const cn = (...classes: string[]) => classes.filter(Boolean).join(' ');

  return (
    <div
      className={cn(
        'flex min-h-screen flex-col items-center p-8 font-serif transition-colors duration-700',
        isLight ? 'bg-[#FDF6E3]' : 'bg-[#1C1C1A]',
      )}>
      <div className="animate-in fade-in slide-in-from-bottom-4 flex w-full max-w-2xl flex-col gap-12 duration-1000">
        {/* Header Section */}
        <header
          className={cn(
            'flex flex-col items-center gap-2 border-b pb-8 text-center',
            isLight ? 'border-[#3E2723]/20' : 'border-[#F5E6C4]/20',
          )}>
          <h1 className={cn('font-serif text-4xl tracking-tight', isLight ? 'text-[#3E2723]' : 'text-[#F5E6C4]')}>
            Assistant Settings
          </h1>
          <p
            className={cn(
              'text-[10px] uppercase tracking-[0.4em] opacity-40',
              isLight ? 'text-[#3E2723]' : 'text-[#F5E6C4]',
            )}>
            Personalize your social media persona
          </p>
        </header>

        {/* API Key Section */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <h2
              className={cn(
                'text-lg font-bold uppercase tracking-widest',
                isLight ? 'text-[#3E2723]/70' : 'text-[#F5E6C4]/60',
              )}>
              API Configuration
            </h2>
            <div className="h-[1px] flex-grow bg-[#EBD9B4]/30"></div>
          </div>

          <div className="flex flex-col gap-3">
            <label
              htmlFor="ark-api-key"
              className={cn('ml-1 text-xs italic opacity-60', isLight ? 'text-[#3E2723]' : 'text-[#F5E6C4]')}>
              Your API Key:
            </label>
            <div className="flex gap-2">
              <input
                id="ark-api-key"
                type="text"
                className={cn(
                  'flex-grow rounded-none border p-3 outline-none transition-all duration-300',
                  isLight
                    ? 'border-[#3E2723]/10 bg-[#F5E6C4]/20 text-[#3E2723] focus:border-[#3E2723]'
                    : 'border-[#F5E6C4]/20 bg-[#1C1C1A] text-[#F5E6C4] focus:border-[#F5E6C4]',
                )}
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="Paste your API key here..."
              />
              <button
                className={cn(
                  'rounded-none px-6 py-2 text-xs font-bold uppercase tracking-widest transition-all active:scale-95',
                  isLight
                    ? 'bg-[#3E2723] text-[#FDF6E3] hover:bg-[#5D4037]'
                    : 'bg-[#EBD9B4] text-[#3E2723] hover:bg-[#F5E6C4]',
                )}
                onClick={handleSaveApiKey}>
                Save Key
              </button>
            </div>
          </div>
        </section>

        {/* Token Usage Section */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <h2
              className={cn(
                'text-lg font-bold uppercase tracking-widest',
                isLight ? 'text-[#3E2723]/70' : 'text-[#F5E6C4]/60',
              )}>
              Usage Audit
            </h2>
            <div className="h-[1px] flex-grow bg-[#EBD9B4]/30"></div>
          </div>

          <div
            className={cn(
              'grid grid-cols-3 gap-4 border p-4',
              isLight ? 'border-[#3E2723]/10 bg-[#F5E6C4]/10' : 'border-[#F5E6C4]/20 bg-[#1C1C1A]',
            )}>
            <div className="flex flex-col gap-1">
              <span className={cn('text-[10px] uppercase opacity-50', isLight ? 'text-[#3E2723]' : 'text-[#F5E6C4]')}>
                Requests
              </span>
              <span className={cn('text-xl font-bold', isLight ? 'text-[#3E2723]' : 'text-[#F5E6C4]')}>
                {usage?.requestCount || 0}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className={cn('text-[10px] uppercase opacity-50', isLight ? 'text-[#3E2723]' : 'text-[#F5E6C4]')}>
                Input Tokens
              </span>
              <span className={cn('text-xl font-bold', isLight ? 'text-[#3E2723]' : 'text-[#F5E6C4]')}>
                {((usage?.totalInputTokens || 0) / 1_000_000).toFixed(3)}M
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className={cn('text-[10px] uppercase opacity-50', isLight ? 'text-[#3E2723]' : 'text-[#F5E6C4]')}>
                Output Tokens
              </span>
              <span className={cn('text-xl font-bold', isLight ? 'text-[#3E2723]' : 'text-[#F5E6C4]')}>
                {((usage?.totalOutputTokens || 0) / 1_000_000).toFixed(3)}M
              </span>
            </div>
          </div>
          <button
            className={cn(
              'self-start rounded-none px-4 py-1 text-[10px] font-bold uppercase tracking-widest opacity-60 transition-all hover:opacity-100',
              isLight ? 'text-[#3E2723] border border-[#3E2723]/20' : 'text-[#F5E6C4] border border-[#F5E6C4]/20',
            )}
            onClick={handleResetUsage}>
            Reset Stats
          </button>
        </section>

        {/* Preset Prompts Section */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <h2
              className={cn(
                'text-lg font-bold uppercase tracking-widest',
                isLight ? 'text-[#3E2723]/70' : 'text-[#F5E6C4]/60',
              )}>
              Reply Persona
            </h2>
            <div className="h-[1px] flex-grow bg-[#EBD9B4]/30"></div>
          </div>

          <div className="flex flex-col gap-3">
            <label
              htmlFor="reply-persona"
              className={cn('ml-1 text-xs italic opacity-60', isLight ? 'text-[#3E2723]' : 'text-[#F5E6C4]')}>
              Guide the assistant with your tone and rules:
            </label>
            <textarea
              id="reply-persona"
              className={cn(
                'min-h-[300px] w-full rounded-none border p-4 leading-relaxed outline-none transition-all duration-300',
                isLight
                  ? 'border-[#3E2723]/10 bg-[#F5E6C4]/10 text-[#3E2723] focus:border-[#3E2723]'
                  : 'border-[#F5E6C4]/20 bg-[#1C1C1A] text-[#F5E6C4] focus:border-[#F5E6C4]',
              )}
              value={prompts}
              onChange={e => setPrompts(e.target.value)}
              placeholder="E.g., Be helpful, funny, and use professional community management tone..."
            />
            <button
              className={cn(
                'self-end rounded-none px-10 py-3 text-xs font-bold uppercase tracking-[0.2em] shadow-lg transition-all active:scale-95',
                isLight
                  ? 'bg-[#3E2723] text-[#FDF6E3] shadow-[#3E2723]/10 hover:bg-[#5D4037]'
                  : 'bg-[#EBD9B4] text-[#3E2723] shadow-black/40 hover:bg-[#F5E6C4]',
              )}
              onClick={handleSavePrompts}>
              Save Persona
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-8 flex items-center justify-center gap-4 border-t border-[#EBD9B4]/30 pt-8 opacity-60">
          <span
            className={cn(
              'text-[10px] font-bold uppercase tracking-widest',
              isLight ? 'text-[#3E2723]' : 'text-[#F5E6C4]',
            )}>
            Theme
          </span>
          <ToggleButton>{isLight ? 'Sun' : 'Moon'}</ToggleButton>
        </footer>
      </div>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Options, <LoadingSpinner />), ErrorDisplay);
