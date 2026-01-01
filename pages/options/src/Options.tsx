import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { presetPromptsStorage, apiKeyStorage, exampleThemeStorage, usageStorage, type Persona } from '@extension/storage';
import { ErrorDisplay, LoadingSpinner, ToggleButton } from '@extension/ui';
import { useState, useEffect } from 'react';

const Options = () => {
  // Personas State
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>('default');

  const [apiKey, setApiKey] = useState('');
  const theme = useStorage(exampleThemeStorage);
  const isLight = theme === 'light';

  const savedPersonas = useStorage(presetPromptsStorage);
  const savedApiKey = useStorage(apiKeyStorage);
  const usage = useStorage(usageStorage);

  // Sync state with storage
  useEffect(() => {
    if (savedPersonas && savedPersonas.length > 0) {
      setPersonas(savedPersonas);
      // Ensure selected ID is valid
      if (!savedPersonas.find(p => p.id === selectedPersonaId)) {
        setSelectedPersonaId(savedPersonas[0].id);
      }
    }
  }, [savedPersonas]);

  useEffect(() => {
    if (savedApiKey) setApiKey(savedApiKey);
  }, [savedApiKey]);

  // Handlers
  const handleSaveApiKey = () => apiKeyStorage.set(apiKey);
  const handleResetUsage = () =>
    usageStorage.set({
      requestCount: 0,
      totalInputTokens: 0,
      totalOutputTokens: 0,
    });

  const savePersonas = (newPersonas: Persona[]) => {
    setPersonas(newPersonas);
    presetPromptsStorage.set(newPersonas);
  };

  const handleAddPersona = () => {
    const newId = `persona-${Date.now()}`;
    const newPersona: Persona = {
      id: newId,
      name: 'New Persona',
      prompt: 'You are a helpful assistant...',
      isDefault: false,
    };
    const newList = [...personas, newPersona];
    savePersonas(newList);
    setSelectedPersonaId(newId);
  };

  const handleDeletePersona = (id: string) => {
    if (personas.length <= 1) return; // Prevent deleting last one
    const newPersonas = personas.filter(p => p.id !== id);
    
    // If we deleted the default, make the first one default
    if (personas.find(p => p.id === id)?.isDefault) {
        newPersonas[0].isDefault = true;
    }

    savePersonas(newPersonas);
    if (selectedPersonaId === id) {
      setSelectedPersonaId(newPersonas[0].id);
    }
  };

  const handleUpdatePersona = (id: string, updates: Partial<Persona>) => {
    const newPersonas = personas.map(p => {
      if (p.id === id) {
        return { ...p, ...updates };
      }
      return p;
    });
    savePersonas(newPersonas);
  };

  const handleSetDefault = (id: string) => {
    const newPersonas = personas.map(p => ({
      ...p,
      isDefault: p.id === id,
    }));
    savePersonas(newPersonas);
  };

  const selectedPersona = personas.find(p => p.id === selectedPersonaId) || personas[0];

  const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

  return (
    <div
      className={cn(
        'flex min-h-screen flex-col items-center p-8 font-serif transition-colors duration-700',
        isLight ? 'bg-[#FDF6E3]' : 'bg-[#1C1C1A]',
      )}>
      <div className="animate-in fade-in slide-in-from-bottom-4 flex w-full max-w-3xl flex-col gap-12 duration-1000">
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

        {/* Personas Section */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <h2
              className={cn(
                'text-lg font-bold uppercase tracking-widest',
                isLight ? 'text-[#3E2723]/70' : 'text-[#F5E6C4]/60',
              )}>
              Personas
            </h2>
            <div className="h-[1px] flex-grow bg-[#EBD9B4]/30"></div>
            <button
              onClick={handleAddPersona}
              className={cn(
                'rounded-none px-4 py-1 text-[10px] font-bold uppercase tracking-widest transition-all hover:scale-105 active:scale-95',
                 isLight
                    ? 'bg-[#3E2723] text-[#FDF6E3] hover:bg-[#5D4037]'
                    : 'bg-[#EBD9B4] text-[#3E2723] hover:bg-[#F5E6C4]',
              )}>
              + Add New
            </button>
          </div>

          <div className="flex flex-col gap-6 md:flex-row">
            {/* Persona List / Sidebar */}
            <div className="flex w-full flex-row gap-2 overflow-x-auto md:w-1/3 md:flex-col md:overflow-visible">
              {personas.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPersonaId(p.id)}
                  className={cn(
                    'group flex items-center justify-between border p-3 text-left transition-all',
                    selectedPersonaId === p.id
                      ? isLight
                        ? 'border-[#3E2723] bg-[#3E2723]/5'
                        : 'border-[#F5E6C4] bg-[#F5E6C4]/10'
                      : isLight
                      ? 'border-[#3E2723]/10 hover:bg-[#3E2723]/5'
                      : 'border-[#F5E6C4]/10 hover:bg-[#F5E6C4]/5',
                  )}>
                  <div className="flex flex-col truncate">
                    <span
                      className={cn(
                        'truncate text-sm font-bold',
                        isLight ? 'text-[#3E2723]' : 'text-[#F5E6C4]',
                        selectedPersonaId === p.id && 'opacity-100',
                      )}>
                      {p.name}
                    </span>
                    {p.isDefault && (
                      <span className="text-[10px] uppercase tracking-wider opacity-50">Default</span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Editor Area */}
            <div
              className={cn(
                'flex flex-grow flex-col gap-4 border p-6',
                isLight ? 'border-[#3E2723]/10 bg-[#F5E6C4]/10' : 'border-[#F5E6C4]/20 bg-[#1C1C1A]',
              )}>
              {selectedPersona && (
                <>
                  <div className="flex items-center justify-between gap-4">
                    <input
                        type="text"
                        value={selectedPersona.name}
                        onChange={(e) => handleUpdatePersona(selectedPersona.id, { name: e.target.value })}
                        className={cn(
                            'flex-grow bg-transparent text-xl font-bold outline-none',
                             isLight ? 'text-[#3E2723]' : 'text-[#F5E6C4]'
                        )}
                    />
                    <div className="flex items-center gap-2">
                         {!selectedPersona.isDefault && (
                             <button
                                onClick={() => handleSetDefault(selectedPersona.id)}
                                className={cn(
                                    'text-[10px] uppercase tracking-widest opacity-50 hover:opacity-100',
                                    isLight ? 'text-[#3E2723]' : 'text-[#F5E6C4]'
                                )}
                             >
                                 Make Default
                             </button>
                         )}
                         {personas.length > 1 && (
                            <button
                                onClick={() => handleDeletePersona(selectedPersona.id)}
                                className="text-[10px] font-bold uppercase tracking-widest text-red-500 opacity-60 hover:opacity-100"
                            >
                                Delete
                            </button>
                         )}
                    </div>
                  </div>
                  
                  <div className="h-[1px] w-full bg-[#EBD9B4]/30"></div>

                  <div className="flex flex-col gap-2">
                    <label className={cn('text-xs italic opacity-60', isLight ? 'text-[#3E2723]' : 'text-[#F5E6C4]')}>
                        Persona Instructions:
                    </label>
                    <textarea
                        className={cn(
                        'min-h-[250px] w-full resize-none rounded-none border p-4 leading-relaxed outline-none transition-all',
                        isLight
                            ? 'border-[#3E2723]/10 bg-[#F5E6C4]/20 text-[#3E2723] focus:border-[#3E2723]'
                            : 'border-[#F5E6C4]/20 bg-[#1C1C1A] text-[#F5E6C4] focus:border-[#F5E6C4]',
                        )}
                        value={selectedPersona.prompt}
                        onChange={e => handleUpdatePersona(selectedPersona.id, { prompt: e.target.value })}
                        placeholder="Define how this persona should behave..."
                    />
                  </div>
                </>
              )}
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
