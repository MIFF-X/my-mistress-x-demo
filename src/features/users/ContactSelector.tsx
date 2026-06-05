import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { DirectoryUser, listUserDirectory } from '../../api/usersApi';

type ContactSelectorProps = {
  selectedUserId?: string;
  roleFilter?: DirectoryUser['role'];
  onSelect: (user: DirectoryUser) => void;
};

function formatTaxonomyLabel(value: string) {
  return value
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function contactHighlights(user: DirectoryUser) {
  const summary = user.profileTaxonomySummary;
  if (!summary) return [];

  const roleLabels =
    user.role === 'SUB'
      ? [
          ...summary.subIdentityLabels,
          ...summary.professionIds,
          ...summary.serviceOfferIds,
          ...summary.customServices,
        ]
      : [
          ...summary.mistressCategoryIds,
          ...summary.customLabels,
        ];

  return [
    summary.jobTitle,
    summary.industry,
    ...roleLabels.map(formatTaxonomyLabel),
  ]
    .filter(Boolean)
    .slice(0, 3) as string[];
}

export function ContactSelector({ selectedUserId, roleFilter, onSelect }: ContactSelectorProps) {
  const [users, setUsers] = useState<DirectoryUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    listUserDirectory(roleFilter)
      .then(setUsers)
      .catch((err) => setError(err instanceof Error ? err.message : 'Contacts failed to load'))
      .finally(() => setLoading(false));
  }, [roleFilter]);

  if (loading) {
    return <Text style={{ color: '#999', marginBottom: 10 }}>Loading contacts...</Text>;
  }

  if (error) {
    return <Text style={{ color: '#ff6b6b', marginBottom: 10 }}>{error}</Text>;
  }

  if (!users.length) {
    return <Text style={{ color: '#999', marginBottom: 10 }}>No contacts available yet.</Text>;
  }

  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ color: '#fff', fontWeight: '700', marginBottom: 8 }}>
        Select Contact
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {users.map((user) => {
          const active = selectedUserId === user.id;
          const label = user.displayName || user.username;
          const highlights = contactHighlights(user);

          return (
            <Pressable
              key={user.id}
              onPress={() => onSelect(user)}
              style={{
                backgroundColor: active ? '#ff0055' : '#111',
                borderColor: active ? '#ff9abf' : '#333',
                borderWidth: 1,
                padding: 10,
                borderRadius: 12,
                marginRight: 8,
                minWidth: 168,
                maxWidth: 220,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '800' }} numberOfLines={1}>
                {label}
              </Text>
              <Text style={{ color: active ? '#fff' : '#aaa', fontSize: 11 }}>{user.role}</Text>
              {highlights.length ? (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 7 }}>
                  {highlights.map((highlight) => (
                    <Text
                      key={highlight}
                      numberOfLines={1}
                      style={{
                        color: active ? '#fff' : '#ff9abf',
                        borderColor: active ? '#ffd1e0' : '#442233',
                        borderWidth: 1,
                        borderRadius: 999,
                        paddingVertical: 3,
                        paddingHorizontal: 7,
                        fontSize: 10,
                        fontWeight: '800',
                        marginRight: 5,
                        marginBottom: 5,
                        maxWidth: 140,
                      }}
                    >
                      {highlight}
                    </Text>
                  ))}
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
