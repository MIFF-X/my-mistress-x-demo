export const NOTIFICATION_SOUND_MAP = {
  info: 'soft-chime',
  success: 'success-chime',
  warning: 'attention-chime',
  error: 'alert-chime',
};

export function getNotificationSound(type = 'info', preferences = {}) {
  if (preferences.muted) {
    return null;
  }

  return preferences[type] || NOTIFICATION_SOUND_MAP[type] || NOTIFICATION_SOUND_MAP.info;
}

export function createSoundPreference(input = {}) {
  return {
    muted: Boolean(input.muted),
    info: input.info || NOTIFICATION_SOUND_MAP.info,
    success: input.success || NOTIFICATION_SOUND_MAP.success,
    warning: input.warning || NOTIFICATION_SOUND_MAP.warning,
    error: input.error || NOTIFICATION_SOUND_MAP.error,
  };
}
