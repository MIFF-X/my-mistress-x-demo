import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const CHAIN_MODES = [
  { id: 'OFFCHAIN_NFT_READY', label: 'NFT Ready' },
  { id: 'PLATFORM_COLLECTIBLE', label: 'Platform Collectible' },
  { id: 'MINTED_NFT', label: 'Minted NFT' },
];

function getToken() {
  try {
    return typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
  } catch {
    return null;
  }
}

async function postJson(path, body) {
  const token = getToken();
  const response = await fetch(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export default function ContentVaultNftPublisherScreen() {
  const [vaultItemId, setVaultItemId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editionSize, setEditionSize] = useState('1');
  const [chainMode, setChainMode] = useState('OFFCHAIN_NFT_READY');
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);

  async function publish() {
    if (!vaultItemId.trim()) {
      Alert.alert('Vault item required', 'Enter the Content Vault item ID to publish as an NFT.');
      return;
    }

    setSaving(true);
    setResult(null);
    try {
      const data = await postJson(`/api/content-vault/${vaultItemId.trim()}/publish-as-nft`, {
        title: title.trim() || undefined,
        description: description.trim() || undefined,
        editionSize: Number(editionSize) || 1,
        chainMode,
        status: 'PENDING_REVIEW',
      });
      setResult(data);
      Alert.alert('Sent for Review', 'The Content Vault item was sent to MX NFT Marketplace review.');
    } catch (error) {
      Alert.alert('Preview / Backend Unreachable', 'The Publish as NFT flow is wired, but the backend was not reachable from this screen.');
      setResult({
        status: 'PENDING_REVIEW',
        nftAsset: {
          id: `preview-nft-${Date.now()}`,
          title: title || 'Vault NFT Asset',
          chainMode,
          editionSize: Number(editionSize) || 1,
        },
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.inner}>
      <View style={s.hero}>
        <Text style={s.kicker}>CONTENT VAULT SHORTCUT</Text>
        <Text style={s.title}>PUBLISH AS NFT</Text>
        <Text style={s.sub}>
          Turn a ready Content Vault item into an MX NFT Marketplace asset. The asset is created as pending review so Headmistress/Admin can approve, list, reject, or archive it.
        </Text>
      </View>

      <View style={s.panel}>
        <Text style={s.label}>Vault Item ID</Text>
        <TextInput
          style={s.input}
          value={vaultItemId}
          onChangeText={setVaultItemId}
          placeholder="vault item id..."
          placeholderTextColor="#6c5877"
          autoCapitalize="none"
        />

        <Text style={s.label}>NFT Title Override</Text>
        <TextInput
          style={s.input}
          value={title}
          onChangeText={setTitle}
          placeholder="optional title..."
          placeholderTextColor="#6c5877"
        />

        <Text style={s.label}>NFT Description Override</Text>
        <TextInput
          style={[s.input, s.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="optional description..."
          placeholderTextColor="#6c5877"
          multiline
          textAlignVertical="top"
        />

        <Text style={s.label}>Edition Size</Text>
        <TextInput
          style={s.input}
          value={editionSize}
          onChangeText={setEditionSize}
          placeholder="1"
          placeholderTextColor="#6c5877"
          keyboardType="number-pad"
        />

        <Text style={s.label}>NFT Mode</Text>
        <View style={s.modeRow}>
          {CHAIN_MODES.map((mode) => (
            <TouchableOpacity key={mode.id} style={[s.modeChip, chainMode === mode.id && s.modeChipActive]} onPress={() => setChainMode(mode.id)}>
              <Text style={[s.modeText, chainMode === mode.id && s.modeTextActive]}>{mode.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={[s.button, saving && s.buttonDisabled]} onPress={publish} disabled={saving}>
          {saving ? <ActivityIndicator color="#080410" /> : <Text style={s.buttonText}>SEND TO NFT REVIEW</Text>}
        </TouchableOpacity>
      </View>

      <View style={s.infoBox}>
        <Text style={s.infoTitle}>Flow</Text>
        <Text style={s.infoText}>Content Vault → NFT Asset → Pending Review → Headmistress Approves/Lists → Marketplace Sell/Auction/Raffle/Swap/Win.</Text>
      </View>

      {result?.nftAsset ? (
        <View style={s.resultBox}>
          <Text style={s.resultTitle}>Created NFT Asset</Text>
          <Text style={s.resultText}>ID: {result.nftAsset.id}</Text>
          <Text style={s.resultText}>Title: {result.nftAsset.title}</Text>
          <Text style={s.resultText}>Status: {result.status || result.nftAsset.status || 'PENDING_REVIEW'}</Text>
          <Text style={s.resultText}>Mode: {result.nftAsset.chainMode || chainMode}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#080410' },
  inner: { padding: 20, paddingBottom: 48 },
  hero: { padding: 18, borderRadius: 22, borderWidth: 1, borderColor: 'rgba(212,175,55,0.35)', backgroundColor: 'rgba(212,175,55,0.07)', marginBottom: 18 },
  kicker: { color: '#d4af37', fontSize: 11, fontWeight: '900', letterSpacing: 2, marginBottom: 6 },
  title: { color: '#fff', fontSize: 24, fontWeight: '900', letterSpacing: 2, marginBottom: 8 },
  sub: { color: '#c9a8d4', fontSize: 13, lineHeight: 19 },
  panel: { borderRadius: 18, borderWidth: 1, borderColor: 'rgba(212,175,55,0.18)', backgroundColor: 'rgba(255,255,255,0.03)', padding: 16 },
  label: { color: '#d4af37', fontSize: 10, fontWeight: '900', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8, marginTop: 12 },
  input: { backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)', borderRadius: 10, padding: 12, color: '#fff' },
  textArea: { height: 90 },
  modeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  modeChip: { borderRadius: 999, borderWidth: 1, borderColor: 'rgba(212,175,55,0.22)', paddingHorizontal: 10, paddingVertical: 7 },
  modeChipActive: { backgroundColor: 'rgba(212,175,55,0.16)', borderColor: '#d4af37' },
  modeText: { color: '#c9a8d4', fontSize: 10, fontWeight: '800' },
  modeTextActive: { color: '#d4af37' },
  button: { backgroundColor: '#d4af37', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 16 },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#080410', fontWeight: '900', letterSpacing: 2 },
  infoBox: { backgroundColor: 'rgba(212,175,55,0.06)', borderRadius: 12, padding: 14, borderLeftWidth: 3, borderLeftColor: '#d4af37', marginTop: 14 },
  infoTitle: { color: '#d4af37', fontWeight: '900', marginBottom: 5 },
  infoText: { color: '#c9a8d4', fontSize: 12, lineHeight: 17 },
  resultBox: { borderRadius: 16, borderWidth: 1, borderColor: 'rgba(34,197,94,0.35)', backgroundColor: 'rgba(34,197,94,0.08)', padding: 14, marginTop: 14 },
  resultTitle: { color: '#22c55e', fontSize: 14, fontWeight: '900', marginBottom: 8 },
  resultText: { color: '#d8cfe1', fontSize: 12, lineHeight: 18 },
});
