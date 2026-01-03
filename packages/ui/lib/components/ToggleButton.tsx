import { cn } from '@/lib/utils';
import { useStorage } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import type { ComponentPropsWithoutRef } from 'react';

type ToggleButtonProps = ComponentPropsWithoutRef<'button'>;

export const ToggleButton = ({ className, children, ...props }: ToggleButtonProps) => {
  const theme = useStorage(exampleThemeStorage);
  const isLight = theme === 'light';

  return (
    <button
      className={cn(
        'rounded-xl border px-4 py-2 font-sans text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm',
        isLight 
          ? 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50' 
          : 'border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800',
        className,
      )}
      onClick={exampleThemeStorage.toggle}
      {...props}>
      {children}
    </button>
  );
};