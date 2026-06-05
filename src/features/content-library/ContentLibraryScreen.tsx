import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { mxTheme } from '../../theme/mxTheme';
import {
  ARCHIVE_RULE_PLANS,
  CONTENT_LIBRARY_ITEMS,
  CONTENT_LIBRARY_METRICS,
  CONTENT_LIBRARY_TABS,
  CONTENT_PACK_PLANS,
  DROP_CALENDAR_PLANS,
  PLAYLIST_PLANS,
  type ArchiveRulePlan,
  type ContentLibraryItem,
  type ContentLibraryTab,
  type ContentPackPlan,
  type DropCalendarPlan,
  type PlaylistPlan,
} from './contentLibraryModel';

function panelStyle(borderColor = mxTheme.colors.border) {
  return {
    backgroundColor: '#0f0f14',
    borderColor,
    borderWidth: 1,
    borderRadius: mxTheme.radius.lg,
    padding: mxTheme.spacing.md,
  };
}

function StatusPill({ label, tone }: { label: string; tone: string }) {
  return (
    <View style={{ backgroundColor: `${tone}22`, borderColor: tone, borderWidth: 1, borderRadius: 999, paddingVertical: 5, paddingHorizontal: 8 }}>
      <Text style={{ color: tone, fontSize: 10, fontWeight: '900' }}>{label.toUpperCase()}</Text>
    </View>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={{ gap: 4 }}>
      <Text style={{ color: mxTheme.colors.text, fontSize: 21, fontWeight: '900' }}>{title}</Text>
      <Text style={{ color: mxTheme.colors.muted, fontSize: 13, lineHeight: 18 }}>{subtitle}</Text>
    </View>
  );
}

function BulletList({ items, tone }: { items: string[]; tone: string }) {
  return (
    <View style={{ gap: 6 }}>
      {items.map((item) => (
        <View key={item} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
          <View style={{ width: 7, height: 7, borderRadius: 999, backgroundColor: tone, marginTop: 6 }} />
          <Text style={{ color: '#ddd', fontSize: 12, lineHeight: 17, flex: 1 }}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function MetricCard({ label, value, detail, tone }: { label: string; value: string; detail: string; tone: string }) {
  return (
    <View style={{ ...panelStyle(`${tone}66`), flex: 1, minWidth: 180, gap: 6 }}>
      <Text style={{ color: mxTheme.colors.muted, fontSize: 11, fontWeight: '900' }}>{label}</Text>
      <Text style={{ color: mxTheme.colors.text, fontSize: 25, fontWeight: '900' }}>{value}</Text>
      <Text style={{ color: tone, fontSize: 12, fontWeight: '800' }}>{detail}</Text>
    </View>
  );
}

function LibraryCard({
  item,
  active,
  onSelect,
}: {
  item: ContentLibraryItem;
  active: boolean;
  onSelect: (item: ContentLibraryItem) => void;
}) {
  return (
    <Pressable onPress={() => onSelect(item)} style={{ ...panelStyle(active ? item.tone : '#2a2a33'), flexGrow: 1, flexBasis: 245, maxWidth: 420, gap: 9 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: item.tone, fontSize: 11, fontWeight: '900' }}>{item.badge}</Text>
          <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900', marginTop: 3 }}>{item.title}</Text>
        </View>
        <StatusPill label={item.status} tone={item.tone} />
      </View>
      <Text style={{ color: '#d7d7de', fontSize: 12, lineHeight: 18 }}>{item.summary}</Text>
      <Text style={{ color: mxTheme.colors.muted, fontSize: 11 }}>Access: {item.access}</Text>
      <Text style={{ color: mxTheme.colors.muted, fontSize: 11 }}>Metric: {item.metric}</Text>
    </Pressable>
  );
}

function PlaylistCard({ playlist }: { playlist: PlaylistPlan }) {
  return (
    <View style={{ ...panelStyle(playlist.tone), flexGrow: 1, flexBasis: 240, maxWidth: 420, gap: 8 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: playlist.tone, fontSize: 11, fontWeight: '900' }}>{playlist.owner}</Text>
          <Text style={{ color: mxTheme.colors.text, fontSize: 17, fontWeight: '900', marginTop: 3 }}>{playlist.title}</Text>
        </View>
        <StatusPill label={playlist.status} tone={playlist.tone} />
      </View>
      <Text style={{ color: '#ddd', fontSize: 12, lineHeight: 18 }}>Flow: {playlist.suggestionFlow}</Text>
      <Text style={{ color: '#ddd', fontSize: 12, lineHeight: 18 }}>Approval: {playlist.approvalRule}</Text>
      <Text style={{ color: playlist.tone, fontSize: 11, fontWeight: '900' }}>{playlist.analytics}</Text>
    </View>
  );
}

function DropCard({ drop }: { drop: DropCalendarPlan }) {
  return (
    <View style={{ ...panelStyle(drop.tone), flexGrow: 1, flexBasis: 220, maxWidth: 380, gap: 8 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: drop.tone, fontSize: 11, fontWeight: '900' }}>{drop.category}</Text>
          <Text style={{ color: mxTheme.colors.text, fontSize: 17, fontWeight: '900', marginTop: 3 }}>{drop.title}</Text>
        </View>
        <StatusPill label={drop.status} tone={drop.tone} />
      </View>
      <Text style={{ color: '#ddd', fontSize: 12, lineHeight: 18 }}>When: {drop.dateLabel}</Text>
      <Text style={{ color: '#ddd', fontSize: 12, lineHeight: 18 }}>Destination: {drop.destination}</Text>
      <Text style={{ color: drop.tone, fontSize: 11, fontWeight: '900' }}>{drop.reminder}</Text>
    </View>
  );
}

function PackCard({ pack }: { pack: ContentPackPlan }) {
  return (
    <View style={{ ...panelStyle(pack.tone), flexGrow: 1, flexBasis: 250, maxWidth: 420, gap: 8 }}>
      <Text style={{ color: pack.tone, fontSize: 11, fontWeight: '900' }}>CONTENT PACK</Text>
      <Text style={{ color: mxTheme.colors.text, fontSize: 17, fontWeight: '900' }}>{pack.title}</Text>
      <Text style={{ color: '#ddd', fontSize: 12, lineHeight: 18 }}>Preview: {pack.preview}</Text>
      <Text style={{ color: '#ddd', fontSize: 12, lineHeight: 18 }}>Unlock: {pack.unlockRule}</Text>
      <Text style={{ color: '#ddd', fontSize: 12, lineHeight: 18 }}>Watchlist: {pack.watchlist}</Text>
      <Text style={{ color: pack.tone, fontSize: 11, fontWeight: '900' }}>{pack.metric}</Text>
      <Text style={{ color: mxTheme.colors.muted, fontSize: 11, lineHeight: 16 }}>Reward: {pack.stickerReward}</Text>
    </View>
  );
}

function ArchiveRuleCard({ rule }: { rule: ArchiveRulePlan }) {
  return (
    <View style={{ ...panelStyle(rule.tone), flexGrow: 1, flexBasis: 230, maxWidth: 400, gap: 8 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
        <Text style={{ color: mxTheme.colors.text, fontSize: 17, fontWeight: '900', flex: 1 }}>{rule.title}</Text>
        <StatusPill label={rule.visibility} tone={rule.tone} />
      </View>
      <Text style={{ color: '#ddd', fontSize: 12, lineHeight: 18 }}>Trigger: {rule.trigger}</Text>
      <Text style={{ color: '#ddd', fontSize: 12, lineHeight: 18 }}>Access: {rule.accessRule}</Text>
      <Text style={{ color: rule.tone, fontSize: 11, fontWeight: '900' }}>{rule.retention}</Text>
    </View>
  );
}

export function ContentLibraryScreen() {
  const [activeTab, setActiveTab] = useState<ContentLibraryTab>('library');
  const [selectedItemId, setSelectedItemId] = useState(CONTENT_LIBRARY_ITEMS[0].id);
  const [notice, setNotice] = useState('Content Library scaffold groups media, playlists, drop calendars, packs and archive rules for production wiring.');

  const selectedItem = useMemo(
    () => CONTENT_LIBRARY_ITEMS.find((item) => item.id === selectedItemId) || CONTENT_LIBRARY_ITEMS[0],
    [selectedItemId],
  );

  function renderLibrary() {
    return (
      <View style={{ gap: 14 }}>
        <SectionHeader
          title="Content Libraries"
          subtitle="Songs, videos, books, movies, links, PDFs, albums and PPV collections get one planning surface before production persistence."
        />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {CONTENT_LIBRARY_ITEMS.map((item) => (
            <LibraryCard
              key={item.id}
              item={item}
              active={item.id === selectedItem.id}
              onSelect={(nextItem) => {
                setSelectedItemId(nextItem.id);
                setNotice(`${nextItem.title} selected for content-library wiring.`);
              }}
            />
          ))}
        </View>
        <View style={{ ...panelStyle(selectedItem.tone), gap: 11 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
            <View style={{ flex: 1, minWidth: 220 }}>
              <Text style={{ color: selectedItem.tone, fontSize: 11, fontWeight: '900' }}>{selectedItem.badge} DETAIL</Text>
              <Text style={{ color: mxTheme.colors.text, fontSize: 22, fontWeight: '900', marginTop: 4 }}>{selectedItem.title}</Text>
              <Text style={{ color: '#d7d7de', fontSize: 13, lineHeight: 19, marginTop: 5 }}>{selectedItem.summary}</Text>
            </View>
            <View style={{ minWidth: 220, gap: 6 }}>
              <Text style={{ color: mxTheme.colors.muted, fontSize: 11 }}>Owner</Text>
              <Text style={{ color: selectedItem.tone, fontSize: 13, fontWeight: '900' }}>{selectedItem.owner}</Text>
              <Text style={{ color: mxTheme.colors.muted, fontSize: 11 }}>Access rule</Text>
              <Text style={{ color: '#ddd', fontSize: 12, lineHeight: 18 }}>{selectedItem.access}</Text>
            </View>
          </View>
          <BulletList items={selectedItem.checklist} tone={selectedItem.tone} />
        </View>
      </View>
    );
  }

  function renderPlaylists() {
    return (
      <View style={{ gap: 14 }}>
        <SectionHeader
          title="Playlist Suggestions and Approval"
          subtitle="Mistress-curated lists, Sub suggestions, own-playlist saves and live-room queues share approval and analytics states."
        />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {PLAYLIST_PLANS.map((playlist) => (
            <PlaylistCard key={playlist.id} playlist={playlist} />
          ))}
        </View>
      </View>
    );
  }

  function renderDrops() {
    return (
      <View style={{ gap: 14 }}>
        <SectionHeader
          title="Drop Calendar"
          subtitle="Sticker releases, PPV series, live shows, replay drops, card packs and goal finales can be scheduled from one calendar model."
        />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {DROP_CALENDAR_PLANS.map((drop) => (
            <DropCard key={drop.id} drop={drop} />
          ))}
        </View>
      </View>
    );
  }

  function renderPacks() {
    return (
      <View style={{ gap: 14 }}>
        <SectionHeader
          title="Content Packs"
          subtitle="Pack detail pages track previews, unlock rules, watchlist saves, shareable metrics and related sticker rewards."
        />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {CONTENT_PACK_PLANS.map((pack) => (
            <PackCard key={pack.id} pack={pack} />
          ))}
        </View>
        <SectionHeader
          title="Live Stream Archive Rules"
          subtitle="Live streams can become public replays, subscription replays, paid replays or private archives with explicit retention rules."
        />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {ARCHIVE_RULE_PLANS.map((rule) => (
            <ArchiveRuleCard key={rule.id} rule={rule} />
          ))}
        </View>
      </View>
    );
  }

  function renderActiveTab() {
    if (activeTab === 'playlists') return renderPlaylists();
    if (activeTab === 'drops') return renderDrops();
    if (activeTab === 'packs') return renderPacks();
    return renderLibrary();
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: mxTheme.colors.background }} contentContainerStyle={{ padding: mxTheme.spacing.lg, gap: mxTheme.spacing.lg }}>
      <View style={{ ...panelStyle('#38bdf8'), gap: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <View style={{ flex: 1, minWidth: 260, gap: 6 }}>
            <Text style={{ color: '#38bdf8', fontSize: 12, fontWeight: '900' }}>CONTENT LIBRARY</Text>
            <Text style={{ color: mxTheme.colors.text, fontSize: 30, fontWeight: '900' }}>Media, playlists, drops and replay archives</Text>
            <Text style={{ color: mxTheme.colors.muted, fontSize: 14, lineHeight: 21 }}>
              Coordinate content libraries, Sub suggestions, creator approvals, drop calendars, pack detail rules and live replay archive modes from one dashboard module.
            </Text>
          </View>
          <View style={{ minWidth: 220, gap: 8 }}>
            <StatusPill label="library scaffolded" tone="#38bdf8" />
            <StatusPill label="drop calendar mapped" tone="#d4af37" />
            <StatusPill label="archive rules planned" tone="#1D9E75" />
          </View>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {CONTENT_LIBRARY_METRICS.map((metric) => (
            <MetricCard key={metric.label} label={metric.label} value={metric.value} detail={metric.detail} tone={metric.tone} />
          ))}
        </View>
      </View>

      <View style={{ ...panelStyle(), gap: 10 }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {CONTENT_LIBRARY_TABS.map((tab) => {
            const active = tab.id === activeTab;
            return (
              <Pressable
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                style={{
                  borderColor: active ? '#38bdf8' : mxTheme.colors.border,
                  backgroundColor: active ? '#38bdf822' : '#15151c',
                  borderWidth: 1,
                  borderRadius: 999,
                  paddingVertical: 9,
                  paddingHorizontal: 13,
                }}
              >
                <Text style={{ color: active ? '#38bdf8' : mxTheme.colors.muted, fontWeight: '900', fontSize: 12 }}>{tab.label}</Text>
              </Pressable>
            );
          })}
        </View>
        <View style={{ backgroundColor: '#15151c', borderColor: '#2f2f3a', borderWidth: 1, borderRadius: mxTheme.radius.md, padding: 10 }}>
          <Text style={{ color: mxTheme.colors.text, fontSize: 12, fontWeight: '800' }}>{notice}</Text>
        </View>
      </View>

      {renderActiveTab()}
    </ScrollView>
  );
}
