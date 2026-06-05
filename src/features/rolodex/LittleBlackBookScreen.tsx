import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import {
  createLittleBlackBookCard,
  deleteRolodexCard,
  listLittleBlackBookCards,
  RolodexCard,
} from '../../api/rolodexApi';
import {
  buildLittleBlackBookContacts,
  buildLittleBlackBookNetwork,
  filterLittleBlackBookContacts,
  LITTLE_BLACK_BOOK_CATEGORIES,
  LITTLE_BLACK_BOOK_STATUSES,
  LITTLE_BLACK_BOOK_TABS,
  LittleBlackBookContact,
  LittleBlackBookTabId,
  recentLittleBlackBookInteractions,
  summarizeLittleBlackBookContacts,
} from './littleBlackBookModel';

const CARD_THEMES = ['Black', 'Purple', 'Gold', 'Pink', 'Red', 'Silver'];
const ALL_FILTER = 'All';
const RATING_FILTERS = ['Any', '5', '4+', '3+'];

function parseCsv(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function panelStyle(accent = '#27213f') {
  return {
    backgroundColor: '#101014',
    borderColor: accent,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  };
}

function fieldStyle() {
  return {
    backgroundColor: '#050508',
    borderColor: '#252033',
    borderWidth: 1,
    color: '#fff',
    padding: 12,
    borderRadius: 10,
  };
}

function MetricCard({ label, value, detail, accent }: { label: string; value: string | number; detail: string; accent: string }) {
  return (
    <View style={{ ...panelStyle('#2a2238'), flex: 1, minWidth: 150 }}>
      <Text style={{ color: '#aaa', fontSize: 12 }}>{label}</Text>
      <Text style={{ color: '#fff', fontSize: 26, fontWeight: '900', marginTop: 8 }}>{value}</Text>
      <Text style={{ color: accent, fontSize: 12, marginTop: 6 }}>{detail}</Text>
    </View>
  );
}

function ChipSelect({
  options,
  value,
  onChange,
  accent = '#8b5cf6',
}: {
  options: string[];
  value: string;
  onChange: (nextValue: string) => void;
  accent?: string;
}) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {options.map((option) => {
        const active = option === value;
        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            style={{
              backgroundColor: active ? accent : '#191923',
              borderColor: active ? accent : '#2d2a38',
              borderWidth: 1,
              borderRadius: 999,
              paddingVertical: 8,
              paddingHorizontal: 11,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '800' }}>{option}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function TabSelect({ value, onChange }: { value: LittleBlackBookTabId; onChange: (nextValue: LittleBlackBookTabId) => void }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {LITTLE_BLACK_BOOK_TABS.map((tab) => {
        const active = tab.id === value;
        return (
          <Pressable
            key={tab.id}
            onPress={() => onChange(tab.id)}
            style={{
              backgroundColor: active ? '#35116c' : '#15151d',
              borderColor: active ? '#8b5cf6' : '#252033',
              borderWidth: 1,
              borderRadius: 12,
              paddingVertical: 9,
              paddingHorizontal: 11,
            }}
          >
            <Text style={{ color: active ? '#fff' : '#bbb', fontSize: 12, fontWeight: '900' }}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function StatusDot({ status }: { status: string }) {
  const color = status === 'VIP' ? '#8b5cf6' : status === 'Inactive' ? '#f59e0b' : status === 'Archived' ? '#94a3b8' : '#22c55e';
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ width: 7, height: 7, borderRadius: 999, backgroundColor: color }} />
      <Text style={{ color, fontSize: 12, fontWeight: '800' }}>{status}</Text>
    </View>
  );
}

function CategoryPill({ label }: { label: string }) {
  const color = label === 'Suppliers' ? '#94a3b8' : label === 'Creative' ? '#ec4899' : label === 'Personal' ? '#f97316' : '#8b5cf6';
  return (
    <View style={{ alignSelf: 'flex-start', backgroundColor: `${color}26`, borderRadius: 999, paddingVertical: 5, paddingHorizontal: 9 }}>
      <Text style={{ color, fontSize: 11, fontWeight: '900' }}>{label}</Text>
    </View>
  );
}

function ContactRow({
  contact,
  onAction,
  onDelete,
}: {
  contact: LittleBlackBookContact;
  onAction: (label: string, contact: LittleBlackBookContact) => void;
  onDelete: (contact: LittleBlackBookContact) => void;
}) {
  return (
    <View style={{ borderBottomColor: '#1f1b2c', borderBottomWidth: 1, paddingVertical: 12, gap: 10 }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
        <View style={{ flex: 1.5, minWidth: 180 }}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '900' }}>{contact.name}</Text>
          <Text style={{ color: '#999', fontSize: 12, marginTop: 3 }}>{contact.card.title}</Text>
        </View>
        <View style={{ minWidth: 105 }}>
          <CategoryPill label={contact.category} />
        </View>
        <View style={{ minWidth: 90 }}>
          <StatusDot status={contact.status} />
        </View>
        <View style={{ minWidth: 86 }}>
          <Text style={{ color: '#ddd', fontSize: 12, fontWeight: '800' }}>{contact.lastContactLabel}</Text>
          <Text style={{ color: '#777', fontSize: 10 }}>last contact</Text>
        </View>
        <View style={{ minWidth: 78 }}>
          <Text style={{ color: contact.accentColor, fontSize: 13, fontWeight: '900' }}>{contact.ratingLabel}</Text>
          <Text style={{ color: '#777', fontSize: 10 }}>rating</Text>
        </View>
      </View>

      <View style={{ backgroundColor: '#07070a', borderRadius: 12, padding: 10 }}>
        <Text style={{ color: '#bbb', fontSize: 12 }}>{contact.lastInteractionSummary}</Text>
        <Text style={{ color: '#777', fontSize: 11, marginTop: 4 }}>
          {contact.subscriptionStatus} / {contact.contractStatus} / Vault refs {contact.sharedVaultCount}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {contact.tags.slice(0, 6).map((tag) => (
          <View key={tag} style={{ backgroundColor: '#1c1827', borderRadius: 999, paddingVertical: 5, paddingHorizontal: 9 }}>
            <Text style={{ color: '#ddd', fontSize: 11 }}>{tag}</Text>
          </View>
        ))}
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <Pressable onPress={() => onAction('message', contact)} style={{ backgroundColor: '#20163a', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 10 }}>
          <Text style={{ color: '#fff', fontSize: 12, fontWeight: '900' }}>Message</Text>
        </Pressable>
        <Pressable onPress={() => onAction('open profile', contact)} style={{ backgroundColor: '#191923', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 10 }}>
          <Text style={{ color: '#ddd', fontSize: 12, fontWeight: '800' }}>Open Profile</Text>
        </Pressable>
        <Pressable onPress={() => onAction('archive/edit notes', contact)} style={{ backgroundColor: '#191923', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 10 }}>
          <Text style={{ color: '#ddd', fontSize: 12, fontWeight: '800' }}>More</Text>
        </Pressable>
        <Pressable onPress={() => onDelete(contact)} style={{ backgroundColor: '#2a0d18', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 10 }}>
          <Text style={{ color: '#ff9abf', fontSize: 12, fontWeight: '800' }}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );
}

function NetworkOverview({ contacts }: { contacts: LittleBlackBookContact[] }) {
  const segments = buildLittleBlackBookNetwork(contacts);
  return (
    <View style={{ ...panelStyle(), gap: 10 }}>
      <Text style={{ color: '#fff', fontSize: 16, fontWeight: '900' }}>Network Overview</Text>
      {segments.length === 0 ? <Text style={{ color: '#777' }}>No categories yet.</Text> : null}
      {segments.map((segment) => (
        <View key={segment.category} style={{ gap: 5 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
            <Text style={{ color: '#ddd', fontSize: 12 }}>{segment.category}</Text>
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '900' }}>{segment.percent}%</Text>
          </View>
          <View style={{ height: 8, backgroundColor: '#07070a', borderRadius: 999, overflow: 'hidden' }}>
            <View style={{ height: 8, width: `${segment.percent}%`, backgroundColor: segment.color }} />
          </View>
        </View>
      ))}
    </View>
  );
}

function QuickActions({ onAction }: { onAction: (label: string) => void }) {
  const actions = ['Add New Contact', 'Import Contacts', 'Export Black Book', 'Merge Duplicates'];
  return (
    <View style={{ ...panelStyle(), gap: 10 }}>
      <Text style={{ color: '#fff', fontSize: 16, fontWeight: '900' }}>Quick Actions</Text>
      {actions.map((action) => (
        <Pressable key={action} onPress={() => onAction(action)} style={{ backgroundColor: '#171720', borderRadius: 10, padding: 11 }}>
          <Text style={{ color: '#eee', fontWeight: '800' }}>{action}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function RecentInteractions({ contacts }: { contacts: LittleBlackBookContact[] }) {
  const recent = recentLittleBlackBookInteractions(contacts);
  return (
    <View style={{ ...panelStyle(), gap: 10 }}>
      <Text style={{ color: '#fff', fontSize: 16, fontWeight: '900' }}>Recent Interactions</Text>
      {recent.length === 0 ? <Text style={{ color: '#777' }}>No interactions yet.</Text> : null}
      {recent.map((contact) => (
        <View key={contact.card.id} style={{ borderBottomColor: '#1f1b2c', borderBottomWidth: 1, paddingBottom: 9 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
            <Text style={{ color: '#fff', fontWeight: '900' }}>{contact.name}</Text>
            <Text style={{ color: '#999', fontSize: 11 }}>{contact.lastContactLabel}</Text>
          </View>
          <Text style={{ color: '#aaa', fontSize: 12, marginTop: 3 }}>{contact.lastInteractionSummary}</Text>
        </View>
      ))}
    </View>
  );
}

export function LittleBlackBookScreen() {
  const [cards, setCards] = useState<RolodexCard[]>([]);
  const [title, setTitle] = useState('');
  const [mistressUserId, setMistressUserId] = useState('');
  const [mistressDisplayName, setMistressDisplayName] = useState('');
  const [relationshipStatus, setRelationshipStatus] = useState('');
  const [subscriptionStatus, setSubscriptionStatus] = useState('');
  const [contractStatus, setContractStatus] = useState('');
  const [tributeSummary, setTributeSummary] = useState('');
  const [privateNotes, setPrivateNotes] = useState('');
  const [favoriteTagsText, setFavoriteTagsText] = useState('');
  const [sharedVaultIdsText, setSharedVaultIdsText] = useState('');
  const [category, setCategory] = useState('Business');
  const [status, setStatus] = useState('Active');
  const [rating, setRating] = useState('4');
  const [lastContactAt, setLastContactAt] = useState('');
  const [lastInteractionSummary, setLastInteractionSummary] = useState('');
  const [theme, setTheme] = useState('Black');
  const [activeTab, setActiveTab] = useState<LittleBlackBookTabId>('all');
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(ALL_FILTER);
  const [statusFilter, setStatusFilter] = useState(ALL_FILTER);
  const [ratingFilter, setRatingFilter] = useState('Any');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const favoriteTags = useMemo(() => parseCsv(favoriteTagsText), [favoriteTagsText]);
  const sharedVaultItemIds = useMemo(() => parseCsv(sharedVaultIdsText), [sharedVaultIdsText]);
  const contacts = useMemo(() => buildLittleBlackBookContacts(cards), [cards]);
  const stats = useMemo(() => summarizeLittleBlackBookContacts(contacts), [contacts]);
  const filteredContacts = useMemo(
    () => filterLittleBlackBookContacts(contacts, {
      tab: activeTab,
      searchText,
      category: categoryFilter,
      status: statusFilter,
      rating: ratingFilter,
    }),
    [activeTab, categoryFilter, contacts, ratingFilter, searchText, statusFilter],
  );

  useEffect(() => {
    void loadCards();
  }, []);

  async function loadCards() {
    try {
      setLoading(true);
      setError(null);
      setCards(await listLittleBlackBookCards());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Little Black Book failed to load.');
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setTitle('');
    setMistressUserId('');
    setMistressDisplayName('');
    setRelationshipStatus('');
    setSubscriptionStatus('');
    setContractStatus('');
    setTributeSummary('');
    setPrivateNotes('');
    setFavoriteTagsText('');
    setSharedVaultIdsText('');
    setCategory('Business');
    setStatus('Active');
    setRating('4');
    setLastContactAt('');
    setLastInteractionSummary('');
    setTheme('Black');
  }

  async function handleCreateCard() {
    if (!title.trim()) {
      setError('Little Black Book contact title is required.');
      return;
    }

    const parsedRating = Number(rating);
    if (!Number.isFinite(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      setError('Rating must be a number from 1 to 5.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setNotice(null);
      await createLittleBlackBookCard({
        title: title.trim(),
        mistressUserId: mistressUserId.trim() || undefined,
        mistressDisplayName: mistressDisplayName.trim() || undefined,
        relationshipStatus: relationshipStatus.trim() || undefined,
        subscriptionStatus: subscriptionStatus.trim() || undefined,
        contractStatus: contractStatus.trim() || undefined,
        tributeSummary: tributeSummary.trim() || undefined,
        category,
        status,
        rating: parsedRating,
        lastContactAt: lastContactAt.trim() || undefined,
        lastInteractionSummary: lastInteractionSummary.trim() || undefined,
        privateNotes: privateNotes.trim() || undefined,
        favoriteTags,
        sharedVaultItemIds,
        theme,
      });
      resetForm();
      setNotice('Little Black Book contact saved.');
      await loadCards();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Little Black Book contact failed to save.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteContact(contact: LittleBlackBookContact) {
    try {
      setError(null);
      setNotice(null);
      await deleteRolodexCard(contact.card.id);
      setNotice(`${contact.name} removed from the Little Black Book.`);
      await loadCards();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Little Black Book contact failed to delete.');
    }
  }

  function handleContactAction(action: string, contact: LittleBlackBookContact) {
    setNotice(`${action} for ${contact.name} is scaffolded. Next pass wires this to chat/profile/archive endpoints.`);
  }

  function handleQuickAction(action: string) {
    if (action === 'Add New Contact') {
      setNotice('Use the Create Contact Card form below; a modal flow can replace it in the UI polish pass.');
      return;
    }

    setNotice(`${action} is scaffolded. Backend import/export/duplicate-merge endpoints are still on the todo list.`);
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#000' }} contentContainerStyle={{ padding: 16, gap: 14 }}>
      <View>
        <Text style={{ color: '#fff', fontSize: 26, fontWeight: '900' }}>Little Black Book</Text>
        <Text style={{ color: '#a78bfa', marginTop: 6 }}>Private CRM for contacts, notes, ratings, recent interactions, and network shape.</Text>
      </View>

      {error ? <Text style={{ color: '#ff6b6b' }}>{error}</Text> : null}
      {notice ? <Text style={{ color: '#22c55e' }}>{notice}</Text> : null}
      {loading ? <Text style={{ color: '#999' }}>Loading Little Black Book...</Text> : null}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        <MetricCard label="Total Contacts" value={stats.total} detail="+ CRM scaffold" accent="#a78bfa" />
        <MetricCard label="Active" value={stats.active} detail="Active plus VIP" accent="#22c55e" />
        <MetricCard label="VIP" value={stats.vip} detail="Priority network" accent="#8b5cf6" />
        <MetricCard label="Archived" value={stats.archived} detail="Hidden from active work" accent="#94a3b8" />
        <MetricCard label="Last Contact" value={stats.lastContactLabel} detail="Newest interaction" accent="#f97316" />
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>
        <View style={{ ...panelStyle('#2c2042'), flex: 2, minWidth: 320, gap: 14 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
            <View>
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>Contact Directory</Text>
              <Text style={{ color: '#888', marginTop: 4 }}>
                Showing {filteredContacts.length} of {contacts.length} contacts
              </Text>
            </View>
            <Pressable onPress={loadCards} style={{ backgroundColor: '#24183d', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12 }}>
              <Text style={{ color: '#fff', fontWeight: '900' }}>Refresh</Text>
            </Pressable>
          </View>

          <TabSelect value={activeTab} onChange={setActiveTab} />

          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search contacts, notes, tags, category, or status"
            placeholderTextColor="#777"
            style={fieldStyle()}
          />

          <View style={{ gap: 10 }}>
            <Text style={{ color: '#aaa', fontSize: 12, fontWeight: '800' }}>Category</Text>
            <ChipSelect options={[ALL_FILTER, ...LITTLE_BLACK_BOOK_CATEGORIES]} value={categoryFilter} onChange={setCategoryFilter} />
            <Text style={{ color: '#aaa', fontSize: 12, fontWeight: '800' }}>Status</Text>
            <ChipSelect options={[ALL_FILTER, ...LITTLE_BLACK_BOOK_STATUSES]} value={statusFilter} onChange={setStatusFilter} />
            <Text style={{ color: '#aaa', fontSize: 12, fontWeight: '800' }}>Rating</Text>
            <ChipSelect options={RATING_FILTERS} value={ratingFilter} onChange={setRatingFilter} />
          </View>

          {!loading && contacts.length === 0 ? <Text style={{ color: '#777' }}>No Little Black Book contacts yet.</Text> : null}
          {!loading && contacts.length > 0 && filteredContacts.length === 0 ? <Text style={{ color: '#777' }}>No contacts match these filters.</Text> : null}
          {filteredContacts.map((contact) => (
            <ContactRow key={contact.card.id} contact={contact} onAction={handleContactAction} onDelete={handleDeleteContact} />
          ))}
        </View>

        <View style={{ flex: 1, minWidth: 260, gap: 14 }}>
          <NetworkOverview contacts={contacts} />
          <QuickActions onAction={handleQuickAction} />
          <RecentInteractions contacts={contacts} />
        </View>
      </View>

      <View style={{ ...panelStyle('#2c2042'), gap: 10 }}>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>Create Contact Card</Text>
        <TextInput value={title} onChangeText={setTitle} placeholder="Contact title" placeholderTextColor="#777" style={fieldStyle()} />
        <TextInput value={mistressDisplayName} onChangeText={setMistressDisplayName} placeholder="Display name" placeholderTextColor="#777" style={fieldStyle()} />
        <TextInput value={mistressUserId} onChangeText={setMistressUserId} placeholder="Linked user id, optional" placeholderTextColor="#777" style={fieldStyle()} />

        <Text style={{ color: '#aaa', fontSize: 12, fontWeight: '800' }}>Category</Text>
        <ChipSelect options={LITTLE_BLACK_BOOK_CATEGORIES} value={category} onChange={setCategory} />
        <Text style={{ color: '#aaa', fontSize: 12, fontWeight: '800' }}>Status</Text>
        <ChipSelect options={LITTLE_BLACK_BOOK_STATUSES} value={status} onChange={setStatus} />

        <TextInput value={rating} onChangeText={setRating} keyboardType="numeric" placeholder="Rating 1-5" placeholderTextColor="#777" style={fieldStyle()} />
        <TextInput value={lastContactAt} onChangeText={setLastContactAt} placeholder="Last contact date, e.g. 2026-05-17" placeholderTextColor="#777" style={fieldStyle()} />
        <TextInput value={lastInteractionSummary} onChangeText={setLastInteractionSummary} placeholder="Recent interaction note" placeholderTextColor="#777" style={fieldStyle()} />
        <TextInput value={relationshipStatus} onChangeText={setRelationshipStatus} placeholder="Relationship status" placeholderTextColor="#777" style={fieldStyle()} />
        <TextInput value={subscriptionStatus} onChangeText={setSubscriptionStatus} placeholder="Subscription status" placeholderTextColor="#777" style={fieldStyle()} />
        <TextInput value={contractStatus} onChangeText={setContractStatus} placeholder="Agreement/contract status" placeholderTextColor="#777" style={fieldStyle()} />
        <TextInput value={tributeSummary} onChangeText={setTributeSummary} placeholder="Support summary" placeholderTextColor="#777" style={fieldStyle()} />
        <TextInput value={privateNotes} onChangeText={setPrivateNotes} placeholder="Private notes" placeholderTextColor="#777" multiline style={{ ...fieldStyle(), minHeight: 76 }} />
        <TextInput value={favoriteTagsText} onChangeText={setFavoriteTagsText} placeholder="Favorite tags, comma separated" placeholderTextColor="#777" style={fieldStyle()} />
        <TextInput value={sharedVaultIdsText} onChangeText={setSharedVaultIdsText} placeholder="Shared Sub Vault item ids, comma separated" placeholderTextColor="#777" style={fieldStyle()} />

        <Text style={{ color: '#aaa', fontSize: 12, fontWeight: '800' }}>Card theme</Text>
        <ChipSelect options={CARD_THEMES} value={theme} onChange={setTheme} accent="#d4af37" />

        <Pressable onPress={handleCreateCard} disabled={saving} style={{ backgroundColor: saving ? '#333' : '#7c3aed', borderRadius: 12, padding: 12 }}>
          <Text style={{ color: '#fff', fontWeight: '900', textAlign: 'center' }}>{saving ? 'Saving...' : 'Save Contact Card'}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
