import type { UiLayoutAudience } from './layoutPresets';
import {
  listUiLayoutAnalyticsEvents,
  type UiLayoutAnalyticsEvent,
  type UiLayoutAnalyticsEventType,
} from './uiLayoutAnalytics';

export type UiLayoutAdminAnalyticsSummary = {
  totalEvents: number;
  eventsByType: Record<UiLayoutAnalyticsEventType, number>;
  eventsByAudience: Partial<Record<UiLayoutAudience, number>>;
  latestEvents: UiLayoutAnalyticsEvent[];
  mostRecentEventAt?: string;
};

const EVENT_TYPES: UiLayoutAnalyticsEventType[] = [
  'layout_preset_selected',
  'layout_preset_saved',
  'layout_lock_toggled',
  'layout_reset',
  'style_pack_applied',
  'style_pack_custom_requested',
  'custom_request_created',
  'custom_request_status_changed',
  'preview_focus_changed',
];

function emptyEventsByType(): Record<UiLayoutAnalyticsEventType, number> {
  return EVENT_TYPES.reduce((summary, type) => {
    summary[type] = 0;
    return summary;
  }, {} as Record<UiLayoutAnalyticsEventType, number>);
}

export function createUiLayoutAdminAnalyticsSummary(limit = 100): UiLayoutAdminAnalyticsSummary {
  const events = listUiLayoutAnalyticsEvents(limit);
  const eventsByType = emptyEventsByType();
  const eventsByAudience: Partial<Record<UiLayoutAudience, number>> = {};

  events.forEach((event) => {
    eventsByType[event.type] += 1;
    eventsByAudience[event.audience] = (eventsByAudience[event.audience] || 0) + 1;
  });

  return {
    totalEvents: events.length,
    eventsByType,
    eventsByAudience,
    latestEvents: events.slice(0, 10),
    mostRecentEventAt: events[0]?.createdAt,
  };
}

export function getUiLayoutAdminAnalyticsHighlights(summary: UiLayoutAdminAnalyticsSummary) {
  const customRequestEvents =
    summary.eventsByType.custom_request_created + summary.eventsByType.custom_request_status_changed;

  return [
    `${summary.totalEvents} total UI layout events`,
    `${summary.eventsByType.layout_preset_saved} saved layouts`,
    `${summary.eventsByType.style_pack_applied} style packs applied`,
    `${customRequestEvents} custom request actions`,
  ];
}
