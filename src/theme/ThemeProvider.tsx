// src/theme/ThemeProvider.tsx
import React, { createContext, useContext, useEffect } from 'react';
import { Uniwind } from 'uniwind';

/**
 * ToMo is dark only (palette "Nuit & Neon"). The provider keeps the same shape as before
 * (`theme`, `isDark`, `effectiveTheme`) so consumers don't change, but nothing is selectable anymore.
 */
export type ThemeMode = 'dark';

interface ThemeContextType {
   theme: ThemeMode;
   isDark: true;
   effectiveTheme: 'dark';
}

const ThemeContext = createContext<ThemeContextType>({ theme: 'dark', isDark: true, effectiveTheme: 'dark' });

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
   useEffect(() => {
      Uniwind.setTheme('dark');
   }, []);
   return <ThemeContext.Provider value={{ theme: 'dark', isDark: true, effectiveTheme: 'dark' }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
