# Astro Icon Reference Notes for MX Icon Forge

Source:
- https://github.com/natemoo-re/astro-icon
- Uploaded archive: astro-icon-main.zip

Use this only as architecture inspiration for the MX Icon Forge pipeline.

## Useful ideas to adapt

- Local SVG icons can live in a project folder and be referenced by name.
- SVG files can be optimised before use.
- Iconify packages can be detected and included from installed `@iconify-json/*` packages.
- Dynamic icon names can point to local icons or external icon set names.
- Repeated icons can be rendered through symbol/use sprite behaviour to reduce duplicate markup.
- Generated type definitions or registry maps can make dynamic icon references safer.
- Icons can accept size, title, description, width and height.
- Icons can inherit color through `currentColor` when converted safely.

## MX translation

The MX Icon Forge should provide:

1. Add Icons
   - Upload local SVG files.
   - Import approved icon packs.
   - Generate original MX icon concepts.

2. Organise
   - Collections, tags, categories, roles, themes and visibility settings.

3. Edit
   - Rename, recolor, optimise, preview, assign active/inactive color modes.

4. Download
   - SVG, SVG sprite, icon font, PNG, favicon, React component, Vue component and metadata JSON.

5. Share and Save
   - Save to Headmistress library.
   - Publish to app market.
   - Attach a pack to chat, dashboards, cards, sticker albums, live overlays and plugin menus.

## Implementation stance

Do not copy code directly. Build a platform-native MX pipeline that uses the same clean ideas: local SVGs, safe optimisation, sprite output, dynamic registry names and generated metadata.
