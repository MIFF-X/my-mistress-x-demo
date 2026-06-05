import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import {
  MarketplaceFulfilmentStatus,
  MarketplaceOrder,
  updateMarketplaceOrderFulfilment,
} from '../../api/marketplaceApi';
import { ActionPillButton } from '../buttons/ActionPillButton';

const fulfilmentStatuses: MarketplaceFulfilmentStatus[] = [
  'PROCESSING',
  'PACKED',
  'SHIPPED',
  'READY_FOR_PICKUP',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
];

type MarketplaceOrderFulfilmentControlProps = {
  orderId: string;
  currentStatus?: string;
  onUpdated?: (order: MarketplaceOrder) => void;
};

function labelStatus(status: string) {
  return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function MarketplaceOrderFulfilmentControl({
  orderId,
  currentStatus = 'COMPLETED',
  onUpdated,
}: MarketplaceOrderFulfilmentControlProps) {
  const [status, setStatus] = useState<MarketplaceFulfilmentStatus>(
    fulfilmentStatuses.includes(currentStatus as MarketplaceFulfilmentStatus)
      ? (currentStatus as MarketplaceFulfilmentStatus)
      : 'PROCESSING',
  );
  const [fulfilmentNote, setFulfilmentNote] = useState('');
  const [sellerNote, setSellerNote] = useState('');
  const [trackingReference, setTrackingReference] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function save() {
    try {
      setSaving(true);
      setError(null);
      setNotice(null);
      const updated = await updateMarketplaceOrderFulfilment(orderId, {
        status,
        fulfilmentNote: fulfilmentNote.trim() || undefined,
        sellerNote: sellerNote.trim() || undefined,
        trackingReference: trackingReference.trim() || undefined,
        trackingUrl: trackingUrl.trim() || undefined,
        internalNote: internalNote.trim() || undefined,
      });
      setNotice(`Order updated to ${labelStatus(updated.status)}.`);
      onUpdated?.(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Order fulfilment update failed.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={{ backgroundColor: '#111', borderRadius: 16, borderWidth: 1, borderColor: '#252525', padding: 14, gap: 12 }}>
      <View>
        <Text style={{ color: '#fff', fontSize: 17, fontWeight: '900' }}>Order Fulfilment</Text>
        <Text style={{ color: '#888', fontSize: 12, marginTop: 3 }}>
          Update order status, tracking details, and a note from seller.
        </Text>
      </View>

      <View style={{ gap: 8 }}>
        <Text style={{ color: '#aaa', fontSize: 12, fontWeight: '800' }}>Status</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {fulfilmentStatuses.map((nextStatus) => {
            const selected = status === nextStatus;
            return (
              <Pressable
                key={nextStatus}
                onPress={() => setStatus(nextStatus)}
                style={{
                  backgroundColor: selected ? '#d4af37' : '#1b1b1b',
                  borderRadius: 999,
                  paddingHorizontal: 10,
                  paddingVertical: 8,
                  borderWidth: 1,
                  borderColor: selected ? '#d4af37' : '#333',
                }}
              >
                <Text style={{ color: selected ? '#000' : '#fff', fontWeight: '900', fontSize: 12 }}>
                  {labelStatus(nextStatus)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <TextInput
        value={sellerNote}
        onChangeText={setSellerNote}
        placeholder="Note from seller to buyer"
        placeholderTextColor="#666"
        multiline
        style={{ backgroundColor: '#1b1b1b', color: '#fff', padding: 10, borderRadius: 12, minHeight: 68 }}
      />

      <TextInput
        value={fulfilmentNote}
        onChangeText={setFulfilmentNote}
        placeholder="Fulfilment note"
        placeholderTextColor="#666"
        multiline
        style={{ backgroundColor: '#1b1b1b', color: '#fff', padding: 10, borderRadius: 12, minHeight: 58 }}
      />

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <TextInput
          value={trackingReference}
          onChangeText={setTrackingReference}
          placeholder="Tracking reference"
          placeholderTextColor="#666"
          style={{ flex: 1, minWidth: 150, backgroundColor: '#1b1b1b', color: '#fff', padding: 10, borderRadius: 12 }}
        />
        <TextInput
          value={trackingUrl}
          onChangeText={setTrackingUrl}
          placeholder="Tracking URL"
          placeholderTextColor="#666"
          autoCapitalize="none"
          style={{ flex: 1, minWidth: 150, backgroundColor: '#1b1b1b', color: '#fff', padding: 10, borderRadius: 12 }}
        />
      </View>

      <TextInput
        value={internalNote}
        onChangeText={setInternalNote}
        placeholder="Internal note / admin note"
        placeholderTextColor="#666"
        multiline
        style={{ backgroundColor: '#1b1b1b', color: '#fff', padding: 10, borderRadius: 12, minHeight: 58 }}
      />

      {error ? <Text style={{ color: '#ff6b6b' }}>{error}</Text> : null}
      {notice ? <Text style={{ color: '#1D9E75' }}>{notice}</Text> : null}

      <ActionPillButton
        actionKey="updateFulfilment"
        disabled={saving}
        label={saving ? 'Updating...' : undefined}
        onPress={save}
        style={{ justifyContent: 'center', marginRight: 0 }}
        textStyle={{ textAlign: 'center' }}
      />
    </View>
  );
}
