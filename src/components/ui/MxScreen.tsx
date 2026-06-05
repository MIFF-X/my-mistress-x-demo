import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { mxTheme } from '../../theme/mxTheme';

type MxScreenProps = {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  scroll?: boolean;
};

export function MxScreen({ title, subtitle, children, scroll = true }: MxScreenProps) {
  const content = (
    <View style={{ padding: mxTheme.spacing.lg }}>
      {title ? (
        <Text style={{ color: mxTheme.colors.text, fontSize: 26, fontWeight: '900', marginBottom: 6 }}>
          {title}
        </Text>
      ) : null}

      {subtitle ? (
        <Text style={{ color: mxTheme.colors.muted, marginBottom: mxTheme.spacing.lg }}>
          {subtitle}
        </Text>
      ) : null}

      {children}
    </View>
  );

  if (scroll) {
    return <ScrollView style={{ flex: 1, backgroundColor: mxTheme.colors.background }}>{content}</ScrollView>;
  }

  return <View style={{ flex: 1, backgroundColor: mxTheme.colors.background }}>{content}</View>;
}
