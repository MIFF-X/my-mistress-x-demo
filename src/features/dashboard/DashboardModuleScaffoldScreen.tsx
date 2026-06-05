import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { mxTheme } from '../../theme/mxTheme';
import {
  dashboardModuleContractStageLabel,
  getDashboardModuleServiceContract,
} from './dashboardModuleServiceContracts';
import type { DashboardModuleServiceContract } from './dashboardModuleServiceContracts';

export type DashboardModuleScaffoldPayload = {
  title: string;
  roleSurface: string;
  category: string;
  summary: string;
  relatedView?: string;
  relatedLabel?: string;
  serviceContract?: DashboardModuleServiceContract;
};

type DashboardModuleScaffoldScreenProps = {
  module?: DashboardModuleScaffoldPayload | null;
  onOpenRelatedModule?: (view: string) => void;
};

const FALLBACK_MODULE: DashboardModuleScaffoldPayload = {
  title: 'Dashboard Module',
  roleSurface: 'Shared Dashboard',
  category: 'Scaffold',
  summary: 'This module has a visible home in the dashboard map and is ready for the next backend wiring pass.',
};

const buildColumns = (module: DashboardModuleScaffoldPayload) => [
  {
    title: 'Home',
    label: module.roleSurface,
    body: `Owns the ${module.title} tile, role placement, dashboard copy, and first clickable route.`,
  },
  {
    title: 'Controls',
    label: module.category,
    body: 'Keeps module-level switches, review states, content loading, pricing, visibility, and fulfilment rules grouped before deeper service wiring.',
  },
  {
    title: 'Safety',
    label: 'Policy-ready',
    body: 'Reserved for consent, audit notes, privacy gates, moderation review, and owner-visible history where the module touches sensitive workflows.',
  },
];

function stageColor(stage: DashboardModuleServiceContract['stage']) {
  if (stage === 'payment-ready' || stage === 'production-ready') return mxTheme.colors.success;
  if (stage === 'policy' || stage === 'persistence') return mxTheme.colors.warning;
  if (stage === 'service-contract') return mxTheme.colors.accent;
  return mxTheme.colors.muted;
}

function ContractList({ title, items }: { title: string; items: string[] }) {
  return (
    <View style={{ backgroundColor: mxTheme.colors.surfaceSoft, borderColor: mxTheme.colors.border, borderWidth: 1, borderRadius: mxTheme.radius.sm, padding: mxTheme.spacing.md, flexGrow: 1, flexBasis: 250, gap: 8 }}>
      <Text style={{ color: mxTheme.colors.accent, fontSize: 11, fontWeight: '900' }}>{title.toUpperCase()}</Text>
      {items.map((item) => (
        <View key={item} style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
          <Text style={{ color: mxTheme.colors.warning, fontSize: 14, lineHeight: 18 }}>-</Text>
          <Text style={{ color: '#d6d6dc', fontSize: 12, lineHeight: 18, flex: 1 }}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

export function DashboardModuleScaffoldScreen({ module, onOpenRelatedModule }: DashboardModuleScaffoldScreenProps) {
  const activeModule = module || FALLBACK_MODULE;
  const columns = buildColumns(activeModule);
  const canOpenRelated = Boolean(activeModule.relatedView && onOpenRelatedModule);
  const serviceContract = activeModule.serviceContract || getDashboardModuleServiceContract(activeModule.roleSurface, activeModule.title);
  const activeStageColor = stageColor(serviceContract.stage);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: mxTheme.colors.background }}
      contentContainerStyle={{ padding: mxTheme.spacing.lg, gap: mxTheme.spacing.lg }}
    >
      <View style={{ gap: mxTheme.spacing.sm }}>
        <Text style={{ color: mxTheme.colors.warning, fontSize: 12, fontWeight: '900' }}>MODULE SCAFFOLD</Text>
        <Text style={{ color: mxTheme.colors.text, fontSize: 30, fontWeight: '900' }}>{activeModule.title}</Text>
        <Text style={{ color: mxTheme.colors.muted, fontSize: 14, lineHeight: 21 }}>{activeModule.summary}</Text>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: mxTheme.spacing.md }}>
        <View style={{ backgroundColor: mxTheme.colors.surfaceSoft, borderColor: mxTheme.colors.border, borderWidth: 1, borderRadius: mxTheme.radius.sm, padding: mxTheme.spacing.md, flexGrow: 1, flexBasis: 180 }}>
          <Text style={{ color: mxTheme.colors.muted, fontSize: 11, fontWeight: '900' }}>ROLE SURFACE</Text>
          <Text style={{ color: mxTheme.colors.text, fontSize: 19, fontWeight: '900', marginTop: 6 }}>{activeModule.roleSurface}</Text>
        </View>
        <View style={{ backgroundColor: mxTheme.colors.surfaceSoft, borderColor: mxTheme.colors.border, borderWidth: 1, borderRadius: mxTheme.radius.sm, padding: mxTheme.spacing.md, flexGrow: 1, flexBasis: 180 }}>
          <Text style={{ color: mxTheme.colors.muted, fontSize: 11, fontWeight: '900' }}>CATEGORY</Text>
          <Text style={{ color: mxTheme.colors.text, fontSize: 19, fontWeight: '900', marginTop: 6 }}>{activeModule.category}</Text>
        </View>
        <View style={{ backgroundColor: mxTheme.colors.surfaceSoft, borderColor: mxTheme.colors.border, borderWidth: 1, borderRadius: mxTheme.radius.sm, padding: mxTheme.spacing.md, flexGrow: 1, flexBasis: 180 }}>
          <Text style={{ color: mxTheme.colors.muted, fontSize: 11, fontWeight: '900' }}>CONTRACT STAGE</Text>
          <Text style={{ color: activeStageColor, fontSize: 19, fontWeight: '900', marginTop: 6 }}>{dashboardModuleContractStageLabel(serviceContract.stage)}</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: mxTheme.spacing.md }}>
        {columns.map((column) => (
          <View key={column.title} style={{ backgroundColor: '#101016', borderColor: mxTheme.colors.border, borderWidth: 1, borderRadius: mxTheme.radius.sm, padding: mxTheme.spacing.md, flexGrow: 1, flexBasis: 240, gap: 8 }}>
            <Text style={{ color: mxTheme.colors.accent, fontSize: 11, fontWeight: '900' }}>{column.title.toUpperCase()}</Text>
            <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900' }}>{column.label}</Text>
            <Text style={{ color: '#d6d6dc', fontSize: 13, lineHeight: 19 }}>{column.body}</Text>
          </View>
        ))}
      </View>

      <View style={{ backgroundColor: '#101016', borderColor: mxTheme.colors.border, borderWidth: 1, borderRadius: mxTheme.radius.sm, padding: mxTheme.spacing.md, gap: mxTheme.spacing.sm }}>
        <Text style={{ color: mxTheme.colors.warning, fontSize: 11, fontWeight: '900' }}>BACKEND WIRING SLOT</Text>
        <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900' }}>Service contract pack mapped</Text>
        <Text style={{ color: mxTheme.colors.muted, fontSize: 13, lineHeight: 20 }}>
          The dashboard home is now clickable and carries the backend contract targets that the next build pass can wire without re-locating the feature.
        </Text>
        {canOpenRelated ? (
          <Pressable
            onPress={() => onOpenRelatedModule?.(activeModule.relatedView as string)}
            style={{ alignSelf: 'flex-start', borderColor: mxTheme.colors.accent, borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 9, backgroundColor: `${mxTheme.colors.accent}18` }}
          >
            <Text style={{ color: mxTheme.colors.accent, fontSize: 12, fontWeight: '900' }}>{activeModule.relatedLabel || 'Open related route'}</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={{ backgroundColor: '#101016', borderColor: activeStageColor, borderWidth: 1, borderRadius: mxTheme.radius.sm, padding: mxTheme.spacing.md, gap: mxTheme.spacing.md }}>
        <View style={{ gap: 5 }}>
          <Text style={{ color: activeStageColor, fontSize: 11, fontWeight: '900' }}>SERVICE CONTRACT PACK</Text>
          <Text style={{ color: mxTheme.colors.text, fontSize: 20, fontWeight: '900' }}>{serviceContract.serviceOwner}</Text>
          <Text style={{ color: mxTheme.colors.muted, fontSize: 13, lineHeight: 20 }}>
            API surfaces, persistence targets, policy gates, audit events, payment hooks and launch blockers are now visible for this scaffolded module.
          </Text>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: mxTheme.spacing.md }}>
          <View style={{ backgroundColor: mxTheme.colors.surfaceSoft, borderColor: mxTheme.colors.border, borderWidth: 1, borderRadius: mxTheme.radius.sm, padding: mxTheme.spacing.md, flexGrow: 1, flexBasis: 150 }}>
            <Text style={{ color: mxTheme.colors.muted, fontSize: 11, fontWeight: '900' }}>API SURFACES</Text>
            <Text style={{ color: mxTheme.colors.text, fontSize: 24, fontWeight: '900', marginTop: 4 }}>{serviceContract.apiSurface.length}</Text>
          </View>
          <View style={{ backgroundColor: mxTheme.colors.surfaceSoft, borderColor: mxTheme.colors.border, borderWidth: 1, borderRadius: mxTheme.radius.sm, padding: mxTheme.spacing.md, flexGrow: 1, flexBasis: 150 }}>
            <Text style={{ color: mxTheme.colors.muted, fontSize: 11, fontWeight: '900' }}>PERSISTENCE</Text>
            <Text style={{ color: mxTheme.colors.text, fontSize: 24, fontWeight: '900', marginTop: 4 }}>{serviceContract.persistence.length}</Text>
          </View>
          <View style={{ backgroundColor: mxTheme.colors.surfaceSoft, borderColor: mxTheme.colors.border, borderWidth: 1, borderRadius: mxTheme.radius.sm, padding: mxTheme.spacing.md, flexGrow: 1, flexBasis: 150 }}>
            <Text style={{ color: mxTheme.colors.muted, fontSize: 11, fontWeight: '900' }}>AUDIT EVENTS</Text>
            <Text style={{ color: mxTheme.colors.text, fontSize: 24, fontWeight: '900', marginTop: 4 }}>{serviceContract.auditEvents.length}</Text>
          </View>
          <View style={{ backgroundColor: mxTheme.colors.surfaceSoft, borderColor: mxTheme.colors.border, borderWidth: 1, borderRadius: mxTheme.radius.sm, padding: mxTheme.spacing.md, flexGrow: 1, flexBasis: 150 }}>
            <Text style={{ color: mxTheme.colors.muted, fontSize: 11, fontWeight: '900' }}>BLOCKERS</Text>
            <Text style={{ color: activeStageColor, fontSize: 24, fontWeight: '900', marginTop: 4 }}>{serviceContract.launchBlockers.length}</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: mxTheme.spacing.md }}>
          <ContractList title="API Surface" items={serviceContract.apiSurface} />
          <ContractList title="Persistence" items={serviceContract.persistence} />
          <ContractList title="Policy Gates" items={serviceContract.policyGates} />
          <ContractList title="Payment Hooks" items={serviceContract.paymentHooks} />
          <ContractList title="Audit Events" items={serviceContract.auditEvents} />
          <ContractList title="Launch Blockers" items={serviceContract.launchBlockers} />
        </View>
      </View>
    </ScrollView>
  );
}
