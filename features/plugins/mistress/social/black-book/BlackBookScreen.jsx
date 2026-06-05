import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert, Modal } from 'react-native';

const CATEGORIES = ['NOTE', 'CONFESSION', 'SECRET', 'INTEL', 'INFRACTION', 'FANTASY', 'TRIBUTE'];
const MOODS = ['PLEASED', 'AMUSED', 'DISAPPOINTED', 'FURIOUS', 'INTRIGUED', 'COLD'];

const CATEGORY_META = {
  NOTE:       { icon: '📝', color: '#c9a8d4' },
  CONFESSION: { icon: '🕯️', color: '#ff3f7f' },
  SECRET:     { icon: '🔒', color: '#d4af37' },
  INTEL:      { icon: '👁️', color: '#a78bfa' },
  INFRACTION: { icon: '⚡', color: '#ef4444' },
  FANTASY:    { icon: '✦', color: '#ec4899' },
  TRIBUTE:    { icon: '👑', color: '#d4af37' },
};

const MOOD_META = {
  PLEASED:      { icon: '😌', color: '#22c55e' },
  AMUSED:       { icon: '😏', color: '#d4af37' },
  DISAPPOINTED: { icon: '😒', color: '#f97316' },
  FURIOUS:      { icon: '😤', color: '#ef4444' },
  INTRIGUED:    { icon: '🧐', color: '#a78bfa' },
  COLD:         { icon: '🧊', color: '#60a5fa' },
};

export default function BlackBookScreen() {
  const [tab, setTab] = useState('entries');
  const [entries, setEntries] = useState([]);
  const [stats, setStats] = useState({ total: 0, sealed: 0, byCategory: {} });
  const [filterCategory, setFilterCategory] = useState('');
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showCompose, setShowCompose] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', category: 'NOTE', mood: '', subjectLabel: '', tags: '', isSealed: false });

  useEffect(() => { load(); }, [filterCategory]);

  async function load() {
    try {
      const url = filterCategory ? `/api/black-book?category=${filterCategory}` : '/api/black-book';
      const [e, s] = await Promise.all([
        fetch(url).then(r => r.json()),
        fetch('/api/black-book/stats').then(r => r.json()),
      ]);
      setEntries(e.items ?? []);
      setStats(s);
    } catch {}
  }

  async function saveEntry() {
    if (!form.title || !form.content) { Alert.alert('Title and content required.'); return; }
    const payload = { ...form, tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [] };
    await fetch('/api/black-book', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    setShowCompose(false);
    setForm({ title: '', content: '', category: 'NOTE', mood: '', subjectLabel: '', tags: '', isSealed: false });
    load();
  }

  async function sealEntry(id) {
    await fetch(`/api/black-book/${id}/seal`, { method: 'POST' });
    Alert.alert('✦ Entry Sealed', 'This entry has been sealed in the book.');
    load();
    setSelectedEntry(null);
  }

  async function deleteEntry(id) {
    Alert.alert('Destroy Entry?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Destroy', style: 'destructive', onPress: async () => {
        await fetch(`/api/black-book/${id}`, { method: 'DELETE' });
        load(); setSelectedEntry(null);
      }},
    ]);
  }

  const catMeta = (cat) => CATEGORY_META[cat] ?? CATEGORY_META.NOTE;
  const moodMeta = (m) => m ? (MOOD_META[m] ?? null) : null;

  return (
    <View style={s.screen}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>✦ LITTLE BLACK BOOK ✦</Text>
        <Text style={s.sub}>Private — For Your Eyes Only</Text>
      </View>

      {/* Tabs */}
      <View style={s.tabs}>
        {['entries', 'stats'].map(t => (
          <TouchableOpacity key={t} style={[s.tab, tab === t && s.tabActive]} onPress={() => setTab(t)}>
            <Text style={[s.tabText, tab === t && s.tabTextActive]}>{t.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'stats' && (
        <ScrollView contentContainerStyle={s.inner}>
          <View style={s.statsRow}>
            <View style={s.statCard}><Text style={s.statNum}>{stats.total}</Text><Text style={s.statLabel}>Entries</Text></View>
            <View style={s.statCard}><Text style={s.statNum}>{stats.sealed}</Text><Text style={s.statLabel}>Sealed</Text></View>
            <View style={s.statCard}><Text style={s.statNum}>{stats.total - stats.sealed}</Text><Text style={s.statLabel}>Open</Text></View>
          </View>
          <Text style={s.sectionLabel}>By Category</Text>
          {CATEGORIES.map(cat => {
            const meta = catMeta(cat);
            const count = stats.byCategory?.[cat] ?? 0;
            return (
              <View key={cat} style={s.catStatRow}>
                <Text style={s.catStatIcon}>{meta.icon}</Text>
                <Text style={[s.catStatName, { color: meta.color }]}>{cat}</Text>
                <Text style={s.catStatCount}>{count}</Text>
              </View>
            );
          })}
        </ScrollView>
      )}

      {tab === 'entries' && (
        <>
          {/* Category filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll}>
            <TouchableOpacity style={[s.filterChip, !filterCategory && s.filterChipActive]} onPress={() => setFilterCategory('')}>
              <Text style={[s.filterText, !filterCategory && s.filterTextActive]}>ALL</Text>
            </TouchableOpacity>
            {CATEGORIES.map(cat => {
              const meta = catMeta(cat);
              return (
                <TouchableOpacity key={cat} style={[s.filterChip, filterCategory === cat && s.filterChipActive, filterCategory === cat && { borderColor: meta.color }]} onPress={() => setFilterCategory(filterCategory === cat ? '' : cat)}>
                  <Text style={[s.filterText, filterCategory === cat && { color: meta.color }]}>{meta.icon} {cat}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <ScrollView contentContainerStyle={s.inner}>
            {entries.length === 0 && (
              <View style={s.emptyState}>
                <Text style={s.emptyIcon}>📖</Text>
                <Text style={s.emptyText}>The book is empty.{'\n'}Begin writing.</Text>
              </View>
            )}
            {entries.map(entry => {
              const meta = catMeta(entry.category);
              const mood = moodMeta(entry.mood);
              return (
                <TouchableOpacity key={entry.id} style={[s.entryCard, entry.isSealed && s.entrySealed]} onPress={() => setSelectedEntry(entry)}>
                  <View style={s.entryTop}>
                    <View style={[s.categoryPill, { borderColor: meta.color + '60', backgroundColor: meta.color + '15' }]}>
                      <Text style={[s.categoryPillText, { color: meta.color }]}>{meta.icon} {entry.category}</Text>
                    </View>
                    {entry.isSealed && <Text style={s.sealedBadge}>🔐 SEALED</Text>}
                    {mood && <Text style={s.moodBadge}>{mood.icon}</Text>}
                  </View>
                  <Text style={s.entryTitle}>{entry.title}</Text>
                  {entry.subjectLabel && <Text style={s.entrySubject}>Subject: {entry.subjectLabel}</Text>}
                  <Text style={s.entryPreview} numberOfLines={2}>{entry.content}</Text>
                  <Text style={s.entryDate}>{new Date(entry.createdAt).toLocaleDateString()}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </>
      )}

      {/* FAB */}
      <TouchableOpacity style={s.fab} onPress={() => setShowCompose(true)}>
        <Text style={s.fabText}>✦ New Entry</Text>
      </TouchableOpacity>

      {/* Compose Modal */}
      <Modal visible={showCompose} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>NEW ENTRY</Text>
            <TextInput style={s.input} value={form.title} onChangeText={v => setForm(f => ({ ...f, title: v }))} placeholder="Entry title..." placeholderTextColor="#4a3060" />
            <TextInput style={[s.input, s.textarea]} value={form.content} onChangeText={v => setForm(f => ({ ...f, content: v }))} placeholder="Write here..." placeholderTextColor="#4a3060" multiline numberOfLines={5} />
            <TextInput style={s.input} value={form.subjectLabel} onChangeText={v => setForm(f => ({ ...f, subjectLabel: v }))} placeholder="Subject name (optional)..." placeholderTextColor="#4a3060" />

            <Text style={s.fieldLabel}>CATEGORY</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {CATEGORIES.map(cat => {
                const meta = catMeta(cat);
                return (
                  <TouchableOpacity key={cat} style={[s.optChip, form.category === cat && { borderColor: meta.color, backgroundColor: meta.color + '20' }]} onPress={() => setForm(f => ({ ...f, category: cat }))}>
                    <Text style={[s.optChipText, form.category === cat && { color: meta.color }]}>{meta.icon} {cat}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Text style={s.fieldLabel}>MOOD</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {MOODS.map(m => {
                const meta = MOOD_META[m];
                return (
                  <TouchableOpacity key={m} style={[s.optChip, form.mood === m && { borderColor: meta.color, backgroundColor: meta.color + '20' }]} onPress={() => setForm(f => ({ ...f, mood: form.mood === m ? '' : m }))}>
                    <Text style={[s.optChipText, form.mood === m && { color: meta.color }]}>{meta.icon} {m}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TextInput style={s.input} value={form.tags} onChangeText={v => setForm(f => ({ ...f, tags: v }))} placeholder="Tags (comma separated)..." placeholderTextColor="#4a3060" />

            <TouchableOpacity style={[s.sealToggle, form.isSealed && s.sealToggleActive]} onPress={() => setForm(f => ({ ...f, isSealed: !f.isSealed }))}>
              <Text style={[s.sealToggleText, form.isSealed && { color: '#d4af37' }]}>
                {form.isSealed ? '🔐 Sealed on creation' : '📖 Open entry'}
              </Text>
            </TouchableOpacity>

            <View style={s.modalActions}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setShowCompose(false)}><Text style={s.cancelText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={s.saveBtn} onPress={saveEntry}><Text style={s.saveText}>✦ Record</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Entry Detail Modal */}
      <Modal visible={!!selectedEntry} animationType="fade" transparent>
        <View style={s.modalOverlay}>
          <View style={s.detailCard}>
            {selectedEntry && (() => {
              const meta = catMeta(selectedEntry.category);
              const mood = moodMeta(selectedEntry.mood);
              return (
                <>
                  <View style={s.detailTop}>
                    <View style={[s.categoryPill, { borderColor: meta.color + '60', backgroundColor: meta.color + '15' }]}>
                      <Text style={[s.categoryPillText, { color: meta.color }]}>{meta.icon} {selectedEntry.category}</Text>
                    </View>
                    {mood && <Text style={[s.moodBadge, { fontSize: 20 }]}>{mood.icon}</Text>}
                    {selectedEntry.isSealed && <Text style={s.sealedBadge}>🔐 SEALED</Text>}
                  </View>
                  <Text style={s.detailTitle}>{selectedEntry.title}</Text>
                  {selectedEntry.subjectLabel && <Text style={s.detailSubject}>Subject: {selectedEntry.subjectLabel}</Text>}
                  <ScrollView style={{ maxHeight: 200 }}>
                    <Text style={s.detailContent}>{selectedEntry.content}</Text>
                  </ScrollView>
                  <Text style={s.detailDate}>{new Date(selectedEntry.createdAt).toLocaleString()}</Text>
                  <View style={s.detailActions}>
                    {!selectedEntry.isSealed && (
                      <TouchableOpacity style={s.sealBtn} onPress={() => sealEntry(selectedEntry.id)}>
                        <Text style={s.sealBtnText}>🔐 Seal Entry</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity style={s.destroyBtn} onPress={() => deleteEntry(selectedEntry.id)}>
                      <Text style={s.destroyBtnText}>Destroy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.closeBtn} onPress={() => setSelectedEntry(null)}>
                      <Text style={s.closeBtnText}>Close</Text>
                    </TouchableOpacity>
                  </View>
                </>
              );
            })()}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#080410' },
  header: { paddingTop: 24, paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(212,175,55,0.12)' },
  title: { fontSize: 18, fontWeight: '700', color: '#d4af37', letterSpacing: 4, textAlign: 'center' },
  sub: { color: 'rgba(201,168,212,0.5)', fontSize: 10, letterSpacing: 3, textAlign: 'center', marginTop: 4 },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: 'rgba(212,175,55,0.1)' },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#d4af37' },
  tabText: { color: 'rgba(201,168,212,0.4)', fontSize: 11, letterSpacing: 1 },
  tabTextActive: { color: '#d4af37', fontWeight: '700' },
  inner: { padding: 16, paddingBottom: 100 },
  filterScroll: { paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(212,175,55,0.06)' },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(201,168,212,0.2)', marginRight: 8 },
  filterChipActive: { borderColor: '#d4af37', backgroundColor: 'rgba(212,175,55,0.1)' },
  filterText: { color: 'rgba(201,168,212,0.5)', fontSize: 11 },
  filterTextActive: { color: '#d4af37', fontWeight: '700' },
  entryCard: { backgroundColor: 'rgba(255,255,255,0.025)', borderWidth: 1, borderColor: 'rgba(212,175,55,0.1)', borderRadius: 12, padding: 16, marginBottom: 10 },
  entrySealed: { borderColor: 'rgba(212,175,55,0.25)', backgroundColor: 'rgba(212,175,55,0.04)' },
  entryTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' },
  categoryPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
  categoryPillText: { fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  sealedBadge: { fontSize: 10, color: '#d4af37', fontWeight: '700', letterSpacing: 1 },
  moodBadge: { fontSize: 14 },
  entryTitle: { color: '#fff', fontWeight: '700', fontSize: 15, marginBottom: 4 },
  entrySubject: { color: '#ff3f7f', fontSize: 11, marginBottom: 6, fontStyle: 'italic' },
  entryPreview: { color: 'rgba(201,168,212,0.6)', fontSize: 12, lineHeight: 18, marginBottom: 8 },
  entryDate: { color: 'rgba(201,168,212,0.3)', fontSize: 10 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { color: 'rgba(201,168,212,0.4)', textAlign: 'center', fontSize: 13, lineHeight: 20 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: 'rgba(212,175,55,0.06)', borderWidth: 1, borderColor: 'rgba(212,175,55,0.15)', borderRadius: 12, padding: 18, alignItems: 'center' },
  statNum: { color: '#d4af37', fontSize: 26, fontWeight: '700' },
  statLabel: { color: '#c9a8d4', fontSize: 10, marginTop: 4, letterSpacing: 1 },
  sectionLabel: { color: '#d4af37', fontSize: 10, letterSpacing: 2, fontWeight: '700', textTransform: 'uppercase', marginBottom: 12 },
  catStatRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)', gap: 10 },
  catStatIcon: { fontSize: 16, width: 24 },
  catStatName: { flex: 1, fontSize: 12, fontWeight: '600', letterSpacing: 1 },
  catStatCount: { color: '#d4af37', fontWeight: '700', fontSize: 16 },
  fab: { position: 'absolute', bottom: 28, right: 20, backgroundColor: '#1a0a24', borderWidth: 1, borderColor: '#d4af37', borderRadius: 24, paddingHorizontal: 20, paddingVertical: 12 },
  fabText: { color: '#d4af37', fontWeight: '700', letterSpacing: 2, fontSize: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#100820', borderTopLeftRadius: 24, borderTopRightRadius: 24, borderTopWidth: 1, borderColor: 'rgba(212,175,55,0.2)', padding: 24, paddingBottom: 40 },
  modalTitle: { color: '#d4af37', fontWeight: '700', letterSpacing: 4, fontSize: 14, textAlign: 'center', marginBottom: 20 },
  input: { backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(212,175,55,0.15)', borderRadius: 8, padding: 12, color: '#fff', marginBottom: 10, fontSize: 13 },
  textarea: { height: 100, textAlignVertical: 'top' },
  fieldLabel: { color: '#d4af37', fontSize: 9, letterSpacing: 2, fontWeight: '700', marginBottom: 8 },
  optChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(201,168,212,0.2)', marginRight: 8 },
  optChipText: { color: '#c9a8d4', fontSize: 11 },
  sealToggle: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(201,168,212,0.2)', alignItems: 'center', marginBottom: 16 },
  sealToggleActive: { borderColor: '#d4af37', backgroundColor: 'rgba(212,175,55,0.08)' },
  sealToggleText: { color: '#c9a8d4', fontSize: 12 },
  modalActions: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(201,168,212,0.2)', alignItems: 'center' },
  cancelText: { color: '#c9a8d4', fontWeight: '600' },
  saveBtn: { flex: 2, padding: 14, borderRadius: 10, backgroundColor: '#1a0a24', borderWidth: 1, borderColor: '#d4af37', alignItems: 'center' },
  saveText: { color: '#d4af37', fontWeight: '700', letterSpacing: 2 },
  detailCard: { backgroundColor: '#100820', margin: 20, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(212,175,55,0.25)', padding: 24 },
  detailTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' },
  detailTitle: { color: '#fff', fontWeight: '700', fontSize: 18, marginBottom: 6 },
  detailSubject: { color: '#ff3f7f', fontSize: 12, fontStyle: 'italic', marginBottom: 12 },
  detailContent: { color: '#c9a8d4', fontSize: 13, lineHeight: 22 },
  detailDate: { color: 'rgba(201,168,212,0.3)', fontSize: 10, marginTop: 12, marginBottom: 16 },
  detailActions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  sealBtn: { flex: 1, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#d4af37', alignItems: 'center' },
  sealBtnText: { color: '#d4af37', fontWeight: '700', fontSize: 12 },
  destroyBtn: { padding: 10, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(239,68,68,0.4)', alignItems: 'center' },
  destroyBtnText: { color: '#ef4444', fontWeight: '600', fontSize: 12 },
  closeBtn: { padding: 10, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(201,168,212,0.2)', alignItems: 'center' },
  closeBtnText: { color: '#c9a8d4', fontWeight: '600', fontSize: 12 },
});
