import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { RolodexCard, RolodexCardStyle } from '../../api/rolodexApi';
import { FloatingProfileCard, type FloatingProfileCardIcon } from '../profile/FloatingProfileCard';

type RolodexFloatingCardPreviewProps = {
  card: RolodexCard;
  onSave?: () => void;
  onDelete?: () => void;
};

const TAG_BADGES = ['CHAT', 'GIFT', 'VIDEO', 'CALL', 'TROPHY', 'STAR'];

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

function getCardTheme(card: RolodexCard) {
  const style = parseStyle(card.style) as RolodexCardStyle & { theme?: string };
  return style.theme || 'Pink';
}

function consentText(style: RolodexCardStyle) {
  if (style.shareStatus === 'SUBMITTED') {
    return style.consentExpiresAt ? `Shared consent expires ${style.consentExpiresAt}` : 'Shared card awaiting save.';
  }
  if (style.shareStatus === 'SAVED') return 'Shared card saved to this Rolodex.';
  return 'Private notes stay on the owning card.';
}

function buildFloatingIcons(tags: string[]): FloatingProfileCardIcon[] {
  return TAG_BADGES.map((badge, index) => ({
    key: badge,
    label: badge,
    state: index < tags.length ? 'highlighted' : 'greyed',
  }));
}

export function RolodexFloatingCardPreview({ card, onSave, onDelete }: RolodexFloatingCardPreviewProps) {
  const style = parseStyle(card.style);
  const isSubmitted = style.shareStatus === 'SUBMITTED';
  const category = style.category || 'Unsorted';
  const theme = getCardTheme(card);
  const themeColor = getThemeColor(theme, style.accentColor || style.customColor);
  const tags = parseTags(card.tags);
  const linkedUser = card.linkedUser;

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
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', marginBottom: 10 }}>
        <Text style={{ color: themeColor, fontSize: 12, fontWeight: '900' }}>MX ROLODEX CARD</Text>
        <Text style={{ color: isSubmitted ? '#d4af37' : card.isPrivate ? '#aaa' : '#1D9E75', fontSize: 11, fontWeight: '900' }}>
          {isSubmitted ? 'SUBMITTED' : card.isPrivate ? 'PRIVATE' : 'SHAREABLE'}
        </Text>
      </View>

      <FloatingProfileCard
        displayName={card.displayName || card.title}
        subtitle={card.title}
        statusLabel={isSubmitted ? 'SUBMITTED' : card.isPrivate ? 'PRIVATE' : 'SHAREABLE'}
        metaLabel={linkedUser ? `${linkedUser.role} / @${linkedUser.username}` : consentText(style)}
        rarityLabel={`${theme} / ${category}`}
        tags={[category, theme, ...tags]}
        icons={buildFloatingIcons(tags)}
        accentColor={themeColor}
      />

      {card.notes ? <Text style={{ color: '#ddd', marginTop: 8 }}>{card.notes}</Text> : null}

      <View style={{ backgroundColor: '#050505', borderRadius: 12, padding: 10, marginTop: 10 }}>
        <Text style={{ color: '#aaa', fontSize: 12 }}>{consentText(style)}</Text>
        <Text style={{ color: '#777', fontSize: 11, marginTop: 4 }}>{style.consentScope || 'Private notes stay on the owning card.'}</Text>
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
