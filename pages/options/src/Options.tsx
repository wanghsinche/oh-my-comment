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
        'flex min-h-screen flex-col items-center p-8 font-sans transition-colors duration-700',
        isLight ? 'bg-[#F8FAFC]' : 'bg-[#0F172A]',
      )}>
      <div className="animate-in fade-in slide-in-from-bottom-4 flex w-full max-w-4xl flex-col gap-12 duration-1000">
        {/* Header Section */}
        <header
          className={cn(
            'flex flex-col items-center gap-4 border-b pb-8 text-center',
            isLight ? 'border-slate-200' : 'border-slate-800',
          )}>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0095FF] text-white shadow-xl shadow-blue-500/20">
                <span className="text-2xl font-black italic">D</span>
            </div>
            <h1 className={cn('text-5xl font-black tracking-tight', isLight ? 'text-[#1E293B]' : 'text-white')}>
                DashReply
            </h1>
          </div>
          <p
            className={cn(
              'text-xs font-bold uppercase tracking-[0.5em] opacity-40',
              isLight ? 'text-[#1E293B]' : 'text-slate-400',
            )}>
            Precision Social Engineering
          </p>
        </header>

        {/* Stacked Layout */}
        <div className="flex flex-col gap-10">
          
          {/* API Key Section */}
          <section className={cn(
              'flex flex-col gap-6 p-8 rounded-3xl border shadow-sm',
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          )}>
              <h2 className={cn('text-sm font-black uppercase tracking-widest', isLight ? 'text-slate-400' : 'text-slate-500')}>
                  API Configuration
              </h2>
              <div className="flex flex-col md:flex-row gap-4">
                  <input
                      id="ark-api-key"
                      type="password"
                      className={cn(
                      'flex-grow rounded-xl border p-3 text-sm outline-none transition-all duration-300',
                      isLight
                          ? 'border-slate-200 bg-slate-50 text-[#1E293B] focus:border-[#0095FF] focus:ring-1 focus:ring-[#0095FF]'
                          : 'border-slate-800 bg-slate-950 text-white focus:border-[#0095FF] focus:ring-1 focus:ring-[#0095FF]',
                      )}
                      value={apiKey}
                      onChange={e => setApiKey(e.target.value)}
                      placeholder="Enter your API key..."
                  />
                  <button
                      className="rounded-xl bg-[#0095FF] px-8 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:bg-blue-600 active:scale-95"
                      onClick={handleSaveApiKey}>
                      Save Changes
                  </button>
              </div>
          </section>

          {/* Token Usage Section */}
          <section className={cn(
              'flex flex-col gap-6 p-8 rounded-3xl border shadow-sm',
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          )}>
              <div className="flex items-center justify-between">
                  <h2 className={cn('text-sm font-black uppercase tracking-widest', isLight ? 'text-slate-400' : 'text-slate-500')}>
                      Performance Metrics
                  </h2>
                  <button
                      className="text-[10px] font-bold uppercase tracking-widest text-rose-500 opacity-60 hover:opacity-100 transition-opacity"
                      onClick={handleResetUsage}>
                      Reset Stats
                  </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Requests</span>
                      <span className={cn('text-3xl font-black', isLight ? 'text-[#1E293B]' : 'text-white')}>{usage?.requestCount || 0}</span>
                  </div>
                  <div className="flex flex-col gap-1 border-l-0 md:border-l border-slate-100 md:pl-8">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Input Tokens</span>
                      <span className={cn('text-3xl font-black', isLight ? 'text-[#1E293B]' : 'text-white')}>{((usage?.totalInputTokens || 0) / 1000).toFixed(1)}k</span>
                  </div>
                  <div className="flex flex-col gap-1 border-l-0 md:border-l border-slate-100 md:pl-8">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Output Tokens</span>
                      <span className={cn('text-3xl font-black', isLight ? 'text-[#1E293B]' : 'text-white')}>{((usage?.totalOutputTokens || 0) / 1000).toFixed(1)}k</span>
                  </div>
              </div>
          </section>

          {/* Persona Management Section */}
          <section className={cn(
              'flex flex-col rounded-3xl border shadow-sm overflow-hidden',
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          )}>
              <div className={cn(
                  'flex items-center justify-between px-8 py-5 border-b',
                  isLight ? 'bg-slate-50/50 border-slate-200' : 'bg-slate-950/50 border-slate-800'
              )}>
                  <h2 className={cn('text-sm font-black uppercase tracking-widest', isLight ? 'text-slate-400' : 'text-slate-500')}>
                      Persona Management
                  </h2>
                  <button
                      onClick={handleAddPersona}
                      className="flex items-center gap-2 rounded-xl bg-[#0095FF]/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#0095FF] hover:bg-[#0095FF]/20 transition-all active:scale-95">
                      <span className="text-lg">+</span> Add New Persona
                  </button>
              </div>

              <div className="flex flex-col h-[600px] md:flex-row">
                  {/* Sidebar */}
                  <div className={cn(
                      'w-full md:w-72 border-r overflow-y-auto flex flex-col',
                      isLight ? 'border-slate-100' : 'border-slate-800'
                  )}>
                      {personas.map(p => (
                          <button
                              key={p.id}
                              onClick={() => setSelectedPersonaId(p.id)}
                              className={cn(
                                  'group flex items-center gap-4 px-8 py-5 text-left transition-all border-l-4',
                                  selectedPersonaId === p.id
                                  ? 'bg-[#0095FF]/5 border-[#0095FF]'
                                  : 'border-transparent hover:bg-slate-50/50'
                              )}>
                              <div className="flex flex-col truncate">
                                  <span className={cn(
                                      'truncate text-sm font-bold',
                                      selectedPersonaId === p.id 
                                          ? isLight ? 'text-[#0095FF]' : 'text-white'
                                          : isLight ? 'text-slate-600' : 'text-slate-400'
                                  )}>
                                      {p.name}
                                  </span>
                                  {p.isDefault && (
                                      <span className="text-[9px] font-black uppercase tracking-widest text-[#8A2BE2] opacity-70">Default</span>
                                  )}
                              </div>
                          </button>
                      ))}
                  </div>

                  {/* Editor */}
                  <div className="flex-grow flex flex-col p-10 gap-8 bg-slate-50/30">
                      {selectedPersona ? (
                          <>
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                  <div className="flex flex-col gap-1 flex-grow">
                                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Persona Name</label>
                                      <input
                                          type="text"
                                          value={selectedPersona.name}
                                          onChange={(e) => handleUpdatePersona(selectedPersona.id, { name: e.target.value })}
                                          className={cn(
                                              'bg-transparent text-3xl font-black outline-none tracking-tight',
                                              isLight ? 'text-[#1E293B]' : 'text-white'
                                          )}
                                      />
                                  </div>
                                  <div className="flex items-center gap-6">
                                      {!selectedPersona.isDefault && (
                                          <button
                                              onClick={() => handleSetDefault(selectedPersona.id)}
                                              className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-[#8A2BE2] transition-colors"
                                          >
                                              Set as Global Default
                                          </button>
                                      )}
                                      {personas.length > 1 && (
                                          <button
                                              onClick={() => handleDeletePersona(selectedPersona.id)}
                                              className="text-[10px] font-bold uppercase tracking-widest text-rose-400 hover:text-rose-600 transition-colors"
                                          >
                                              Delete Persona
                                          </button>
                                      )}
                                  </div>
                              </div>

                              <div className="flex flex-col gap-4 h-full">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                      System Instructions & Knowledge
                                  </label>
                                  <textarea
                                      className={cn(
                                          'flex-grow w-full resize-none rounded-2xl border p-8 text-sm leading-relaxed outline-none transition-all shadow-inner font-mono',
                                          isLight
                                              ? 'border-slate-200 bg-white text-[#1E293B] focus:border-[#0095FF]'
                                              : 'border-slate-800 bg-slate-950 text-white focus:border-[#0095FF]',
                                      )}
                                      value={selectedPersona.prompt}
                                      onChange={e => handleUpdatePersona(selectedPersona.id, { prompt: e.target.value })}
                                      placeholder="Define how this persona should behave..."
                                  />
                              </div>
                          </>
                      ) : (
                          <div className="h-full flex items-center justify-center text-slate-400 italic text-sm">
                              Select a persona from the left to begin editing.
                          </div>
                      )}
                  </div>
              </div>
          </section>
        </div>

        {/* Footer */}
        <footer className={cn(
            'mt-8 flex items-center justify-between border-t pt-8 px-4',
            isLight ? 'border-slate-200' : 'border-slate-800'
        )}>
          <div className="flex items-center gap-4">
              <span className={cn('text-[10px] font-black uppercase tracking-[0.3em] opacity-40', isLight ? 'text-slate-900' : 'text-white')}>
                  DashReply v0.5.0
              </span>
          </div>
          <div className="flex items-center gap-3">
            <span className={cn('text-[10px] font-black uppercase tracking-widest opacity-40', isLight ? 'text-slate-900' : 'text-white')}>
                Theme
            </span>
            <ToggleButton>{isLight ? 'Light' : 'Dark'}</ToggleButton>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Options, <LoadingSpinner />), ErrorDisplay);
