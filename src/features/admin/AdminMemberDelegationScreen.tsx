import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import type { AdminMemberScope } from './adminMemberDelegationModels';
import { AdminMemberPlusPanel } from './AdminMemberPlusPanel';
import { AdminMessagesPanel } from './AdminMessagesPanel';

function sectionStyle() {
  return { backgroundColor: '#080808', padding: 14, borderRadius: 16, marginBottom: 12 } as const;
}

function tabStyle(active: boolean) {
  return {
    borderWidth: 1,
    borderColor: active ? '#d4af37' : '#333',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: active ? '#1a1408' : '#0b0b0b',
  } as const;
}

export function AdminMemberDelegationScreen() {
  return <AdminMemberDelegationSurface initialScope="PLATFORM" />;
}

export function TrustedMemberDelegationScreen() {
  return <AdminMemberDelegationSurface initialScope="MISTRESS_PROFILE" allowedScopes={['MISTRESS_PROFILE']} />;
}

function AdminMemberDelegationSurface({
  initialScope,
  allowedScopes = ['PLATFORM', 'MISTRESS_PROFILE'],
}: {
  initialScope: AdminMemberScope;
  allowedScopes?: AdminMemberScope[];
}) {
  const [scope, setScope] = useState<AdminMemberScope>(allowedScopes.includes(initialScope) ? initialScope : allowedScopes[0]);

  const isPlatform = scope === 'PLATFORM';
  const showTabs = allowedScopes.length > 1;
  const ownerProfileId = scope === 'MISTRESS_PROFILE' ? 'mistress_profile_demo' : undefined;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#050505' }} contentContainerStyle={{ padding: 16, paddingBottom: 36 }}>
      <View style={{ ...sectionStyle(), borderWidth: 1, borderColor: '#d4af37' }}>
        <Text style={{ color: '#d4af37', fontSize: 11, fontWeight: '900', textTransform: 'uppercase' }}>
          {isPlatform ? 'Headmistress Administration Zone' : 'Mistress creator operations'}
        </Text>
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900', marginTop: 6 }}>
          {isPlatform ? 'Admin Member +' : 'Trusted Member +'}
        </Text>
        <Text style={{ color: '#aaa', lineHeight: 20, marginTop: 8 }}>
          {isPlatform
            ? 'Headmistress adds Admin Members, assigns roles, jobs and monitoring duties, then coordinates work through Admin Messages.'
            : 'Mistresses can add trusted helpers for their own profile only, assign specific creator jobs and keep helper notes separate from platform admin.'}
        </Text>
      </View>

      {showTabs ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 }}>
          {allowedScopes.includes('PLATFORM') ? (
            <Pressable onPress={() => setScope('PLATFORM')} style={tabStyle(scope === 'PLATFORM')}>
              <Text style={{ color: scope === 'PLATFORM' ? '#d4af37' : '#ccc', fontWeight: '900' }}>
                Headmistress Admin Members
              </Text>
            </Pressable>
          ) : null}
          {allowedScopes.includes('MISTRESS_PROFILE') ? (
            <Pressable onPress={() => setScope('MISTRESS_PROFILE')} style={tabStyle(scope === 'MISTRESS_PROFILE')}>
              <Text style={{ color: scope === 'MISTRESS_PROFILE' ? '#d4af37' : '#ccc', fontWeight: '900' }}>
                Mistress Trusted Members
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <AdminMemberPlusPanel scope={scope} ownerProfileId={ownerProfileId} />
      <AdminMessagesPanel scope={scope} ownerProfileId={ownerProfileId} />

      <View style={{ ...sectionStyle(), borderWidth: 1, borderColor: '#333' }}>
        <Text style={{ color: '#d4af37', fontWeight: '900' }}>Permission boundary</Text>
        <Text style={{ color: '#aaa', lineHeight: 18, marginTop: 6 }}>
          Headmistress Admin Members are platform-level helpers. Mistress Trusted Members are creator/profile-level helpers only. A trusted member cannot become a platform admin unless the Headmistress adds them through Admin Member +.
        </Text>
      </View>
    </ScrollView>
  );
}
