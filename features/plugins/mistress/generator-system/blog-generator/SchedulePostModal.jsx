import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { blogGeneratorApi } from './blog-generator-api';

export default function SchedulePostModal({ visible, post, onClose }) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSchedule() {
    if (!date || !time) { Alert.alert('Please enter date (YYYY-MM-DD) and time (HH:MM)'); return; }
    const iso = new Date(`${date}T${time}:00`).toISOString();
    if (isNaN(new Date(iso).getTime())) { Alert.alert('Invalid date/time'); return; }

    setLoading(true);
    try {
      await blogGeneratorApi.schedulePost(post.id, iso);
      Alert.alert('✦ Post Scheduled', `Your article will be published on ${date} at ${time}`);
      onClose();
    } catch (err) {
      Alert.alert('Schedule failed', err.message ?? 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>🗓 Schedule Post</Text>
          {post && <Text style={styles.postTitle} numberOfLines={2}>{post.title}</Text>}

          <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.input}
            placeholder="2026-06-15"
            placeholderTextColor="#4a3060"
            value={date}
            onChangeText={setDate}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Time (HH:MM — 24h)</Text>
          <TextInput
            style={styles.input}
            placeholder="14:00"
            placeholderTextColor="#4a3060"
            value={time}
            onChangeText={setTime}
            keyboardType="numeric"
          />

          <View style={styles.actions}>
            <TouchableOpacity style={styles.btnCancel} onPress={onClose}>
              <Text style={styles.btnCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btnSchedule, loading && { opacity: 0.5 }]}
              onPress={handleSchedule}
              disabled={loading}
            >
              <Text style={styles.btnText}>{loading ? 'Scheduling...' : '✦ Confirm Schedule'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 24 },
  modal: {
    backgroundColor: '#1a0a2e',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.3)',
    gap: 14,
  },
  title: { color: '#d4af37', fontSize: 18, fontWeight: '700', letterSpacing: 2 },
  postTitle: { color: '#c9a8d4', fontSize: 13, fontStyle: 'italic' },
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
  btnSchedule: { flex: 2, padding: 14, borderRadius: 8, backgroundColor: '#8b1e5a', alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700', letterSpacing: 1 },
});
