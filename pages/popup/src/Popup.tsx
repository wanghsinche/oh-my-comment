import '@src/Popup.css';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage, disabledHostsStorage, presetPromptsStorage, hostPersonaStorage } from '@extension/storage';
import { cn, ErrorDisplay, LoadingSpinner, ToggleButton } from '@extension/ui';
import { useEffect, useState } from 'react';

const Popup = () => {
  const theme = useStorage(exampleThemeStorage);
  const isLight = theme === 'light';
  const disabledHosts = useStorage(disabledHostsStorage);
  const personas = useStorage(presetPromptsStorage);
  const hostPersonas = useStorage(hostPersonaStorage);
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
    if (!currentHost) return;
    await hostPersonaStorage.set({
        ...hostPersonas,
        [currentHost]: id
    });
  };

  const openOptions = () => {
    chrome.runtime.openOptionsPage();
  };

  const activePersonaId = (currentHost && hostPersonas[currentHost]) || personas.find(p => p.isDefault)?.id || personas[0]?.id;

  return (
    <div
      className={cn(
        'mx-auto flex w-full flex-col items-center border p-5 shadow-2xl transition-colors duration-500',
        isLight ? 'bg-[#F8FAFC] border-slate-200' : 'bg-[#0F172A] border-slate-800',
      )}>
      <div className="flex w-full flex-col items-center gap-6 text-center">
        {/* Header Section */}
        <div
          className={cn(
            'flex w-full flex-col items-center gap-1 border-b pb-4',
            isLight ? 'border-slate-200' : 'border-slate-800',
          )}>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0095FF] text-white shadow-lg shadow-blue-500/30">
                <span className="font-bold italic">D</span>
            </div>
            <h1 className={cn('text-2xl font-black tracking-tight', isLight ? 'text-[#1E293B]' : 'text-white')}>
                DashReply
            </h1>
          </div>
          <span
            className={cn(
              'text-[9px] font-bold uppercase tracking-[0.3em] opacity-40',
              isLight ? 'text-[#1E293B]' : 'text-slate-400',
            )}>
            Instant AI Growth
          </span>
        </div>

        {/* Action Section */}
        <div className="flex w-full flex-col items-center gap-4">
          <button
            onClick={openOptions}
            className={cn(
              'group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl py-3 text-sm font-bold shadow-md transition-all active:scale-95',
              isLight
                ? 'bg-[#0095FF] text-white hover:bg-blue-600'
                : 'bg-[#0095FF] text-white hover:bg-blue-600',
            )}>
            <span className="relative z-10">Dashboard</span>
            <div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          </button>

          {/* Persona Selection Section */}
          <div className="flex w-full flex-col items-center gap-2">
            <div className="flex w-full items-center gap-2">
              <div className={cn('h-[1px] flex-grow opacity-10', isLight ? 'bg-slate-900' : 'bg-white')}></div>
              <span
                className={cn(
                  'text-[10px] font-bold uppercase tracking-widest opacity-40',
                  isLight ? 'text-[#1E293B]' : 'text-slate-400',
                )}>
                Active Persona
              </span>
              <div className={cn('h-[1px] flex-grow opacity-10', isLight ? 'bg-slate-900' : 'bg-white')}></div>
            </div>

            <div className="flex w-full flex-col gap-1.5">
              {personas?.map(p => {
                const isActive = p.id === activePersonaId;
                return (
                    <button
                        key={p.id}
                        onClick={() => handleSelectPersona(p.id)}
                        className={cn(
                            'group flex w-full items-center justify-between border px-4 py-2 text-left transition-all rounded-lg',
                            isActive
                            ? isLight
                                ? 'border-[#0095FF] bg-blue-50 text-[#0095FF]'
                                : 'border-[#0095FF] bg-blue-500/10 text-[#0095FF]'
                            : isLight
                            ? 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                            : 'border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-800/50',
                        )}>
                        <span
                            className={cn(
                            'truncate text-xs font-semibold',
                            isActive ? 'opacity-100' : 'opacity-70',
                            )}>
                            {p.name}
                        </span>
                        {isActive && (
                            <div className="h-1.5 w-1.5 rounded-full bg-[#0095FF] shadow-[0_0_8px_rgba(0,149,255,0.6)]"></div>
                        )}
                    </button>
                );
              })}
            </div>
          </div>

          {currentHost && (
            <div className="flex w-full flex-col items-center gap-2">
              <div className="flex w-full items-center gap-2">
                <div className={cn('h-[1px] flex-grow opacity-10', isLight ? 'bg-slate-900' : 'bg-white')}></div>
                <span
                  className={cn(
                    'text-[10px] font-bold uppercase tracking-widest opacity-40',
                    isLight ? 'text-[#1E293B]' : 'text-slate-400',
                  )}>
                  Channel Info
                </span>
                <div className={cn('h-[1px] flex-grow opacity-10', isLight ? 'bg-slate-900' : 'bg-white')}></div>
              </div>

              <span
                className={cn(
                  'mb-2 max-w-full truncate px-2 text-xs font-medium italic',
                  isLight ? 'text-slate-500' : 'text-slate-400',
                )}>
                {currentHost}
              </span>

              <button
                onClick={toggleDisableCurrentHost}
                className={cn(
                  'flex w-full items-center justify-center gap-2 rounded-xl border py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95',
                  isCurrentHostDisabled
                    ? 'border-blue-500/30 bg-blue-500/5 text-blue-600 hover:bg-blue-500/10'
                    : 'border-rose-500/30 bg-rose-500/5 text-rose-500 hover:bg-rose-500/10',
                )}>
                {isCurrentHostDisabled ? 'Enable Dash' : 'Disable Dash'}
              </button>
            </div>
          )}
        </div>

        {/* Footer Toggle */}
        <div className={cn('flex w-full items-center justify-center gap-3 border-t pt-4', isLight ? 'border-slate-100' : 'border-slate-800')}>
          <span
            className={cn(
              'text-[10px] font-bold uppercase tracking-widest opacity-40',
              isLight ? 'text-[#1E293B]' : 'text-slate-400',
            )}>
            Appearance
          </span>
          <ToggleButton>{isLight ? 'Light' : 'Dark'}</ToggleButton>
        </div>
      </div>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <LoadingSpinner />), ErrorDisplay);