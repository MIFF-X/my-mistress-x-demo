import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import {
  createRolodexCard,
  deleteRolodexCard,
  listRolodexCards,
  RolodexCard,
  RolodexCardStyle,
  RolodexVisibilityFilter,
  saveRolodexCard,
  updateRolodexCard,
} from '../../api/rolodexApi';
import { DirectoryProfileTaxonomySummary, DirectoryUser, listUserDirectory } from '../../api/usersApi';

const TAG_BADGES = ['CHAT', 'GIFT', 'VIDEO', 'CALL', 'TROPHY', 'STAR'];
const CARD_THEMES = ['Pink', 'Gold', 'Purple', 'Red', 'Silver'];
const CATEGORY_PRESETS = ['VIP', 'Daily', 'Gifting', 'Live', 'Contract', 'Prospect'];
const VISIBILITY_FILTERS: RolodexVisibilityFilter[] = ['all', 'private', 'shareable'];

function parseTags(tags: unknown): string[] {
  if (Array.isArray(tags)) {
    return Array.from(new Set(tags.map((tag) => String(tag).trim()).filter(Boolean))).slice(0, 30);
  }

  if (typeof tags === 'string') {
    return Array.from(new Set(tags.split(',').map((tag) => tag.trim()).filter(Boolean))).slice(0, 30);
  }

  return [];
}

function parseStyle(style: unknown): RolodexCardStyle {
  if (!style || typeof style !== 'object' || Array.isArray(style)) return {};
  return style as RolodexCardStyle;
}

function getThemeColor(theme?: string, accentColor?: string) {
  if (accentColor?.trim()) return accentColor.trim();
  if (theme === 'Gold') return '#d4af37';
  if (theme === 'Purple') return '#a855f7';
  if (theme === 'Red') return '#ef4444';
  if (theme === 'Silver') return '#c0c0c0';
  return '#ff5c9a';
}

function consentText(style: RolodexCardStyle) {
  if (style.shareStatus === 'SUBMITTED') {
    return style.consentExpiresAt ? `Shared consent expires ${style.consentExpiresAt}` : 'Shared card awaiting Mistress save.';
  }
  if (style.shareStatus === 'SAVED') return 'Shared card saved to this Rolodex.';
  return 'Private Mistress notes stay on the owning card.';
}

function consentExpiryFromDays(daysText: string) {
  const days = Number(daysText);
  if (!Number.isFinite(days) || days <= 0) return undefined;
  const date = new Date();
  date.setDate(date.getDate() + Math.floor(days));
  return date.toISOString();
}

function getCardTheme(card: RolodexCard) {
  const style = styleRecord(card.style);
  return style.theme || 'Pink';
}

function styleRecord(style: unknown) {
  if (!style || typeof style !== 'object' || Array.isArray(style)) return {} as { theme?: string; linkedUserId?: string };
  return style as { theme?: string; linkedUserId?: string };
}

function getLinkedUserId(card: RolodexCard) {
  const linkedUserId = card.linkedUserId || styleRecord(card.style).linkedUserId || card.linkedUser?.id;
  return typeof linkedUserId === 'string' ? linkedUserId : '';
}

function formatTaxonomyLabel(value: string) {
  return value
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function userLabel(user: DirectoryUser | { username: string; displayName?: string | null }) {
  return user.displayName || user.username;
}

function taxonomyHighlights(summary?: DirectoryProfileTaxonomySummary) {
  if (!summary) return [];

  return [
    summary.jobTitle,
    summary.industry,
    ...summary.subIdentityLabels.map(formatTaxonomyLabel),
    ...summary.professionIds.map(formatTaxonomyLabel),
    ...summary.serviceOfferIds.map(formatTaxonomyLabel),
    ...summary.customServices,
  ]
    .filter(Boolean)
    .slice(0, 6) as string[];
}

function CardPreview({ card, onSave, onDelete }: { card: RolodexCard; onSave?: () => void; onDelete?: () => void }) {
  const style = parseStyle(card.style);
  const isSubmitted = style.shareStatus === 'SUBMITTED';
  const category = style.category || 'Unsorted';
  const theme = getCardTheme(card);
  const themeColor = getThemeColor(theme, style.accentColor || style.customColor);
  const tags = parseTags(card.tags);
  const linkedUser = card.linkedUser;
  const highlights = taxonomyHighlights(linkedUser?.profileTaxonomySummary);

  return (
    <View
      style={{
        backgroundColor: '#121212',
        borderColor: themeColor,
        borderWidth: 2,
        borderRadius: 18,
        padding: 14,
        marginBottom: 12,
        shadowColor: themeColor,
        shadowOpacity: 0.35,
        shadowRadius: 10,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <Text style={{ color: themeColor, fontSize: 12, fontWeight: '900' }}>MX ROLODEX CARD</Text>
        <Text style={{ color: isSubmitted ? '#d4af37' : card.isPrivate ? '#aaa' : '#1D9E75', fontSize: 11, fontWeight: '900' }}>
          {isSubmitted ? 'SUBMITTED' : card.isPrivate ? 'PRIVATE' : 'SHAREABLE'}
        </Text>
      </View>

      <View
        style={{
          backgroundColor: '#050505',
          borderRadius: 14,
          padding: 16,
          marginTop: 10,
          minHeight: 98,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text style={{ color: themeColor, fontSize: 28, fontWeight: '900' }}>
          {(card.displayName || card.title).slice(0, 2).toUpperCase()}
        </Text>
        <Text style={{ color: '#777', fontSize: 11, marginTop: 4 }}>profile image placeholder</Text>
      </View>

      <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900', marginTop: 12 }}>
        {card.displayName || card.title}
      </Text>
      <Text style={{ color: themeColor, fontSize: 13, fontWeight: '800', marginTop: 2 }}>{card.title}</Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 }}>
        <View style={{ backgroundColor: '#222', borderRadius: 999, paddingVertical: 5, paddingHorizontal: 9, marginRight: 6, marginBottom: 6 }}>
          <Text style={{ color: '#fff', fontSize: 11 }}>{category}</Text>
        </View>
        <View style={{ backgroundColor: '#222', borderRadius: 999, paddingVertical: 5, paddingHorizontal: 9, marginRight: 6, marginBottom: 6 }}>
          <Text style={{ color: '#fff', fontSize: 11 }}>{theme}</Text>
        </View>
      </View>

      {card.notes ? <Text style={{ color: '#ddd', marginTop: 8 }}>{card.notes}</Text> : null}

      <View style={{ backgroundColor: '#050505', borderRadius: 12, padding: 10, marginTop: 10 }}>
        <Text style={{ color: '#aaa', fontSize: 12 }}>{consentText(style)}</Text>
        <Text style={{ color: '#777', fontSize: 11, marginTop: 4 }}>{style.consentScope || 'Private Mistress notes stay on the owning card.'}</Text>
      </View>

      {linkedUser ? (
        <View style={{ backgroundColor: '#050505', borderColor: '#333', borderWidth: 1, borderRadius: 12, padding: 10, marginTop: 10 }}>
          <Text style={{ color: '#ff9abf', fontSize: 11, fontWeight: '900' }}>LINKED PROFILE</Text>
          <Text style={{ color: '#fff', fontWeight: '900', marginTop: 3 }}>{userLabel(linkedUser)}</Text>
          <Text style={{ color: '#888', fontSize: 11, marginTop: 2 }}>{linkedUser.role} / @{linkedUser.username}</Text>
          {highlights.length ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
              {highlights.map((highlight) => (
                <View key={highlight} style={{ borderColor: themeColor, borderWidth: 1, borderRadius: 999, paddingVertical: 4, paddingHorizontal: 8, marginRight: 6, marginBottom: 6 }}>
                  <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>{highlight}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      ) : null}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 }}>
        {TAG_BADGES.map((badge, index) => (
          <View
            key={badge}
            style={{
              opacity: index < tags.length ? 1 : 0.28,
              borderColor: index < tags.length ? themeColor : '#444',
              borderWidth: 1,
              borderRadius: 999,
              paddingVertical: 5,
              paddingHorizontal: 8,
              marginRight: 6,
              marginBottom: 6,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>{badge}</Text>
          </View>
        ))}
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 }}>
        {tags.map((tag) => (
          <View key={tag} style={{ backgroundColor: '#222', borderRadius: 999, paddingVertical: 5, paddingHorizontal: 9, marginRight: 6, marginBottom: 6 }}>
            <Text style={{ color: '#fff', fontSize: 11 }}>{tag}</Text>
          </View>
        ))}
      </View>

      {onSave || onDelete ? (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 }}>
        {isSubmitted && onSave ? (
          <Pressable onPress={onSave} style={{ backgroundColor: '#1D9E75', padding: 10, borderRadius: 10, marginRight: 8, marginBottom: 8 }}>
            <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '900' }}>Save Shared Card</Text>
          </Pressable>
        ) : null}
        {onDelete ? (
        <Pressable onPress={onDelete} style={{ backgroundColor: '#330011', padding: 10, borderRadius: 10, marginBottom: 8 }}>
          <Text style={{ color: '#ff9abf', textAlign: 'center', fontWeight: '800' }}>Delete Card</Text>
        </Pressable>
        ) : null}
      </View>
      ) : null}
    </View>
  );
}

export function RolodexScreen() {
  const [cards, setCards] = useState<RolodexCard[]>([]);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [notes, setNotes] = useState('');
  const [tagText, setTagText] = useState('');
  const [category, setCategory] = useState('VIP');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [theme, setTheme] = useState('Pink');
  const [customColor, setCustomColor] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);
  const [shareMode, setShareMode] = useState<'PRIVATE' | 'SEND'>('PRIVATE');
  const [recipientUserId, setRecipientUserId] = useState('');
  const [consentDays, setConsentDays] = useState('90');
  const [linkedUserId, setLinkedUserId] = useState('');
  const [directoryUsers, setDirectoryUsers] = useState<DirectoryUser[]>([]);
  const [directoryLoading, setDirectoryLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [taxonomyTagFilter, setTaxonomyTagFilter] = useState('');
  const [professionFilter, setProfessionFilter] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState<RolodexVisibilityFilter>('all');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const tagPreview = useMemo(() => parseTags(tagText), [tagText]);
  const selectedLinkedUser = useMemo(
    () => directoryUsers.find((user) => user.id === linkedUserId),
    [directoryUsers, linkedUserId],
  );

  function renderShareModeButton(label: string, mode: 'PRIVATE' | 'SEND') {
    const active = shareMode === mode;
    return (
      <Pressable
        onPress={() => setShareMode(mode)}
        style={{
          backgroundColor: active ? '#1D9E75' : '#222',
          borderRadius: 999,
          paddingVertical: 8,
          paddingHorizontal: 10,
          marginRight: 8,
          marginBottom: 8,
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '800', fontSize: 12 }}>{label}</Text>
      </Pressable>
    );
  }

  const categories = useMemo(() => {
    const values = new Set(['All', ...CATEGORY_PRESETS]);
    cards.forEach((card) => {
      const style = parseStyle(card.style);
      if (style.category) values.add(style.category);
    });
    return Array.from(values);
  }, [cards]);

  const groupedCards = useMemo(() => {
    const search = searchText.trim().toLowerCase();
    const filtered = cards.filter((card) => {
      const style = parseStyle(card.style);
      const tags = parseTags(card.tags);
      const cardCategory = style.category || 'Unsorted';
      const haystack = `${card.title} ${card.displayName || ''} ${card.notes || ''} ${tags.join(' ')} ${cardCategory}`.toLowerCase();
      const matchesSearch = !search || haystack.includes(search);
      const matchesCategory = categoryFilter === 'All' || cardCategory === categoryFilter;
      return matchesSearch && matchesCategory;
    });

    return filtered.reduce((groups, card) => {
      const style = parseStyle(card.style);
      const groupName = style.category || 'Unsorted';
      const group = groups.find((item) => item.category === groupName);
      if (group) group.cards.push(card);
      else groups.push({ category: groupName, cards: [card] });
      return groups;
    }, [] as { category: string; cards: RolodexCard[] }[]);
  }, [cards, categoryFilter, searchText]);

  useEffect(() => {
    loadCards();
    loadDirectoryUsers();
  }, []);

  async function loadCards() {
    try {
      setLoading(true);
      setError(null);
      setCards(await listRolodexCards({
        q: searchText,
        tag: filterTag,
        taxonomyTag: taxonomyTagFilter,
        professionId: professionFilter,
        serviceOfferId: serviceFilter,
        visibility: visibilityFilter,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Rolodex failed to load');
    } finally {
      setLoading(false);
    }
  }

  async function loadDirectoryUsers() {
    try {
      setDirectoryLoading(true);
      const users = await listUserDirectory('SUB');
      setDirectoryUsers(users);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Directory profiles failed to load');
    } finally {
      setDirectoryLoading(false);
    }
  }

  function resetForm() {
    setEditingCardId(null);
    setTitle('');
    setDisplayName('');
    setNotes('');
    setTagText('');
    setCategory('VIP');
    setTheme('Pink');
    setCustomColor('');
    setIsPrivate(true);
    setShareMode('PRIVATE');
    setRecipientUserId('');
    setConsentDays('90');
    setLinkedUserId('');
  }

  function beginEditCard(card: RolodexCard) {
    setEditingCardId(card.id);
    setTitle(card.title);
    setDisplayName(card.displayName || '');
    setNotes(card.notes || '');
    setTagText(parseTags(card.tags).join(', '));
    const style = parseStyle(card.style);
    setCategory(style.category || 'VIP');
    setTheme(getCardTheme(card));
    setCustomColor(style.accentColor || style.customColor || '');
    setIsPrivate(card.isPrivate);
    setShareMode('PRIVATE');
    setLinkedUserId(getLinkedUserId(card));
    setError(null);
  }

  async function handleSaveCard() {
    if (!title.trim()) {
      setError('Card title is required.');
      return;
    }
    if (shareMode === 'SEND' && !recipientUserId.trim()) {
      setError('Mistress user id is required when sending a shared card.');
      return;
    }

    const payload = {
      title: title.trim(),
      displayName: editingCardId ? displayName.trim() : displayName.trim() || undefined,
      notes: editingCardId ? notes.trim() : notes.trim() || undefined,
      tags: tagPreview,
      style: {
        theme,
        category,
        accentColor: customColor.trim() || undefined,
        consentScope: shareMode === 'SEND' ? 'Sub-created profile card' : undefined,
        consentExpiresAt: shareMode === 'SEND' ? consentExpiryFromDays(consentDays) : undefined,
      },
      linkedUserId: linkedUserId || null,
      ownerUserId: shareMode === 'SEND' ? recipientUserId.trim() : undefined,
      isPrivate: shareMode === 'SEND' ? true : isPrivate,
    };

    try {
      setSaving(true);
      setError(null);
      if (editingCardId) {
        await updateRolodexCard(editingCardId, payload);
      } else {
        await createRolodexCard(payload);
      }
      resetForm();
      await loadCards();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Card failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteCard(cardId: string) {
    try {
      setError(null);
      setNotice(null);
      await deleteRolodexCard(cardId);
      if (editingCardId === cardId) resetForm();
      await loadCards();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Card failed to delete');
    }
  }

  async function handleSaveSharedCard(cardId: string) {
    try {
      setError(null);
      setNotice(null);
      await saveRolodexCard(cardId);
      setNotice('Shared card saved.');
      await loadCards();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Shared card failed to save');
    }
  }

  async function clearFilters() {
    setSearchText('');
    setFilterTag('');
    setTaxonomyTagFilter('');
    setProfessionFilter('');
    setServiceFilter('');
    setVisibilityFilter('all');
    try {
      setLoading(true);
      setError(null);
      setCards(await listRolodexCards());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Rolodex failed to load');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={{ flex: 1, padding: 16, backgroundColor: '#000' }}>
      <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900', marginBottom: 6 }}>Rolodex / Contact Cards</Text>
      <Text style={{ color: '#aaa', marginBottom: 16 }}>
        Create private Sub cards, receive shared cards, group them, and track consent windows.
      </Text>

      {error ? <Text style={{ color: '#ff6b6b', marginBottom: 10 }}>{error}</Text> : null}
      {notice ? <Text style={{ color: '#1D9E75', marginBottom: 10 }}>{notice}</Text> : null}

      <View style={{ backgroundColor: '#111', padding: 14, borderRadius: 16, marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>
            {editingCardId ? 'Edit Card' : 'Create Card'}
          </Text>
          {editingCardId ? (
            <Pressable onPress={resetForm} style={{ backgroundColor: '#222', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999 }}>
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>Cancel</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
          {renderShareModeButton('Private card', 'PRIVATE')}
          {renderShareModeButton('Send to Mistress', 'SEND')}
        </View>

        {shareMode === 'SEND' ? (
          <>
            <TextInput
              value={recipientUserId}
              onChangeText={setRecipientUserId}
              placeholder="Mistress user id"
              placeholderTextColor="#777"
              style={{ backgroundColor: '#050505', color: '#fff', padding: 12, borderRadius: 10, marginBottom: 8 }}
            />
            <TextInput
              value={consentDays}
              onChangeText={setConsentDays}
              keyboardType="numeric"
              placeholder="Consent duration in days"
              placeholderTextColor="#777"
              style={{ backgroundColor: '#050505', color: '#fff', padding: 12, borderRadius: 10, marginBottom: 8 }}
            />
          </>
        ) : null}

        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Card title, e.g. Tech Sub / Loyal Supporter"
          placeholderTextColor="#777"
          style={{ backgroundColor: '#050505', color: '#fff', padding: 12, borderRadius: 10, marginBottom: 8 }}
        />
        <TextInput
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Display name"
          placeholderTextColor="#777"
          style={{ backgroundColor: '#050505', color: '#fff', padding: 12, borderRadius: 10, marginBottom: 8 }}
        />

        <Text style={{ color: '#aaa', fontSize: 12, marginBottom: 8 }}>Link visible Sub profile taxonomy</Text>
        {selectedLinkedUser ? (
          <View style={{ backgroundColor: '#1D9E75', borderRadius: 12, padding: 10, marginBottom: 8 }}>
            <Text style={{ color: '#fff', fontWeight: '900' }}>Linked: {userLabel(selectedLinkedUser)}</Text>
            <Text style={{ color: '#eafff7', fontSize: 11, marginTop: 2 }}>@{selectedLinkedUser.username}</Text>
          </View>
        ) : null}
        {directoryLoading ? <Text style={{ color: '#777', marginBottom: 8 }}>Loading Sub directory...</Text> : null}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
          <Pressable
            onPress={() => setLinkedUserId('')}
            style={{
              backgroundColor: linkedUserId ? '#222' : '#ff0055',
              borderRadius: 999,
              paddingVertical: 8,
              paddingHorizontal: 11,
              marginRight: 7,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 12 }}>No Link</Text>
          </Pressable>
          {directoryUsers.slice(0, 24).map((user) => {
            const active = user.id === linkedUserId;
            const highlights = taxonomyHighlights(user.profileTaxonomySummary);
            return (
              <Pressable
                key={user.id}
                onPress={() => {
                  setLinkedUserId(user.id);
                  if (!displayName.trim()) setDisplayName(userLabel(user));
                }}
                style={{
                  backgroundColor: active ? '#ff0055' : '#222',
                  borderColor: active ? '#ff9abf' : '#333',
                  borderWidth: 1,
                  borderRadius: 12,
                  padding: 9,
                  marginRight: 7,
                  minWidth: 150,
                  maxWidth: 210,
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '900' }} numberOfLines={1}>{userLabel(user)}</Text>
                <Text style={{ color: active ? '#fff' : '#aaa', fontSize: 10, marginTop: 2 }} numberOfLines={1}>
                  {highlights.slice(0, 2).join(' / ') || user.role}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Private Mistress notes"
          placeholderTextColor="#777"
          multiline
          style={{ backgroundColor: '#050505', color: '#fff', padding: 12, borderRadius: 10, minHeight: 86, marginBottom: 8 }}
        />
        <TextInput
          value={tagText}
          onChangeText={setTagText}
          placeholder="Tags/interests, e.g. chat, gift, video"
          placeholderTextColor="#777"
          style={{ backgroundColor: '#050505', color: '#fff', padding: 12, borderRadius: 10, marginBottom: 8 }}
        />
        <TextInput
          value={category}
          onChangeText={setCategory}
          placeholder="Category"
          placeholderTextColor="#777"
          style={{ backgroundColor: '#050505', color: '#fff', padding: 12, borderRadius: 10, marginBottom: 8 }}
        />

        <Text style={{ color: '#aaa', fontSize: 12, marginBottom: 8 }}>Quick categories</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 }}>
          {CATEGORY_PRESETS.map((option) => {
            const active = option === category;
            return (
              <Pressable
                key={option}
                onPress={() => setCategory(option)}
                style={{ backgroundColor: active ? '#ff0055' : '#222', borderRadius: 999, paddingVertical: 8, paddingHorizontal: 10, marginRight: 7, marginBottom: 7 }}
              >
                <Text style={{ color: '#fff', fontWeight: '800', fontSize: 12 }}>{option}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={{ color: '#aaa', fontSize: 12, marginBottom: 8 }}>Card color theme</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 }}>
          {CARD_THEMES.map((option) => {
            const active = option === theme;
            return (
              <Pressable
                key={option}
                onPress={() => setTheme(option)}
                style={{
                  backgroundColor: active ? getThemeColor(option) : '#222',
                  borderRadius: 999,
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  marginRight: 8,
                  marginBottom: 8,
                }}
              >
                <Text style={{ color: active && option !== 'Silver' ? '#000' : '#fff', fontWeight: '800' }}>{option}</Text>
              </Pressable>
            );
          })}
        </View>
        <TextInput
          value={customColor}
          onChangeText={setCustomColor}
          placeholder="Custom card color, e.g. #22c55e"
          placeholderTextColor="#777"
          style={{ backgroundColor: '#050505', color: '#fff', padding: 12, borderRadius: 10, marginBottom: 8 }}
        />

        <View style={{ flexDirection: 'row', marginBottom: 10 }}>
          <Pressable
            onPress={() => setIsPrivate(true)}
            style={{
              backgroundColor: isPrivate ? '#ff0055' : '#222',
              paddingVertical: 9,
              paddingHorizontal: 12,
              borderRadius: 10,
              marginRight: 8,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '800' }}>Private</Text>
          </Pressable>
          <Pressable
            onPress={() => setIsPrivate(false)}
            style={{
              backgroundColor: !isPrivate ? '#1D9E75' : '#222',
              paddingVertical: 9,
              paddingHorizontal: 12,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '800' }}>Shareable</Text>
          </Pressable>
        </View>

        <Pressable
          onPress={handleSaveCard}
          disabled={saving}
          style={{ backgroundColor: saving ? '#555' : '#ff0055', padding: 12, borderRadius: 12 }}
        >
          <Text style={{ color: '#fff', fontWeight: '900', textAlign: 'center' }}>
            {saving ? 'Saving...' : editingCardId ? 'Update Contact Card' : 'Save Contact Card'}
          </Text>
        </Pressable>
      </View>

      <View style={{ backgroundColor: '#111', padding: 12, borderRadius: 14, marginBottom: 12 }}>
        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search cards, notes, or tags"
          placeholderTextColor="#777"
          style={{ backgroundColor: '#050505', color: '#fff', padding: 10, borderRadius: 10, marginBottom: 8 }}
        />
        <TextInput
          value={filterTag}
          onChangeText={setFilterTag}
          placeholder="Filter by exact tag"
          placeholderTextColor="#777"
          style={{ backgroundColor: '#050505', color: '#fff', padding: 10, borderRadius: 10, marginBottom: 8 }}
        />
        <TextInput
          value={taxonomyTagFilter}
          onChangeText={setTaxonomyTagFilter}
          placeholder="Filter by linked profile label"
          placeholderTextColor="#777"
          style={{ backgroundColor: '#050505', color: '#fff', padding: 10, borderRadius: 10, marginBottom: 8 }}
        />
        <TextInput
          value={professionFilter}
          onChangeText={setProfessionFilter}
          placeholder="Filter by profession id"
          placeholderTextColor="#777"
          style={{ backgroundColor: '#050505', color: '#fff', padding: 10, borderRadius: 10, marginBottom: 8 }}
        />
        <TextInput
          value={serviceFilter}
          onChangeText={setServiceFilter}
          placeholder="Filter by service id"
          placeholderTextColor="#777"
          style={{ backgroundColor: '#050505', color: '#fff', padding: 10, borderRadius: 10, marginBottom: 8 }}
        />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
          {VISIBILITY_FILTERS.map((option) => {
            const active = option === visibilityFilter;
            return (
              <Pressable
                key={option}
                onPress={() => setVisibilityFilter(option)}
                style={{
                  backgroundColor: active ? '#1D9E75' : '#222',
                  paddingVertical: 7,
                  paddingHorizontal: 10,
                  borderRadius: 999,
                  marginRight: 6,
                  marginBottom: 6,
                }}
              >
                <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>{option.toUpperCase()}</Text>
              </Pressable>
            );
          })}
        </View>
        <View style={{ flexDirection: 'row' }}>
          <Pressable onPress={loadCards} style={{ backgroundColor: '#ff0055', padding: 10, borderRadius: 10, flex: 1, marginRight: 8 }}>
            <Text style={{ color: '#fff', fontWeight: '800', textAlign: 'center' }}>Search Rolodex</Text>
          </Pressable>
          <Pressable onPress={clearFilters} style={{ backgroundColor: '#222', padding: 10, borderRadius: 10 }}>
            <Text style={{ color: '#fff', fontWeight: '800', textAlign: 'center' }}>Clear</Text>
          </Pressable>
        </View>
      </View>

      {loading ? <Text style={{ color: '#999' }}>Loading cards...</Text> : null}
      {!loading && cards.length === 0 ? <Text style={{ color: '#777' }}>No Rolodex cards yet.</Text> : null}
      {!loading && cards.length > 0 && groupedCards.length === 0 ? <Text style={{ color: '#777' }}>No cards match this filter.</Text> : null}

      {cards.map((card) => (
        <View key={card.id}>
          <CardPreview card={card} onSave={() => handleSaveSharedCard(card.id)} />
          <View style={{ flexDirection: 'row', marginTop: -6, marginBottom: 16 }}>
            <Pressable onPress={() => beginEditCard(card)} style={{ backgroundColor: '#222', padding: 10, borderRadius: 10, flex: 1, marginRight: 8 }}>
              <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '800' }}>Edit Card</Text>
            </Pressable>
            <Pressable onPress={() => handleDeleteCard(card.id)} style={{ backgroundColor: '#330011', padding: 10, borderRadius: 10, flex: 1 }}>
              <Text style={{ color: '#ff9abf', textAlign: 'center', fontWeight: '800' }}>Delete Card</Text>
            </Pressable>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
