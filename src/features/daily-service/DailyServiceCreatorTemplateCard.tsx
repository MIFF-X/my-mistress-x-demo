import React from 'react';
import { Pressable, Text, View } from 'react-native';

type CreatorTemplate = {
  id: string;
  title: string;
  helper: string;
  category: 'task' | 'journal' | 'challenge' | 'reward';
  difficulty?: 'easy' | 'medium' | 'hard';
};

type DailyServiceCreatorTemplateCardProps = {
  title?: string;
  subtitle?: string;
  templates?: CreatorTemplate[];
  onUseTemplate?: (template: CreatorTemplate) => void;
};

const defaultTemplates: CreatorTemplate[] = [
  { id: 'daily-checkin', title: 'Daily Check-In', helper: 'Simple recurring task template.', category: 'task', difficulty: 'easy' },
  { id: 'reflection-prompt', title: 'Reflection Prompt', helper: 'Journal prompt with optional sharing.', category: 'journal', difficulty: 'easy' },
  { id: 'seven-day-streak', title: '7-Day Streak', helper: 'Challenge with milestone reward.', category: 'challenge', difficulty: 'medium' },
  { id: 'reward-drop', title: 'Reward Drop', helper: 'Points, badge, or sticker unlock.', category: 'reward', difficulty: 'medium' },
];

function templateAccent(category: CreatorTemplate['category']) {
  if (category === 'task') return '#ff3f8e';
  if (category === 'journal') return '#a855f7';
  if (category === 'challenge') return '#d4af37';
  return '#1D9E75';
}

export function DailyServiceCreatorTemplateCard({
  title = 'Creator Templates',
  subtitle = 'Reusable task, prompt, challenge, and reward templates for building daily service flows quickly.',
  templates = defaultTemplates,
  onUseTemplate,
}: DailyServiceCreatorTemplateCardProps) {
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

      <View style={{ gap: 10 }}>
        {templates.map((template) => {
          const accent = templateAccent(template.category);
          return (
            <View key={template.id} style={{ backgroundColor: '#050505', borderColor: accent, borderWidth: 1, borderRadius: 14, padding: 11 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#fff', fontWeight: '900', fontSize: 13 }}>{template.title}</Text>
                  <Text style={{ color: '#888', fontSize: 11, lineHeight: 16, marginTop: 4 }}>{template.helper}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: accent, fontSize: 10, fontWeight: '900' }}>{template.category.toUpperCase()}</Text>
                  {template.difficulty ? <Text style={{ color: '#777', fontSize: 9, fontWeight: '800', marginTop: 3 }}>{template.difficulty.toUpperCase()}</Text> : null}
                </View>
              </View>

              <Pressable onPress={() => onUseTemplate?.(template)} style={{ marginTop: 10, backgroundColor: accent, borderRadius: 999, paddingVertical: 9, alignItems: 'center' }}>
                <Text style={{ color: '#080808', fontWeight: '900', fontSize: 12 }}>Use Template</Text>
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}
