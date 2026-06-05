import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { mxTheme } from '../../theme/mxTheme';
import {
  AI_CAPABILITY_LABELS,
  AI_PROVIDER_TEAM_METRICS,
  AI_PROVIDER_TEAM_PROVIDERS,
  AI_PROVIDER_TEAM_TABS,
  AI_PROVIDER_USAGE_ROWS,
  AI_ROUTING_POLICIES,
  type AiCapabilityLabel,
  type AiProviderTeamProvider,
  type AiProviderTeamTab,
  type AiProviderUsageRow,
  type AiRoutingPolicy,
} from './aiProviderTeamModel';

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

function ProviderCard({
  provider,
  active,
  onSelect,
}: {
  provider: AiProviderTeamProvider;
  active: boolean;
  onSelect: (provider: AiProviderTeamProvider) => void;
}) {
  return (
    <Pressable onPress={() => onSelect(provider)} style={{ ...panelStyle(active ? provider.tone : '#2a2a33'), flexGrow: 1, flexBasis: 250, maxWidth: 430, gap: 9 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: provider.tone, fontSize: 11, fontWeight: '900' }}>{provider.family} / {provider.mode.toUpperCase()}</Text>
          <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900', marginTop: 3 }}>{provider.name}</Text>
        </View>
        <StatusPill label={provider.status} tone={provider.tone} />
      </View>
      <Text style={{ color: '#d7d7de', fontSize: 12, lineHeight: 18 }}>{provider.primaryUse}</Text>
      <Text style={{ color: mxTheme.colors.muted, fontSize: 11 }}>Cost: {provider.costTier} / Privacy: {provider.privacy}</Text>
    </Pressable>
  );
}

function CapabilityCard({ capability }: { capability: AiCapabilityLabel }) {
  return (
    <View style={{ ...panelStyle(capability.tone), flexGrow: 1, flexBasis: 235, maxWidth: 420, gap: 8 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
        <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900', flex: 1 }}>{capability.label}</Text>
        <StatusPill label="label" tone={capability.tone} />
      </View>
      <Text style={{ color: '#d7d7de', fontSize: 12, lineHeight: 18 }}>{capability.detail}</Text>
      <Text style={{ color: capability.tone, fontSize: 11, fontWeight: '900' }}>{capability.providers.join(' / ')}</Text>
      <Text style={{ color: mxTheme.colors.muted, fontSize: 11, lineHeight: 16 }}>{capability.policy}</Text>
    </View>
  );
}

function RoutingPolicyCard({
  policy,
  active,
  onSelect,
}: {
  policy: AiRoutingPolicy;
  active: boolean;
  onSelect: (policy: AiRoutingPolicy) => void;
}) {
  return (
    <Pressable onPress={() => onSelect(policy)} style={{ ...panelStyle(active ? policy.tone : '#2a2a33'), flexGrow: 1, flexBasis: 250, maxWidth: 430, gap: 8 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
        <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900', flex: 1 }}>{policy.title}</Text>
        <StatusPill label="route" tone={policy.tone} />
      </View>
      <Text style={{ color: '#d7d7de', fontSize: 12, lineHeight: 18 }}>{policy.trigger}</Text>
      <Text style={{ color: policy.tone, fontSize: 11, fontWeight: '900' }}>Primary: {policy.primaryProvider}</Text>
    </Pressable>
  );
}

function UsageRow({ row }: { row: AiProviderUsageRow }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, alignItems: 'center', borderBottomColor: '#262630', borderBottomWidth: 1, paddingVertical: 10 }}>
      <View style={{ flex: 1.4, minWidth: 180 }}>
        <Text style={{ color: mxTheme.colors.text, fontSize: 14, fontWeight: '900' }}>{row.provider}</Text>
        <Text style={{ color: row.tone, fontSize: 11, fontWeight: '900', marginTop: 3 }}>{row.status.toUpperCase()}</Text>
      </View>
      <Text style={{ color: '#ddd', fontSize: 12, minWidth: 80 }}>{row.requests}</Text>
      <Text style={{ color: '#ddd', fontSize: 12, minWidth: 80 }}>{row.tokens}</Text>
      <Text style={{ color: row.tone, fontSize: 12, fontWeight: '900', minWidth: 80 }}>{row.cost}</Text>
      <Text style={{ color: mxTheme.colors.muted, fontSize: 12, minWidth: 70 }}>{row.latency}</Text>
    </View>
  );
}

export function AiProviderTeamScreen() {
  const [activeTab, setActiveTab] = useState<AiProviderTeamTab>('providers');
  const [selectedProviderId, setSelectedProviderId] = useState(AI_PROVIDER_TEAM_PROVIDERS[0].id);
  const [selectedPolicyId, setSelectedPolicyId] = useState(AI_ROUTING_POLICIES[0].id);
  const [notice, setNotice] = useState('AI Provider Team scaffold groups provider choices, capability labels, routing policy and usage analytics.');

  const selectedProvider = useMemo(
    () => AI_PROVIDER_TEAM_PROVIDERS.find((provider) => provider.id === selectedProviderId) || AI_PROVIDER_TEAM_PROVIDERS[0],
    [selectedProviderId],
  );
  const selectedPolicy = useMemo(
    () => AI_ROUTING_POLICIES.find((policy) => policy.id === selectedPolicyId) || AI_ROUTING_POLICIES[0],
    [selectedPolicyId],
  );

  function renderProviders() {
    return (
      <View style={{ gap: 14 }}>
        <SectionHeader
          title="Provider Switcher"
          subtitle="GPT, Gemini, Grok, RouteLLM and local lanes are staged as policy-gated provider choices before production credentials are wired."
        />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {AI_PROVIDER_TEAM_PROVIDERS.map((provider) => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              active={provider.id === selectedProvider.id}
              onSelect={(nextProvider) => {
                setSelectedProviderId(nextProvider.id);
                setNotice(`${nextProvider.name} selected for provider routing review.`);
              }}
            />
          ))}
        </View>
        <View style={{ ...panelStyle(selectedProvider.tone), gap: 11 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
            <View style={{ flex: 1, minWidth: 240 }}>
              <Text style={{ color: selectedProvider.tone, fontSize: 11, fontWeight: '900' }}>{selectedProvider.family} PROVIDER DETAIL</Text>
              <Text style={{ color: mxTheme.colors.text, fontSize: 22, fontWeight: '900', marginTop: 4 }}>{selectedProvider.name}</Text>
              <Text style={{ color: '#d7d7de', fontSize: 13, lineHeight: 19, marginTop: 5 }}>{selectedProvider.routingRule}</Text>
            </View>
            <View style={{ minWidth: 230, gap: 6 }}>
              <Text style={{ color: mxTheme.colors.muted, fontSize: 11 }}>Telemetry snapshot</Text>
              <Text style={{ color: selectedProvider.tone, fontSize: 13, fontWeight: '900' }}>{selectedProvider.telemetry.requests} requests / {selectedProvider.telemetry.tokens} tokens</Text>
              <Text style={{ color: '#ddd', fontSize: 12 }}>{selectedProvider.telemetry.cost} spend / {selectedProvider.telemetry.latency} avg latency</Text>
              <Text style={{ color: '#ddd', fontSize: 12 }}>{selectedProvider.telemetry.successRate} success rate</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {selectedProvider.capabilities.map((capability) => (
              <StatusPill key={capability} label={capability} tone={selectedProvider.tone} />
            ))}
          </View>
          <BulletList items={selectedProvider.notes} tone={selectedProvider.tone} />
        </View>
      </View>
    );
  }

  function renderCapabilities() {
    return (
      <View style={{ gap: 14 }}>
        <SectionHeader
          title="Capability Labels"
          subtitle="Admin can see what each provider is allowed to do before a prompt is routed: coding, image, routing, local, hosted, private and cost tier."
        />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {AI_CAPABILITY_LABELS.map((capability) => (
            <CapabilityCard key={capability.id} capability={capability} />
          ))}
        </View>
      </View>
    );
  }

  function renderRouting() {
    return (
      <View style={{ gap: 14 }}>
        <SectionHeader
          title="Route-Aware Model Policy"
          subtitle="Each route records why a provider was chosen, where fallback should go and which approval gate must pass before hosted execution."
        />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {AI_ROUTING_POLICIES.map((policy) => (
            <RoutingPolicyCard
              key={policy.id}
              policy={policy}
              active={policy.id === selectedPolicy.id}
              onSelect={(nextPolicy) => {
                setSelectedPolicyId(nextPolicy.id);
                setNotice(`${nextPolicy.title} route selected for approval and telemetry planning.`);
              }}
            />
          ))}
        </View>
        <View style={{ ...panelStyle(selectedPolicy.tone), gap: 11 }}>
          <Text style={{ color: selectedPolicy.tone, fontSize: 11, fontWeight: '900' }}>SELECTED ROUTE POLICY</Text>
          <Text style={{ color: mxTheme.colors.text, fontSize: 22, fontWeight: '900' }}>{selectedPolicy.title}</Text>
          <Text style={{ color: '#d7d7de', fontSize: 13, lineHeight: 19 }}>{selectedPolicy.trigger}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            <View style={{ flex: 1, minWidth: 220 }}>
              <Text style={{ color: mxTheme.colors.muted, fontSize: 11, fontWeight: '900' }}>Provider path</Text>
              <Text style={{ color: selectedPolicy.tone, fontSize: 13, fontWeight: '900', marginTop: 4 }}>{selectedPolicy.primaryProvider} to {selectedPolicy.fallbackProvider}</Text>
            </View>
            <View style={{ flex: 1, minWidth: 220 }}>
              <Text style={{ color: mxTheme.colors.muted, fontSize: 11, fontWeight: '900' }}>Approval</Text>
              <Text style={{ color: '#ddd', fontSize: 12, lineHeight: 18, marginTop: 4 }}>{selectedPolicy.approvalRule}</Text>
            </View>
            <View style={{ flex: 1, minWidth: 220 }}>
              <Text style={{ color: mxTheme.colors.muted, fontSize: 11, fontWeight: '900' }}>Telemetry</Text>
              <Text style={{ color: '#ddd', fontSize: 12, lineHeight: 18, marginTop: 4 }}>{selectedPolicy.telemetry}</Text>
            </View>
          </View>
          <BulletList items={selectedPolicy.checklist} tone={selectedPolicy.tone} />
        </View>
      </View>
    );
  }

  function renderAnalytics() {
    return (
      <View style={{ gap: 14 }}>
        <SectionHeader
          title="Provider Usage, Tokens and Cost"
          subtitle="The admin dashboard gets a provider analytics shape now, with production wiring left for persisted telemetry and provider health history."
        />
        <View style={{ ...panelStyle('#8b5cf6'), gap: 8 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, borderBottomColor: '#2a2a33', borderBottomWidth: 1, paddingBottom: 8 }}>
            <Text style={{ color: mxTheme.colors.muted, fontSize: 11, fontWeight: '900', flex: 1.4, minWidth: 180 }}>PROVIDER</Text>
            <Text style={{ color: mxTheme.colors.muted, fontSize: 11, fontWeight: '900', minWidth: 80 }}>REQUESTS</Text>
            <Text style={{ color: mxTheme.colors.muted, fontSize: 11, fontWeight: '900', minWidth: 80 }}>TOKENS</Text>
            <Text style={{ color: mxTheme.colors.muted, fontSize: 11, fontWeight: '900', minWidth: 80 }}>COST</Text>
            <Text style={{ color: mxTheme.colors.muted, fontSize: 11, fontWeight: '900', minWidth: 70 }}>LATENCY</Text>
          </View>
          {AI_PROVIDER_USAGE_ROWS.map((row) => (
            <UsageRow key={row.provider} row={row} />
          ))}
        </View>
        <View style={{ ...panelStyle('#38bdf8'), gap: 8 }}>
          <Text style={{ color: '#38bdf8', fontSize: 11, fontWeight: '900' }}>ADMIN ANALYTICS HANDOFF</Text>
          <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900' }}>Production telemetry targets</Text>
          <BulletList
            tone="#38bdf8"
            items={[
              'Persist provider profile, route decision, prompt class, token usage, cost, latency and outcome.',
              'Feed token and cost totals into Admin Analytics and Abacus audit exports.',
              'Add provider health history with outage, fallback and approval-queue counts.',
              'Gate high-cost or private-data routes through an admin approval workflow.',
            ]}
          />
        </View>
      </View>
    );
  }

  function renderActiveTab() {
    if (activeTab === 'capabilities') return renderCapabilities();
    if (activeTab === 'routing') return renderRouting();
    if (activeTab === 'analytics') return renderAnalytics();
    return renderProviders();
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: mxTheme.colors.background }} contentContainerStyle={{ padding: mxTheme.spacing.lg, gap: mxTheme.spacing.lg }}>
      <View style={{ ...panelStyle('#8b5cf6'), gap: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <View style={{ flex: 1, minWidth: 280, gap: 6 }}>
            <Text style={{ color: '#8b5cf6', fontSize: 12, fontWeight: '900' }}>AI PROVIDER TEAM</Text>
            <Text style={{ color: mxTheme.colors.text, fontSize: 30, fontWeight: '900' }}>Provider routing, labels and cost controls</Text>
            <Text style={{ color: mxTheme.colors.muted, fontSize: 14, lineHeight: 20 }}>
              Scaffolded provider switcher for approved GPT, Gemini, Grok, RouteLLM and local lanes with visible capability labels, usage snapshots and policy gates.
            </Text>
          </View>
          <View style={{ ...panelStyle('#38bdf8'), minWidth: 220, gap: 6 }}>
            <Text style={{ color: '#38bdf8', fontSize: 11, fontWeight: '900' }}>CURRENT SELECTION</Text>
            <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900' }}>{selectedProvider.name}</Text>
            <Text style={{ color: mxTheme.colors.muted, fontSize: 12 }}>{selectedProvider.family} / {selectedProvider.mode} / {selectedProvider.costTier} cost</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {AI_PROVIDER_TEAM_METRICS.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </View>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {AI_PROVIDER_TEAM_TABS.map((tab) => {
          const active = tab.id === activeTab;
          return (
            <Pressable
              key={tab.id}
              onPress={() => {
                setActiveTab(tab.id);
                setNotice(`${tab.label} view selected.`);
              }}
              style={{
                backgroundColor: active ? '#8b5cf633' : '#12121a',
                borderColor: active ? '#8b5cf6' : '#2a2a33',
                borderWidth: 1,
                borderRadius: 999,
                paddingVertical: 9,
                paddingHorizontal: 13,
              }}
            >
              <Text style={{ color: active ? '#ffffff' : mxTheme.colors.muted, fontSize: 12, fontWeight: '900' }}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {renderActiveTab()}

      <View style={{ ...panelStyle('#2dd4bf'), flexDirection: 'row', flexWrap: 'wrap', gap: 10, alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flex: 1, minWidth: 250 }}>
          <Text style={{ color: '#2dd4bf', fontSize: 11, fontWeight: '900' }}>SCAFFOLD NOTICE</Text>
          <Text style={{ color: mxTheme.colors.text, fontSize: 14, fontWeight: '800', marginTop: 3 }}>{notice}</Text>
        </View>
        <StatusPill label="needs persisted providers" tone="#2dd4bf" />
      </View>
    </ScrollView>
  );
}
