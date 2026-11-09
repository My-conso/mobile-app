import React from 'react';
import { ThemedView } from './themed-view';

/** Card that stacks rows (ListRow, SwitchRow…) separated by hairlines. */
export function RowGroup({ children }: { children: React.ReactNode }) {
   const rows = React.Children.toArray(children).filter(Boolean);
   return (
      <ThemedView variant="card" rounded="xl" className="overflow-hidden">
         {rows.map((row, i) => (
            <React.Fragment key={i}>
               {i > 0 ? <ThemedView className="bg-border mx-4 h-px" /> : null}
               {row}
            </React.Fragment>
         ))}
      </ThemedView>
   );
}
