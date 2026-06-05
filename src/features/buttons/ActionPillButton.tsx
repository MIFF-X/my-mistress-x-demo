import React from 'react';
import { Pressable, Text, TextStyle, ViewStyle } from 'react-native';
import { ActionRowButtonKey, getActionRowButtonSpec } from './ActionRowButtonPack';

type ActionPillButtonProps = {
  actionKey: ActionRowButtonKey;
  disabled?: boolean;
  label?: string;
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
};

export function ActionPillButton({
  actionKey,
  disabled = false,
  label,
  onPress,
  style,
  textStyle,
}: ActionPillButtonProps) {
  const spec = getActionRowButtonSpec(actionKey);
  const backgroundColor = disabled ? '#2a2a2a' : spec.backgroundColor;
  const borderColor = disabled ? '#444444' : spec.borderColor;
  const color = disabled ? '#777777' : spec.textColor;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={{
        alignItems: 'center',
        backgroundColor,
        borderColor,
        borderRadius: 10,
        borderWidth: 1,
        flexDirection: 'row',
        marginBottom: 6,
        marginRight: 6,
        minHeight: 38,
        paddingHorizontal: 10,
        paddingVertical: 8,
        opacity: disabled ? 0.7 : 1,
        ...style,
      }}
    >
      <Text
        style={{
          color,
          fontSize: 12,
          fontWeight: '900',
          ...textStyle,
        }}
      >
        {spec.fallbackGlyph} {label || spec.label}
      </Text>
    </Pressable>
  );
}
