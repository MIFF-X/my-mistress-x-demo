import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, TextInput, Alert, ScrollView } from 'react-native';
import { blogGeneratorApi } from './blog-generator-api';

export default function BloggerConnectModal({ visible, onClose }) {
  const [blogId, setBlogId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [blogUrl, setBlogUrl] = useState('');
  const [platformUrl, setPlatformUrl] = useState('https://mistress-x.com');
  const [loading, setLoading] = useState(false);

  async function handleConnect() {
    if (!blogId.trim()) { Alert.alert('Blog ID is required'); return; }
    setLoading(true);
    try {
      const result = await blogGeneratorApi.connectBlogger({
        blogId: blogId.trim(),
        accessToken: accessToken.trim() || undefined,
        apiKey: apiKey.trim() || undefined,
        blogUrl: blogUrl.trim() || undefined,
        platformUrl: platformUrl.trim() || 'https://mistress-x.com',
      });
      Alert.alert(
        '✦ Blogger Connected',
        result.blogInfo ? `Connected to: ${result.blogInfo.name}` : 'Blogger account linked successfully.',
      );
      onClose();
    } catch (err) {
      Alert.alert('Connection failed', err.message ?? 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.modal}>
            <Text style={styles.title}>Connect Blogger</Text>
            <Text style={styles.subtitle}>Link your Google Blogger blog to receive auto-generated posts</Text>

            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                Find your Blog ID in Blogger Dashboard → Settings → Basic. Your OAuth access token can be obtained via Google OAuth2 with the blogger scope.
              </Text>
            </View>

            <Text style={styles.label}>Blog ID *</Text>
            <TextInput
              style={styles.input}
              placeholder="1234567890123456789"
              placeholderTextColor="#4a3060"
              value={blogId}
              onChangeText={setBlogId}
            />

            <Text style={styles.label}>OAuth Access Token</Text>
            <TextInput
              style={styles.input}
              placeholder="ya29.a0A..."
              placeholderTextColor="#4a3060"
              value={accessToken}
              onChangeText={setAccessToken}
              secureTextEntry
            />

            <Text style={styles.label}>API Key (optional fallback)</Text>
            <TextInput
              style={styles.input}
              placeholder="AIza..."
              placeholderTextColor="#4a3060"
              value={apiKey}
              onChangeText={setApiKey}
              secureTextEntry
            />

            <Text style={styles.label}>Blog URL (display only)</Text>
            <TextInput
              style={styles.input}
              placeholder="https://yourblog.blogspot.com"
              placeholderTextColor="#4a3060"
              value={blogUrl}
              onChangeText={setBlogUrl}
              keyboardType="url"
            />

            <Text style={styles.label}>Mistress-X Platform URL</Text>
            <TextInput
              style={styles.input}
              placeholder="https://mistress-x.com"
              placeholderTextColor="#4a3060"
              value={platformUrl}
              onChangeText={setPlatformUrl}
              keyboardType="url"
            />

            <View style={styles.actions}>
              <TouchableOpacity style={styles.btnCancel} onPress={onClose}>
                <Text style={styles.btnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btnConnect, loading && { opacity: 0.5 }]}
                onPress={handleConnect}
                disabled={loading}
              >
                <Text style={styles.btnText}>{loading ? 'Connecting...' : '✦ Connect Blog'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  modal: {
    backgroundColor: '#1a0a2e',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.3)',
    gap: 14,
  },
  title: { color: '#d4af37', fontSize: 20, fontWeight: '700', letterSpacing: 3 },
  subtitle: { color: '#c9a8d4', fontSize: 12, letterSpacing: 1 },
  infoBox: {
    backgroundColor: 'rgba(212,175,55,0.06)',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 2,
    borderLeftColor: '#d4af37',
  },
  infoText: { color: '#c9a8d4', fontSize: 11, lineHeight: 18 },
  label: { color: '#d4af37', fontSize: 10, letterSpacing: 2, fontWeight: '700', textTransform: 'uppercase' },
  input: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.2)',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 14,
  },
  actions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  btnCancel: { flex: 1, padding: 14, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(201,168,212,0.3)', alignItems: 'center' },
  btnCancelText: { color: '#c9a8d4', fontWeight: '600' },
  btnConnect: { flex: 2, padding: 14, borderRadius: 8, backgroundColor: '#d4af37', alignItems: 'center' },
  btnText: { color: '#0d0618', fontWeight: '700', letterSpacing: 1 },
});
