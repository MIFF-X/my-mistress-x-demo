# Shared Ebooks Plugins

This bucket is the canonical frontend plugin home for ebook and guide-style
content modules. Use `ebooks` for new plugin work going forward.

Canonical source files:

```text
ebook-store.js
mistress-ebook.js
sub-servitude-guide.js
```

Compatibility bridge files:

```text
handbook-store.js
mistress-handbook.js
```

Old handbook-named paths remain as bridge shims until imports and routes are
fully migrated. Do not add new source logic under handbook names.

## Migration Progress

```text
Conflict-marker cleanup                 [##########] 100%
Ebook-named canonical modules           [##########] 100%
Handbook compatibility bridges          [##########] 100%
Feature bridge README cleanup           [########--]  80%
Runtime import verification             [##########] 100%
```
