import React from 'react';
import { Pressable, Text, View } from 'react-native';

type CommandAction = {
  id: string;
  label: string;
  helper: string;
  tone: 'task' | 'journal' | 'reward' | 'review';
};

type DailyServiceCommandPanelProps = {
  title?: string;
  subtitle?: string;
  actions?: CommandAction[];
  onActionPress?: (action: CommandAction) => void;
};

const defaultActions: CommandAction[] = [
  { id: 'assign-task', label: 'Assign Task', helper: 'Create a new daily action', tone: 'task' },
  { id: 'send-prompt', label: 'Send Prompt', helper: 'Issue a journal/reflection prompt', tone: 'journal' },
  { id: 'award-reward', label: 'Award Reward', helper: 'Grant points, badge, or sticker', tone: 'reward' },
  { id: 'review-queue', label: 'Review Queue', helper: 'Check submitted items', tone: 'review' },
];

function actionAccent(tone: CommandAction['tone']) {
  if (tone === 'task') return '#ff3f8e';
  if (tone === 'journal') return '#a855f7';
  if (tone === 'reward') return '#d4af37';
  return '#1D9E75';
}

export function DailyServiceCommandPanel({
  title = 'Daily Service Commands',
  subtitle = 'Quick creator/admin actions for assigning tasks, sending prompts, awarding rewards, and reviewing submitted service items.',
  actions = defaultActions,
  onActionPress,
}: DailyServiceCommandPanelProps) {
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
      <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>{title}</Text>
      <Text style={{ color: '#999', fontSize: 12, lineHeight: 18, marginTop: 5, marginBottom: 12 }}>{subtitle}</Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {actions.map((action) => {
          const accent = actionAccent(action.tone);
          return (
            <Pressable
              key={action.id}
              onPress={() => onActionPress?.(action)}
              style={{
                flexGrow: 1,
                minWidth: 145,
                backgroundColor: '#050505',
                borderColor: accent,
                borderWidth: 1,
                borderRadius: 16,
                padding: 12,
              }}
            >
              <Text style={{ color: accent, fontSize: 11, fontWeight: '900', textTransform: 'uppercase' }}>{action.label}</Text>
              <Text style={{ color: '#aaa', fontSize: 11, lineHeight: 16, marginTop: 5 }}>{action.helper}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
