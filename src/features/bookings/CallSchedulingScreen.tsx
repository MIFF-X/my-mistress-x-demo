import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { CallBookingStatus, CallSchedulingBooking, CallSessionType } from '../../api/callSchedulingApi';
import { mxTheme } from '../../theme/mxTheme';
import { useCallScheduling } from './useCallScheduling';

const STATUS_FILTERS: Array<'all' | CallBookingStatus> = ['all', 'draft', 'booked', 'paid', 'cancelled', 'completed', 'expired'];
const STATUS_ACTIONS: CallBookingStatus[] = ['booked', 'paid', 'completed', 'cancelled', 'expired'];

function formatCurrency(cents: number, currency = 'AUD') {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency,
  }).format(cents / 100);
}

function formatDateTime(value?: string) {
  if (!value) return 'Not set';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function statusColor(status: CallBookingStatus) {
  if (status === 'paid') return '#1D9E75';
  if (status === 'booked') return '#d4af37';
  if (status === 'completed') return '#777';
  if (status === 'cancelled' || status === 'expired') return '#ff6b6b';
  return '#ff9abf';
}

function nextHourIso() {
  const date = new Date();
  date.setHours(date.getHours() + 1, 0, 0, 0);
  return date.toISOString();
}

function Pill({
  label,
  active,
  color = '#ff0055',
  onPress,
}: {
  label: string;
  active?: boolean;
  color?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      style={{
        backgroundColor: active ? color : '#111',
        borderColor: active ? color : '#333',
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 11,
        paddingVertical: 8,
        marginRight: 7,
        marginBottom: 7,
      }}
    >
      <Text style={{ color: '#fff', fontWeight: '900', fontSize: 12 }}>{label}</Text>
    </Pressable>
  );
}

function SummaryCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <View style={{ flex: 1, minWidth: 130, backgroundColor: '#111', borderColor: '#282828', borderWidth: 1, borderRadius: 14, padding: 12, marginRight: 8, marginBottom: 8 }}>
      <Text style={{ color: mxTheme.colors.muted, fontSize: 11, fontWeight: '900', textTransform: 'uppercase' }}>{label}</Text>
      <Text style={{ color: mxTheme.colors.text, fontSize: 22, fontWeight: '900', marginTop: 5 }}>{value}</Text>
      <Text style={{ color: mxTheme.colors.muted, fontSize: 12, marginTop: 4 }}>{detail}</Text>
    </View>
  );
}

function BookingCard({
  booking,
  saving,
  onUpdateStatus,
}: {
  booking: CallSchedulingBooking;
  saving: boolean;
  onUpdateStatus: (status: CallBookingStatus) => void;
}) {
  const color = statusColor(booking.status);

  return (
    <View style={{ backgroundColor: '#111', borderColor: color, borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1, paddingRight: 10 }}>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>{booking.mistressName}</Text>
          <Text style={{ color, marginTop: 4, fontWeight: '900', textTransform: 'uppercase' }}>{booking.status}</Text>
        </View>
        <Text style={{ color: '#ff9abf', fontWeight: '900' }}>{formatCurrency(booking.priceCents, booking.currency)}</Text>
      </View>

      <Text style={{ color: '#aaa', marginTop: 8 }}>Session: {booking.sessionType} / {booking.durationMinutes} minutes</Text>
      <Text style={{ color: '#aaa', marginTop: 4 }}>Starts: {formatDateTime(booking.startsAt)}</Text>
      <Text style={{ color: '#777', fontSize: 11, marginTop: 4 }}>Sub: {booking.subId} | Mistress: {booking.mistressId}</Text>

      <View style={{ backgroundColor: '#050505', borderRadius: 12, padding: 10, marginTop: 10 }}>
        <Text style={{ color: '#fff', fontWeight: '900', marginBottom: 4 }}>Handoff ids</Text>
        <Text style={{ color: '#aaa', fontSize: 12 }}>Wallet: {booking.walletTransactionId || 'pending'}</Text>
        <Text style={{ color: '#aaa', fontSize: 12, marginTop: 3 }}>Calendar: {booking.calendarEventId || 'pending'}</Text>
        <Text style={{ color: '#aaa', fontSize: 12, marginTop: 3 }}>Notifications: {(booking.notificationIds || []).join(', ') || 'pending'}</Text>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 }}>
        {STATUS_ACTIONS.map((status) => (
          <Pill
            key={`${booking.id}-${status}`}
            label={status}
            active={booking.status === status}
            color={statusColor(status)}
            onPress={booking.status === status || saving ? undefined : () => onUpdateStatus(status)}
          />
        ))}
      </View>
    </View>
  );
}

export function CallSchedulingScreen() {
  const {
    bookings,
    summary,
    totals,
    loading,
    saving,
    error,
    notice,
    refresh,
    applyFilters,
    createBooking,
    updateStatus,
  } = useCallScheduling();
  const [statusFilter, setStatusFilter] = useState<'all' | CallBookingStatus>('all');
  const [subId, setSubId] = useState('demo-sub');
  const [mistressId, setMistressId] = useState('demo-mistress');
  const [mistressName, setMistressName] = useState('Demo Mistress');
  const [sessionType, setSessionType] = useState<CallSessionType>('voice');
  const [startsAt, setStartsAt] = useState(nextHourIso());
  const [durationMinutes, setDurationMinutes] = useState('15');
  const [priceCents, setPriceCents] = useState('1000');

  const filteredBookings = useMemo(
    () => (statusFilter === 'all' ? bookings : bookings.filter((booking) => booking.status === statusFilter)),
    [bookings, statusFilter],
  );

  function updateFilter(nextStatus: 'all' | CallBookingStatus) {
    setStatusFilter(nextStatus);
    applyFilters(nextStatus === 'all' ? {} : { status: nextStatus });
  }

  async function submitBooking() {
    const created = await createBooking({
      subId: subId.trim() || 'demo-sub',
      mistressId: mistressId.trim() || 'demo-mistress',
      mistressName: mistressName.trim() || 'Demo Mistress',
      sessionType,
      startsAt: startsAt.trim() || nextHourIso(),
      durationMinutes: Number(durationMinutes) || 15,
      priceCents: Number(priceCents) || 1000,
      status: 'booked',
    });

    if (created) {
      setStatusFilter('all');
      setStartsAt(nextHourIso());
    }
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#000' }} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900', marginBottom: 6 }}>Call Scheduling</Text>
      <Text style={{ color: '#aaa', marginBottom: 14 }}>
        Backend-backed paid call scheduling with wallet, calendar and notification handoff ids.
      </Text>

      {error ? <Text style={{ color: '#ff6b6b', marginBottom: 10 }}>{error}</Text> : null}
      {notice ? <Text style={{ color: '#1D9E75', marginBottom: 10 }}>{notice}</Text> : null}
      {loading ? <Text style={{ color: '#999', marginBottom: 10 }}>Loading call scheduling...</Text> : null}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
        <SummaryCard label="Total" value={String(summary.totalBookings)} detail={`${totals.open} open bookings`} />
        <SummaryCard label="Revenue" value={formatCurrency(summary.totalRevenueCents, summary.currency)} detail={`${summary.paid} paid sessions`} />
        <SummaryCard label="Ready" value={String(totals.readyToRun)} detail={`${totals.needsPayment} waiting on payment`} />
      </View>

      <View style={{ backgroundColor: '#111', borderColor: '#282828', borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 14 }}>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900', marginBottom: 10 }}>Create scheduled call</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
          <Pill label="Voice" active={sessionType === 'voice'} onPress={() => setSessionType('voice')} />
          <Pill label="Video" active={sessionType === 'video'} onPress={() => setSessionType('video')} />
        </View>
        <TextInput value={subId} onChangeText={setSubId} placeholder="Sub id" placeholderTextColor="#777" style={inputStyle} />
        <TextInput value={mistressId} onChangeText={setMistressId} placeholder="Mistress id" placeholderTextColor="#777" style={inputStyle} />
        <TextInput value={mistressName} onChangeText={setMistressName} placeholder="Mistress name" placeholderTextColor="#777" style={inputStyle} />
        <TextInput value={startsAt} onChangeText={setStartsAt} placeholder="Starts at ISO" placeholderTextColor="#777" style={inputStyle} />
        <View style={{ flexDirection: 'row' }}>
          <TextInput value={durationMinutes} onChangeText={setDurationMinutes} keyboardType="numeric" placeholder="Minutes" placeholderTextColor="#777" style={[inputStyle, { flex: 1, marginRight: 8 }]} />
          <TextInput value={priceCents} onChangeText={setPriceCents} keyboardType="numeric" placeholder="Price cents" placeholderTextColor="#777" style={[inputStyle, { flex: 1 }]} />
        </View>
        <Pressable disabled={saving} onPress={submitBooking} style={{ backgroundColor: saving ? '#555' : '#ff0055', borderRadius: 12, padding: 12, marginTop: 2 }}>
          <Text style={{ color: '#fff', fontWeight: '900', textAlign: 'center' }}>{saving ? 'Saving...' : 'Create Call Booking'}</Text>
        </Pressable>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
        {STATUS_FILTERS.map((status) => (
          <Pill
            key={status}
            label={status}
            active={statusFilter === status}
            color={status === 'all' ? '#ff0055' : statusColor(status)}
            onPress={() => updateFilter(status)}
          />
        ))}
        <Pill label="Refresh" color="#1D9E75" onPress={() => refresh()} />
      </View>

      {filteredBookings.length === 0 ? <Text style={{ color: '#777' }}>No call bookings in this filter.</Text> : null}
      {filteredBookings.map((booking) => (
        <BookingCard
          key={booking.id}
          booking={booking}
          saving={saving}
          onUpdateStatus={(status) => updateStatus(booking.id, status)}
        />
      ))}
    </ScrollView>
  );
}

const inputStyle = {
  backgroundColor: '#050505',
  color: '#fff',
  padding: 12,
  borderRadius: 10,
  marginBottom: 8,
};
