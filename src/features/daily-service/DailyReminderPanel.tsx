import React from 'react';
import { Pressable, Text, View } from 'react-native';

type DailyReminder = {
  id: string;
  label: string;
  timeLabel: string;
  helper: string;
  enabled: boolean;
};

type DailyReminderPanelProps = {
  title?: string;
  subtitle?: string;
  reminders?: DailyReminder[];
  onToggleReminder?: (reminder: DailyReminder) => void;
  onOpenSettings?: () => void;
};

const defaultReminders: DailyReminder[] = [
  { id: 'login', label: 'Daily login', timeLabel: '9:00 AM', helper: 'Claim daily points', enabled: true },
  { id: 'task', label: 'Task due', timeLabel: '6:00 PM', helper: 'Finish today’s task', enabled: true },
  { id: 'journal', label: 'Journal prompt', timeLabel: '8:30 PM', helper: 'Write reflection entry', enabled: false },
  { id: 'watch', label: 'Watch room', timeLabel: '15 min before', helper: 'Live/watch reminder', enabled: true },
];

export function DailyReminderPanel({
  title = 'Daily Reminders',
  subtitle = 'Reminder settings for login points, tasks, journal prompts, bookings, and Watch With Mistress rooms.',
  reminders = defaultReminders,
  onToggleReminder,
  onOpenSettings,
}: DailyReminderPanelProps) {
  return (
    <View
      style={{
        backgroundColor: '#101010',
        borderColor: '#2a1620',
        borderWidth: 1,
        borderRadius: 18,
        padding: 14,
        marginBottom: 16,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>{title}</Text>
          <Text style={{ color: '#999', fontSize: 12, lineHeight: 18, marginTop: 5 }}>{subtitle}</Text>
        </View>
        <Pressable onPress={onOpenSettings} style={{ backgroundColor: '#1a0b13', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 }}>
          <Text style={{ color: '#ff9abf', fontSize: 10, fontWeight: '900' }}>SETTINGS</Text>
        </Pressable>
      </View>

      <View style={{ gap: 8, marginTop: 12 }}>
        {reminders.map((reminder) => (
          <Pressable
            key={reminder.id}
            onPress={() => onToggleReminder?.(reminder)}
            style={{
              backgroundColor: reminder.enabled ? '#140b12' : '#050505',
              borderColor: reminder.enabled ? '#ff3f8e' : '#262626',
              borderWidth: 1,
              borderRadius: 14,
              padding: 11,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: 999,
                backgroundColor: reminder.enabled ? '#ff3f8e' : '#333',
              }}
            />
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#fff', fontWeight: '900', fontSize: 13 }}>{reminder.label}</Text>
              <Text style={{ color: '#888', fontSize: 11, marginTop: 3 }}>{reminder.helper}</Text>
            </View>
            <Text style={{ color: reminder.enabled ? '#d4af37' : '#777', fontWeight: '900', fontSize: 11 }}>{reminder.timeLabel}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
