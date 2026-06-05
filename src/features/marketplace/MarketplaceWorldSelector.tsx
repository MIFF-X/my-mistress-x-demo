import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import {
  listMarketplaceWorldPolicies,
  MarketplaceWorld,
  MarketplaceWorldPolicy,
} from '../../api/marketplaceApi';

type MarketplaceWorldSelectorProps = {
  selectedWorld?: MarketplaceWorld;
  onSelect: (policy: MarketplaceWorldPolicy) => void;
  includeLegacyRestrictedListing?: boolean;
};

const fallbackPolicies: MarketplaceWorldPolicy[] = [
  {
    world: 'STANDARD',
    label: 'Standard Marketplace',
    description: 'General listed products and digital/physical items.',
    defaultVisibility: 'PUBLIC',
    defaultRevealMode: 'IMMEDIATE',
    requiresApproval: false,
    supportsPhysicalStock: true,
    supportsMysteryReveal: false,
    supportsManualApproval: false,
  },
  {
    world: 'VENDING_MACHINE',
    label: 'Vending Machine',
    description: 'Fast-buy limited stock drops with clear price, stock, and immediate purchase flow.',
    defaultVisibility: 'PUBLIC',
    defaultRevealMode: 'IMMEDIATE',
    requiresApproval: false,
    supportsPhysicalStock: true,
    supportsMysteryReveal: false,
    supportsManualApproval: false,
  },
  {
    world: 'LAUNDRY_HAMPER',
    label: 'Laundry Hamper',
    description: 'Inventory-style item drops with stock handling, listing controls, and creator fulfilment notes.',
    defaultVisibility: 'PUBLIC',
    defaultRevealMode: 'AFTER_PURCHASE',
    requiresApproval: false,
    supportsPhysicalStock: true,
    supportsMysteryReveal: false,
    supportsManualApproval: false,
  },
  {
    world: 'MYSTERY_BOX',
    label: 'Mystery Box',
    description: 'Surprise bundles where full reveal happens after purchase.',
    defaultVisibility: 'PUBLIC',
    defaultRevealMode: 'AFTER_PURCHASE',
    requiresApproval: false,
    supportsPhysicalStock: true,
    supportsMysteryReveal: true,
    supportsManualApproval: false,
  },
];

export function MarketplaceWorldSelector({
  selectedWorld,
  onSelect,
  includeLegacyRestrictedListing = false,
}: MarketplaceWorldSelectorProps) {
  const [policies, setPolicies] = useState<MarketplaceWorldPolicy[]>(fallbackPolicies);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadPolicies() {
      try {
        setLoading(true);
        const nextPolicies = await listMarketplaceWorldPolicies();
        if (!isMounted) return;
        setPolicies(
          includeLegacyRestrictedListing
            ? nextPolicies
            : nextPolicies.filter((policy) => !policy.isLegacyRestrictedListing),
        );
        setError(null);
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Marketplace worlds failed to load.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    void loadPolicies();

    return () => {
      isMounted = false;
    };
  }, [includeLegacyRestrictedListing]);

  return (
    <View style={{ gap: 8 }}>
      <View>
        <Text style={{ color: '#fff', fontSize: 17, fontWeight: '900' }}>Inventory World</Text>
        <Text style={{ color: '#999', fontSize: 12, marginTop: 3 }}>
          Choose where this item lives: vending drops, hamper stock, mystery bundles, standard listings, or seller-managed restricted listings.
        </Text>
      </View>

      {loading ? <Text style={{ color: '#777' }}>Loading marketplace worlds...</Text> : null}
      {error ? <Text style={{ color: '#ff6b6b' }}>{error}</Text> : null}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
        {policies.map((policy) => {
          const active = selectedWorld === policy.world;
          return (
            <Pressable
              key={policy.world}
              onPress={() => onSelect(policy)}
              style={{
                width: 230,
                padding: 12,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: active ? '#d4af37' : '#2a2a2a',
                backgroundColor: active ? '#2b2208' : '#111',
              }}
            >
              <Text style={{ color: active ? '#d4af37' : '#fff', fontWeight: '900', fontSize: 15 }}>
                {policy.label}
              </Text>
              <Text style={{ color: '#aaa', marginTop: 6, fontSize: 12 }}>{policy.description}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 9 }}>
                <Text style={{ color: '#999', backgroundColor: '#1b1b1b', paddingHorizontal: 7, paddingVertical: 4, borderRadius: 999, fontSize: 10 }}>
                  {policy.defaultVisibility}
                </Text>
                <Text style={{ color: '#999', backgroundColor: '#1b1b1b', paddingHorizontal: 7, paddingVertical: 4, borderRadius: 999, fontSize: 10 }}>
                  {policy.defaultRevealMode}
                </Text>
                {policy.requiresApproval ? (
                  <Text style={{ color: '#d4af37', backgroundColor: '#2b2208', paddingHorizontal: 7, paddingVertical: 4, borderRadius: 999, fontSize: 10 }}>
                    approval
                  </Text>
                ) : null}
                {policy.supportsMysteryReveal ? (
                  <Text style={{ color: '#d4af37', backgroundColor: '#2b2208', paddingHorizontal: 7, paddingVertical: 4, borderRadius: 999, fontSize: 10 }}>
                    mystery
                  </Text>
                ) : null}
              </View>
              {policy.isLegacyRestrictedListing ? (
                <Text style={{ color: '#ff9abf', marginTop: 8, fontSize: 11 }}>
                  Legacy marketplace restricted-listing only. The real Sub Vault / Verification Vault is a separate plugin.
                </Text>
              ) : null}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
