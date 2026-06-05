import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { mxTheme } from '../../theme/mxTheme';
import {
  WORKSHOP_OAUTH_PROVIDERS,
  WORKSHOP_PORTAL_METRICS,
  WORKSHOP_PORTAL_TABS,
  WORKSHOP_QUEUE_ITEMS,
  WORKSHOP_RELEASE_CHANNELS,
  WORKSHOP_ROLE_PANELS,
  type WorkshopOAuthProvider,
  type WorkshopPortalTab,
  type WorkshopQueueItem,
  type WorkshopReleaseChannel,
  type WorkshopRolePanel,
} from './workshopPortalModel';

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

function QueueCard({
  item,
  active,
  onSelect,
}: {
  item: WorkshopQueueItem;
  active: boolean;
  onSelect: (item: WorkshopQueueItem) => void;
}) {
  return (
    <Pressable onPress={() => onSelect(item)} style={{ ...panelStyle(active ? item.tone : '#2a2a33'), flexGrow: 1, flexBasis: 250, maxWidth: 430, gap: 9 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: item.tone, fontSize: 11, fontWeight: '900' }}>{item.kind.toUpperCase()}</Text>
          <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900', marginTop: 3 }}>{item.title}</Text>
        </View>
        <StatusPill label={item.status} tone={item.tone} />
      </View>
      <Text style={{ color: '#d7d7de', fontSize: 12, lineHeight: 18 }}>Target: {item.target}</Text>
      <Text style={{ color: mxTheme.colors.muted, fontSize: 11 }}>Owner: {item.owner}</Text>
      <Text style={{ color: mxTheme.colors.muted, fontSize: 11 }}>Priority: {item.priority}</Text>
    </Pressable>
  );
}

function RolePanelCard({ panel }: { panel: WorkshopRolePanel }) {
  return (
    <View style={{ ...panelStyle(panel.tone), flexGrow: 1, flexBasis: 260, maxWidth: 440, gap: 9 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: panel.tone, fontSize: 11, fontWeight: '900' }}>{panel.role.toUpperCase()}</Text>
          <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900', marginTop: 3 }}>{panel.title}</Text>
        </View>
        <StatusPill label="separated" tone={panel.tone} />
      </View>
      <Text style={{ color: '#d7d7de', fontSize: 12, lineHeight: 18 }}>{panel.scope}</Text>
      <BulletList items={panel.controls} tone={panel.tone} />
      <Text style={{ color: panel.tone, fontSize: 11, fontWeight: '900' }}>{panel.auditRule}</Text>
    </View>
  );
}

function ReleaseCard({ release }: { release: WorkshopReleaseChannel }) {
  return (
    <View style={{ ...panelStyle(release.tone), flexGrow: 1, flexBasis: 250, maxWidth: 430, gap: 8 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: release.tone, fontSize: 11, fontWeight: '900' }}>{release.version}</Text>
          <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900', marginTop: 3 }}>{release.title}</Text>
        </View>
        <StatusPill label={release.status} tone={release.tone} />
      </View>
      <Text style={{ color: '#ddd', fontSize: 12, lineHeight: 18 }}>Artifact: {release.artifact}</Text>
      <Text style={{ color: '#ddd', fontSize: 12, lineHeight: 18 }}>Target: {release.installTarget}</Text>
      <Text style={{ color: release.tone, fontSize: 11, fontWeight: '900' }}>{release.checksum}</Text>
      <BulletList items={release.checklist} tone={release.tone} />
    </View>
  );
}

function OAuthCard({
  provider,
  active,
  onSelect,
}: {
  provider: WorkshopOAuthProvider;
  active: boolean;
  onSelect: (provider: WorkshopOAuthProvider) => void;
}) {
  return (
    <Pressable onPress={() => onSelect(provider)} style={{ ...panelStyle(active ? provider.tone : '#2a2a33'), flexGrow: 1, flexBasis: 245, maxWidth: 420, gap: 8 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: provider.tone, fontSize: 11, fontWeight: '900' }}>{provider.provider.toUpperCase()}</Text>
          <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900', marginTop: 3 }}>{provider.title}</Text>
        </View>
        <StatusPill label={provider.status} tone={provider.tone} />
      </View>
      <Text style={{ color: '#d7d7de', fontSize: 12, lineHeight: 18 }}>{provider.connectionState}</Text>
      <Text style={{ color: mxTheme.colors.muted, fontSize: 11 }}>{provider.auditTrail}</Text>
    </Pressable>
  );
}

export function WorkshopPortalScreen() {
  const [activeTab, setActiveTab] = useState<WorkshopPortalTab>('queue');
  const [selectedQueueId, setSelectedQueueId] = useState(WORKSHOP_QUEUE_ITEMS[0].id);
  const [selectedProviderId, setSelectedProviderId] = useState(WORKSHOP_OAUTH_PROVIDERS[0].id);
  const [notice, setNotice] = useState('Workshop Portal scaffold groups moderation queues, role panels, releases and OAuth account links for production wiring.');

  const selectedQueue = useMemo(
    () => WORKSHOP_QUEUE_ITEMS.find((item) => item.id === selectedQueueId) || WORKSHOP_QUEUE_ITEMS[0],
    [selectedQueueId],
  );
  const selectedProvider = useMemo(
    () => WORKSHOP_OAUTH_PROVIDERS.find((provider) => provider.id === selectedProviderId) || WORKSHOP_OAUTH_PROVIDERS[0],
    [selectedProviderId],
  );

  function renderQueue() {
    return (
      <View style={{ gap: 14 }}>
        <SectionHeader
          title="Workshop Moderation Queue"
          subtitle="Uploads, reports, comments, ratings, screenshots, releases and attachments share one evidence-first review surface."
        />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {WORKSHOP_QUEUE_ITEMS.map((item) => (
            <QueueCard
              key={item.id}
              item={item}
              active={item.id === selectedQueue.id}
              onSelect={(nextItem) => {
                setSelectedQueueId(nextItem.id);
                setNotice(`${nextItem.title} selected for moderation workflow planning.`);
              }}
            />
          ))}
        </View>
        <View style={{ ...panelStyle(selectedQueue.tone), gap: 11 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <View style={{ flex: 1, minWidth: 220 }}>
              <Text style={{ color: selectedQueue.tone, fontSize: 11, fontWeight: '900' }}>{selectedQueue.kind.toUpperCase()} EVIDENCE</Text>
              <Text style={{ color: mxTheme.colors.text, fontSize: 22, fontWeight: '900', marginTop: 4 }}>{selectedQueue.title}</Text>
              <Text style={{ color: '#d7d7de', fontSize: 13, lineHeight: 19, marginTop: 5 }}>{selectedQueue.owner} owns review for {selectedQueue.target}.</Text>
            </View>
            <View style={{ minWidth: 220, gap: 6 }}>
              <Text style={{ color: mxTheme.colors.muted, fontSize: 11 }}>Status</Text>
              <Text style={{ color: selectedQueue.tone, fontSize: 13, fontWeight: '900' }}>{selectedQueue.status}</Text>
              <Text style={{ color: mxTheme.colors.muted, fontSize: 11 }}>Priority</Text>
              <Text style={{ color: '#ddd', fontSize: 12, lineHeight: 18 }}>{selectedQueue.priority}</Text>
            </View>
          </View>
          <SectionHeader title="Evidence" subtitle="Moderators can decide from captured context before touching production records." />
          <BulletList items={selectedQueue.evidence} tone={selectedQueue.tone} />
          <SectionHeader title="Decision Path" subtitle="Every queue item keeps the next review actions explicit." />
          <BulletList items={selectedQueue.decisionPath} tone={selectedQueue.tone} />
        </View>
      </View>
    );
  }

  function renderRoles() {
    return (
      <View style={{ gap: 14 }}>
        <SectionHeader
          title="Admin, Moderator and Developer Panels"
          subtitle="The portal keeps high-risk admin controls, moderator review actions and developer diagnostics separated by default."
        />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {WORKSHOP_ROLE_PANELS.map((panel) => (
            <RolePanelCard key={panel.id} panel={panel} />
          ))}
        </View>
      </View>
    );
  }

  function renderReleases() {
    return (
      <View style={{ gap: 14 }}>
        <SectionHeader
          title="Download and Release Pages"
          subtitle="Official app downloads, plugin archives and hotfix builds get version, checksum, release note and rollback states before publication."
        />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {WORKSHOP_RELEASE_CHANNELS.map((release) => (
            <ReleaseCard key={release.id} release={release} />
          ))}
        </View>
      </View>
    );
  }

  function renderOAuth() {
    return (
      <View style={{ gap: 14 }}>
        <SectionHeader
          title="OAuth Connect and Disconnect"
          subtitle="External providers must expose connection state, disconnect actions, token review and audit history in one predictable pattern."
        />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {WORKSHOP_OAUTH_PROVIDERS.map((provider) => (
            <OAuthCard
              key={provider.id}
              provider={provider}
              active={provider.id === selectedProvider.id}
              onSelect={(nextProvider) => {
                setSelectedProviderId(nextProvider.id);
                setNotice(`${nextProvider.title} selected for OAuth account-link planning.`);
              }}
            />
          ))}
        </View>
        <View style={{ ...panelStyle(selectedProvider.tone), gap: 11 }}>
          <Text style={{ color: selectedProvider.tone, fontSize: 11, fontWeight: '900' }}>PROVIDER ACTIONS</Text>
          <Text style={{ color: mxTheme.colors.text, fontSize: 22, fontWeight: '900' }}>{selectedProvider.title}</Text>
          <Text style={{ color: '#d7d7de', fontSize: 13, lineHeight: 19 }}>{selectedProvider.connectionState}</Text>
          <BulletList items={selectedProvider.actions} tone={selectedProvider.tone} />
          <Text style={{ color: selectedProvider.tone, fontSize: 11, fontWeight: '900' }}>{selectedProvider.auditTrail}</Text>
        </View>
      </View>
    );
  }

  function renderActiveTab() {
    if (activeTab === 'roles') return renderRoles();
    if (activeTab === 'releases') return renderReleases();
    if (activeTab === 'oauth') return renderOAuth();
    return renderQueue();
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: mxTheme.colors.background }} contentContainerStyle={{ padding: mxTheme.spacing.lg, gap: mxTheme.spacing.lg }}>
      <View style={{ ...panelStyle('#f5c542'), gap: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <View style={{ flex: 1, minWidth: 260, gap: 6 }}>
            <Text style={{ color: '#f5c542', fontSize: 12, fontWeight: '900' }}>WORKSHOP PORTAL</Text>
            <Text style={{ color: mxTheme.colors.text, fontSize: 30, fontWeight: '900' }}>Moderation, releases and provider links</Text>
            <Text style={{ color: mxTheme.colors.muted, fontSize: 14, lineHeight: 21 }}>
              Coordinate workshop uploads, reports, comments, ratings, screenshots, release downloads, admin/mod/dev panels and OAuth account links from one dashboard module.
            </Text>
          </View>
          <View style={{ minWidth: 220, gap: 8 }}>
            <StatusPill label="queue scaffolded" tone="#f5c542" />
            <StatusPill label="role panels mapped" tone="#c084fc" />
            <StatusPill label="OAuth patterns queued" tone="#1D9E75" />
          </View>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {WORKSHOP_PORTAL_METRICS.map((metric) => (
            <MetricCard key={metric.label} label={metric.label} value={metric.value} detail={metric.detail} tone={metric.tone} />
          ))}
        </View>
      </View>

      <View style={{ ...panelStyle(), gap: 10 }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {WORKSHOP_PORTAL_TABS.map((tab) => {
            const active = tab.id === activeTab;
            return (
              <Pressable
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                style={{
                  borderColor: active ? '#f5c542' : mxTheme.colors.border,
                  backgroundColor: active ? '#f5c54222' : '#15151c',
                  borderWidth: 1,
                  borderRadius: 999,
                  paddingVertical: 9,
                  paddingHorizontal: 13,
                }}
              >
                <Text style={{ color: active ? '#f5c542' : mxTheme.colors.muted, fontWeight: '900', fontSize: 12 }}>{tab.label}</Text>
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
