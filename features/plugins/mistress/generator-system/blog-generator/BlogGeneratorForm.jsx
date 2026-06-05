import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

const TONES = ['authoritative', 'playful', 'mysterious', 'commanding'];
const SOURCES = [
  { key: 'web', label: '🌐 Web Search' },
  { key: 'diary', label: '📓 Mistress Diary' },
  { key: 'journal', label: '📔 Sub Journals' },
];

export default function BlogGeneratorForm({ onGenerate, loading }) {
  const [topic, setTopic] = useState('');
  const [selectedSources, setSelectedSources] = useState(['web']);
  const [tone, setTone] = useState('authoritative');
  const [keywords, setKeywords] = useState('');
  const [tags, setTags] = useState('');

  function toggleSource(key) {
    setSelectedSources((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key],
    );
  }

  function handleSubmit() {
    if (!topic.trim()) { alert('Please enter a topic.'); return; }
    onGenerate({
      topic: topic.trim(),
      sources: selectedSources,
      tone,
      seoKeywords: keywords.split(',').map((k) => k.trim()).filter(Boolean),
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
    });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Topic / Prompt</Text>
      <TextInput
        style={styles.textarea}
        multiline
        numberOfLines={4}
        placeholder="e.g. The art of devotion and discipline in modern dynamics..."
        placeholderTextColor="#4a3060"
        value={topic}
        onChangeText={setTopic}
      />

      <Text style={styles.label}>Content Sources</Text>
      <View style={styles.row}>
        {SOURCES.map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            style={[styles.chip, selectedSources.includes(key) && styles.chipActive]}
            onPress={() => toggleSource(key)}
          >
            <Text style={[styles.chipText, selectedSources.includes(key) && styles.chipTextActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Tone</Text>
      <View style={styles.row}>
        {TONES.map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.chip, tone === t && styles.chipActivePurple]}
            onPress={() => setTone(t)}
          >
            <Text style={[styles.chipText, tone === t && styles.chipTextActive]}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>SEO Keywords (comma separated)</Text>
      <TextInput
        style={styles.input}
        placeholder="mistress, domination, submission, devotion..."
        placeholderTextColor="#4a3060"
        value={keywords}
        onChangeText={setKeywords}
      />

      <Text style={styles.label}>Tags (comma separated)</Text>
      <TextInput
        style={styles.input}
        placeholder="lifestyle, dynamics, training..."
        placeholderTextColor="#4a3060"
        value={tags}
        onChangeText={setTags}
      />

      <TouchableOpacity
        style={[styles.btnGenerate, loading && styles.btnDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.btnText}>
          {loading ? '⟳  Generating...' : '✦  Generate Article'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  label: { color: '#d4af37', fontSize: 11, letterSpacing: 2, fontWeight: '700', textTransform: 'uppercase' },
  input: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.2)',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 14,
  },
  textarea: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.2)',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.3)',
    backgroundColor: 'transparent',
  },
  chipActive: { backgroundColor: 'rgba(212,175,55,0.15)', borderColor: '#d4af37' },
  chipActivePurple: { backgroundColor: 'rgba(139,30,90,0.3)', borderColor: '#8b1e5a' },
  chipText: { color: 'rgba(201,168,212,0.6)', fontSize: 12 },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  btnGenerate: {
    marginTop: 8,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    background: 'linear-gradient(135deg, #d4af37, #b8922a)',
    backgroundColor: '#d4af37',
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: '#0d0618', fontSize: 14, fontWeight: '700', letterSpacing: 2 },
});
