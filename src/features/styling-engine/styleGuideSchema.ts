export type StylingEnginePalette = {
  background: string;
  panel: string;
  gold: string;
  goldLight: string;
  goldDark: string;
  burgundy: string;
  red: string;
  cream: string;
  shadow: string;
};

export type StylingEngineStyleGuide = {
  id: string;
  engineName: 'Mistress-X Styling Engine';
  brandName: string;
  packPrefix: string;
  mood: string;
  qualityGoal: string;
  palette: StylingEnginePalette;
  typography: {
    display: string;
    body: string;
    signature: string;
  };
  output: {
    width: number;
    height: number;
    pngScale: number;
  };
  materials: {
    velvet: string;
    leather: string;
    satin: string;
    metal: string;
    wax: string;
  };
};

export const defaultStylingEngineStyleGuide: StylingEngineStyleGuide = {
  id: 'mistress-x-royal-noir-v1',
  engineName: 'Mistress-X Styling Engine',
  brandName: 'Mistress-X',
  packPrefix: 'MX',
  mood: 'luxury gothic authority, black leather, antique gold, burgundy and velvet accents',
  qualityGoal: 'crisp vector output for repeatable SVG/SVGO packs, with optional raster export for digital gifts and marketplace previews',
  palette: {
    background: '#050505',
    panel: '#11100d',
    gold: '#c9a24a',
    goldLight: '#f9d976',
    goldDark: '#6f4c16',
    burgundy: '#6f0f2a',
    red: '#b51d28',
    cream: '#f1dfad',
    shadow: '#000000',
  },
  typography: {
    display: 'Cinzel, Cormorant Garamond, serif',
    body: 'Montserrat, Inter, sans-serif',
    signature: 'Great Vibes, Allura, cursive',
  },
  output: {
    width: 1024,
    height: 1024,
    pngScale: 1,
  },
  materials: {
    velvet: 'deep soft radial shading, low sheen, plush dark red or black surface',
    leather: 'dark grain-inspired texture with subtle highlights and beveled edges',
    satin: 'smooth flowing highlight bands with soft contrast and pearled reflection',
    metal: 'layered gold gradient with light, mid, and bronze shadow stops',
    wax: 'radial burgundy seal with inner shadow, rim pressure, and stamped centre mark',
  },
};

export function resolveStylingEngineStyleGuide(input: Partial<StylingEngineStyleGuide> = {}): StylingEngineStyleGuide {
  return {
    ...defaultStylingEngineStyleGuide,
    ...input,
    palette: {
      ...defaultStylingEngineStyleGuide.palette,
      ...(input.palette || {}),
    },
    typography: {
      ...defaultStylingEngineStyleGuide.typography,
      ...(input.typography || {}),
    },
    output: {
      ...defaultStylingEngineStyleGuide.output,
      ...(input.output || {}),
    },
    materials: {
      ...defaultStylingEngineStyleGuide.materials,
      ...(input.materials || {}),
    },
  };
}
