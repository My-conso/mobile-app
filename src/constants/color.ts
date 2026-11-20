/**
 * Valeurs hexadécimales IDENTIQUES à celles de global.css (mêmes tokens, mêmes valeurs ; palette Piste, sombre uniquement).
 * Elles servent aux consommateurs JS qui ne savent pas lire les variables CSS (graphiques SVG,
 * barre d'onglets, icônes, toasts) et de secours si une variable CSS est absente.
 * Toute modification de couleur se fait dans les DEUX fichiers.
 */

export const COLORS = {
   // The app is dark only: both entries hold the same palette (Piste).
   light: {
      // Backgrounds
      background: '#000c0c',
      backgroundTop: '#021b1c',
      backgroundBottom: '#000000',
      backgroundSecondary: '#1e2327',
      card: '#15191c',
      cardHover: '#1e2327',

      // Text
      foreground: '#f2f7f8',
      foregroundSecondary: '#8fa3a6',
      foregroundMuted: '#8fa3a6',
      foregroundFaint: '#3e5054',
      foregroundInverse: '#00191c',

      // Borders
      border: '#253033',
      borderSubtle: '#12292b',

      // Brand (cyan)
      primary: '#20d0e8',
      primaryHover: '#5fe0f0',
      primarySoft: '#0a2e33',

      // Accent (amber)
      accent: '#f2b84b',
      accentSoft: '#2a2310',

      // Semantic
      danger: '#ff8a8d',
      dangerSoft: '#2e1416',
      success: '#20d0e8',
      successSoft: '#0a2e33',
      warning: '#f2b84b',
      warningSoft: '#2a2310',
      info: '#8fa3a6',
      infoSoft: '#1e2327',

      // Rating
      rating: '#f2b84b',
      ratingInactive: '#253033',
   },
   dark: {
      // Backgrounds
      background: '#000c0c',
      backgroundTop: '#021b1c',
      backgroundBottom: '#000000',
      backgroundSecondary: '#1e2327',
      card: '#15191c',
      cardHover: '#1e2327',

      // Text
      foreground: '#f2f7f8',
      foregroundSecondary: '#8fa3a6',
      foregroundMuted: '#8fa3a6',
      foregroundFaint: '#3e5054',
      foregroundInverse: '#00191c',

      // Borders
      border: '#253033',
      borderSubtle: '#12292b',

      // Brand (cyan)
      primary: '#20d0e8',
      primaryHover: '#5fe0f0',
      primarySoft: '#0a2e33',

      // Accent (amber)
      accent: '#f2b84b',
      accentSoft: '#2a2310',

      // Semantic
      danger: '#ff8a8d',
      dangerSoft: '#2e1416',
      success: '#20d0e8',
      successSoft: '#0a2e33',
      warning: '#f2b84b',
      warningSoft: '#2a2310',
      info: '#8fa3a6',
      infoSoft: '#1e2327',

      // Rating
      rating: '#f2b84b',
      ratingInactive: '#253033',
   },
};
