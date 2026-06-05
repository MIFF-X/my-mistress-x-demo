# Headmistress Feature Plugin Bridge

The dashboard bridge shims that pointed at the canonical Head-Mistress plugin
bucket were removed after active import verification on 2026-05-31.

The remaining real Headmistress feature screens were moved to:

```text
frontend/features/head-mistress/
```

The canonical Head-Mistress plugin source files live in:

```text
frontend/plugins/headmistress/
```

Keep this folder empty of source modules. New reusable Headmistress plugin
modules should start in `frontend/plugins/headmistress/`; role-owned feature
screens should start in `frontend/features/head-mistress/`.
