<div align="center">

<img src="assets/images/icon.png" alt="Logo ToMo" width="120" height="120" />

# ToMo

**Suis la consommation de ton scooter ou de ta moto, plein après plein.**

![Expo](https://img.shields.io/badge/Expo-55-000020?logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React_Native-0.83-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Android](https://img.shields.io/badge/Android-APK-3DDC84?logo=android&logoColor=white)
![Offline](https://img.shields.io/badge/100%25-hors_ligne-C5F25A)
![Langues](https://img.shields.io/badge/langues-FR_·_MG-F2B84B)

</div>

---

## ✨ L'app

ToMo calcule ta **vraie consommation** en L/100 km avec la méthode « plein à plein », et te dit combien ça te coûte. Tout reste sur ton téléphone : pas de compte, pas de serveur.

| | |
|---|---|
| ⛽ **Pleins** | Ajoute un plein en quelques secondes : compteur, litres, prix. |
| 📊 **Consommation** | Moyenne globale, dernier plein, tendance et alerte si ça grimpe. |
| 💸 **Coût** | Coût aux 100 km et dépenses du mois. |
| 🛵 **Plusieurs véhicules** | Marque, modèle, année, cylindrée, réservoir, photo. |
| 🕘 **Historique** | Pleins groupés par mois, avec leur situation (en attente, oublié…). |
| 📈 **Stats** | Graphiques dessinés à la main, par période. |
| 💾 **Sauvegarde** | Export et import de tes données. |
| 🌍 **Langues** | Français et malgache. |

## 🎨 Design

Thème sombre uniquement, palette **« Nuit & Néon »**.

| | Couleur | Usage |
|---|---|---|
| ⬛ | `#0F1012` | Fond |
| ◾ | `#17191C` · `#212428` | Surfaces |
| 🟩 | `#C5F25A` | Action principale, chiffre clé, tendance positive |
| 🟥 | `#FF6B5E` | Alerte de surconsommation, suppression |
| 🟨 | `#F2B84B` | Avertissement |

Polices : **Inter** (textes) et **Space Grotesk** (chiffres).

## 🧰 Stack

| | |
|---|---|
| 📱 Framework | [Expo](https://expo.dev) + React Native, TypeScript |
| 🎨 Styles | [Uniwind](https://uniwind.dev) (Tailwind CSS v4) |
| 🗃️ État | [Zustand](https://zustand-demo.pmnd.rs) persisté dans MMKV |
| 🧭 Navigation | React Navigation (stack + onglets) |
| 🌐 i18n | i18next + react-i18next |
| 📃 Listes | FlashList v2 |
| 📉 Graphiques | react-native-svg |
| ✅ Qualité | ESLint, Jest (jest-expo), GitHub Actions |

## 🚀 Démarrer

> L'app utilise des modules natifs (MMKV…) : **Expo Go ne suffit pas**, il faut un *dev client*.

```bash
pnpm install
cp .env.example .env.local   # si .env.local n'existe pas encore
pnpm dev-client              # lance Metro
pnpm android                 # premier build natif sur un appareil
pnpm ios
```

### 🌱 Environnements

| Env | `EXPO_PUBLIC_APP_ENV` | Suffixe de l'identifiant |
|---|---|---|
| development | `development` | `.development` |
| preview | `preview` | `.preview` |
| production | `production` | aucun |

## 🛠️ Scripts

| Commande | Rôle |
|---|---|
| `pnpm dev` / `pnpm dev-client` | Lance Metro |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | ESLint |
| `pnpm test` | Jest |
| `pnpm doctor` / `pnpm fix` | Vérifie / corrige les versions Expo |
| `pnpm build:android:preview` | APK interne |
| `pnpm build:android:production-apk` | APK de production (installation directe) |
| `pnpm build:android:production` | Bundle AAB (store) |

## 🗂️ Structure

```
src/
├─ features/     un dossier par écran (home, history, stats, settings…)
├─ components/   ui/ (composants thémés), layout/
├─ providers/    cache, toast, erreurs, bottom sheet
├─ navigation/   stack racine et barre d'onglets
├─ lib/          calcul de consommation, formats, validation, import/export
├─ i18n/         locales fr / mg
└─ theme/        thème (sombre)
```

## 📦 Publication

L'app est distribuée en **APK** depuis le site, sans store. Un tag `vX.Y.Z` lance `.github/workflows/release.yml` : contrôles, build EAS, GitHub Release avec l'APK, puis mise à jour de la page de téléchargement.

## ✅ CI

`.github/workflows/ci.yml` lance typecheck, lint et tests à chaque push et pull request.

---

<div align="center">

Fait avec ❤️ pour les motards de Madagascar · **Misaotra !** 🇲🇬

</div>
