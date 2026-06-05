import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { mxTheme } from '../../theme/mxTheme';

type CrownLoginProps = {
  mode?: 'login' | 'register';
  email: string;
  password: string;
  username?: string;
  error?: string | null;
  isSubmitting?: boolean;
  showUsername?: boolean;
  submitLabel?: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onUsernameChange?: (value: string) => void;
  onSubmit: () => void;
  onToggleMode?: () => void;
  children?: React.ReactNode;
};

export default function CrownLogin({
  mode = 'login',
  email,
  password,
  username = '',
  error,
  isSubmitting,
  showUsername,
  submitLabel,
  onEmailChange,
  onPasswordChange,
  onUsernameChange,
  onSubmit,
  onToggleMode,
  children,
}: CrownLoginProps) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.crownOrb}>
          <Text style={styles.crown}>👑</Text>
        </View>
        <Text style={styles.kicker}>Mistress-X Platform</Text>
        <Text style={styles.title}>{mode === 'login' ? 'Enter the Realm' : 'Create Your Access'}</Text>
        <Text style={styles.subtitle}>One crown-themed gateway for web and app. Sub, Mistress and Headmistress routes unlock after login.</Text>

        <TextInput
          placeholder="Email"
          placeholderTextColor={mxTheme.colors.muted}
          value={email}
          onChangeText={onEmailChange}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />

        {showUsername ? (
          <TextInput
            placeholder="Username"
            placeholderTextColor={mxTheme.colors.muted}
            value={username}
            onChangeText={onUsernameChange}
            autoCapitalize="none"
            style={styles.input}
          />
        ) : null}

        <TextInput
          placeholder="Password"
          placeholderTextColor={mxTheme.colors.muted}
          secureTextEntry
          value={password}
          onChangeText={onPasswordChange}
          style={styles.input}
        />

        <Pressable disabled={isSubmitting} onPress={onSubmit} style={[styles.loginButton, isSubmitting && styles.loginButtonDisabled]}>
          <Text style={styles.loginText}>{isSubmitting ? 'Entering…' : submitLabel || (mode === 'login' ? 'Login' : 'Register')}</Text>
        </Pressable>

        {onToggleMode ? (
          <Pressable onPress={onToggleMode} style={styles.toggleButton}>
            <Text style={styles.toggleText}>Switch to {mode === 'login' ? 'Register' : 'Login'}</Text>
          </Pressable>
        ) : null}

        {children}
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: mxTheme.colors.background, padding: mxTheme.spacing.xl },
  card: { width: '100%', maxWidth: 520, backgroundColor: mxTheme.colors.surface, borderWidth: 1, borderColor: mxTheme.colors.warning, borderRadius: mxTheme.radius.xl, padding: mxTheme.spacing.xl, alignItems: 'center' },
  crownOrb: { width: 86, height: 86, borderRadius: 43, borderWidth: 1, borderColor: mxTheme.colors.warning, alignItems: 'center', justifyContent: 'center', backgroundColor: '#090909', marginBottom: mxTheme.spacing.md },
  crown: { fontSize: 42 },
  kicker: { color: mxTheme.colors.warning, fontSize: 12, fontWeight: '900', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: mxTheme.spacing.xs },
  title: { fontSize: 28, fontWeight: '900', color: mxTheme.colors.text, marginBottom: mxTheme.spacing.sm, textAlign: 'center' },
  subtitle: { color: mxTheme.colors.muted, fontSize: 13, lineHeight: 19, textAlign: 'center', marginBottom: mxTheme.spacing.lg },
  input: { width: '100%', padding: mxTheme.spacing.md, borderRadius: mxTheme.radius.md, borderWidth: 1, borderColor: mxTheme.colors.border, color: mxTheme.colors.text, marginBottom: mxTheme.spacing.md, backgroundColor: '#050505' },
  loginButton: { width: '100%', padding: mxTheme.spacing.md, borderRadius: mxTheme.radius.md, backgroundColor: mxTheme.colors.warning, alignItems: 'center' },
  loginButtonDisabled: { opacity: 0.65 },
  loginText: { color: '#050505', fontWeight: '900', fontSize: 16 },
  toggleButton: { marginTop: mxTheme.spacing.md },
  toggleText: { color: mxTheme.colors.muted, fontSize: 13, fontWeight: '800' },
  error: { color: '#ff6b6b', marginTop: mxTheme.spacing.md, textAlign: 'center' },
});
