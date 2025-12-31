import '@src/SidePanel.css';
import { withErrorBoundary, withSuspense } from '@extension/shared';
import { ErrorDisplay, LoadingSpinner } from '@extension/ui';

const SidePanel = () => {
  return (
    <div className="min-h-screen font-serif p-6 flex flex-col items-center bg-[#FDF6E3] text-[#3E2723]">
      <header className="flex flex-col items-center text-center gap-4">
        <h1 className="text-2xl font-serif tracking-tight border-b border-[#3E2723]/20 pb-2 w-full">
          Oh My Comment
        </h1>
        <p className="text-sm italic opacity-70">
          Side Panel Reference
        </p>
      </header>
    </div>
  );
};

export default withErrorBoundary(withSuspense(SidePanel, <LoadingSpinner />), ErrorDisplay);