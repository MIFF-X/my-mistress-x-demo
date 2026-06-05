import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const CONTENT_TYPES = [
  { id: 'ALL', label: 'All', icon: '◈' },
  { id: 'PHOTO', label: 'Photos', icon: '🖼' },
  { id: 'VIDEO', label: 'Video', icon: '▶' },
  { id: 'AUDIO', label: 'Audio', icon: '♪' },
  { id: 'TEXT', label: 'Text', icon: '✍' },
  { id: 'BUNDLE', label: 'Bundle', icon: '📦' },
];

const ACCESS_TIERS = [
  { id: 'FREE_PREVIEW', label: 'Free Preview', color: '#22c55e' },
  { id: 'PAID', label: 'Paid', color: '#d4af37' },
  { id: 'SUBSCRIBERS_ONLY', label: 'Subscribers', color: '#60a5fa' },
  { id: 'EXCLUSIVE', label: 'Exclusive', color: '#ff3f7f' },
];

const STATUSES = [
  { id: 'DRAFT', label: 'Draft', color: 'rgba(201,168,212,0.4)' },
  { id: 'CURATING', label: 'Curating', color: '#d4af37' },
  { id: 'READY', label: 'Ready ✦', color: '#22c55e' },
  { id: 'ARCHIVED', label: 'Archived', color: 'rgba(201,168,212,0.2)' },
];

const CHANNELS = [
  { id: 'PPV', label: 'PPV', icon: '💰' },
  { id: 'LIVE_SHOW', label: 'Live Show', icon: '📡' },
  { id: 'BLOG', label: 'Blog', icon: '✍' },
  { id: 'SMM', label: 'SMM', icon: '📲' },
  { id: 'MARKETPLACE', label: 'Marketplace', icon: '🏪' },
  { id: 'STICKER', label: 'Sticker', icon: '🎴' },
  { id: 'NFT_MARKETPLACE', label: 'NFT', icon: '◆' },
];

const TABS = [
  { id: 'load', label: 'LOAD', icon: '⬆' },
  { id: 'curate', label: 'CURATE', icon: '✦' },
  { id: 'create', label: 'CREATE', icon: '✍' },
  { id: 'ready', label: 'READY', icon: '◉' },
];

const API = (path) => fetch(`/api/content-vault${path}`).then((r) => r.json());
const POST = (path, body) => fetch(`/api/content-vault${path}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
}).then((r) => r.json());
const PATCH = (path, body) => fetch(`/api/content-vault${path}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
}).then((r) => r.json());
const DEL = (path) => fetch(`/api/content-vault${path}`, { method: 'DELETE' }).then((r) => r.json());

function StatBar({ stats }) {
  return (
    <View style={s.statsStrip}>
      <StatPill label="TOTAL" value={stats.total} color="#c9a8d4" />
      <StatPill label="DRAFT" value={stats.draft} color="rgba(201,168,212,0.4)" />
      <StatPill label="CURATING" value={stats.curating} color="#d4af37" />
      <StatPill label="READY ✦" value={stats.ready} color="#22c55e" />
      <StatPill label="REVENUE" value={`$${(stats.totalRevenue ?? 0).toFixed(0)}`} color="#ff3f7f" />
    </View>
  );
}

function StatPill({ label, value, color }) {
  return (
    <View style={s.statPill}>
      <Text style={[s.statNum, { color }]}>{value ?? 0}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

function TypeChip({ type, active, onPress }) {
  return (
    <TouchableOpacity
      style={[s.typeChip, active && { borderColor: '#d4af37', backgroundColor: 'rgba(212,175,55,0.1)' }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={s.typeChipIcon}>{type.icon}</Text>
      <Text style={[s.typeChipLabel, active && { color: '#d4af37' }]}>{type.label}</Text>
    </TouchableOpacity>
  );
}

function TierBadge({ tierId }) {
  const tier = ACCESS_TIERS.find((x) => x.id === tierId) ?? ACCESS_TIERS[1];
  return (
    <View style={[s.tierBadge, { borderColor: `${tier.color}60`, backgroundColor: `${tier.color}15` }]}>
      <Text style={[s.tierBadgeText, { color: tier.color }]}>{tier.label.toUpperCase()}</Text>
    </View>
  );
}

function StatusDot({ statusId }) {
  const status = STATUSES.find((x) => x.id === statusId) ?? STATUSES[0];
  return <View style={[s.statusDot, { backgroundColor: status.color }]} />;
}

function VaultCard({ item, onPress, onReadyToggle, onPublishAsNft, isPublishingNft }) {
  const typeInfo = CONTENT_TYPES.find((type) => type.id === item.contentType) ?? CONTENT_TYPES[1];
  const channels = [...new Set((item.usages ?? []).map((usage) => usage.channel))].slice(0, 5);

  return (
    <TouchableOpacity style={s.card} onPress={() => onPress(item)} activeOpacity={0.85}>
      <View style={s.cardThumb}>
        <Text style={s.cardThumbIcon}>{typeInfo.icon}</Text>
        <StatusDot statusId={item.status} />
      </View>

      <View style={s.cardBody}>
        <Text style={s.cardTitle} numberOfLines={1}>{item.title}</Text>
        <TierBadge tierId={item.accessTier} />
        {channels.length > 0 && (
          <View style={s.cardChannels}>
            {channels.map((channel) => {
              const match = CHANNELS.find((x) => x.id === channel);
              return match ? <Text key={channel} style={s.cardChannelIcon}>{match.icon}</Text> : null;
            })}
          </View>
        )}
        {onPublishAsNft && item.isReadyListed && (
          <TouchableOpacity
            style={[s.nftInlineButton, isPublishingNft && s.nftInlineButtonDisabled]}
            onPress={() => onPublishAsNft(item)}
            disabled={isPublishingNft}
            activeOpacity={0.85}
          >
            <Text style={s.nftInlineButtonText}>{isPublishingNft ? 'SENDING TO REVIEW…' : '◆ PUBLISH AS NFT'}</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        style={[s.readyToggle, item.isReadyListed && s.readyToggleOn]}
        onPress={() => onReadyToggle(item)}
        activeOpacity={0.8}
      >
        <Text style={[s.readyToggleText, item.isReadyListed && { color: '#22c55e' }]}>{item.isReadyListed ? '✦' : '○'}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

function LoadZone({ onCreated }) {
  const [form, setForm] = useState({
    title: '', contentType: 'PHOTO', accessTier: 'PAID', mediaUrl: '', thumbnailUrl: '', description: '', tags: '',
  });
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  async function submit() {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const item = await POST('', {
        ...form,
        tags: form.tags ? form.tags.split(',').map((tag) => tag.trim()).filter(Boolean) : [],
      });
      setDone(true);
      setTimeout(() => {
        setDone(false);
        setForm({ title: '', contentType: 'PHOTO', accessTier: 'PAID', mediaUrl: '', thumbnailUrl: '', description: '', tags: '' });
      }, 1200);
      onCreated(item);
    } catch {}
    setSaving(false);
  }

  return (
    <View style={s.zone}>
      <Text style={s.zoneTitle}>⬆  LOAD CONTENT</Text>
      <Text style={s.zoneDesc}>Add a new item to your Vault. Paste a URL or fill in the metadata — media hosting is handled externally.</Text>

      <Text style={s.fieldLabel}>TITLE *</Text>
      <TextInput style={s.input} value={form.title} onChangeText={(value) => setForm((prev) => ({ ...prev, title: value }))} placeholder="Give it a name..." placeholderTextColor="rgba(201,168,212,0.3)" />

      <Text style={s.fieldLabel}>CONTENT TYPE</Text>
      <View style={s.chipRow}>
        {CONTENT_TYPES.filter((type) => type.id !== 'ALL').map((type) => (
          <TypeChip key={type.id} type={type} active={form.contentType === type.id} onPress={() => setForm((prev) => ({ ...prev, contentType: type.id }))} />
        ))}
      </View>

      <Text style={s.fieldLabel}>ACCESS TIER</Text>
      <View style={s.chipRow}>
        {ACCESS_TIERS.map((tier) => (
          <TouchableOpacity key={tier.id} style={[s.typeChip, form.accessTier === tier.id && { borderColor: tier.color, backgroundColor: `${tier.color}15` }]} onPress={() => setForm((prev) => ({ ...prev, accessTier: tier.id }))} activeOpacity={0.8}>
            <Text style={[s.typeChipLabel, form.accessTier === tier.id && { color: tier.color }]}>{tier.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={s.fieldLabel}>MEDIA URL</Text>
      <TextInput style={s.input} value={form.mediaUrl} onChangeText={(value) => setForm((prev) => ({ ...prev, mediaUrl: value }))} placeholder="https://..." placeholderTextColor="rgba(201,168,212,0.3)" autoCapitalize="none" />

      <Text style={s.fieldLabel}>THUMBNAIL URL</Text>
      <TextInput style={s.input} value={form.thumbnailUrl} onChangeText={(value) => setForm((prev) => ({ ...prev, thumbnailUrl: value }))} placeholder="https://..." placeholderTextColor="rgba(201,168,212,0.3)" autoCapitalize="none" />

      <Text style={s.fieldLabel}>DESCRIPTION</Text>
      <TextInput style={[s.input, { height: 72, textAlignVertical: 'top' }]} value={form.description} onChangeText={(value) => setForm((prev) => ({ ...prev, description: value }))} placeholder="Optional description..." placeholderTextColor="rgba(201,168,212,0.3)" multiline />

      <Text style={s.fieldLabel}>TAGS  (comma separated)</Text>
      <TextInput style={s.input} value={form.tags} onChangeText={(value) => setForm((prev) => ({ ...prev, tags: value }))} placeholder="femdom, latex, audio..." placeholderTextColor="rgba(201,168,212,0.3)" />

      <TouchableOpacity style={[s.btn, done && s.btnDone]} onPress={submit} disabled={saving || done} activeOpacity={0.85}>
        {saving ? <ActivityIndicator color="#080410" size="small" /> : <Text style={s.btnText}>{done ? '✦ ADDED TO VAULT' : 'ADD TO VAULT'}</Text>}
      </TouchableOpacity>
    </View>
  );
}

function CurateZone({ items, loading, onReadyToggle, onItemPress }) {
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const filtered = items.filter((item) => {
    if (typeFilter !== 'ALL' && item.contentType !== typeFilter) return false;
    if (statusFilter && item.status !== statusFilter) return false;
    if (search && !String(item.title || '').toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <View style={s.zone}>
      <Text style={s.zoneTitle}>✦  CURATE</Text>
      <Text style={s.zoneDesc}>Tag, tier, organise, and move content toward the Ready List.</Text>
      <TextInput style={[s.input, { marginBottom: 10 }]} value={search} onChangeText={setSearch} placeholder="Search titles..." placeholderTextColor="rgba(201,168,212,0.3)" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}><View style={s.chipRow}>{CONTENT_TYPES.map((type) => <TypeChip key={type.id} type={type} active={typeFilter === type.id} onPress={() => setTypeFilter(type.id)} />)}</View></ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
        <View style={s.chipRow}>
          <TouchableOpacity style={[s.typeChip, !statusFilter && { borderColor: '#d4af37', backgroundColor: 'rgba(212,175,55,0.1)' }]} onPress={() => setStatusFilter('')} activeOpacity={0.8}><Text style={[s.typeChipLabel, !statusFilter && { color: '#d4af37' }]}>All Statuses</Text></TouchableOpacity>
          {STATUSES.map((status) => <TouchableOpacity key={status.id} style={[s.typeChip, statusFilter === status.id && { borderColor: status.color, backgroundColor: `${status.color}15` }]} onPress={() => setStatusFilter(status.id)} activeOpacity={0.8}><Text style={[s.typeChipLabel, statusFilter === status.id && { color: status.color }]}>{status.label}</Text></TouchableOpacity>)}
        </View>
      </ScrollView>
      {loading ? <ActivityIndicator color="#d4af37" style={{ marginTop: 30 }} /> : filtered.length === 0 ? <EmptyState icon="📂" text="No items match.\nLoad some content first." /> : <View>{filtered.map((item) => <VaultCard key={item.id} item={item} onPress={onItemPress} onReadyToggle={onReadyToggle} />)}</View>}
    </View>
  );
}

function CreateZone({ onCreated }) {
  const [form, setForm] = useState({ title: '', content: '', accessTier: 'PAID', tags: '' });
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  async function submit() {
    if (!form.title.trim() || !form.content.trim()) return;
    setSaving(true);
    try {
      const item = await POST('', { title: form.title, description: form.content, contentType: 'TEXT', accessTier: form.accessTier, tags: form.tags ? form.tags.split(',').map((tag) => tag.trim()).filter(Boolean) : [] });
      setDone(true);
      setTimeout(() => { setDone(false); setForm({ title: '', content: '', accessTier: 'PAID', tags: '' }); }, 1200);
      onCreated(item);
    } catch {}
    setSaving(false);
  }

  const wordCount = form.content.trim() ? form.content.trim().split(/\s+/).length : 0;

  return (
    <View style={s.zone}>
      <Text style={s.zoneTitle}>✍  CREATE</Text>
      <Text style={s.zoneDesc}>Write captions, blog drafts, scripts, or any text content directly into the Vault.</Text>
      <Text style={s.fieldLabel}>TITLE *</Text>
      <TextInput style={s.input} value={form.title} onChangeText={(value) => setForm((prev) => ({ ...prev, title: value }))} placeholder="Give it a title..." placeholderTextColor="rgba(201,168,212,0.3)" />
      <Text style={s.fieldLabel}>ACCESS TIER</Text>
      <View style={s.chipRow}>{ACCESS_TIERS.map((tier) => <TouchableOpacity key={tier.id} style={[s.typeChip, form.accessTier === tier.id && { borderColor: tier.color, backgroundColor: `${tier.color}15` }]} onPress={() => setForm((prev) => ({ ...prev, accessTier: tier.id }))} activeOpacity={0.8}><Text style={[s.typeChipLabel, form.accessTier === tier.id && { color: tier.color }]}>{tier.label}</Text></TouchableOpacity>)}</View>
      <View style={s.editorHeader}><Text style={s.fieldLabel}>CONTENT *</Text><Text style={s.wordCount}>{wordCount} words</Text></View>
      <TextInput style={[s.input, s.editor]} value={form.content} onChangeText={(value) => setForm((prev) => ({ ...prev, content: value }))} placeholder="Write here..." placeholderTextColor="rgba(201,168,212,0.3)" multiline textAlignVertical="top" />
      <Text style={s.fieldLabel}>TAGS  (comma separated)</Text>
      <TextInput style={s.input} value={form.tags} onChangeText={(value) => setForm((prev) => ({ ...prev, tags: value }))} placeholder="caption, script, femdom..." placeholderTextColor="rgba(201,168,212,0.3)" />
      <TouchableOpacity style={[s.btn, done && s.btnDone]} onPress={submit} disabled={saving || done} activeOpacity={0.85}>{saving ? <ActivityIndicator color="#080410" size="small" /> : <Text style={s.btnText}>{done ? '✦ SAVED TO VAULT' : 'SAVE TO VAULT'}</Text>}</TouchableOpacity>
    </View>
  );
}

function ReadyZone({ items, loading, onItemPress, onReadyToggle, onPublishAsNft, publishingNftId }) {
  const [typeFilter, setTypeFilter] = useState('ALL');
  const ready = useMemo(() => items.filter((item) => item.isReadyListed && (typeFilter === 'ALL' || item.contentType === typeFilter)), [items, typeFilter]);

  return (
    <View style={s.zone}>
      <Text style={s.zoneTitle}>◉  READY LIST</Text>
      <Text style={s.zoneDesc}>Content cleared for monetisation. Every plugin can browse and pull from here.{`\n`}Toggle ✦ on any item in Curate to add it here.</Text>
      <View style={s.nftInfoBox}><Text style={s.nftInfoTitle}>◆ NFT shortcut active</Text><Text style={s.nftInfoText}>Ready items now have an inline Publish as NFT button. Publishing sends the item to MX NFT Marketplace as PENDING_REVIEW.</Text></View>
      <View style={s.channelKey}>{CHANNELS.map((channel) => <View key={channel.id} style={s.channelKeyItem}><Text style={s.channelKeyIcon}>{channel.icon}</Text><Text style={s.channelKeyLabel}>{channel.label}</Text></View>)}</View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14, marginTop: 10 }}><View style={s.chipRow}>{CONTENT_TYPES.map((type) => <TypeChip key={type.id} type={type} active={typeFilter === type.id} onPress={() => setTypeFilter(type.id)} />)}</View></ScrollView>
      {loading ? <ActivityIndicator color="#22c55e" style={{ marginTop: 30 }} /> : ready.length === 0 ? <EmptyState icon="◉" text="No ready items yet.\nMark content as ✦ ready in the Curate tab." /> : <View>{ready.map((item) => <VaultCard key={item.id} item={item} onPress={onItemPress} onReadyToggle={onReadyToggle} onPublishAsNft={onPublishAsNft} isPublishingNft={publishingNftId === item.id} />)}</View>}
    </View>
  );
}

function EmptyState({ icon, text }) {
  return <View style={s.emptyState}><Text style={s.emptyIcon}>{icon}</Text><Text style={s.emptyText}>{text}</Text></View>;
}

function ItemModal({ item, onClose, onUpdate, onArchive, onDelete, onPublishAsNft, isPublishingNft }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ title: item.title, description: item.description ?? '', notes: item.notes ?? '', accessTier: item.accessTier });
  const [saving, setSaving] = useState(false);
  const typeInfo = CONTENT_TYPES.find((type) => type.id === item.contentType) ?? CONTENT_TYPES[1];
  const statusInfo = STATUSES.find((status) => status.id === item.status) ?? STATUSES[0];

  async function save() {
    setSaving(true);
    const updated = await PATCH(`/${item.id}`, form).catch(() => null);
    if (updated) onUpdate(updated);
    setEditing(false);
    setSaving(false);
  }

  return (
    <View style={m.overlay}>
      <View style={m.sheet}>
        <View style={m.sheetHeader}>
          <Text style={m.typeIcon}>{typeInfo.icon}</Text>
          <View style={{ flex: 1 }}><Text style={m.itemTitle} numberOfLines={2}>{item.title}</Text><View style={m.metaRow}><View style={[m.statusChip, { borderColor: `${statusInfo.color}80` }]}><View style={[m.statusDot2, { backgroundColor: statusInfo.color }]} /><Text style={[m.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text></View><TierBadge tierId={item.accessTier} /></View></View>
          <TouchableOpacity onPress={onClose} style={m.closeBtn}><Text style={m.closeBtnText}>✕</Text></TouchableOpacity>
        </View>
        <ScrollView style={m.body} showsVerticalScrollIndicator={false}>
          {editing ? <><Text style={s.fieldLabel}>TITLE</Text><TextInput style={s.input} value={form.title} onChangeText={(value) => setForm((prev) => ({ ...prev, title: value }))} /><Text style={s.fieldLabel}>DESCRIPTION</Text><TextInput style={[s.input, { height: 80, textAlignVertical: 'top' }]} value={form.description} onChangeText={(value) => setForm((prev) => ({ ...prev, description: value }))} multiline /><Text style={s.fieldLabel}>NOTES (private)</Text><TextInput style={[s.input, { height: 64, textAlignVertical: 'top' }]} value={form.notes} onChangeText={(value) => setForm((prev) => ({ ...prev, notes: value }))} multiline /></> : <><Text style={m.desc}>{item.description || 'No description supplied.'}</Text>{item.mediaUrl ? <View style={m.urlRow}><Text style={m.urlLabel}>MEDIA</Text><Text style={m.urlValue} numberOfLines={1}>{item.mediaUrl}</Text></View> : null}{item.notes ? <View style={m.notesBox}><Text style={m.notesLabel}>PRIVATE NOTES</Text><Text style={m.notesText}>{item.notes}</Text></View> : null}</>}
        </ScrollView>
        <View style={m.actions}>
          {editing ? <><TouchableOpacity style={[m.actionBtn, m.actionBtnPrimary]} onPress={save} disabled={saving} activeOpacity={0.85}>{saving ? <ActivityIndicator color="#080410" size="small" /> : <Text style={m.actionBtnPrimaryText}>SAVE</Text>}</TouchableOpacity><TouchableOpacity style={m.actionBtn} onPress={() => setEditing(false)} activeOpacity={0.85}><Text style={m.actionBtnText}>CANCEL</Text></TouchableOpacity></> : <><TouchableOpacity style={[m.actionBtn, m.actionBtnPrimary]} onPress={() => setEditing(true)} activeOpacity={0.85}><Text style={m.actionBtnPrimaryText}>EDIT</Text></TouchableOpacity>{item.isReadyListed ? <TouchableOpacity style={[m.actionBtn, m.actionBtnGold]} onPress={() => onPublishAsNft(item)} disabled={isPublishingNft} activeOpacity={0.85}><Text style={m.actionBtnGoldText}>{isPublishingNft ? 'SENDING…' : '◆ NFT'}</Text></TouchableOpacity> : null}<TouchableOpacity style={m.actionBtn} onPress={() => onArchive(item)} activeOpacity={0.85}><Text style={m.actionBtnText}>ARCHIVE</Text></TouchableOpacity><TouchableOpacity style={[m.actionBtn, m.actionBtnDanger]} onPress={() => onDelete(item)} activeOpacity={0.85}><Text style={m.actionBtnDangerText}>DELETE</Text></TouchableOpacity></>}
        </View>
      </View>
    </View>
  );
}

export default function ContentVaultScreen() {
  const [tab, setTab] = useState('load');
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({ total: 0, draft: 0, curating: 0, ready: 0, archived: 0, totalRevenue: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [publishingNftId, setPublishingNftId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [{ items: all }, nextStats] = await Promise.all([API(''), API('/stats')]);
      setItems(all ?? []);
      setStats(nextStats ?? {});
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleReadyToggle(item) {
    const updated = await POST(`/${item.id}/ready`, { ready: !item.isReadyListed }).catch(() => null);
    if (updated) setItems((prev) => prev.map((entry) => (entry.id === item.id ? { ...entry, ...updated } : entry)));
    load();
  }

  async function handlePublishAsNft(item) {
    setPublishingNftId(item.id);
    try {
      const result = await POST(`/${item.id}/publish-as-nft`, { title: item.title, description: item.description, editionSize: 1, chainMode: 'OFFCHAIN_NFT_READY', status: 'PENDING_REVIEW' });
      Alert.alert('Sent to NFT Review', `${result?.nftAsset?.title || item.title} is now pending Headmistress/Admin review.`);
      setItems((prev) => prev.map((entry) => entry.id === item.id ? { ...entry, usages: [...(entry.usages ?? []), { id: `nft-${Date.now()}`, channel: 'NFT_MARKETPLACE', pluginRef: result?.nftAsset?.id, revenueAud: 0 }] } : entry));
      setSelectedItem((prev) => prev?.id === item.id ? { ...prev, usages: [...(prev.usages ?? []), { id: `nft-${Date.now()}`, channel: 'NFT_MARKETPLACE', pluginRef: result?.nftAsset?.id, revenueAud: 0 }] } : prev);
    } catch {
      Alert.alert('Publish as NFT', 'The inline NFT shortcut is wired, but the backend was not reachable from this screen.');
    } finally {
      setPublishingNftId(null);
    }
  }

  async function handleArchive(item) {
    await POST(`/${item.id}/archive`, {}).catch(() => null);
    setSelectedItem(null);
    load();
  }

  async function handleDelete(item) {
    await DEL(`/${item.id}`).catch(() => null);
    setSelectedItem(null);
    load();
  }

  function handleItemUpdate(updated) {
    setItems((prev) => prev.map((entry) => (entry.id === updated.id ? { ...entry, ...updated } : entry)));
    setSelectedItem((prev) => (prev?.id === updated.id ? { ...prev, ...updated } : prev));
  }

  return (
    <View style={s.screen}>
      <View style={s.header}><Text style={s.title}>◈ CONTENT VAULT ◈</Text><Text style={s.sub}>Load · Curate · Create · Monetise · NFT</Text></View>
      <StatBar stats={stats} />
      <View style={s.tabs}>{TABS.map((tabItem) => <TouchableOpacity key={tabItem.id} style={[s.tab, tab === tabItem.id && s.tabActive]} onPress={() => setTab(tabItem.id)} activeOpacity={0.8}><Text style={[s.tabIcon, tab === tabItem.id && { color: '#d4af37' }]}>{tabItem.icon}</Text><Text style={[s.tabText, tab === tabItem.id && s.tabTextActive]}>{tabItem.label}</Text></TouchableOpacity>)}</View>
      <ScrollView contentContainerStyle={s.inner} showsVerticalScrollIndicator={false}>{tab === 'load' && <LoadZone onCreated={(item) => { setItems((prev) => [item, ...prev]); load(); }} />}{tab === 'curate' && <CurateZone items={items} loading={loading} onReadyToggle={handleReadyToggle} onItemPress={setSelectedItem} />}{tab === 'create' && <CreateZone onCreated={(item) => { setItems((prev) => [item, ...prev]); load(); }} />}{tab === 'ready' && <ReadyZone items={items} loading={loading} onItemPress={setSelectedItem} onReadyToggle={handleReadyToggle} onPublishAsNft={handlePublishAsNft} publishingNftId={publishingNftId} />}</ScrollView>
      {selectedItem && <Modal visible transparent animationType="slide" onRequestClose={() => setSelectedItem(null)}><ItemModal item={selectedItem} onClose={() => setSelectedItem(null)} onUpdate={handleItemUpdate} onArchive={handleArchive} onDelete={handleDelete} onPublishAsNft={handlePublishAsNft} isPublishingNft={publishingNftId === selectedItem.id} /></Modal>}
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#080410' },
  header: { paddingTop: 24, paddingHorizontal: 20, paddingBottom: 12 },
  title: { fontSize: 18, fontWeight: '700', color: '#d4af37', letterSpacing: 4, textAlign: 'center' },
  sub: { color: 'rgba(201,168,212,0.5)', fontSize: 10, letterSpacing: 3, textAlign: 'center', marginTop: 4 },
  statsStrip: { flexDirection: 'row', backgroundColor: 'rgba(212,175,55,0.05)', borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'rgba(212,175,55,0.1)', paddingVertical: 12 },
  statPill: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 18, fontWeight: '700' },
  statLabel: { color: 'rgba(201,168,212,0.4)', fontSize: 8, letterSpacing: 1.5, marginTop: 2 },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: 'rgba(212,175,55,0.1)' },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#d4af37' },
  tabIcon: { fontSize: 14, color: 'rgba(201,168,212,0.3)', marginBottom: 2 },
  tabText: { color: 'rgba(201,168,212,0.4)', fontSize: 9, letterSpacing: 1.5 },
  tabTextActive: { color: '#d4af37', fontWeight: '700' },
  inner: { padding: 16, paddingBottom: 100 },
  zoneTitle: { color: '#d4af37', fontSize: 13, fontWeight: '700', letterSpacing: 3, marginBottom: 6 },
  zoneDesc: { color: 'rgba(201,168,212,0.45)', fontSize: 11, lineHeight: 18, marginBottom: 20 },
  fieldLabel: { color: 'rgba(201,168,212,0.5)', fontSize: 9, letterSpacing: 2, marginBottom: 6, marginTop: 14 },
  input: { backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(212,175,55,0.15)', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, color: '#e8d5f5', fontSize: 13 },
  editor: { height: 160, paddingTop: 10 },
  editorHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 14, marginBottom: 6 },
  wordCount: { color: 'rgba(201,168,212,0.3)', fontSize: 10 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  typeChip: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderColor: 'rgba(212,175,55,0.15)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  typeChipIcon: { fontSize: 12 },
  typeChipLabel: { color: 'rgba(201,168,212,0.5)', fontSize: 11 },
  tierBadge: { borderWidth: 1, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, alignSelf: 'flex-start', marginTop: 4 },
  tierBadgeText: { fontSize: 8, fontWeight: '700', letterSpacing: 1 },
  statusDot: { position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: 4 },
  btn: { backgroundColor: '#d4af37', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 20 },
  btnDone: { backgroundColor: '#22c55e' },
  btnText: { color: '#080410', fontWeight: '800', fontSize: 13, letterSpacing: 2 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.025)', borderWidth: 1, borderColor: 'rgba(212,175,55,0.1)', borderRadius: 12, padding: 12, marginBottom: 10, gap: 12 },
  cardThumb: { width: 48, height: 48, borderRadius: 10, backgroundColor: 'rgba(212,175,55,0.08)', borderWidth: 1, borderColor: 'rgba(212,175,55,0.15)', alignItems: 'center', justifyContent: 'center' },
  cardThumbIcon: { fontSize: 22 },
  cardBody: { flex: 1 },
  cardTitle: { color: '#e8d5f5', fontSize: 13, fontWeight: '600', marginBottom: 4 },
  cardChannels: { flexDirection: 'row', gap: 4, marginTop: 4 },
  cardChannelIcon: { fontSize: 12 },
  readyToggle: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)', alignItems: 'center', justifyContent: 'center' },
  readyToggleOn: { borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.1)' },
  readyToggleText: { color: 'rgba(201,168,212,0.4)', fontSize: 16 },
  nftInlineButton: { alignSelf: 'flex-start', borderRadius: 999, backgroundColor: 'rgba(212,175,55,0.14)', borderWidth: 1, borderColor: 'rgba(212,175,55,0.34)', paddingHorizontal: 10, paddingVertical: 6, marginTop: 8 },
  nftInlineButtonDisabled: { opacity: 0.45 },
  nftInlineButtonText: { color: '#d4af37', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  nftInfoBox: { backgroundColor: 'rgba(212,175,55,0.06)', borderRadius: 10, borderLeftWidth: 3, borderLeftColor: '#d4af37', padding: 12, marginBottom: 12 },
  nftInfoTitle: { color: '#d4af37', fontWeight: '900', fontSize: 12, marginBottom: 4 },
  nftInfoText: { color: 'rgba(201,168,212,0.65)', fontSize: 11, lineHeight: 16 },
  channelKey: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 10, padding: 12 },
  channelKeyItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  channelKeyIcon: { fontSize: 12 },
  channelKeyLabel: { color: 'rgba(201,168,212,0.4)', fontSize: 10 },
  emptyState: { alignItems: 'center', paddingVertical: 50 },
  emptyIcon: { fontSize: 40, marginBottom: 14 },
  emptyText: { color: 'rgba(201,168,212,0.35)', textAlign: 'center', fontSize: 13, lineHeight: 22 },
});

const m = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(8,4,16,0.92)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#0d0618', borderTopWidth: 1, borderColor: 'rgba(212,175,55,0.2)', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%' },
  sheetHeader: { flexDirection: 'row', alignItems: 'flex-start', padding: 20, gap: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(212,175,55,0.08)' },
  typeIcon: { fontSize: 28, marginTop: 2 },
  itemTitle: { color: '#e8d5f5', fontSize: 15, fontWeight: '700', lineHeight: 20 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  statusChip: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  statusDot2: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  closeBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' },
  closeBtnText: { color: 'rgba(201,168,212,0.6)', fontSize: 14 },
  body: { padding: 20, maxHeight: 400 },
  desc: { color: 'rgba(201,168,212,0.65)', fontSize: 13, lineHeight: 20, marginBottom: 14 },
  urlRow: { marginBottom: 10 },
  urlLabel: { color: 'rgba(201,168,212,0.4)', fontSize: 9, letterSpacing: 2, marginBottom: 3 },
  urlValue: { color: '#60a5fa', fontSize: 11 },
  notesBox: { backgroundColor: 'rgba(139,30,90,0.1)', borderWidth: 1, borderColor: 'rgba(139,30,90,0.2)', borderRadius: 10, padding: 12, marginBottom: 12 },
  notesLabel: { color: 'rgba(201,168,212,0.4)', fontSize: 9, letterSpacing: 2, marginBottom: 4 },
  notesText: { color: 'rgba(201,168,212,0.65)', fontSize: 12, lineHeight: 18 },
  actions: { flexDirection: 'row', gap: 8, padding: 16, borderTopWidth: 1, borderTopColor: 'rgba(212,175,55,0.08)' },
  actionBtn: { flex: 1, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)', alignItems: 'center', paddingVertical: 11 },
  actionBtnPrimary: { backgroundColor: '#d4af37', borderColor: '#d4af37' },
  actionBtnDanger: { borderColor: 'rgba(255,63,127,0.4)', backgroundColor: 'rgba(255,63,127,0.1)' },
  actionBtnGold: { borderColor: 'rgba(212,175,55,0.5)', backgroundColor: 'rgba(212,175,55,0.14)' },
  actionBtnText: { color: 'rgba(201,168,212,0.65)', fontSize: 11, fontWeight: '800' },
  actionBtnPrimaryText: { color: '#080410', fontSize: 11, fontWeight: '900' },
  actionBtnDangerText: { color: '#ff3f7f', fontSize: 11, fontWeight: '900' },
  actionBtnGoldText: { color: '#d4af37', fontSize: 11, fontWeight: '900' },
});
