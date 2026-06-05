import type { UiLayoutAudience, UiLayoutPresetId } from './layoutPresets';
import type { UiLayoutStylePack } from './uiLayoutStylePacks';
import type { UiLayoutCustomRequest, UiLayoutCustomRequestStatus } from './uiLayoutCustomRequest';

export type UiLayoutAnalyticsEventType =
  | 'layout_preset_selected'
  | 'layout_preset_saved'
  | 'layout_lock_toggled'
  | 'layout_reset'
  | 'style_pack_applied'
  | 'style_pack_custom_requested'
  | 'custom_request_created'
  | 'custom_request_status_changed'
  | 'preview_focus_changed';

export type UiLayoutAnalyticsEvent = {
  id: string;
  type: UiLayoutAnalyticsEventType;
  userId: string;
  audience: UiLayoutAudience;
  presetId?: UiLayoutPresetId;
  stylePackId?: string;
  requestId?: string;
  requestStatus?: UiLayoutCustomRequestStatus;
  details?: Record<string, string | number | boolean | undefined>;
  createdAt: string;
};

const memoryEvents: UiLayoutAnalyticsEvent[] = [];

function createEventId(type: UiLayoutAnalyticsEventType, userId: string) {
  return `ui-layout-${type}-${userId}-${Date.now()}`.replace(/[^a-zA-Z0-9-_]/g, '-');
}

export function trackUiLayoutEvent(event: Omit<UiLayoutAnalyticsEvent, 'id' | 'createdAt'>) {
  const trackedEvent: UiLayoutAnalyticsEvent = {
    ...event,
    id: createEventId(event.type, event.userId),
    createdAt: new Date().toISOString(),
  };

  memoryEvents.unshift(trackedEvent);
  return trackedEvent;
}

export function trackUiLayoutPresetSelected(input: {
  userId: string;
  audience: UiLayoutAudience;
  presetId: UiLayoutPresetId;
}) {
  return trackUiLayoutEvent({
    type: 'layout_preset_selected',
    userId: input.userId,
    audience: input.audience,
    presetId: input.presetId,
  });
}

export function trackUiLayoutPresetSaved(input: {
  userId: string;
  audience: UiLayoutAudience;
  presetId: UiLayoutPresetId;
  locked: boolean;
}) {
  return trackUiLayoutEvent({
    type: 'layout_preset_saved',
    userId: input.userId,
    audience: input.audience,
    presetId: input.presetId,
    details: { locked: input.locked },
  });
}

export function trackUiLayoutLockToggled(input: {
  userId: string;
  audience: UiLayoutAudience;
  presetId: UiLayoutPresetId;
  locked: boolean;
}) {
  return trackUiLayoutEvent({
    type: 'layout_lock_toggled',
    userId: input.userId,
    audience: input.audience,
    presetId: input.presetId,
    details: { locked: input.locked },
  });
}

export function trackUiLayoutStylePackApplied(input: {
  userId: string;
  audience: UiLayoutAudience;
  presetId?: UiLayoutPresetId;
  pack: UiLayoutStylePack;
}) {
  return trackUiLayoutEvent({
    type: 'style_pack_applied',
    userId: input.userId,
    audience: input.audience,
    presetId: input.presetId,
    stylePackId: input.pack.id,
    details: {
      tier: input.pack.tier,
      status: input.pack.status,
      priceLabel: input.pack.priceLabel,
    },
  });
}

export function trackUiLayoutCustomRequestCreated(input: {
  userId: string;
  audience: UiLayoutAudience;
  request: UiLayoutCustomRequest;
}) {
  return trackUiLayoutEvent({
    type: 'custom_request_created',
    userId: input.userId,
    audience: input.audience,
    presetId: input.request.presetId,
    stylePackId: input.request.requestedPackId,
    requestId: input.request.id,
    requestStatus: input.request.status,
  });
}

export function trackUiLayoutCustomRequestStatusChanged(input: {
  userId: string;
  audience: UiLayoutAudience;
  request: UiLayoutCustomRequest;
}) {
  return trackUiLayoutEvent({
    type: 'custom_request_status_changed',
    userId: input.userId,
    audience: input.audience,
    presetId: input.request.presetId,
    stylePackId: input.request.requestedPackId,
    requestId: input.request.id,
    requestStatus: input.request.status,
  });
}

export function listUiLayoutAnalyticsEvents(limit = 50) {
  return memoryEvents.slice(0, limit);
}

export function clearUiLayoutAnalyticsEvents() {
  memoryEvents.splice(0, memoryEvents.length);
}
