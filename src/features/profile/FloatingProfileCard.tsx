import React from 'react';
import { Text, View } from 'react-native';
import { mxTheme } from '../../theme/mxTheme';

export type FloatingProfileCardIconState = 'highlighted' | 'greyed' | 'unknown' | 'locked' | 'warning' | 'verified';

export type FloatingProfileCardIcon = {
  key: string;
  label: string;
  state: FloatingProfileCardIconState;
};

export type FloatingProfileCardProps = {
  displayName: string;
  subtitle?: string;
  initials?: string;
  statusLabel?: string;
  metaLabel?: string;
  rarityLabel?: string;
  tags?: string[];
  icons?: FloatingProfileCardIcon[];
  accentColor?: string;
  compact?: boolean;
};

function getIconStateColor(state: FloatingProfileCardIconState, accentColor: string) {
  if (state === 'highlighted' || state === 'verified') return accentColor;
  if (state === 'warning') return mxTheme.colors.warning;
  if (state === 'locked') return '#777';
  if (state === 'unknown') return '#555';
  return '#333';
}

function getInitials(displayName: string, initials?: string) {
  if (initials?.trim()) return initials.trim().slice(0, 2).toUpperCase();
  return displayName
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'MX';
}

export function FloatingProfileCard({
  displayName,
  subtitle,
  initials,
  statusLabel = 'Verified',
  metaLabel,
  rarityLabel = 'Collector Card',
  tags = [],
  icons = [],
  accentColor = mxTheme.colors.warning,
  compact = false,
}: FloatingProfileCardProps) {
  const visibleTags = tags.slice(0, compact ? 3 : 6);
  const visibleIcons = icons.slice(0, compact ? 5 : 8);

  return (
    <View
      style={{
        backgroundColor: '#f8f5ee',
        borderColor: '#ffffff',
        borderWidth: 3,
        borderRadius: 24,
        padding: compact ? 10 : 14,
        marginBottom: 12,
        shadowColor: '#ffffff',
        shadowOpacity: 0.24,
        shadowRadius: 14,
      }}
    >
      <View
        style={{
          backgroundColor: '#130814',
          borderColor: accentColor,
          borderWidth: 1,
          borderRadius: 20,
          minHeight: compact ? 92 : 132,
          padding: compact ? 10 : 14,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: accentColor, fontSize: compact ? 32 : 44, fontWeight: '900' }}>
          {getInitials(displayName, initials)}
        </Text>
        <Text style={{ color: '#ffffff', fontSize: 11, marginTop: 6, fontWeight: '800' }}>{rarityLabel}</Text>
      </View>

      <View style={{ marginTop: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#120814', fontSize: compact ? 18 : 22, fontWeight: '900' }}>{displayName}</Text>
            {subtitle ? <Text style={{ color: '#5b4456', fontSize: 12, fontWeight: '800', marginTop: 2 }}>{subtitle}</Text> : null}
            {metaLabel ? <Text style={{ color: '#7a6c76', fontSize: 11, marginTop: 2 }}>{metaLabel}</Text> : null}
          </View>
          <View style={{ backgroundColor: accentColor, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 }}>
            <Text style={{ color: '#120814', fontSize: 10, fontWeight: '900' }}>{statusLabel}</Text>
          </View>
        </View>

        {visibleTags.length ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 }}>
            {visibleTags.map((tag) => (
              <View key={tag} style={{ backgroundColor: '#eadfea', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4, marginRight: 6, marginBottom: 6 }}>
                <Text style={{ color: '#23111f', fontSize: 10, fontWeight: '800' }}>{tag}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {visibleIcons.length ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 }}>
            {visibleIcons.map((icon) => {
              const iconColor = getIconStateColor(icon.state, accentColor);
              return (
                <View
                  key={icon.key}
                  style={{
                    borderColor: iconColor,
                    backgroundColor: icon.state === 'greyed' ? '#ded8df' : '#fff',
                    borderWidth: 1,
                    borderRadius: 999,
                    paddingHorizontal: 7,
                    paddingVertical: 4,
                    marginRight: 5,
                    marginBottom: 5,
                    opacity: icon.state === 'greyed' ? 0.45 : 1,
                  }}
                >
                  <Text style={{ color: iconColor, fontSize: 9, fontWeight: '900' }}>{icon.label}</Text>
                </View>
              );
            })}
          </View>
        ) : null}
      </View>
    </View>
  );
}
