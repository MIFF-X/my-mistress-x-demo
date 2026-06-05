import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { mxTheme } from '../../theme/mxTheme';
import {
  ENVIRONMENT_SERVICE_STATUSES,
  PREVIEW_OPS_METRICS,
  PREVIEW_OPS_TABS,
  SECURE_PREVIEW_GUARDS,
  SHUTDOWN_RUNBOOK,
  TUNNEL_PLAYBOOK_STEPS,
  type EnvironmentServiceStatus,
  type PreviewOpsTab,
  type SecurePreviewGuard,
  type ShutdownRunbookItem,
  type TunnelPlaybookStep,
} from './previewOpsModel';

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

function PlaybookCard({
  step,
  active,
  onSelect,
}: {
  step: TunnelPlaybookStep;
  active: boolean;
  onSelect: (step: TunnelPlaybookStep) => void;
}) {
  return (
    <Pressable onPress={() => onSelect(step)} style={{ ...panelStyle(active ? step.tone : '#2a2a33'), flexGrow: 1, flexBasis: 250, maxWidth: 430, gap: 9 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: step.tone, fontSize: 11, fontWeight: '900' }}>{step.phase.toUpperCase()}</Text>
          <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900', marginTop: 3 }}>{step.title}</Text>
        </View>
        <StatusPill label={step.status} tone={step.tone} />
      </View>
      <Text style={{ color: '#d7d7de', fontSize: 12, lineHeight: 18 }}>{step.command}</Text>
      <Text style={{ color: mxTheme.colors.muted, fontSize: 11 }}>Owner: {step.owner}</Text>
    </Pressable>
  );
}

function ServiceCard({
  service,
  active,
  onSelect,
}: {
  service: EnvironmentServiceStatus;
  active: boolean;
  onSelect: (service: EnvironmentServiceStatus) => void;
}) {
  return (
    <Pressable onPress={() => onSelect(service)} style={{ ...panelStyle(active ? service.tone : '#2a2a33'), flexGrow: 1, flexBasis: 240, maxWidth: 420, gap: 8 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: service.tone, fontSize: 11, fontWeight: '900' }}>{service.endpoint}</Text>
          <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900', marginTop: 3 }}>{service.label}</Text>
        </View>
        <StatusPill label={service.state} tone={service.tone} />
      </View>
      <Text style={{ color: '#d7d7de', fontSize: 12, lineHeight: 18 }}>{service.detail}</Text>
    </Pressable>
  );
}

function GuardCard({ guard }: { guard: SecurePreviewGuard }) {
  return (
    <View style={{ ...panelStyle(guard.tone), flexGrow: 1, flexBasis: 260, maxWidth: 440, gap: 9 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: guard.tone, fontSize: 11, fontWeight: '900' }}>PUBLIC GUARD</Text>
          <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900', marginTop: 3 }}>{guard.title}</Text>
        </View>
        <StatusPill label="required" tone={guard.tone} />
      </View>
      <Text style={{ color: '#ddd', fontSize: 12, lineHeight: 18 }}>Risk: {guard.risk}</Text>
      <Text style={{ color: guard.tone, fontSize: 12, lineHeight: 18, fontWeight: '900' }}>{guard.guardrail}</Text>
      <BulletList items={guard.requiredBeforePublic} tone={guard.tone} />
    </View>
  );
}

function ShutdownCard({ item }: { item: ShutdownRunbookItem }) {
  return (
    <View style={{ ...panelStyle(item.tone), flexGrow: 1, flexBasis: 245, maxWidth: 420, gap: 8 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
        <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900', flex: 1 }}>{item.title}</Text>
        <StatusPill label="runbook" tone={item.tone} />
      </View>
      <Text style={{ color: mxTheme.colors.muted, fontSize: 11, fontWeight: '900' }}>Trigger</Text>
      <Text style={{ color: '#ddd', fontSize: 12, lineHeight: 18 }}>{item.trigger}</Text>
      <Text style={{ color: mxTheme.colors.muted, fontSize: 11, fontWeight: '900' }}>Action</Text>
      <Text style={{ color: '#ddd', fontSize: 12, lineHeight: 18 }}>{item.action}</Text>
      <Text style={{ color: item.tone, fontSize: 11, fontWeight: '900' }}>{item.confirmation}</Text>
    </View>
  );
}

export function PreviewOpsScreen() {
  const [activeTab, setActiveTab] = useState<PreviewOpsTab>('playbook');
  const [selectedStepId, setSelectedStepId] = useState(TUNNEL_PLAYBOOK_STEPS[0].id);
  const [selectedServiceId, setSelectedServiceId] = useState(ENVIRONMENT_SERVICE_STATUSES[0].id);
  const [notice, setNotice] = useState('Preview Ops scaffold groups tunnel setup, readiness checks, secure-preview guards and shutdown actions.');

  const selectedStep = useMemo(
    () => TUNNEL_PLAYBOOK_STEPS.find((step) => step.id === selectedStepId) || TUNNEL_PLAYBOOK_STEPS[0],
    [selectedStepId],
  );
  const selectedService = useMemo(
    () => ENVIRONMENT_SERVICE_STATUSES.find((service) => service.id === selectedServiceId) || ENVIRONMENT_SERVICE_STATUSES[0],
    [selectedServiceId],
  );

  function renderPlaybook() {
    return (
      <View style={{ gap: 14 }}>
        <SectionHeader
          title="Cloudflare Tunnel Playbook"
          subtitle="Named tunnels, ingress rules, service install, metrics and logs stay visible before an external preview link is shared."
        />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {TUNNEL_PLAYBOOK_STEPS.map((step) => (
            <PlaybookCard
              key={step.id}
              step={step}
              active={step.id === selectedStep.id}
              onSelect={(nextStep) => {
                setSelectedStepId(nextStep.id);
                setNotice(`${nextStep.title} selected for local preview planning.`);
              }}
            />
          ))}
        </View>
        <View style={{ ...panelStyle(selectedStep.tone), gap: 11 }}>
          <Text style={{ color: selectedStep.tone, fontSize: 11, fontWeight: '900' }}>{selectedStep.phase.toUpperCase()} STEP</Text>
          <Text style={{ color: mxTheme.colors.text, fontSize: 22, fontWeight: '900' }}>{selectedStep.title}</Text>
          <Text style={{ color: '#d7d7de', fontSize: 13, lineHeight: 19 }}>{selectedStep.command}</Text>
          <BulletList items={selectedStep.checklist} tone={selectedStep.tone} />
        </View>
      </View>
    );
  }

  function renderReadiness() {
    return (
      <View style={{ gap: 14 }}>
        <SectionHeader
          title="Dev Environment Readiness"
          subtitle="Local API, frontend, websocket, tunnel, database and payment provider readiness can be checked before public exposure."
        />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {ENVIRONMENT_SERVICE_STATUSES.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              active={service.id === selectedService.id}
              onSelect={(nextService) => {
                setSelectedServiceId(nextService.id);
                setNotice(`${nextService.label} selected for readiness review.`);
              }}
            />
          ))}
        </View>
        <View style={{ ...panelStyle(selectedService.tone), gap: 11 }}>
          <Text style={{ color: selectedService.tone, fontSize: 11, fontWeight: '900' }}>{selectedService.state.toUpperCase()}</Text>
          <Text style={{ color: mxTheme.colors.text, fontSize: 22, fontWeight: '900' }}>{selectedService.label}</Text>
          <Text style={{ color: '#d7d7de', fontSize: 13, lineHeight: 19 }}>{selectedService.detail}</Text>
          <BulletList items={selectedService.evidence} tone={selectedService.tone} />
        </View>
      </View>
    );
  }

  function renderSecurity() {
    return (
      <View style={{ gap: 14 }}>
        <SectionHeader
          title="Secure Preview Warning"
          subtitle="Public tunnel sharing is blocked until secrets, auth, demo data and expiry ownership have explicit guardrails."
        />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {SECURE_PREVIEW_GUARDS.map((guard) => (
            <GuardCard key={guard.id} guard={guard} />
          ))}
        </View>
      </View>
    );
  }

  function renderShutdown() {
    return (
      <View style={{ gap: 14 }}>
        <SectionHeader
          title="Shutdown Safety"
          subtitle="Every preview gets a closing runbook so temporary public access does not linger after review."
        />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {SHUTDOWN_RUNBOOK.map((item) => (
            <ShutdownCard key={item.id} item={item} />
          ))}
        </View>
      </View>
    );
  }

  function renderActiveTab() {
    if (activeTab === 'readiness') return renderReadiness();
    if (activeTab === 'security') return renderSecurity();
    if (activeTab === 'shutdown') return renderShutdown();
    return renderPlaybook();
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: mxTheme.colors.background }} contentContainerStyle={{ padding: mxTheme.spacing.lg, gap: mxTheme.spacing.lg }}>
      <View style={{ ...panelStyle('#38bdf8'), gap: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <View style={{ flex: 1, minWidth: 260, gap: 6 }}>
            <Text style={{ color: '#38bdf8', fontSize: 12, fontWeight: '900' }}>PREVIEW OPS</Text>
            <Text style={{ color: mxTheme.colors.text, fontSize: 30, fontWeight: '900' }}>Tunnels, readiness and public-preview safety</Text>
            <Text style={{ color: mxTheme.colors.muted, fontSize: 14, lineHeight: 21 }}>
              Coordinate local preview tunnel setup, environment readiness, secure public-share warnings and shutdown actions from one admin dashboard module.
            </Text>
          </View>
          <View style={{ minWidth: 220, gap: 8 }}>
            <StatusPill label="tunnel playbook" tone="#38bdf8" />
            <StatusPill label="readiness mapped" tone="#1D9E75" />
            <StatusPill label="public guardrails" tone="#f5c542" />
          </View>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {PREVIEW_OPS_METRICS.map((metric) => (
            <MetricCard key={metric.label} label={metric.label} value={metric.value} detail={metric.detail} tone={metric.tone} />
          ))}
        </View>
      </View>

      <View style={{ ...panelStyle(), gap: 10 }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {PREVIEW_OPS_TABS.map((tab) => {
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
