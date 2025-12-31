import { useState } from 'react';
import { useStorage } from '@extension/shared';
import { debugLogsStorage } from '@extension/storage';

const DebugLogPanel = () => {
  const debugLogs = useStorage(debugLogsStorage);
  const [showLogs, setShowLogs] = useState(false);

  if (debugLogs.length === 0) {
    // 为了让你“常驻”看到，即便没日志也显示一个占位状态
    return (
      <div className="fixed bottom-5 left-5 z-[999999] pointer-events-auto font-serif">
        <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] bg-[#FDF6E3] text-[#3E2723]/30 border border-[#3E2723]/10 shadow-sm cursor-help" title="Waiting for first spark of inspiration...">
          Codex Idle
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-5 left-5 z-[999999] flex flex-col items-start gap-2 pointer-events-none font-serif">
      {showLogs && (
        <div className="w-96 max-h-[70vh] overflow-y-auto bg-[#FDF6E3] border border-[#EBD9B4] shadow-2xl p-4 text-[12px] text-[#3E2723] rounded-sm animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-auto mb-2">
          <div className="flex justify-between items-center border-b border-[#3E2723]/20 pb-2 mb-3">
            <span className="font-bold uppercase tracking-widest text-[10px] opacity-70">The Debugging Codex</span>
            <button onClick={() => debugLogsStorage.set([])} className="hover:underline text-[10px] uppercase">Burn Logs</button>
          </div>
          <div className="flex flex-col gap-4">
            {debugLogs.map((log, i) => (
              <div key={i} className="flex flex-col gap-2 border-b border-[#3E2723]/10 pb-3 last:border-0">
                <div className="flex justify-between items-center opacity-60">
                  <span className="font-bold px-1.5 py-0.5 bg-[#3E2723]/5 rounded text-[9px]">
                    {log.type === 'req' ? 'SENT TO MUSE' : 'MUSE REPLIED'}
                  </span>
                  <span className="text-[9px] italic">{log.time}</span>
                </div>
                <pre className="whitespace-pre-wrap font-mono break-all leading-normal bg-[#3E2723]/5 p-2 rounded-sm border border-[#3E2723]/5">
                  {JSON.stringify(log.content, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}

      <button 
        onClick={() => setShowLogs(!showLogs)}
        className={cn(
          "px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-all rounded-none border border-[#3E2723]/20 shadow-md pointer-events-auto",
          showLogs 
            ? "bg-[#3E2723] text-[#FDF6E3]" 
            : "bg-[#FDF6E3] text-[#3E2723] hover:bg-[#F5E6C4]"
        )}
      >
        {showLogs ? 'Close Codex' : `View Logs (${debugLogs.length})`}
      </button>
    </div>
  );
};

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

export default DebugLogPanel;
