import '@src/NewTab.css';
import { withErrorBoundary, withSuspense } from '@extension/shared';
import { ErrorDisplay, LoadingSpinner } from '@extension/ui';

const NewTab = () => {
  return (
    <div className="min-h-screen font-serif flex flex-col items-center justify-center bg-[#FDF6E3] text-[#3E2723]">
      <div className="max-w-md text-center flex flex-col gap-6 animate-in fade-in duration-1000">
        <h1 className="text-5xl font-serif tracking-tighter">
          The Codex Workspace
        </h1>
        <div className="h-[1px] w-full bg-[#3E2723]/10"></div>
        <p className="text-lg italic opacity-60">
          "Simplicity is the ultimate sophistication."
        </p>
      </div>
    </div>
  );
};

export default withErrorBoundary(withSuspense(NewTab, <LoadingSpinner />), ErrorDisplay);