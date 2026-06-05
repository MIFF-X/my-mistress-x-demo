import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { AuthUser, DEMO_LOGIN_ACCOUNTS, loginUser, registerUser } from '../../api/authApi';
import { setAuthSession } from '../../state/authStore';
import { mxTheme } from '../../theme/mxTheme';
import CrownLogin from '../../components/shared/CrownLogin';

type AuthScreenProps = {
  onSuccess: (user: AuthUser) => void;
};

export function AuthScreen({ onSuccess }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function completeAuth(res: Awaited<ReturnType<typeof loginUser>>) {
    await setAuthSession(res.user, res.token);
    onSuccess(res.user);
  }

  async function handleSubmit(nextEmail = email, nextPassword = password) {
    setError(null);
    setIsSubmitting(true);

    try {
      const res =
        mode === 'login'
          ? await loginUser({ email: nextEmail, password: nextPassword })
          : await registerUser({ email: nextEmail, username, password: nextPassword });

      await completeAuth(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function loginDemo(emailValue: string, passwordValue: string) {
    setMode('login');
    setEmail(emailValue);
    setPassword(passwordValue);
    setError(null);
    await handleSubmit(emailValue, passwordValue);
  }

  return (
    <CrownLogin
      mode={mode}
      email={email}
      password={password}
      username={username}
      error={error}
      isSubmitting={isSubmitting}
      showUsername={mode === 'register'}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onUsernameChange={setUsername}
      onSubmit={() => handleSubmit()}
      onToggleMode={() => setMode(mode === 'login' ? 'register' : 'login')}
    >
      {mode === 'login' ? (
        <View style={{ width: '100%', marginTop: mxTheme.spacing.lg }}>
          <Text style={{ color: mxTheme.colors.text, fontWeight: '900', marginBottom: mxTheme.spacing.xs }}>Demo logins</Text>
          <Text style={{ color: mxTheme.colors.muted, marginBottom: mxTheme.spacing.md, fontSize: 12 }}>
            Tap a demo card to enter instantly.
          </Text>

          {DEMO_LOGIN_ACCOUNTS.slice(0, 4).map((account) => (
            <Pressable
              key={account.id}
              disabled={isSubmitting}
              onPress={() => loginDemo(account.email, account.password)}
              style={{
                backgroundColor: '#050505',
                padding: mxTheme.spacing.md,
                marginBottom: mxTheme.spacing.sm,
                borderRadius: mxTheme.radius.md,
                borderWidth: 1,
                borderColor: mxTheme.colors.border,
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              <Text style={{ color: mxTheme.colors.warning, fontWeight: '900' }}>{account.role}</Text>
              <Text style={{ color: mxTheme.colors.muted, fontSize: 12 }}>
                {account.email} / {account.password}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : (
        <Text style={{ color: mxTheme.colors.muted, marginTop: mxTheme.spacing.md, fontSize: 12, textAlign: 'center' }}>
          Register will create a local demo session if the backend server is not running.
        </Text>
      )}
    </CrownLogin>
  );
}
