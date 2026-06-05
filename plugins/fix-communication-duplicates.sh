#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
TARGET_ROOT="$ROOT/shared/communication"

fix_one() {
  local name="$1"
  local source="$ROOT/mistress/$name"
  local target="$TARGET_ROOT/$name"

  if [[ ! -d "$source" ]]; then
    return 0
  fi

  mkdir -p "$TARGET_ROOT"

  if [[ -d "$target" ]]; then
    echo "Duplicate found for $name: keeping shared/communication copy, deleting mistress copy"
    rm -rf "$source"
  else
    echo "Moving $name from mistress -> shared/communication"
    mv "$source" "$target"
  fi
}

fix_one "live-shows"
fix_one "voice-calls-ppm"

# Normalize legacy top-level communication location
if [[ -d "$ROOT/communication" ]]; then
  mkdir -p "$TARGET_ROOT"
  echo "Moving legacy plugins/communication/* -> plugins/shared/communication"
  for child in "$ROOT/communication"/*; do
    [[ -e "$child" ]] || continue
    base="$(basename "$child")"
    if [[ -e "$TARGET_ROOT/$base" ]]; then
      echo " - skipping existing $base"
    else
      mv "$child" "$TARGET_ROOT/$base"
      echo " - moved $base"
    fi
  done
  rmdir "$ROOT/communication" 2>/dev/null || true
fi

if [[ -d "$ROOT/../shared/communications" ]]; then
  mkdir -p "$TARGET_ROOT"
  echo "Moving legacy frontend/shared/communications -> plugins/shared/communication/legacy-shared-communications"
  mv "$ROOT/../shared/communications" "$TARGET_ROOT/legacy-shared-communications"
fi

echo "Done."
