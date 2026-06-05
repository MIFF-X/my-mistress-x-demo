#!/usr/bin/env python3
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parent

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

print('Plugin layout check passed.')
