import React from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

export type StylingEnginePackCardVariant = 'front-facing-card' | 'expanded-info-card';

export type StylingEnginePackCardDraft = {
  packName: string;
  packSubtitle: string;
  packTheme: string;
  assetTotal: string;
  price: string;
  contents: string;
  description: string;
};

const palette = {
  panel: '#0b0906',
  card: '#080806',
  border: '#2a2208',
  gold: '#d4af37',
  goldLight: '#f9d976',
  goldDark: '#6f4c16',
  muted: '#9a927f',
  cyan: '#00f5ff',
  pink: '#ff2da6',
};

const ICOMOON_FEATURES = [
  'SVG-first editor workflow',
  'Import SVG images',
  'Import SVG fonts',
  'Import .ico files',
  'Import WOFF / WOFF2',
  'Import TTF',
  'Import OTF',
  'Export icon fonts in all common font formats',
  'Export individual SVG images',
  'Export SVG sprites / symbol defs',
  'Export Web Component icons',
  'Export React-ready icons',
  'Export Vue-ready icons',
  'Export Elm-ready icons',
  'Export Flutter-ready icons',
  'Export PNG-24 previews',
  'Export indexed PNG previews',
  'Export favicon .ico',
  'Export CSH / Photoshop shape assets',
  'Multicolor icon fonts with ligatures',
  'Project/library organization for icon packs',
  'Mobile, touch-ready and installable PWA style workflow',
  'Copy/download quick-use icon library pattern',
];

const ICOMOON_COVERAGE_GROUPS = [
  { title: 'Import coverage', items: ['SVG images', 'SVG fonts', '.ico', 'WOFF', 'WOFF2', 'TTF', 'OTF'] },
  { title: 'Export coverage', items: ['Icon fonts', 'SVG images', 'SVG sprites', 'Symbol defs', 'Web Component', 'Elm', 'React', 'Vue', 'Flutter', 'Tiles'] },
  { title: 'Raster / app outputs', items: ['PNG-24', 'Indexed PNG', 'Favicon .ico', 'CSH / Photoshop shapes'] },
  { title: 'Mistress-X extras', items: ['SVGO cleanup', 'Tailwind-ready usage notes', 'Pack manifest', 'Front card', 'Expanded info card', 'Commercial licence notes'] },
];

function Field({ label, value, onChangeText, multiline }: { label: string; value: string; onChangeText: (value: string) => void; multiline?: boolean }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ color: palette.gold, fontSize: 10, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        placeholderTextColor="#6f6240"
        style={{
          borderColor: palette.border,
          borderWidth: 1,
          borderRadius: 12,
          backgroundColor: palette.card,
          color: palette.goldLight,
          padding: 12,
          minHeight: multiline ? 88 : undefined,
          textAlignVertical: multiline ? 'top' : 'center',
          fontSize: 12,
        }}
      />
    </View>
  );
}

function VariantButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected: active }} onPress={onPress} style={{ borderColor: active ? palette.gold : palette.goldDark, borderWidth: 1, borderRadius: 999, backgroundColor: active ? '#181207' : '#0d0d0d', paddingHorizontal: 12, paddingVertical: 7 }}>
      <Text style={{ color: active ? palette.goldLight : palette.muted, fontSize: 9, fontWeight: '900', textTransform: 'uppercase' }}>{label}</Text>
    </Pressable>
  );
}

function IcoMoonFeaturePill({ label }: { label: string }) {
  return (
    <View style={{ borderColor: palette.goldDark, borderWidth: 1, borderRadius: 999, backgroundColor: '#0d0d0d', paddingHorizontal: 9, paddingVertical: 5 }}>
      <Text style={{ color: palette.goldLight, fontSize: 8, fontWeight: '900' }}>{label}</Text>
    </View>
  );
}

function CoverageCard({ title, items }: { title: string; items: string[] }) {
  return (
    <View style={{ flexGrow: 1, flexBasis: 210, borderColor: palette.border, borderWidth: 1, borderRadius: 12, backgroundColor: palette.card, padding: 10, gap: 6 }}>
      <Text style={{ color: palette.gold, fontSize: 10, fontWeight: '900', textTransform: 'uppercase' }}>{title}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5 }}>
        {items.map((item) => (
          <View key={item} style={{ borderColor: palette.goldDark, borderWidth: 1, borderRadius: 999, paddingHorizontal: 7, paddingVertical: 3 }}>
            <Text style={{ color: palette.muted, fontSize: 8, fontWeight: '800' }}>{item}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export function MXPackCardGeneratorPanel({
  draft,
  variant,
  onChangeDraft,
  onChangeVariant,
  onGenerateFrontCard,
  onGenerateExpandedCard,
}: {
  draft: StylingEnginePackCardDraft;
  variant: StylingEnginePackCardVariant;
  onChangeDraft: (patch: Partial<StylingEnginePackCardDraft>) => void;
  onChangeVariant: (variant: StylingEnginePackCardVariant) => void;
  onGenerateFrontCard: () => void;
  onGenerateExpandedCard: () => void;
}) {
  const contentLines = draft.contents.split('\n').filter(Boolean);
  return (
    <View style={{ borderColor: palette.goldDark, borderWidth: 1, borderRadius: 22, backgroundColor: palette.panel, padding: 16, gap: 14 }}>
      <View style={{ gap: 3 }}>
        <Text style={{ color: palette.gold, fontSize: 11, fontWeight: '900', letterSpacing: 2, textTransform: 'uppercase' }}>Pack Card Generator</Text>
        <Text style={{ color: palette.goldLight, fontSize: 20, fontWeight: '900' }}>Front Card + Expanded Info Card</Text>
        <Text style={{ color: palette.muted, fontSize: 12, lineHeight: 17 }}>
          Create a premium front-facing card with the little box/product feel, then generate the expanded details card with contents, license, counts and selling points.
        </Text>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <VariantButton label="Front-facing card" active={variant === 'front-facing-card'} onPress={() => onChangeVariant('front-facing-card')} />
        <VariantButton label="Expanded info card" active={variant === 'expanded-info-card'} onPress={() => onChangeVariant('expanded-info-card')} />
      </View>

      <View style={{ gap: 10 }}>
        <Field label="Pack / Set Name" value={draft.packName} onChangeText={(packName) => onChangeDraft({ packName })} />
        <Field label="Subtitle / Family" value={draft.packSubtitle} onChangeText={(packSubtitle) => onChangeDraft({ packSubtitle })} />
        <Field label="Theme / Badge" value={draft.packTheme} onChangeText={(packTheme) => onChangeDraft({ packTheme })} />
        <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
          <View style={{ flex: 1, minWidth: 130 }}><Field label="Total Assets" value={draft.assetTotal} onChangeText={(assetTotal) => onChangeDraft({ assetTotal })} /></View>
          <View style={{ flex: 1, minWidth: 130 }}><Field label="Price" value={draft.price} onChangeText={(price) => onChangeDraft({ price })} /></View>
        </View>
        <Field label="Contents / Counts" value={draft.contents} onChangeText={(contents) => onChangeDraft({ contents })} multiline />
        <Field label="Expanded Description" value={draft.description} onChangeText={(description) => onChangeDraft({ description })} multiline />
      </View>

      <View style={{ borderColor: palette.border, borderWidth: 1, borderRadius: 16, backgroundColor: palette.card, padding: 12, gap: 10 }}>
        <Text style={{ color: palette.goldLight, fontSize: 15, fontWeight: '900' }}>{draft.packName || 'Pack Name'}</Text>
        <Text style={{ color: palette.cyan, fontSize: 11, fontWeight: '900', textTransform: 'uppercase' }}>{draft.packTheme || 'Theme Badge'}</Text>
        <Text style={{ color: palette.muted, fontSize: 11 }}>{draft.packSubtitle || 'Family Pack'}</Text>
        <Text style={{ color: palette.gold, fontSize: 13, fontWeight: '900' }}>{draft.assetTotal || '0+'} Premium Assets · {draft.price || '$0.00'}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {contentLines.slice(0, 6).map((line, index) => (
            <View key={`${line}-${index}`} style={{ borderColor: palette.goldDark, borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 }}>
              <Text style={{ color: palette.goldLight, fontSize: 8 }}>{line}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ borderColor: palette.border, borderWidth: 1, borderRadius: 16, backgroundColor: '#050505', padding: 12, gap: 8 }}>
        <Text style={{ color: palette.gold, fontSize: 11, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' }}>IcoMoon-inspired Import / Export Coverage</Text>
        <Text style={{ color: palette.muted, fontSize: 10, lineHeight: 15 }}>
          These are workflow/reference features for the Mistress-X Styling Engine, not copied assets: import SVGs and fonts, organize libraries, generate premium packs, then export crisp web/app formats.
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {ICOMOON_COVERAGE_GROUPS.map((group) => <CoverageCard key={group.title} title={group.title} items={group.items} />)}
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {ICOMOON_FEATURES.map((feature) => <IcoMoonFeaturePill key={feature} label={feature} />)}
        </View>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <Pressable accessibilityRole="button" onPress={onGenerateFrontCard} style={{ flexGrow: 1, flexBasis: 190, backgroundColor: palette.gold, borderRadius: 12, paddingVertical: 12 }}>
          <Text style={{ color: '#050505', textAlign: 'center', fontWeight: '900', letterSpacing: 1.2 }}>Generate Front Card</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={onGenerateExpandedCard} style={{ flexGrow: 1, flexBasis: 190, borderColor: palette.goldDark, borderWidth: 1, borderRadius: 12, paddingVertical: 12 }}>
          <Text style={{ color: palette.goldLight, textAlign: 'center', fontWeight: '900', letterSpacing: 1.2 }}>Generate Expanded Info</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default MXPackCardGeneratorPanel;
