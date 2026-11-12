# HANDOFF : refonte ToMo (à reprendre à la maison)

> Dernière mise à jour : 2026-11-12 (reprise : sections B, D et F faites, voir « Mise à jour du 12 novembre » en bas). État : **typecheck, lint et 73 tests passent** ; **rien n'a été vu sur un téléphone ni sur un émulateur**.
> Le travail a déjà été commité par l'utilisateur sur `develop` (commit `e54e65e`, remote `origin` = `My-conso/mobile-app`). Les derniers ajustements faits après ce commit (voir « Non commité » plus bas) sont à commiter.

## 1. Référence de design

- Artefact (canevas de design) : https://claude.ai/artifact/MhgjrpKYaEudZR31LimprM
  - Écrans : `Main` (palette et composants), `Bienvenue` (premier lancement), `Accueil`, `Ajouter`, `Historique`, `Stats`, `Reglages`, `Site` (site vitrine).
  - Notes du canevas à respecter : micro-interactions, premier lancement, ton des textes (tutoiement, phrases courtes, chiffres d'abord), règles d'usage de la palette.
- Produit renommé **ToMo** (ancien noms : « My Conso », « my-konso »). L'utilisateur renomme lui-même dossiers et dépôts GitHub puis me donnera les noms définitifs : **ne rien renommer avant**.
- Décisions prises avec l'utilisateur :
  - **Thème sombre uniquement** (palette « Nuit & Néon »). Plus de sélecteur Clair/Sombre.
  - Langues : **français + malagasy** (l'anglais est supprimé).
  - Stockage inchangé (MMKV + zustand), site vitrine dans un **dépôt séparé**.

## 2. Règles de code (obligatoires, voir aussi CLAUDE.md)

1. Composants partagés d'abord (`src/components/ui`, `src/components/layout`), jamais de primitives React Native brutes dans les écrans.
2. Tailwind uniquement (`className` + `cn()`). `style` inline seulement pour une valeur dynamique (inset de zone sûre, hauteur calculée d'une barre).
3. Aucune couleur en dur : jetons du thème. Côté JS (SVG, icônes, navigation) : `useThemeColor` ou `COLORS` (`src/constants/color.ts`, **à garder identique à `global.css`**).
4. Listes : `ThemedList` (FlashList v2).

## 3. Ce qui est fait

### Fondations
- `global.css` : palette Nuit & Néon (fonds `#0F1012` / `#17191C` / `#212428`, bordure `#2C2F34`, néon `#C5F25A`, corail `#FF6B5E`, ambre `#F2B84B`), rayons (`rounded-chip|card|hero`), polices (`font-sans*`, `font-display*`). `src/constants/color.ts` en miroir.
- `ThemeProvider` forcé en sombre. `App.tsx` charge Inter et Space Grotesk (`@expo-google-fonts`) et garde le splash tant que les polices ne sont pas prêtes.
- `ThemedText` : variantes de la maquette, prop `numeric` (Space Grotesk + chiffres tabulaires), couleur `faint`.
- Composants partagés ajoutés : `ThemedSwitch`, `SwitchRow`, `RowGroup`, `ListRow`, `Odometer`, `AnimatedNumber` (+ hook `useCountUp`), `MiniBars`, `Status`, `BarChart` (refait), `SegmentedControl` (pilules), `StatCard`, `ThemedInput` (props `suffix`, `numeric`), `ThemedButton` (variantes de la maquette), `ScreenHeader`, `TabBar` (navigation flottante avec « + » central), `ThemedIcon` (nouvelles icônes).
- Supprimés : `ThemedFab`, `ThemedLineChart`, `SectionCard`, `InfoRow`, `AddEntryFab`.

### Données et logique
- Véhicule = **marque, modèle, année, cylindrée (facultatif), réservoir (facultatif), photo (facultatif)** ; helper `vehicleName()`.
- Store persisté **v4** (`src/features/fuel/store.ts`) avec `onboardingDone` et `completeOnboarding()`. Migrations v1→v4 dans `src/lib/migrations.ts` (testées). Sauvegarde JSON v3 (`src/lib/data-io.ts`), les anciennes sauvegardes restent importables.
- `validateVehicleDraft` (marque, modèle, année 1950 → N+1 obligatoires) + tests.
- `computeConsumption` : un plein partiel pointe maintenant vers le segment qui l'a compté (historique « compté le 18 mars »).
- i18n : `fr` et `mg` générés avec les **mêmes clés** (test de parité `src/i18n/__tests__/locales.test.ts`). Fichiers : `src/i18n/locales/{fr,mg}/{common,errors,fuel}.json`.

### Écrans (réécrits d'après les maquettes)
Onboarding (langue → moto → bienvenue), Accueil (carte héros avec chiffre qui « roule », mini-barres, tendance ambre/corail, grille de chiffres, compteur kilométrique), Ajouter un plein (champs, bascule prix au litre / montant, interrupteurs, calcul en direct, écran « C'est noté ! » avec vibration légère), Historique (FlashList, lignes groupées par mois), Statistiques (barres, période, meilleur / pire, tableau), Réglages (langue, véhicules, préférences, données), Ma moto (avec photo), Édition d'une préférence (devise, seuil d'alerte).

## 4. À FAIRE (dans l'ordre conseillé)

### A. Vérifier sur téléphone (priorité 1)
Lancer : `pnpm install`, `npx expo prebuild --clean`, `pnpm android` (ou `pnpm ios`). Dépendances natives ajoutées récemment : `expo-image-picker`, `@react-native-community/datetimepicker`, `expo-sharing`, `expo-document-picker`, `expo-crypto`, `@shopify/flash-list`, `@expo-google-fonts/*`.

Points de risque (non vérifiés) :
1. **Classes Tailwind personnalisées** : `font-sans-medium`, `font-sans-semibold`, `font-display`, `font-display-semibold`, `font-display-bold`, `rounded-chip|card|hero`, `text-6xl`, `tabular-nums`, tailles `size-*`, `min-h-13/14/15/17/18`, `w-13`, `h-17`, `size-22`. Si l'une ne rend rien, la définir dans `global.css` (jeton) ou la remplacer par une valeur arbitraire (`min-h-[52px]`).
2. **Polices** : vérifier que les familles (`Inter_500Medium`, `SpaceGrotesk_600SemiBold`…) sont bien appliquées, sinon revoir le mapping dans `src/components/ui/themed-text.tsx`.
3. **Barre d'onglets** : marge basse selon la barre de gestes (`TabBar`), « + » central, onglet actif en néon.
4. **Onboarding** : clavier (écran moto), retour étape 2 → 1, première ouverture sans aucune présélection de langue, passage à l'accueil après « Ajouter mon premier plein ».
5. **Ajouter un plein** : sélecteur de date (Android : 2 dialogues ; iOS : picker compact), calcul en direct, écran de confirmation (animation `ZoomIn`, « Réduire les animations »).
6. **Historique** : fluidité au défilement rapide (FlashList, `drawDistance`), coins arrondis premier / dernier de chaque mois.
7. **Migration** : ouvrir l'app sur un téléphone qui avait l'ancienne version (données v1 / v3) → la moto « Yamaha Cygnus X 2013 » doit devenir marque « Yamaha », modèle « Cygnus X », année 2013 et l'onboarding doit être sauté.

### B. Marque et icônes
- Le pack de marque a été renommé par l'utilisateur : `../tomo-brand/` (logos `tomo-*`, icônes dans `expo/assets/images/`, fichiers du site dans `site/`).
- Copier `tomo-brand/expo/assets/images/*.png` dans `assets/images/`, puis **réappliquer la réduction du splash à 65 %** (le splash du pack déborde du cercle de masque Android 12+ : rayon max visible ≈ 338 px sur 1024 ; script Python/Pillow : recadrer sur la bbox, redimensionner ×0,65, recentrer sur 1024×1024 transparent). Les icônes actuelles de l'app affichent encore « my-konso ».
- `app.json` et `app.config.ts` : `name` → « ToMo », `userInterfaceStyle` → `"dark"`, fonds du splash `#0F1012` (clair) / `#000000` (sombre), fond d'icône adaptative `#0F1012`. **Ne pas changer `slug`, `package`, `bundleIdentifier`** sans décision (nouveau projet EAS).

### C. Nom, dossiers, GitHub (attendre les noms de l'utilisateur)
- Remplacer « My Conso » / `my-conso` : `package.json` (`name`), `app.config.ts` (`APP_NAME`, `PROJECT_SLUG`), `CLAUDE.md`, `README.md`, workflows.
- `git remote set-url origin <nouvelle URL>` après le renommage des dépôts. L'ancien remote `old-origin` (`diamondrarktvo/my-conso`) peut être supprimé (`git remote remove old-origin`) puis archivé.
- Après un renommage de dossier : `rm -rf node_modules && pnpm install --frozen-lockfile` (les scripts de `node_modules/.bin` contiennent des chemins absolus) et `npx jest --clearCache`.

### D. Nettoyage de code
- Mettre à jour `CLAUDE.md` (encore décrit : thème clair/sombre/système, langue `en`, store v3, `ThemedFab`, `SectionCard`, `InfoRow`, « My Conso »). À documenter : sombre uniquement, ToMo, `fr` + `mg`, onboarding, store v4, nouveaux composants partagés.
- Composants starter non restylés (utilisent encore d'anciens jetons) : `src/components/feedback/*` (error-modal, écrans de chargement / erreur / permission), `ThemedBottomSheet`, toasts (`toast-provider.tsx`, ombres `#000`). Vérifier le rendu avec la nouvelle palette.
- Code mort probable : `CACHE_KEYS.THEME`, `useAppSettings`, mentions de `en`, exports inutilisés (`ThemedPressable` OK), `vehicle-switcher` / `vehicle-avatar` (vérifier l'usage sur l'accueil). Lancer `pnpm lint` après.
- Champs **Station** et **Note** : retirés du formulaire (absents de la maquette) mais toujours dans le modèle et conservés à l'édition. Décision à confirmer avec l'utilisateur : les remettre (lien « Plus de détails ») ou les supprimer du modèle.
- Photo du véhicule : conservée (demande de l'utilisateur) alors que la maquette ne la montre pas ; l'avatar est affiché à l'accueil, dans les pastilles et dans le formulaire.

### E. Textes
- **Traductions malagasy à faire relire par un locuteur natif** (écrites sans relecture ; les textes d'onboarding et de réglages viennent de la maquette, le reste est de moi). Tout est dans `src/i18n/locales/mg/`.
- Le ton doit rester : tutoiement, phrases courtes, chiffres d'abord.

### F. Site vitrine (pas commencé)
- Dossier : `../my-conso-website/` (vide). Dépôt séparé : `https://github.com/My-conso/website.git` (à renommer éventuellement). Faire : `git init -b main`, `git remote add origin …`, premier commit, `git push -u origin main`.
- Contenu : reproduire l'artboard `Site` de l'artefact : en-tête (liens Fonctions / Installer / Questions, bascule FR | MG, bouton Télécharger), héros avec **maquette de téléphone contenant l'Accueil**, 4 fonctions, 3 gestes, section « Installer sur Android » (3 étapes + avertissement APK), FAQ (accordéon), appel final, pied de page.
- Technique conseillée : **HTML + CSS + un peu de JS, sans build** (bascule FR / MG, accordéon). Polices Google (Inter, Space Grotesk), mêmes jetons de couleur que l'app, `prefers-reduced-motion`, responsive (téléphone 400 px).
- Fichiers prêts dans `../tomo-brand/site/` : `favicon-32.png`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, `og-image.png` (balises dans `LISEZMOI.md`). Logos dans `../tomo-brand/logos/`.
- **Placeholders à remplir par l'utilisateur** (ne pas inventer) : lien du fichier APK, taille en Mo, version minimale d'Android, contact (e-mail ou page Facebook), domaine (pour `og:image`).
- À décider : hébergement du site (Netlify, GitHub Pages…) et hébergement de l'APK (artefact EAS ou « Releases » GitHub).

### G. Build et diffusion
- `npx eas login`, `npx eas init`, puis renseigner `EAS_PROJECT_ID` dans `app.config.ts`.
- APK : `pnpm build:android:production-apk` (nom propre) ou `pnpm build:android:preview`. iPhone : compte Apple Developer requis.
- CI : vérifier l'onglet Actions du dépôt de l'organisation.

## 5. Commandes utiles

```bash
pnpm typecheck && pnpm lint && pnpm test      # tous doivent passer (73 tests aujourd'hui)
pnpm test src/i18n                             # parité fr / mg
npx expo prebuild --clean && pnpm android      # nouveau build natif
npx expo export --platform android --output-dir /tmp/export   # vérifie que le bundle compile
```

## 6. Non commité (au moment de cette note)
- Correction du test `la photo n'est pas exportée` (véhicule avec `brand` / `model`) et suppression d'une variable inutilisée dans `themed-button.tsx`.
- Ce fichier `HANDOFF.md`.
→ `git add -A && git commit` puis `git push` pour les récupérer à la maison.

## 7. Mise à jour du 12 novembre

Fait lors de la reprise :
- **B (marque)** : icônes et splash du pack `tomo-brand/` copiés dans `assets/images/` (splash réduit pour tenir dans le cercle Android 12+ : rayon 309 px pour 338). `name` = « ToMo », `userInterfaceStyle` = `"dark"`. `slug` (`my-conso`), `package` et `bundleIdentifier` **inchangés**.
- **D (nettoyage)** : CLAUDE.md et README mis à jour (ToMo, sombre uniquement, fr + mg, onboarding, store v4, nouveaux composants) ; `CACHE_KEYS.THEME` et `useAppSettings` supprimés (inutilisés).
- **F (site)** : `../my-conso-website/` créé (HTML + CSS + JS sans build, FR / MG, FAQ, maquette de téléphone). Vérifié en rendu bureau et mobile 390 px. Dépôt git local initialisé (branche `main`, 1 commit), **aucun remote ajouté et rien poussé**. Voir son `README.md` pour la liste « à faire avant la mise en ligne ».

Reste à faire (mis à jour) : A (vérifier sur téléphone, **jamais fait**), C (renommages : attend les noms de l'utilisateur), D partiel (restyler `src/components/feedback/*`, `ThemedBottomSheet`, toasts ; décider du sort des champs Station / Note), E (relecture malagasy de l'app **et du site**), F (renseigner `config.js`, domaine de `og:image`, choisir l'hébergement, `git remote add origin https://github.com/My-conso/website.git` puis push), G (build EAS et diffusion de l'APK).

### Correctif du 12 novembre (après la question « as-tu refait le design ? »)
- Premier lancement, étape 3 : « Ajouter mon premier plein » crée la moto **puis ouvre directement le formulaire de plein** (comme la maquette). Pour cela `Onboarding` est maintenant un écran de la pile (écrans conditionnels selon `onboardingDone`) et `navigateWhenReady` (testé) navigue dès que `FuelForm` existe. À vérifier sur téléphone : après le formulaire, le retour ramène à l'Accueil.
- Écarts restants avec la maquette : voir la liste donnée dans la conversation (avatar à l'Accueil, Station / Note retirés, écran d'édition de la devise et du seuil, 10 barres max, sélecteur de date natif sur iPhone).
