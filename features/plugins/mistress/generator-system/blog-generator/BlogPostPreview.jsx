import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';

const DOOR_PREVIEW = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       👁️‍🗨️  THE DOOR AWAITS
  Step through into Mistress-X
  ✦  Enter Mistress-X  ✦
  By Invitation of the Headmistress
━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

export default function BlogPostPreview({ post, loading, onPostNow, onSchedule }) {
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#d4af37" />
        <Text style={styles.loadingText}>The Headmistress is writing...</Text>
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyIcon}>✍️</Text>
        <Text style={styles.emptyText}>No article generated yet.</Text>
        <Text style={styles.emptyHint}>Fill the form and press Generate Article</Text>
      </View>
    );
  }

  const statusColor = {
    DRAFT: '#c9a8d4',
    SCHEDULED: '#d4af37',
    PUBLISHING: '#ff9f40',
    PUBLISHED: '#22c55e',
    FAILED: '#ff3f7f',
  }[post.status] ?? '#c9a8d4';

  return (
    <View style={styles.container}>
      {/* Status badge */}
      <View style={[styles.statusBadge, { borderColor: statusColor }]}>
        <Text style={[styles.statusText, { color: statusColor }]}>{post.status}</Text>
      </View>

      {/* Title */}
      <Text style={styles.title}>{post.title}</Text>

      {/* Meta */}
      <View style={styles.meta}>
        {post.tags?.map((t) => (
          <View key={t} style={styles.tag}><Text style={styles.tagText}>{t}</Text></View>
        ))}
      </View>

      {/* Article body preview */}
      <View style={styles.articleCard}>
        <Text style={styles.articleText}>{post.content?.slice(0, 600)}...</Text>
      </View>

      {/* Door preview */}
      <View style={styles.doorPreview}>
        <Text style={styles.doorText}>{DOOR_PREVIEW}</Text>
      </View>

      {/* Blogger URL if published */}
      {post.bloggerUrl && (
        <View style={styles.publishedBar}>
          <Text style={styles.publishedLabel}>✓ Published at:</Text>
          <Text style={styles.publishedUrl}>{post.bloggerUrl}</Text>
        </View>
      )}

      {/* Actions */}
      {post.status === 'DRAFT' && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.btnPost} onPress={onPostNow}>
            <Text style={styles.btnText}>🚀  Post Now</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnSchedule} onPress={onSchedule}>
            <Text style={styles.btnText}>🗓  Schedule</Text>
          </TouchableOpacity>
        </View>
      )}
      {post.status === 'SCHEDULED' && (
        <View style={styles.scheduledInfo}>
          <Text style={styles.scheduledText}>
            ⏰ Scheduled for {new Date(post.scheduledFor).toLocaleString()}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  centered: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12 },
  loadingText: { color: '#d4af37', fontSize: 14, letterSpacing: 2 },
  emptyIcon: { fontSize: 48 },
  emptyText: { color: '#c9a8d4', fontSize: 16, fontWeight: '600' },
  emptyHint: { color: 'rgba(201,168,212,0.4)', fontSize: 12 },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: { fontSize: 10, fontWeight: '700', letterSpacing: 2 },
  title: { color: '#d4af37', fontSize: 20, fontWeight: '700', lineHeight: 28 },
  meta: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { backgroundColor: 'rgba(139,30,90,0.3)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  tagText: { color: '#c9a8d4', fontSize: 11 },
  articleCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.15)',
    borderRadius: 10,
    padding: 16,
  },
  articleText: { color: '#c9a8d4', fontSize: 13, lineHeight: 20 },
  doorPreview: {
    backgroundColor: 'rgba(26,10,46,0.8)',
    borderWidth: 1,
    borderColor: '#d4af37',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
  },
  doorText: { color: '#d4af37', fontSize: 11, letterSpacing: 1, textAlign: 'center', lineHeight: 20 },
  publishedBar: {
    backgroundColor: 'rgba(34,197,94,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.3)',
    borderRadius: 8,
    padding: 12,
  },
  publishedLabel: { color: '#22c55e', fontSize: 11, fontWeight: '700' },
  publishedUrl: { color: '#c9a8d4', fontSize: 11, marginTop: 4 },
  actions: { flexDirection: 'row', gap: 12 },
  btnPost: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#ff3f7f',
    alignItems: 'center',
  },
  btnSchedule: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#8b1e5a',
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 13, letterSpacing: 1 },
  scheduledInfo: {
    backgroundColor: 'rgba(212,175,55,0.1)',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  scheduledText: { color: '#d4af37', fontSize: 13 },
});
