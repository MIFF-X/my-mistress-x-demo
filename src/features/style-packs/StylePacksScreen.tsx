import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { mxTheme } from '../../theme/mxTheme';
import { MXStylingEngineWithAdaptersScreen } from '../styling-engine/MXStylingEngineWithAdaptersScreen';
import {
  filterStylePacks,
  formatStylePackPrice,
  INITIAL_INSTALLED_STYLE_PACKS,
  InstalledStylePack,
  STYLE_PACKS,
  STYLE_PLUGIN_PACKS,
  StylePack,
  StylePackKind,
} from './stylePacksModel';

type StyleTab = StylePackKind | 'all' | 'installed';

const STYLE_TABS: { id: StyleTab; label: string }[] = [
  { id: 'all', label: 'Marketplace' },
  { id: 'free', label: 'Free' },
  { id: 'paid', label: 'Paid' },
  { id: 'custom', label: 'Custom' },
  { id: 'installed', label: 'Installed' },
];

function panelStyle(borderColor = mxTheme.colors.border) {
  return {
    backgroundColor: '#101014',
    borderColor,
    borderWidth: 1,
    borderRadius: mxTheme.radius.lg,
    padding: mxTheme.spacing.md,
  };
}

function MiniPreview({ pack }: { pack: StylePack }) {
  return (
    <View style={{ backgroundColor: pack.accent, borderColor: pack.tone, borderWidth: 1, borderRadius: 12, padding: 10, height: 104, gap: 8 }}>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        <View style={{ backgroundColor: pack.tone, borderRadius: 999, height: 18, width: 18 }} />
        <View style={{ backgroundColor: '#ffffff22', borderRadius: 999, height: 8, flex: 1, marginTop: 5 }} />
      </View>
      <View style={{ height: 36, borderRadius: 8, backgroundColor: '#00000066', borderColor: pack.secondary, borderWidth: 1 }} />
      <View style={{ flexDirection: 'row', gap: 6 }}>
        <View style={{ height: 8, flex: 1, borderRadius: 999, backgroundColor: pack.secondary }} />
        <View style={{ height: 8, flex: 1, borderRadius: 999, backgroundColor: '#ffffff22' }} />
      </View>
    </View>
  );
}

function StylePackCard({
  pack,
  active,
  onApply,
  onRequest,
}: {
  pack: StylePack;
  active: boolean;
  onApply: (pack: StylePack) => void;
  onRequest: (pack: StylePack) => void;
}) {
  const locked = pack.status === 'locked';

  return (
    <View style={{ ...panelStyle(active ? pack.tone : '#2a2634'), flexGrow: 1, flexBasis: 240, maxWidth: 420, gap: 10 }}>
      <MiniPreview pack={pack} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: mxTheme.colors.text, fontSize: 17, fontWeight: '900' }}>{pack.title}</Text>
          <Text style={{ color: mxTheme.colors.muted, fontSize: 11, marginTop: 3 }}>by {pack.creator}</Text>
        </View>
        <View style={{ backgroundColor: locked ? '#2a1d08' : `${pack.tone}22`, borderRadius: 999, paddingVertical: 5, paddingHorizontal: 8 }}>
          <Text style={{ color: locked ? '#f5c542' : pack.tone, fontSize: 11, fontWeight: '900' }}>{formatStylePackPrice(pack)}</Text>
        </View>
      </View>
      <Text style={{ color: '#c9c9d1', fontSize: 12, lineHeight: 17 }}>{pack.description}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {pack.features.map((feature) => (
          <View key={feature} style={{ backgroundColor: '#1b1b23', borderRadius: 999, paddingVertical: 5, paddingHorizontal: 8 }}>
            <Text style={{ color: '#ddd', fontSize: 10, fontWeight: '800' }}>{feature}</Text>
          </View>
        ))}
      </View>
      <Pressable
        onPress={() => locked ? onRequest(pack) : onApply(pack)}
        style={{ backgroundColor: locked ? '#241b08' : pack.tone, borderRadius: 10, padding: 10, marginTop: 2 }}
      >
        <Text style={{ color: locked ? '#f5c542' : '#000', textAlign: 'center', fontWeight: '900' }}>
          {active ? 'Active' : locked ? 'Request Unlock' : 'Apply Style'}
        </Text>
      </Pressable>
    </View>
  );
}

function PluginPackGrid({ onOpenStylingEngine }: { onOpenStylingEngine: () => void }) {
  return (
    <View style={{ gap: 10 }}>
      <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900' }}>Style Plugin Packs</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {STYLE_PLUGIN_PACKS.map((pack) => {
          const isStylingEngine = pack.id === 'styling-engine';
          return (
            <View key={pack.id} style={{ ...panelStyle(pack.tone), flexGrow: 1, flexBasis: 180, gap: 8 }}>
              <Text style={{ color: pack.tone, fontSize: 22, fontWeight: '900' }}>{pack.glyph}</Text>
              <Text style={{ color: mxTheme.colors.text, fontWeight: '900' }}>{pack.title}</Text>
              <Text style={{ color: mxTheme.colors.muted, fontSize: 12 }}>{pack.count}+ plugins</Text>
              <Pressable onPress={isStylingEngine ? onOpenStylingEngine : undefined} style={{ backgroundColor: '#191923', borderRadius: 10, padding: 9 }}>
                <Text style={{ color: '#ddd', fontSize: 12, textAlign: 'center', fontWeight: '900' }}>{isStylingEngine ? 'Open Engine' : 'View'}</Text>
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function InstalledStylesTable({
  installed,
  activeStyleId,
  onActivate,
  onRemove,
}: {
  installed: InstalledStylePack[];
  activeStyleId: string;
  onActivate: (styleId: string) => void;
  onRemove: (styleId: string) => void;
}) {
  return (
    <View style={{ ...panelStyle('#2a2634'), gap: 8 }}>
      <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900' }}>Installed Styles & Plugins</Text>
      {installed.map((item) => {
        const active = item.id === activeStyleId;
        return (
          <View key={item.id} style={{ borderTopColor: '#252033', borderTopWidth: 1, paddingVertical: 10, gap: 7 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <View style={{ flex: 1, minWidth: 180 }}>
                <Text style={{ color: mxTheme.colors.text, fontWeight: '900' }}>{item.name}</Text>
                <Text style={{ color: mxTheme.colors.muted, fontSize: 11, marginTop: 3 }}>{item.type}</Text>
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                <View style={{ backgroundColor: active ? '#123d2e' : '#222', borderRadius: 999, paddingVertical: 6, paddingHorizontal: 9 }}>
                  <Text style={{ color: active ? mxTheme.colors.success : '#aaa', fontSize: 10, fontWeight: '900' }}>{active ? 'ACTIVE' : item.status}</Text>
                </View>
                <Pressable onPress={() => onActivate(item.id)} style={{ backgroundColor: '#191923', borderRadius: 9, paddingVertical: 7, paddingHorizontal: 9 }}>
                  <Text style={{ color: '#ddd', fontSize: 11, fontWeight: '900' }}>Apply</Text>
                </Pressable>
                <Pressable onPress={() => onRemove(item.id)} style={{ backgroundColor: '#2a0d18', borderRadius: 9, paddingVertical: 7, paddingHorizontal: 9 }}>
                  <Text style={{ color: '#ff9abf', fontSize: 11, fontWeight: '900' }}>Remove</Text>
                </Pressable>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

export function StylePacksScreen() {
  const [activeTab, setActiveTab] = useState<StyleTab>('all');
  const [activeStyleId, setActiveStyleId] = useState('dark-royalty');
  const [installed, setInstalled] = useState(INITIAL_INSTALLED_STYLE_PACKS);
  const [customPrompt, setCustomPrompt] = useState('');
  const [showStylingEngine, setShowStylingEngine] = useState(false);
  const [notice, setNotice] = useState('Style marketplace scaffold is running locally. Purchases and theme persistence are next.');

  const visiblePacks = useMemo(
    () => activeTab === 'installed' ? [] : filterStylePacks(STYLE_PACKS, activeTab),
    [activeTab],
  );
  const activePack = useMemo(() => STYLE_PACKS.find((pack) => pack.id === activeStyleId) || STYLE_PACKS[0], [activeStyleId]);

  function applyPack(pack: StylePack) {
    setActiveStyleId(pack.id);
    setInstalled((current) => {
      const exists = current.some((item) => item.id === pack.id);
      const next = current.map((item) => ({
        ...item,
        status: item.id === pack.id ? 'ACTIVE' as const : item.status === 'ACTIVE' ? 'INSTALLED' as const : item.status,
      }));

      if (exists) return next;
      return [
        { id: pack.id, name: pack.title, type: pack.kind === 'custom' ? 'Custom Style' : `${pack.kind === 'paid' ? 'Premium' : 'Free'} Style`, status: 'ACTIVE', tone: pack.tone },
        ...next,
      ];
    });
    setNotice(`${pack.title} is active for this session. Persistent theme application is a backend follow-up.`);
  }

  function requestUnlock(pack: StylePack) {
    setNotice(`${pack.title} unlock request is scaffolded. Licensing, checkout, and receipts still need backend wiring.`);
  }

  function removeInstalled(styleId: string) {
    setInstalled((current) => current.filter((item) => item.id !== styleId));
    if (styleId === activeStyleId) setActiveStyleId('dark-royalty');
    setNotice('Installed style row removed from the local scaffold table.');
  }

  function activateInstalled(styleId: string) {
    setActiveStyleId(styleId);
    setInstalled((current) => current.map((item) => ({
      ...item,
      status: item.id === styleId ? 'ACTIVE' : item.status === 'ACTIVE' ? 'INSTALLED' : item.status,
    })));
    setNotice('Installed style activated for this session.');
  }

  function quickAction(action: string) {
    if (action === 'Duplicate Active Style') {
      const duplicateId = `${activePack.id}-copy`;
      setInstalled((current) => [
        { id: duplicateId, name: `${activePack.title} Copy`, type: 'Custom Style', status: 'SAVED', tone: activePack.tone },
        ...current,
      ]);
      setNotice('Duplicated the active style into the installed scaffold table.');
      return;
    }

    if (action === 'Reset to Default') {
      setActiveStyleId('dark-royalty');
      setNotice('Active style reset to Dark Royalty for this session.');
      return;
    }

    setNotice(`${action} is scaffolded. File upload/download and audit logging are backend follow-ups.`);
  }

  function generateCustomBrief() {
    const prompt = customPrompt.trim();
    if (!prompt) {
      setNotice('Describe the custom style direction before generating a brief.');
      return;
    }

    setInstalled((current) => [
      { id: `brief-${Date.now()}`, name: 'AI Style Brief', type: 'Custom Style', status: 'SAVED', tone: '#2dd4bf' },
      ...current,
    ]);
    setCustomPrompt('');
    setNotice('Custom style brief saved locally. Real AI generation and review queue wiring are next.');
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: mxTheme.colors.background }} contentContainerStyle={{ padding: mxTheme.spacing.lg, gap: mxTheme.spacing.md }}>
      <View>
        <Text style={{ color: mxTheme.colors.text, fontSize: 26, fontWeight: '900' }}>Style Packs</Text>
        <Text style={{ color: '#d4af37', marginTop: 6 }}>Choose a style pack, manage installed plugins, or build a custom brand direction.</Text>
      </View>

      {notice ? <Text style={{ color: mxTheme.colors.success }}>{notice}</Text> : null}

      <View style={{ ...panelStyle(activePack.tone), gap: 10 }}>
        <Text style={{ color: mxTheme.colors.muted, fontSize: 11, fontWeight: '900' }}>ACTIVE STYLE</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          <View style={{ flex: 1, minWidth: 220 }}>
            <Text style={{ color: mxTheme.colors.text, fontSize: 22, fontWeight: '900' }}>{activePack.title}</Text>
            <Text style={{ color: mxTheme.colors.muted, marginTop: 4 }}>{activePack.description}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {[activePack.tone, activePack.accent, activePack.secondary].map((color) => (
              <View key={color} style={{ width: 34, height: 34, borderRadius: 999, backgroundColor: color, borderColor: '#ffffff44', borderWidth: 1 }} />
            ))}
          </View>
        </View>
      </View>

      <View style={{ ...panelStyle('#d4af37'), gap: 10 }}>
        <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900' }}>Mistress-X Styling Engine</Text>
        <Text style={{ color: mxTheme.colors.muted, fontSize: 12, lineHeight: 18 }}>
          Open the generator marketplace for SVG/SVGO packs, premium menu-card flyers, digital gift packs and marketplace manifests. Now includes the MX Magnetic Connector adapter registry for Iconify, IcoMoon, unplugin and cross-runtime export coverage.
        </Text>
        <Pressable onPress={() => setShowStylingEngine((current) => !current)} style={{ backgroundColor: '#d4af37', borderRadius: 10, padding: 11 }}>
          <Text style={{ color: '#000', textAlign: 'center', fontWeight: '900' }}>{showStylingEngine ? 'Hide Styling Engine + Magnetic Connectors' : 'Open Styling Engine + Magnetic Connectors'}</Text>
        </Pressable>
      </View>

      {showStylingEngine ? (
        <MXStylingEngineWithAdaptersScreen
          onCartAction={(action) => setNotice(`Styling Engine ${action.action.replace('-', ' ')} captured for ${action.packId}.`)}
        />
      ) : null}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {STYLE_TABS.map((tab) => {
          const active = tab.id === activeTab;
          return (
            <Pressable
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={{ backgroundColor: active ? '#2f155f' : '#111', borderColor: active ? '#8b5cf6' : mxTheme.colors.border, borderWidth: 1, borderRadius: 999, paddingVertical: 9, paddingHorizontal: 12 }}
            >
              <Text style={{ color: active ? '#fff' : mxTheme.colors.muted, fontSize: 12, fontWeight: '900' }}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {activeTab === 'installed' ? (
        <InstalledStylesTable installed={installed} activeStyleId={activeStyleId} onActivate={activateInstalled} onRemove={removeInstalled} />
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {visiblePacks.map((pack) => (
            <StylePackCard key={pack.id} pack={pack} active={pack.id === activeStyleId} onApply={applyPack} onRequest={requestUnlock} />
          ))}
        </View>
      )}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>
        <View style={{ ...panelStyle('#8b5cf6'), flex: 1.3, minWidth: 280, gap: 10 }}>
          <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900' }}>AI Style Designer</Text>
          <Text style={{ color: mxTheme.colors.muted, fontSize: 12 }}>Describe a visual direction and save a reusable custom style brief.</Text>
          <TextInput
            value={customPrompt}
            onChangeText={setCustomPrompt}
            placeholder="Example: premium gold dashboard, compact cards, calm reports"
            placeholderTextColor="#777"
            multiline
            style={{ backgroundColor: '#050508', borderColor: '#2a2634', borderWidth: 1, color: '#fff', borderRadius: 10, padding: 12, minHeight: 86 }}
          />
          <Pressable onPress={generateCustomBrief} style={{ backgroundColor: '#8b5cf6', borderRadius: 10, padding: 11 }}>
            <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '900' }}>Generate Brief</Text>
          </Pressable>
        </View>

        <View style={{ ...panelStyle('#d4af37'), flex: 1, minWidth: 260, gap: 10 }}>
          <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900' }}>Quick Style Actions</Text>
          {['Import Style Pack', 'Export Current Style', 'Duplicate Active Style', 'Reset to Default'].map((action) => (
            <Pressable key={action} onPress={() => quickAction(action)} style={{ backgroundColor: '#181821', borderRadius: 10, padding: 11 }}>
              <Text style={{ color: '#eee', fontWeight: '900' }}>{action}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <PluginPackGrid onOpenStylingEngine={() => setShowStylingEngine(true)} />
    </ScrollView>
  );
}
