import React, { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { mxTheme } from '../../theme/mxTheme';
import type { UiLayoutAudience, UiLayoutPresetId } from './layoutPresets';
import type { UiLayoutStylePack } from './uiLayoutStylePacks';
import {
  createUiLayoutCustomRequest,
  listUiLayoutCustomRequests,
  updateUiLayoutCustomRequestStatus,
  type UiLayoutCustomRequest,
  type UiLayoutCustomRequestStatus,
} from './uiLayoutCustomRequest';
import {
  trackUiLayoutCustomRequestCreated,
  trackUiLayoutCustomRequestStatusChanged,
} from './uiLayoutAnalytics';

type UiLayoutCustomRequestPanelProps = {
  userId: string;
  audience: UiLayoutAudience;
  presetId: UiLayoutPresetId;
  selectedPack?: UiLayoutStylePack | null;
};

function statusColor(status: UiLayoutCustomRequestStatus) {
  if (status === 'ready') return mxTheme.colors.warning;
  if (status === 'submitted') return mxTheme.colors.success;
  if (status === 'quoted') return '#38bdf8';
  if (status === 'parked') return mxTheme.colors.muted;
  return mxTheme.colors.accentSoft;
}

function RequestCard({
  request,
  onStatusChange,
}: {
  request: UiLayoutCustomRequest;
  onStatusChange: (requestId: string, status: UiLayoutCustomRequestStatus) => void;
}) {
  const colour = statusColor(request.status);

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: colour,
        borderRadius: mxTheme.radius.lg,
        backgroundColor: '#101010',
        padding: mxTheme.spacing.lg,
        marginBottom: mxTheme.spacing.md,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colour, fontSize: 11, fontWeight: '900', textTransform: 'uppercase' }}>
            {request.status} · {request.budgetLabel}
          </Text>
          <Text style={{ color: mxTheme.colors.text, fontSize: 16, fontWeight: '900', marginTop: 5 }}>
            {request.title}
          </Text>
          <Text style={{ color: mxTheme.colors.muted, fontSize: 12, lineHeight: 18, marginTop: 5 }}>
            {request.inspirationNotes}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 12 }}>
        {request.brandWords.map((word) => (
          <View
            key={`${request.id}-${word}`}
            style={{
              borderWidth: 1,
              borderColor: '#2a2a2a',
              borderRadius: 999,
              backgroundColor: '#080808',
              paddingHorizontal: 8,
              paddingVertical: 5,
            }}
          >
            <Text style={{ color: '#cfcfcf', fontSize: 10, fontWeight: '800' }}>{word}</Text>
          </View>
        ))}
      </View>

      <Text style={{ color: mxTheme.colors.muted, fontSize: 11, lineHeight: 16, marginTop: 10 }}>
        Colour notes: {request.colourNotes}
      </Text>
      <Text style={{ color: mxTheme.colors.muted, fontSize: 11, lineHeight: 16, marginTop: 4 }}>
        Modules: {request.requiredModules.slice(0, 4).join(', ')}
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
        <Pressable
          accessibilityRole="button"
          onPress={() => onStatusChange(request.id, 'ready')}
          style={{ borderWidth: 1, borderColor: mxTheme.colors.warning, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 8 }}
        >
          <Text style={{ color: mxTheme.colors.warning, fontSize: 11, fontWeight: '900' }}>Mark ready</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => onStatusChange(request.id, 'submitted')}
          style={{ borderWidth: 1, borderColor: mxTheme.colors.success, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 8 }}
        >
          <Text style={{ color: mxTheme.colors.success, fontSize: 11, fontWeight: '900' }}>Submit later</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => onStatusChange(request.id, 'parked')}
          style={{ borderWidth: 1, borderColor: mxTheme.colors.border, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 8 }}
        >
          <Text style={{ color: mxTheme.colors.muted, fontSize: 11, fontWeight: '900' }}>Park</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function UiLayoutCustomRequestPanel({
  userId,
  audience,
  presetId,
  selectedPack,
}: UiLayoutCustomRequestPanelProps) {
  const [refreshToken, setRefreshToken] = useState(0);
  const requests = useMemo(
    () => listUiLayoutCustomRequests(userId, audience),
    [audience, refreshToken, userId],
  );

  function createRequest() {
    if (!selectedPack) return;
    const request = createUiLayoutCustomRequest({
      userId,
      audience,
      presetId,
      pack: selectedPack,
    });
    trackUiLayoutCustomRequestCreated({ userId, audience, request });
    setRefreshToken((current) => current + 1);
  }

  function updateStatus(requestId: string, status: UiLayoutCustomRequestStatus) {
    const request = updateUiLayoutCustomRequestStatus(userId, audience, requestId, status);
    if (request) {
      trackUiLayoutCustomRequestStatusChanged({ userId, audience, request });
    }
    setRefreshToken((current) => current + 1);
  }

  return (
    <View style={{ marginTop: mxTheme.spacing.lg }}>
      <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900', marginBottom: 8 }}>
        Custom layout requests
      </Text>
      <Text style={{ color: mxTheme.colors.muted, lineHeight: 19, marginBottom: 12 }}>
        Draft bespoke UI requests for future Style Marketplace or Tech Slave contributor workflows.
      </Text>

      <Pressable
        accessibilityRole="button"
        disabled={!selectedPack}
        onPress={createRequest}
        style={{
          borderWidth: 1,
          borderColor: selectedPack ? selectedPack.accent : mxTheme.colors.border,
          borderRadius: 999,
          backgroundColor: selectedPack ? '#171717' : '#0b0b0b',
          paddingHorizontal: 14,
          paddingVertical: 10,
          alignSelf: 'flex-start',
          marginBottom: mxTheme.spacing.md,
          opacity: selectedPack ? 1 : 0.65,
        }}
      >
        <Text style={{ color: selectedPack ? selectedPack.accent : mxTheme.colors.muted, fontWeight: '900' }}>
          {selectedPack ? `Draft ${selectedPack.title} request` : 'Select a custom pack first'}
        </Text>
      </Pressable>

      {requests.length === 0 ? (
        <View
          style={{
            borderWidth: 1,
            borderColor: mxTheme.colors.border,
            borderRadius: mxTheme.radius.md,
            backgroundColor: '#0d0d0d',
            padding: mxTheme.spacing.md,
          }}
        >
          <Text style={{ color: mxTheme.colors.muted }}>No custom layout request drafts yet.</Text>
        </View>
      ) : null}

      {requests.map((request) => (
        <RequestCard key={request.id} request={request} onStatusChange={updateStatus} />
      ))}
    </View>
  );
}
