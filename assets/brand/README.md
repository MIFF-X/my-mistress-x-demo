# Brand Assets

This folder stores Mistress-X brand source assets and exported web/app variants.

## Asset groups

```text
MX pink signature with crown
MX gold emblem with crown
MX wordmark
MX monogram
MX seal / stamp marks
Transparent PNG exports
SVG/vector trace candidates
```

## Workflow

1. Add original source image into this folder or a subfolder.
2. Create transparent PNG exports.
3. Create favicon-ready variants in `frontend/assets/favicon/`.
4. Register reusable brand marks in the Styling Plugin registry.

## Copy It Rule

When Anna says `Copy it`, the goal is a precise trace/extraction of the supplied source image, not a loose redesign.

## Exact Trace Register

The current app-side slot register lives in:

```text
docs/EXACT_TRACE_ASSET_PIPELINE.md
react_native_space/features/assets/exactTraceAssetPipeline.ts
react_native_space/app/exact-trace-asset-pipeline.tsx
```

Use that route/register to keep MX signatures, crown emblems, badges, button packs, card decks, gift art, icons, and styling packs mapped before final PNG/GIF exports are committed.
