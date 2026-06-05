import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import BlogGeneratorForm from './BlogGeneratorForm';
import BlogPostPreview from './BlogPostPreview';
import BlogPostsList from './BlogPostsList';
import BloggerConnectModal from './BloggerConnectModal';
import SchedulePostModal from './SchedulePostModal';
import { blogGeneratorApi } from './blog-generator-api';

export default function BlogGeneratorScreen() {
  const [generatedPost, setGeneratedPost] = useState(null);
  const [posts, setPosts] = useState([]);
  const [bloggerStatus, setBloggerStatus] = useState({ connected: false });
  const [loading, setLoading] = useState(false);
  const [showConnect, setShowConnect] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [activeTab, setActiveTab] = useState('generate');

  useEffect(() => {
    loadStatus();
    loadPosts();
  }, []);

  async function loadStatus() {
    try {
      const status = await blogGeneratorApi.getBloggerStatus();
      setBloggerStatus(status);
    } catch {}
  }

  async function loadPosts() {
    try {
      const result = await blogGeneratorApi.listPosts();
      setPosts(result.items ?? []);
    } catch {}
  }

  async function handleGenerate(formData) {
    setLoading(true);
    try {
      const post = await blogGeneratorApi.generateArticle(formData);
      setGeneratedPost(post);
      setActiveTab('preview');
    } catch (err) {
      alert('Generation failed: ' + (err.message ?? 'Unknown error'));
    } finally {
      setLoading(false);
    }
  }

  async function handlePostNow() {
    if (!generatedPost) return;
    if (!bloggerStatus.connected) {
      setShowConnect(true);
      return;
    }
    setLoading(true);
    try {
      const result = await blogGeneratorApi.postNow(generatedPost.id);
      setGeneratedPost(result);
      await loadPosts();
      alert('✦ Posted to Blogger successfully!');
    } catch (err) {
      alert('Post failed: ' + (err.message ?? 'Unknown error'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>BLOG GENERATOR</Text>
        <Text style={styles.headerSub}>Powered by Headmistress Intelligence</Text>

        {/* Blogger status */}
        <TouchableOpacity style={styles.statusBar} onPress={() => setShowConnect(true)}>
          <View style={[styles.statusDot, bloggerStatus.connected ? styles.dotGreen : styles.dotRed]} />
          <Text style={styles.statusText}>
            {bloggerStatus.connected ? `Blogger: ${bloggerStatus.blogUrl ?? 'Connected'}` : 'Blogger: Not Connected — tap to connect'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab bar */}
      <View style={styles.tabs}>
        {['generate', 'preview', 'history'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'generate' ? '✍ Write' : tab === 'preview' ? '👁 Preview' : '📜 History'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        {activeTab === 'generate' && (
          <BlogGeneratorForm onGenerate={handleGenerate} loading={loading} />
        )}

        {activeTab === 'preview' && (
          <BlogPostPreview
            post={generatedPost}
            loading={loading}
            onPostNow={handlePostNow}
            onSchedule={() => setShowSchedule(true)}
          />
        )}

        {activeTab === 'history' && (
          <BlogPostsList posts={posts} onRefresh={loadPosts} />
        )}
      </ScrollView>

      {/* Modals */}
      <BloggerConnectModal
        visible={showConnect}
        onClose={() => { setShowConnect(false); loadStatus(); }}
      />
      <SchedulePostModal
        visible={showSchedule}
        post={generatedPost}
        onClose={() => { setShowSchedule(false); loadPosts(); }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0d0618' },
  header: { padding: 20, paddingTop: 48, borderBottomWidth: 1, borderBottomColor: 'rgba(212,175,55,0.2)' },
  headerTitle: {
    fontFamily: 'Orbitron',
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 4,
    color: '#d4af37',
  },
  headerSub: { color: '#c9a8d4', fontSize: 12, letterSpacing: 2, marginTop: 4 },
  statusBar: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  dotGreen: { backgroundColor: '#22c55e' },
  dotRed: { backgroundColor: '#ff3f7f' },
  statusText: { color: '#c9a8d4', fontSize: 12, letterSpacing: 1 },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: 'rgba(212,175,55,0.15)' },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#d4af37' },
  tabText: { color: 'rgba(201,168,212,0.5)', fontSize: 12, letterSpacing: 1, fontWeight: '600' },
  tabTextActive: { color: '#d4af37' },
  content: { flex: 1 },
  contentInner: { padding: 20, paddingBottom: 40 },
});
