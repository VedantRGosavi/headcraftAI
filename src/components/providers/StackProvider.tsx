import { StackProvider as BaseStackProvider } from '@stackframe/stack';
import { stackClient } from '../../lib/stack-client';

export function StackProvider({ children }: { children: React.ReactNode }) {
  return (
    <BaseStackProvider app={stackClient}>
      {children}
    </BaseStackProvider>
  );
} 