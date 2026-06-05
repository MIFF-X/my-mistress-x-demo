import React from 'react';
import { Pressable, Text, View } from 'react-native';

export type StylingEngineDraftQueueItem = {
  id: string;
  title: string;
  source: string;
  category: string;
  tier: string;
  prompt: string;
  status: 'queued' | 'sent' | 'failed';
  createdAt: string;
};

const palette = {
  panel: '#0e0c07',
  card: '#080806',
  border: '#2a2208',
  gold: '#d4af37',
  goldLight: '#f9d976',
  goldDark: '#6f4c16',
  muted: '#9a927f',
  danger: '#b91c1c',
  success: '#22c55e',
};

function statusColor(status: StylingEngineDraftQueueItem['status']) {
  if (status === 'failed') return palette.danger;
  if (status === 'sent') return palette.success;
  return palette.gold;
}

function DraftActionButton({ label, onPress }: { label: string; onPress?: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={{ borderColor: palette.goldDark, borderWidth: 1, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 }}>
      <Text style={{ color: palette.gold, fontSize: 8, fontWeight: '900', textTransform: 'uppercase' }}>{label}</Text>
    </Pressable>
  );
}

export function MXGeneratedDraftQueuePanel({
  drafts,
  onClear,
  onSelectDraft,
  onRetryDraft,
  onRemoveDraft,
  onPromoteDraft,
  onBundleDraft,
}: {
  drafts: StylingEngineDraftQueueItem[];
  onClear: () => void;
  onSelectDraft?: (draft: StylingEngineDraftQueueItem) => void;
  onRetryDraft?: (draft: StylingEngineDraftQueueItem) => void;
  onRemoveDraft?: (draft: StylingEngineDraftQueueItem) => void;
  onPromoteDraft?: (draft: StylingEngineDraftQueueItem) => void;
  onBundleDraft?: (draft: StylingEngineDraftQueueItem) => void;
}) {
  if (!drafts.length) return null;

  return (
    <View style={{ borderColor: palette.border, borderWidth: 1, borderRadius: 16, backgroundColor: palette.panel, padding: 14, gap: 10 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <View style={{ gap: 2 }}>
          <Text style={{ color: palette.goldLight, fontSize: 16, fontWeight: '900' }}>Generated Drafts / Queue</Text>
          <Text style={{ color: palette.muted, fontSize: 10 }}>{drafts.length} local generator request{drafts.length === 1 ? '' : 's'} captured</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={onClear} style={{ borderColor: palette.goldDark, borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 }}>
          <Text style={{ color: palette.gold, fontSize: 9, fontWeight: '900' }}>Clear Queue</Text>
        </Pressable>
      </View>

      {drafts.slice(0, 8).map((draft, index) => (
        <View key={draft.id} style={{ borderColor: palette.border, borderWidth: 1, borderRadius: 12, backgroundColor: palette.card, padding: 11, gap: 7 }}>
          <Pressable accessibilityRole="button" onPress={() => onSelectDraft?.(draft)} style={{ gap: 7 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={{ color: palette.goldLight, fontSize: 13, fontWeight: '900' }}>{index + 1}. {draft.title}</Text>
                <Text style={{ color: palette.goldDark, fontSize: 9 }}>{draft.source} · {draft.category} · {draft.tier}</Text>
              </View>
              <Text style={{ color: statusColor(draft.status), fontSize: 9, fontWeight: '900', textTransform: 'uppercase' }}>{draft.status}</Text>
            </View>
            <Text numberOfLines={3} style={{ color: palette.muted, fontSize: 10, lineHeight: 15 }}>{draft.prompt}</Text>
            <Text style={{ color: palette.goldDark, fontSize: 8 }}>{new Date(draft.createdAt).toLocaleString()}</Text>
          </Pressable>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            <DraftActionButton label="Retry" onPress={() => onRetryDraft?.(draft)} />
            <DraftActionButton label="Promote" onPress={() => onPromoteDraft?.(draft)} />
            <DraftActionButton label="Bundle" onPress={() => onBundleDraft?.(draft)} />
            <DraftActionButton label="Remove" onPress={() => onRemoveDraft?.(draft)} />
          </View>
        </View>
      ))}
    </View>
  );
}

export default MXGeneratedDraftQueuePanel;
