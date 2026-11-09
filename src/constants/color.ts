/**
 * Valeurs hexadécimales IDENTIQUES à celles de global.css (mêmes tokens, mêmes valeurs ; palette Nuit & Néon, sombre uniquement).
 * Elles servent aux consommateurs JS qui ne savent pas lire les variables CSS (graphiques SVG,
 * barre d'onglets, icônes, toasts) et de secours si une variable CSS est absente.
 * Toute modification de couleur se fait dans les DEUX fichiers.
 */

export const COLORS = {
   // The app is dark only: both entries hold the same palette (Nuit & Neon).
   light: {
      // Backgrounds
      background: '#0f1012',
      backgroundSecondary: '#212428',
      card: '#17191c',
      cardHover: '#212428',

      // Text
      foreground: '#f4f5f0',
      foregroundSecondary: '#a1a5ac',
      foregroundMuted: '#858a93',
      foregroundFaint: '#4a4e55',
      foregroundInverse: '#0f1012',

      // Borders
      border: '#2c2f34',
      borderSubtle: '#1e2024',

      // Brand (neon)
      primary: '#c5f25a',
      primaryHover: '#a8d43f',
      primarySoft: '#2c3323',

      // Accent (amber)
      accent: '#f2b84b',
      accentSoft: '#332a14',

      // Semantic
      danger: '#ff6b5e',
      dangerSoft: '#3a1f1d',
      success: '#c5f25a',
      successSoft: '#2c3323',
      warning: '#f2b84b',
      warningSoft: '#332a14',
      info: '#a1a5ac',
      infoSoft: '#212428',

      // Rating
      rating: '#f2b84b',
      ratingInactive: '#2c2f34',
   },
   dark: {
      // Backgrounds
      background: '#0f1012',
      backgroundSecondary: '#212428',
      card: '#17191c',
      cardHover: '#212428',

      // Text
      foreground: '#f4f5f0',
      foregroundSecondary: '#a1a5ac',
      foregroundMuted: '#858a93',
      foregroundFaint: '#4a4e55',
      foregroundInverse: '#0f1012',

      // Borders
      border: '#2c2f34',
      borderSubtle: '#1e2024',

      // Brand (neon)
      primary: '#c5f25a',
      primaryHover: '#a8d43f',
      primarySoft: '#2c3323',

      // Accent (amber)
      accent: '#f2b84b',
      accentSoft: '#332a14',

      // Semantic
      danger: '#ff6b5e',
      dangerSoft: '#3a1f1d',
      success: '#c5f25a',
      successSoft: '#2c3323',
      warning: '#f2b84b',
      warningSoft: '#332a14',
      info: '#a1a5ac',
      infoSoft: '#212428',

      // Rating
      rating: '#f2b84b',
      ratingInactive: '#2c2f34',
   },
};
