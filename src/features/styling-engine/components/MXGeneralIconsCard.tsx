import React, { useMemo, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

type GeneralIconItem = {
  id: string;
  name: string;
  description: string;
  glyph: string;
};

const palette = {
  background: '#080806',
  panel: '#111008',
  cell: '#0e0c07',
  border: '#2a2208',
  borderStrong: '#3a2f10',
  gold: '#c8a84b',
  goldLight: '#f0d060',
  goldDark: '#7a6230',
  red: '#8b1a1a',
  muted: '#6a5820',
  green: '#22c55e',
};

const GENERAL_ICONS: GeneralIconItem[] = [
  { id: 'notifications', name: 'Notifications', description: 'Alert and notification bell for user updates and messages.', glyph: '🔔' },
  { id: 'favourite', name: 'Favourite', description: 'Gold star for marking favourite content, subs, or items.', glyph: '★' },
  { id: 'heart-like', name: 'Heart / Like', description: 'Heart icon for likes, devotion, and affection tracking.', glyph: '♡' },
  { id: 'note-memo', name: 'Note / Memo', description: 'Note and memo icon for written records and annotations.', glyph: '✎' },
  { id: 'add-to-rolodex', name: 'Add to Rolodex', description: 'Add a new sub or contact to the digital Rolodex.', glyph: '＋' },
  { id: 'view', name: 'View', description: 'Eye icon for viewing profiles, content, or records.', glyph: '◉' },
  { id: 'hidden', name: 'Hidden', description: 'Hidden/private mode. Content is not visible to others.', glyph: '⊘' },
  { id: 'online', name: 'Online', description: 'Green active dot. Shows a user is currently online.', glyph: '●' },
  { id: 'verified-user', name: 'Verified User', description: 'Verified badge for trusted and authenticated accounts.', glyph: '✓' },
  { id: 'privacy-lock', name: 'Privacy / Lock', description: 'Lock icon for private content, gated access and security.', glyph: '🔒' },
  { id: 'warning', name: 'Warning', description: 'Warning marker for alerts, flags and cautions.', glyph: '!' },
  { id: 'blocked', name: 'Blocked', description: 'Block icon for banned or restricted accounts.', glyph: '⊘' },
  { id: 'timeout', name: 'Timeout', description: 'Timed out or expiring access state.', glyph: '◷' },
  { id: 'expand', name: 'Expand', description: 'Expand / enlarge icon for full-screen or detail views.', glyph: '↗' },
  { id: 'folder', name: 'Folder', description: 'Folder icon for organising assets, packs and files.', glyph: '▣' },
  { id: 'settings', name: 'Settings', description: 'Settings cog for account preferences and configuration.', glyph: '⚙' },
  { id: 'search', name: 'Search', description: 'Search magnifier for finding subs, packs or content.', glyph: '⌕' },
  { id: 'download', name: 'Download', description: 'Download icon for saving assets, packs and files.', glyph: '↓' },
  { id: 'upload', name: 'Upload', description: 'Upload icon for sending assets or submitting content.', glyph: '↑' },
  { id: 'share', name: 'Share', description: 'Share icon for distributing content across surfaces.', glyph: '⌯' },
  { id: 'filter', name: 'Filter', description: 'Filter funnel for sorting and narrowing search results.', glyph: '▽' },
  { id: 'menu', name: 'Menu', description: 'Hamburger menu for navigation and sidebar access.', glyph: '☰' },
  { id: 'delete', name: 'Delete', description: 'Delete / trash icon for removing records and content.', glyph: '⌫' },
  { id: 'bookmark', name: 'Bookmark', description: 'Bookmark icon for saving and tagging favourite items.', glyph: '⌑' },
  { id: 'link', name: 'Link', description: 'Link chain icon for URLs, references and connections.', glyph: '∞' },
];

type MXGeneralIconsCardProps = {
  onDownloadFree?: () => void;
  onAddToCollection?: () => void;
};

function InfoRow({ glyph, label, sub }: { glyph: string; label: string; sub: string }) {
  return (
    <View style={{ width: '100%', borderColor: palette.border, borderWidth: 1, borderRadius: 7, paddingVertical: 7, paddingHorizontal: 8, backgroundColor: 'rgba(10,8,4,0.6)', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Text style={{ color: palette.gold, width: 18, textAlign: 'center', fontWeight: '900' }}>{glyph}</Text>
      <View style={{ flex: 1 }}>
        <Text style={{ color: palette.gold, fontSize: 9, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' }}>{label}</Text>
        <Text style={{ color: palette.muted, fontSize: 8 }}>{sub}</Text>
      </View>
    </View>
  );
}

export function MXGeneralIconsCard({ onDownloadFree, onAddToCollection }: MXGeneralIconsCardProps) {
  const [selectedIconId, setSelectedIconId] = useState<string | null>(null);
  const selectedIcon = useMemo(() => GENERAL_ICONS.find((icon) => icon.id === selectedIconId), [selectedIconId]);

  return (
    <View style={{ backgroundColor: palette.panel, borderColor: palette.borderStrong, borderWidth: 1, borderRadius: 12, overflow: 'hidden' }}>
      <View style={{ padding: 18, borderBottomColor: palette.border, borderBottomWidth: 1, alignItems: 'center', gap: 6 }}>
        <Text style={{ color: palette.goldDark, fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', fontWeight: '900' }}>Mistress-X Design System</Text>
        <Text style={{ color: palette.goldLight, fontSize: 26, letterSpacing: 2, fontWeight: '900' }}>General Icons</Text>
        <Text style={{ color: palette.red, fontSize: 12, letterSpacing: 2, fontWeight: '900' }}>( Free Pack )</Text>
        <Text style={{ color: palette.muted, fontSize: 9, letterSpacing: 2 }}>◆ Mistress-X Styling Plugins ◆</Text>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        <View style={{ flexBasis: 150, flexGrow: 1, borderRightColor: palette.border, borderRightWidth: 1, padding: 12, alignItems: 'center', gap: 10 }}>
          <View style={{ width: 76, height: 88, borderRadius: 18, borderColor: palette.goldDark, borderWidth: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#141008' }}>
            <Text style={{ color: palette.gold, fontSize: 26, fontWeight: '900' }}>MX</Text>
          </View>
          <View style={{ width: 74, height: 74, borderRadius: 999, backgroundColor: '#4a0a0a', borderColor: '#5a1010', borderWidth: 2, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: palette.gold, fontSize: 16, fontWeight: '900' }}>MX</Text>
            <Text style={{ color: '#7a1818', fontSize: 7, letterSpacing: 1 }}>SEALED</Text>
          </View>
          <InfoRow glyph="+" label="Free Pack" sub="100% free to use" />
          <InfoRow glyph="★" label="Standard" sub="Essential icon set" />
          <InfoRow glyph="✓" label="Included" sub="25 icons · PNG + SVG" />
          <InfoRow glyph="▦" label="Plugin Ready" sub="Perfect for UI kits" />
        </View>

        <View style={{ flexGrow: 4, flexBasis: 320, padding: 12 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
            {GENERAL_ICONS.map((icon) => (
              <Pressable
                key={icon.id}
                accessibilityRole="button"
                onPress={() => setSelectedIconId(icon.id)}
                style={{ width: 68, height: 68, borderRadius: 8, borderColor: palette.border, borderWidth: 1, backgroundColor: palette.cell, alignItems: 'center', justifyContent: 'center', padding: 5, gap: 4 }}
              >
                <Text style={{ color: icon.id === 'online' ? palette.green : palette.gold, fontSize: icon.glyph.length > 1 ? 16 : 20, fontWeight: '900' }}>{icon.glyph}</Text>
                <Text numberOfLines={2} style={{ color: palette.muted, fontSize: 7, textAlign: 'center', textTransform: 'uppercase', lineHeight: 9 }}>{icon.name}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      <View style={{ borderTopColor: palette.border, borderTopWidth: 1, padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <Text style={{ color: palette.muted, fontSize: 8, letterSpacing: 1.3, textTransform: 'uppercase' }}>Designed for creators · built for power · made to stand out</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5 }}>
          {['PNG', 'SVG', 'Figma', 'Webflow', 'WordPress'].map((format) => (
            <View key={format} style={{ borderColor: palette.border, borderWidth: 1, borderRadius: 4, paddingHorizontal: 7, paddingVertical: 3 }}>
              <Text style={{ color: palette.goldDark, fontSize: 8 }}>{format}</Text>
            </View>
          ))}
        </View>
      </View>

      <Modal visible={Boolean(selectedIcon)} transparent animationType="fade" onRequestClose={() => setSelectedIconId(null)}>
        <Pressable onPress={() => setSelectedIconId(null)} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.86)', alignItems: 'center', justifyContent: 'center', padding: 18 }}>
          <Pressable style={{ width: '100%', maxWidth: 360, backgroundColor: '#0f0d08', borderColor: palette.borderStrong, borderWidth: 1, borderRadius: 12, padding: 18, gap: 12 }}>
            {selectedIcon ? (
              <>
                <Text style={{ color: selectedIcon.id === 'online' ? palette.green : palette.gold, fontSize: 48, textAlign: 'center', fontWeight: '900' }}>{selectedIcon.glyph}</Text>
                <Text style={{ color: palette.gold, fontSize: 14, fontWeight: '900', textAlign: 'center', letterSpacing: 2, textTransform: 'uppercase' }}>{selectedIcon.name}</Text>
                <Text style={{ color: palette.muted, fontSize: 11, textAlign: 'center', lineHeight: 18 }}>{selectedIcon.description}</Text>
                <Pressable accessibilityRole="button" onPress={onDownloadFree} style={{ backgroundColor: palette.gold, borderRadius: 8, paddingVertical: 11 }}>
                  <Text style={{ color: palette.background, fontSize: 10, fontWeight: '900', textAlign: 'center', letterSpacing: 2 }}>Download Free</Text>
                </Pressable>
                <Pressable accessibilityRole="button" onPress={onAddToCollection} style={{ borderColor: palette.borderStrong, borderWidth: 1, borderRadius: 8, paddingVertical: 10 }}>
                  <Text style={{ color: palette.gold, fontSize: 10, fontWeight: '900', textAlign: 'center', letterSpacing: 2 }}>Add to Collection</Text>
                </Pressable>
              </>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

export default MXGeneralIconsCard;
