#!/usr/bin/env python3
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parent
FRONTEND_ROOT = ROOT.parent

forbidden = [
    ROOT / 'communication',
    ROOT / 'mistress' / 'live-shows',
    ROOT / 'mistress' / 'voice-calls-ppm',
    ROOT.parent / 'shared' / 'communications',
]

errors = [str(path.relative_to(ROOT.parent)) for path in forbidden if path.exists()]

if errors:
    print('Layout check failed. Remove duplicate/legacy communication plugin locations:')
    for err in errors:
        print(f' - {err}')
    sys.exit(1)

required = [
    ROOT / 'headmistress',
    ROOT / 'shared' / 'communication',
    ROOT / 'mistress',
    ROOT / 'sub',
    ROOT / 'shared',
    ROOT / 'site',
]
missing = [str(path.relative_to(ROOT.parent)) for path in required if not path.exists()]
if missing:
    print('Layout check failed. Missing required plugin namespaces:')
    for m in missing:
        print(f' - {m}')
    sys.exit(1)

bridge_root = FRONTEND_ROOT / 'features' / 'plugins'
import_pattern = re.compile(r"""(?:from\s*|import\s*\(\s*|require\s*\(\s*)["']([^"']+)["']""")
source_suffixes = ('', '.js', '.jsx', '.ts', '.tsx', '/index.js', '/index.jsx', '/index.ts', '/index.tsx')
source_extensions = {'.js', '.jsx', '.ts', '.tsx'}

def target_exists(target: Path) -> bool:
    target_text = str(target)
    return any(Path(f'{target_text}{suffix}').exists() for suffix in source_suffixes)

def inside(path: Path, parent: Path) -> bool:
    try:
        path.relative_to(parent)
        return True
    except ValueError:
        return False

missing_targets = []
if bridge_root.exists():
    for source in bridge_root.rglob('*'):
        if source.suffix not in source_extensions or not source.is_file():
            continue

        content = source.read_text(encoding='utf-8')
        for match in import_pattern.finditer(content):
            specifier = match.group(1)
            if not specifier.startswith('.'):
                continue
            if '/plugins/' not in specifier.replace('\\', '/'):
                continue

            target = (source.parent / specifier).resolve()
            if not inside(target, ROOT) or not target_exists(target):
                missing_targets.append(
                    f'{source.relative_to(FRONTEND_ROOT)} -> {specifier}'
                )

if missing_targets:
    print('Layout check failed. Bridge imports point at missing plugin targets:')
    for err in missing_targets:
        print(f' - {err}')
    sys.exit(1)

print('Plugin layout and bridge import check passed.')
