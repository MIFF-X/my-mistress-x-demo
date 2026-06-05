import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';

const STATUS_COLORS = {
  DRAFT: '#c9a8d4',
  SCHEDULED: '#d4af37',
  PUBLISHING: '#ff9f40',
  PUBLISHED: '#22c55e',
  FAILED: '#ff3f7f',
};

const STATUS_ICONS = {
  DRAFT: '✏️',
  SCHEDULED: '⏰',
  PUBLISHING: '⟳',
  PUBLISHED: '✓',
  FAILED: '✗',
};

function PostCard({ post }) {
  const color = STATUS_COLORS[post.status] ?? '#c9a8d4';
  const icon = STATUS_ICONS[post.status] ?? '•';

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.statusDot, { backgroundColor: color }]} />
        <Text style={[styles.statusLabel, { color }]}>{icon} {post.status}</Text>
        <Text style={styles.date}>{new Date(post.createdAt).toLocaleDateString()}</Text>
      </View>

      <Text style={styles.cardTitle} numberOfLines={2}>{post.title}</Text>

      {post.status === 'SCHEDULED' && post.scheduledFor && (
        <Text style={styles.scheduledLine}>
          ⏰ Publishes {new Date(post.scheduledFor).toLocaleString()}
        </Text>
      )}

      {post.bloggerUrl && (
        <Text style={styles.bloggerUrl} numberOfLines={1}>🔗 {post.bloggerUrl}</Text>
      )}

      <View style={styles.tagsRow}>
        {(post.tags ?? []).slice(0, 4).map((t) => (
          <View key={t} style={styles.tag}><Text style={styles.tagText}>{t}</Text></View>
        ))}
        {(post.sources ?? []).map((s) => (
          <View key={s} style={styles.sourceTag}><Text style={styles.sourceText}>{s}</Text></View>
        ))}
      </View>
    </View>
  );
}

export default function BlogPostsList({ posts, onRefresh }) {
  const [refreshing, setRefreshing] = React.useState(false);

  async function handleRefresh() {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  }

  if (!posts.length) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>📜</Text>
        <Text style={styles.emptyText}>No posts yet</Text>
        <Text style={styles.emptyHint}>Generate your first article to get started</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <PostCard post={item} />}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#d4af37" />}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      scrollEnabled={false}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.12)',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusDot: { width: 7, height: 7, borderRadius: 3.5 },
  statusLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, flex: 1 },
  date: { color: 'rgba(201,168,212,0.4)', fontSize: 11 },
  cardTitle: { color: '#fff', fontSize: 15, fontWeight: '600', lineHeight: 22 },
  scheduledLine: { color: '#d4af37', fontSize: 12 },
  bloggerUrl: { color: '#22c55e', fontSize: 11 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  tag: { backgroundColor: 'rgba(139,30,90,0.25)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  tagText: { color: '#c9a8d4', fontSize: 10 },
  sourceTag: { backgroundColor: 'rgba(212,175,55,0.1)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  sourceText: { color: '#d4af37', fontSize: 10 },
  separator: { height: 10 },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 8 },
  emptyIcon: { fontSize: 40 },
  emptyText: { color: '#c9a8d4', fontSize: 16, fontWeight: '600' },
  emptyHint: { color: 'rgba(201,168,212,0.4)', fontSize: 12 },
});
