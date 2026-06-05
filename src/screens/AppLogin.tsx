import React from 'react';
import { AuthUser } from '../api/authApi';
import { AuthScreen } from '../features/auth/AuthScreen';

type AppLoginScreenProps = {
  onSuccess?: (user: AuthUser) => void;
};

export default function AppLoginScreen({ onSuccess = () => undefined }: AppLoginScreenProps) {
  return <AuthScreen onSuccess={onSuccess} />;
}
