# Mistress-X Favicon Integration Guide

Branch: `feature/abacus-ai-build`

## Current status

The following app entry files were checked and were not present on this branch:

```text
index.html
frontend/index.html
public/index.html
app.json
package.json
```

That means the favicon cannot be safely wired into a runtime entry file yet without guessing.

## Files already committed

```text
frontend/assets/favicon/favicon.svg
frontend/assets/favicon/site.webmanifest
frontend/assets/favicon/README.md
```

## Binary files generated locally but still need upload/commit

```text
frontend/assets/favicon/favicon.ico
frontend/assets/favicon/favicon-16x16.png
frontend/assets/favicon/favicon-32x32.png
frontend/assets/favicon/apple-touch-icon.png
frontend/assets/favicon/android-chrome-192x192.png
frontend/assets/favicon/android-chrome-512x512.png
frontend/assets/brand/mx-pink-signature-crown-transparent.png
frontend/assets/brand/mx-gold-crown-emblem-transparent.png
```

## Standard HTML head snippet

When an HTML entry point exists, add this inside `<head>`:

```html
<link rel="icon" href="/assets/favicon/favicon.svg" type="image/svg+xml" />
<link rel="alternate icon" href="/assets/favicon/favicon.ico" />
<link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon/favicon-16x16.png" />
<link rel="apple-touch-icon" href="/assets/favicon/apple-touch-icon.png" />
<link rel="manifest" href="/assets/favicon/site.webmanifest" />
<meta name="theme-color" content="#08070d" />
```

## Expo app config snippet

When an Expo `app.json` or `app.config.js` exists, wire icons like this:

```json
{
  "expo": {
    "name": "Mistress-X",
    "slug": "mistress-x",
    "icon": "./frontend/assets/favicon/android-chrome-512x512.png",
    "web": {
      "favicon": "./frontend/assets/favicon/favicon.ico"
    }
  }
}
```

## Next step

Create or locate the actual app entry/manifest, then wire these references into that file.

## Progress

```text
Entry path audit                     ██████████ 100%
HTML head snippet created            ██████████ 100%
Expo config snippet created          ██████████ 100%
Runtime favicon wired                ░░░░░░░░░░ waiting for app entry file
```
