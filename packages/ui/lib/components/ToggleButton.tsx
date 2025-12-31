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
        'rounded border px-4 py-1 font-serif text-sm transition-all active:scale-95',
        isLight 
          ? 'border-[#3E2723]/20 bg-[#FDF6E3] text-[#3E2723] hover:bg-[#F5E6C4]' 
          : 'border-[#F5E6C4]/20 bg-[#1C1C1A] text-[#F5E6C4] hover:bg-[#2C2C2A]',
        className,
      )}
      onClick={exampleThemeStorage.toggle}
      {...props}>
      {children}
    </button>
  );
};
