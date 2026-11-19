#!/usr/bin/env bash
# Release ToMo: checks -> version bump -> commit -> tag -> push.
# The pushed tag triggers .github/workflows/release.yml (EAS APK build, GitHub Release,
# then the website's app-info.ts is updated and published).
#
# Usage: pnpm release [patch|minor|major|X.Y.Z] [--dry-run] [--yes]
#   no argument  -> patch bump
#   X.Y.Z equal to the current package.json version -> tags it without a bump commit (first release)
#   --dry-run    -> runs every check, changes nothing
#   --yes        -> no confirmation prompt
set -euo pipefail

BUMP="patch"; DRY=0; YES=0
for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY=1 ;;
    --yes|-y) YES=1 ;;
    patch|minor|major) BUMP="$arg" ;;
    [0-9]*.[0-9]*.[0-9]*) BUMP="$arg" ;;
    *) echo "Argument inconnu : $arg"; echo "Usage : pnpm release [patch|minor|major|X.Y.Z] [--dry-run] [--yes]"; exit 1 ;;
  esac
done

cd "$(git rev-parse --show-toplevel)"
fail() { echo "✗ $*" >&2; exit 1; }
step() { echo; echo "▸ $*"; }
run()  { if [ "$DRY" = 1 ]; then echo "  [dry-run] $*"; else "$@"; fi; }

BRANCH=$(git branch --show-current)
RELEASE_BRANCH="main"
DEV_BRANCH="develop"

step "Vérifications Git"
[ -z "$(git status --porcelain)" ] || fail "Des modifications ne sont pas committées. Commit ou stash d'abord."
git fetch origin --tags --quiet
[ "$BRANCH" = "$RELEASE_BRANCH" ] || [ "$BRANCH" = "$DEV_BRANCH" ] || fail "Lance la release depuis '$DEV_BRANCH' ou '$RELEASE_BRANCH' (branche actuelle : $BRANCH)."
if [ "$BRANCH" = "$DEV_BRANCH" ]; then
  [ -z "$(git log "origin/$DEV_BRANCH..$DEV_BRANCH" --oneline 2>/dev/null)" ] || fail "'$DEV_BRANCH' a des commits non poussés. Fais un push d'abord."
  [ -z "$(git log "$DEV_BRANCH..origin/$DEV_BRANCH" --oneline 2>/dev/null)" ] || fail "'$DEV_BRANCH' est en retard sur origin. Fais un pull d'abord."
fi
[ -z "$(git log "$RELEASE_BRANCH..origin/$RELEASE_BRANCH" --oneline)" ] || fail "'$RELEASE_BRANCH' est en retard sur origin. Fais un pull d'abord."

CURRENT=$(node -p "require('./package.json').version")
if [[ "$BUMP" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  NEXT="$BUMP"
else
  NEXT=$(node -e "
    const [a,b,c]='$CURRENT'.split('.').map(Number);
    console.log({major:[a+1,0,0],minor:[a,b+1,0],patch:[a,b,c+1]}['$BUMP'].join('.'));")
fi
TAG="v$NEXT"
git rev-parse -q --verify "refs/tags/$TAG" >/dev/null && fail "Le tag $TAG existe déjà."
[ -z "$(git ls-remote --tags origin "refs/tags/$TAG")" ] || fail "Le tag $TAG existe déjà sur origin."

step "Contrôles de qualité"
pnpm typecheck
pnpm lint
pnpm test

REPO_URL=$(git remote get-url origin | sed -E 's#(git@github.com:|https://github.com/)##; s#\.git$##')
echo
echo "Release : $CURRENT → $NEXT  (tag $TAG)"
echo "Branche : $BRANCH$( [ "$BRANCH" = "$DEV_BRANCH" ] && echo " → fusion dans $RELEASE_BRANCH" )"
echo "Le push du tag lance le build de l'APK et met à jour le site (app-info.ts)."
if [ "$DRY" = 1 ]; then echo; echo "✓ Dry-run terminé : rien n'a été modifié."; exit 0; fi
if [ "$YES" != 1 ]; then
  read -r -p "Continuer ? [o/N] " ans
  [[ "$ans" =~ ^[oOyY]$ ]] || { echo "Annulé."; exit 1; }
fi

if [ "$BRANCH" = "$DEV_BRANCH" ]; then
  step "Fusion de $DEV_BRANCH dans $RELEASE_BRANCH"
  git checkout "$RELEASE_BRANCH"
  git merge --no-ff "$DEV_BRANCH" -m "chore: merge $DEV_BRANCH for release $TAG"
fi

if [ "$NEXT" != "$CURRENT" ]; then
  step "Version $NEXT"
  npm version "$NEXT" --no-git-tag-version --allow-same-version >/dev/null
  git add package.json
  git commit -m "chore(release): $TAG"
fi

step "Tag et push"
git tag -a "$TAG" -m "ToMo $NEXT"
git push --atomic origin "$RELEASE_BRANCH" "$TAG"

if [ "$BRANCH" = "$DEV_BRANCH" ]; then
  git checkout "$DEV_BRANCH"
  git merge --ff-only "$RELEASE_BRANCH"
  git push origin "$DEV_BRANCH"
fi

echo
echo "✓ $TAG poussé. Suivi du build : https://github.com/$REPO_URL/actions"
