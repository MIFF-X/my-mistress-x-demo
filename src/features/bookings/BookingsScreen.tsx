import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import {
  approveBooking,
  BookingRecord,
  BookingReceipt,
  BookingReceiptDocument,
  BookingReceiptVerification,
  BookingStatus,
  BookingType,
  cancelBooking,
  completeBooking,
  createBooking,
  deliverBookingReceipt,
  downloadBookingReceipt,
  extendBooking,
  listBookings,
  startBooking,
  verifyBookingReceipt,
} from '../../api/bookingsApi';
import { DirectoryUser, listUserDirectory } from '../../api/usersApi';
import { getCurrentUser } from '../../state/authStore';

type BookingTab = 'list' | 'create';
type BookingStatusFilter = 'ALL' | BookingStatus;
type ScheduleMode = 'NOW' | 'LATER';

const STATUS_FILTERS: BookingStatusFilter[] = ['ALL', 'PENDING', 'APPROVED', 'ACTIVE', 'COMPLETED', 'CANCELLED'];
const QUICK_DATE_OFFSETS = [0, 1, 2, 3, 7];
const QUICK_TIME_SLOTS = ['09:00', '12:00', '15:00', '18:00', '20:00', '22:00'];
const DURATION_PRESETS = [5, 10, 20];
const EXTENSION_PRESETS = [
  { minutes: 5, price: 10 },
  { minutes: 10, price: 20 },
  { minutes: 20, price: 40 },
];

function statusColor(status: BookingRecord['status']) {
  if (status === 'ACTIVE') return '#1D9E75';
  if (status === 'APPROVED') return '#d4af37';
  if (status === 'COMPLETED') return '#777';
  if (status === 'CANCELLED') return '#ff6b6b';
  return '#ff9abf';
}

function formatDateTime(value?: string | null) {
  if (!value) return 'Not set';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

function quickDateLabel(days: number) {
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `+${days} days`;
}

function buildScheduledIso(dateValue: string, timeValue: string) {
  if (!dateValue.trim() || !timeValue.trim()) return '';
  const date = new Date(`${dateValue.trim()}T${timeValue.trim()}:00`);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString();
}

function formatDuration(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours <= 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

function revenueSplitForCredits(grossCredits: number) {
  const safeGrossCredits = Number.isFinite(grossCredits) && grossCredits > 0 ? grossCredits : 0;
  return {
    grossCredits: safeGrossCredits,
    hostCredits: Math.round(safeGrossCredits * 70) / 100,
    platformCredits: Math.round(safeGrossCredits * 30) / 100,
  };
}

function reminderTextForSchedule(scheduledAt?: string | null) {
  if (!scheduledAt) return 'Reminder placeholder: sent when the host approves an unscheduled session.';
  const scheduledDate = new Date(scheduledAt);
  if (Number.isNaN(scheduledDate.getTime())) return 'Reminder placeholder: waiting for a valid schedule.';
  return `Reminder placeholder: ${formatDateTime(new Date(scheduledDate.getTime() - 15 * 60000).toISOString())}`;
}

function calendarTextForSchedule(scheduledAt?: string | null) {
  if (!scheduledAt) return 'Calendar placeholder: available after a date and time are set.';
  return `Calendar placeholder: add ${formatDateTime(scheduledAt)} to calendar.`;
}

function autoEndText(booking: BookingRecord) {
  if (booking.status === 'ACTIVE' && booking.startedAt) {
    const endAt = new Date(new Date(booking.startedAt).getTime() + booking.durationMinutes * 60000);
    return `Auto-end placeholder: ${formatDateTime(endAt.toISOString())}`;
  }
  return `Auto-end placeholder: ${booking.durationMinutes} minute limit when the host starts the bridge.`;
}

function bookingTimerText(booking: BookingRecord, nowMs: number) {
  if (booking.status === 'ACTIVE' && booking.startedAt) {
    const elapsedMs = Math.max(0, nowMs - new Date(booking.startedAt).getTime());
    const elapsedMinutes = Math.floor(elapsedMs / 60000);
    const remainingMinutes = Math.max(0, booking.durationMinutes - elapsedMinutes);
    return `Live now - elapsed ${formatDuration(elapsedMinutes)} - approx remaining ${formatDuration(remainingMinutes)}`;
  }

  if (booking.status === 'APPROVED' && booking.scheduledAt) {
    const diffMs = new Date(booking.scheduledAt).getTime() - nowMs;
    const diffMinutes = Math.ceil(Math.abs(diffMs) / 60000);
    return diffMs >= 0 ? `Scheduled in ${formatDuration(diffMinutes)}` : `Scheduled time passed ${formatDuration(diffMinutes)} ago`;
  }

  if ((booking.status === 'COMPLETED' || booking.status === 'CANCELLED') && booking.endedAt) {
    return `${booking.status === 'COMPLETED' ? 'Completed' : 'Cancelled'} at ${formatDateTime(booking.endedAt)}`;
  }

  return null;
}

function userLabel(user: DirectoryUser) {
  return user.displayName || user.username || user.id;
}

function userSearchText(user: DirectoryUser) {
  const summary = user.profileTaxonomySummary;
  return [
    user.id,
    user.username,
    user.displayName,
    user.role,
    ...(summary?.mistressCategoryIds || []),
    ...(summary?.subIdentityLabels || []),
    ...(summary?.professionIds || []),
    ...(summary?.serviceOfferIds || []),
    ...(summary?.customLabels || []),
    ...(summary?.customServices || []),
    summary?.employmentStatus,
    summary?.jobTitle,
    summary?.industry,
  ]
    .filter(Boolean)
    .map((value) => String(value).replace(/_/g, ' '))
    .join(' ')
    .toLowerCase();
}

function ActionButton({
  label,
  onPress,
  color,
  textColor = '#fff',
}: {
  label: string;
  onPress: () => void;
  color: string;
  textColor?: string;
}) {
  return (
    <Pressable onPress={onPress} style={{ backgroundColor: color, padding: 9, borderRadius: 10, marginRight: 7, marginBottom: 7 }}>
      <Text style={{ color: textColor, fontWeight: '800' }}>{label}</Text>
    </Pressable>
  );
}

function BookingCard({
  booking,
  currentUserId,
  nowMs,
  onApprove,
  onStart,
  onComplete,
  onCancel,
  onExtend,
}: {
  booking: BookingRecord;
  currentUserId?: string;
  nowMs: number;
  onApprove: () => void;
  onStart: () => void;
  onComplete: () => void;
  onCancel: () => void;
  onExtend: (extraMinutes: number, extraPrice: number) => void;
}) {
  const [customExtendMinutes, setCustomExtendMinutes] = useState('5');
  const [customExtendPrice, setCustomExtendPrice] = useState('10');
  const color = statusColor(booking.status);
  const isHost = booking.hostUserId === currentUserId;
  const isParticipant = booking.hostUserId === currentUserId || booking.subUserId === currentUserId;
  const canApprove = isHost && booking.status === 'PENDING';
  const canStart = isHost && booking.status === 'APPROVED';
  const canComplete = isParticipant && booking.status === 'ACTIVE';
  const canExtend = isParticipant && booking.status === 'ACTIVE';
  const canCancel = isParticipant && booking.status !== 'COMPLETED' && booking.status !== 'CANCELLED';
  const timerText = bookingTimerText(booking, nowMs);
  const revenueSplit = revenueSplitForCredits(booking.price);

  function handleCustomExtend() {
    const minutes = Number(customExtendMinutes);
    const credits = Number(customExtendPrice);
    if (!Number.isFinite(minutes) || minutes <= 0 || !Number.isFinite(credits) || credits <= 0) return;
    onExtend(minutes, credits);
  }

  return (
    <View style={{ backgroundColor: '#111', borderColor: color, borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>{booking.type} Booking</Text>
          <Text style={{ color, marginTop: 5, fontWeight: '900' }}>{booking.status}</Text>
        </View>
        <Text style={{ color: '#ff9abf', fontWeight: '900' }}>{booking.price} credits</Text>
      </View>

      {timerText ? (
        <View style={{ backgroundColor: '#050505', padding: 10, borderRadius: 12, marginTop: 10 }}>
          <Text style={{ color, fontWeight: '900' }}>{timerText}</Text>
        </View>
      ) : null}

      <Text style={{ color: '#aaa', marginTop: 8 }}>Host: {booking.hostUserId}</Text>
      <Text style={{ color: '#aaa', marginTop: 4 }}>Sub: {booking.subUserId}</Text>
      <Text style={{ color: '#aaa', marginTop: 4 }}>Duration: {booking.durationMinutes} minutes</Text>
      <Text style={{ color: '#aaa', marginTop: 4 }}>Scheduled: {formatDateTime(booking.scheduledAt)}</Text>
      {booking.startedAt ? <Text style={{ color: '#777', fontSize: 10, marginTop: 4 }}>Started: {formatDateTime(booking.startedAt)}</Text> : null}
      {booking.endedAt ? <Text style={{ color: '#777', fontSize: 10, marginTop: 4 }}>Ended: {formatDateTime(booking.endedAt)}</Text> : null}
      {booking.notes ? <Text style={{ color: '#ddd', marginTop: 8 }}>{booking.notes}</Text> : null}

      <View style={{ backgroundColor: '#050505', padding: 10, borderRadius: 12, marginTop: 10 }}>
        <Text style={{ color: '#fff', fontWeight: '900', marginBottom: 4 }}>Booking support</Text>
        <Text style={{ color: '#aaa', fontSize: 12 }}>Revenue split: Host {revenueSplit.hostCredits} / Platform {revenueSplit.platformCredits} credits</Text>
        <Text style={{ color: '#aaa', fontSize: 12, marginTop: 4 }}>{reminderTextForSchedule(booking.scheduledAt)}</Text>
        <Text style={{ color: '#aaa', fontSize: 12, marginTop: 4 }}>{calendarTextForSchedule(booking.scheduledAt)}</Text>
        <Text style={{ color: '#aaa', fontSize: 12, marginTop: 4 }}>{autoEndText(booking)}</Text>
      </View>

      <Text style={{ color: '#777', fontSize: 10, marginTop: 8 }}>
        Created: {new Date(booking.createdAt).toLocaleString()}
      </Text>

      {canExtend ? (
        <View style={{ backgroundColor: '#050505', padding: 10, borderRadius: 12, marginTop: 12 }}>
          <Text style={{ color: '#fff', fontWeight: '900', marginBottom: 8 }}>Extend session</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {EXTENSION_PRESETS.map((preset) => (
              <ActionButton
                key={`${preset.minutes}-${preset.price}`}
                label={`+${preset.minutes}m / ${preset.price}`}
                onPress={() => onExtend(preset.minutes, preset.price)}
                color="#ff0055"
              />
            ))}
          </View>
          <View style={{ flexDirection: 'row', marginTop: 2 }}>
            <TextInput
              value={customExtendMinutes}
              onChangeText={setCustomExtendMinutes}
              keyboardType="numeric"
              placeholder="Minutes"
              placeholderTextColor="#777"
              style={{ flex: 1, backgroundColor: '#111', color: '#fff', padding: 10, borderRadius: 10, marginRight: 8 }}
            />
            <TextInput
              value={customExtendPrice}
              onChangeText={setCustomExtendPrice}
              keyboardType="numeric"
              placeholder="Credits"
              placeholderTextColor="#777"
              style={{ flex: 1, backgroundColor: '#111', color: '#fff', padding: 10, borderRadius: 10 }}
            />
          </View>
          <Pressable onPress={handleCustomExtend} style={{ backgroundColor: '#222', padding: 10, borderRadius: 10, marginTop: 8 }}>
            <Text style={{ color: '#fff', fontWeight: '900', textAlign: 'center' }}>Apply Custom Extension</Text>
          </Pressable>
        </View>
      ) : null}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 }}>
        {canApprove ? <ActionButton label="Approve" onPress={onApprove} color="#222" /> : null}
        {canStart ? <ActionButton label="Start" onPress={onStart} color="#1D9E75" /> : null}
        {canComplete ? <ActionButton label="Complete" onPress={onComplete} color="#444" /> : null}
        {canCancel ? <ActionButton label="Cancel" onPress={onCancel} color="#330011" textColor="#ff9abf" /> : null}
        {!canApprove && !canStart && !canComplete && !canExtend && !canCancel ? (
          <Text style={{ color: '#777', fontSize: 12 }}>No available actions for this booking status.</Text>
        ) : null}
      </View>
    </View>
  );
}

export function BookingsScreen() {
  const currentUser = getCurrentUser() as { id?: string; role?: string } | null;
  const [activeTab, setActiveTab] = useState<BookingTab>('list');
  const [statusFilter, setStatusFilter] = useState<BookingStatusFilter>('ALL');
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [hosts, setHosts] = useState<DirectoryUser[]>([]);
  const [hostUserId, setHostUserId] = useState('');
  const [hostSearch, setHostSearch] = useState('');
  const [type, setType] = useState<BookingType>('VIDEO');
  const [durationMinutes, setDurationMinutes] = useState('15');
  const [price, setPrice] = useState('25');
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>('NOW');
  const [scheduleDate, setScheduleDate] = useState(formatDateInput(new Date()));
  const [scheduleTime, setScheduleTime] = useState('20:00');
  const [scheduledAt, setScheduledAt] = useState('');
  const [notes, setNotes] = useState('');
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [latestReceipt, setLatestReceipt] = useState<BookingReceipt | null>(null);
  const [latestReceiptDocument, setLatestReceiptDocument] = useState<BookingReceiptDocument | null>(null);
  const [latestReceiptVerification, setLatestReceiptVerification] = useState<BookingReceiptVerification | null>(null);

  const scheduledPreview = useMemo(
    () => scheduleMode === 'LATER' ? buildScheduledIso(scheduleDate, scheduleTime) : '',
    [scheduleMode, scheduleDate, scheduleTime],
  );

  const filteredBookings = useMemo(
    () => (statusFilter === 'ALL' ? bookings : bookings.filter((booking) => booking.status === statusFilter)),
    [bookings, statusFilter],
  );

  const filteredHosts = useMemo(() => {
    const search = hostSearch.trim().replace(/_/g, ' ').toLowerCase();
    return hosts.filter((host) => {
      if (host.id === currentUser?.id) return false;
      if (!search) return true;
      return userSearchText(host).includes(search);
    });
  }, [hosts, hostSearch, currentUser?.id]);

  const selectedHost = useMemo(() => hosts.find((host) => host.id === hostUserId), [hosts, hostUserId]);
  const bookingRevenueSplit = useMemo(() => revenueSplitForCredits(Number(price)), [price]);

  const statusCounts = useMemo(() => {
    const counts = STATUS_FILTERS.reduce((acc, status) => ({ ...acc, [status]: 0 }), {} as Record<BookingStatusFilter, number>);
    counts.ALL = bookings.length;
    bookings.forEach((booking) => {
      counts[booking.status] = (counts[booking.status] || 0) + 1;
    });
    return counts;
  }, [bookings]);

  useEffect(() => {
    loadBookings();
    loadHosts();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setNowMs(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setScheduledAt(scheduledPreview);
  }, [scheduledPreview]);

  async function loadBookings() {
    try {
      setLoading(true);
      setError(null);
      setBookings(await listBookings());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bookings failed to load');
    } finally {
      setLoading(false);
    }
  }

  async function loadHosts() {
    try {
      const [mistresses, headmistresses] = await Promise.all([
        listUserDirectory('MISTRESS'),
        listUserDirectory('HEADMISTRESS'),
      ]);
      const uniqueHosts = [...mistresses, ...headmistresses].filter(
        (host, index, allHosts) => allHosts.findIndex((candidate) => candidate.id === host.id) === index,
      );
      setHosts(uniqueHosts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hosts failed to load');
    }
  }

  async function handleCreateBooking() {
    if (!hostUserId.trim()) {
      setError('Choose a host/Mistress for this booking.');
      return;
    }
    if (!durationMinutes.trim() || Number(durationMinutes) <= 0) {
      setError('Duration must be greater than zero.');
      return;
    }
    if (!price.trim() || Number(price) <= 0) {
      setError('Price must be greater than zero.');
      return;
    }
    if (scheduleMode === 'LATER' && !scheduledPreview) {
      setError('Choose a valid booking date and time.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const result = await createBooking({
        hostUserId: hostUserId.trim(),
        type,
        durationMinutes: Number(durationMinutes),
        price: Number(price),
        scheduledAt: scheduleMode === 'LATER' ? scheduledPreview : undefined,
        notes: notes.trim() || undefined,
      });
      setLatestReceipt(result.receipt ?? null);
      setLatestReceiptDocument(null);
      setHostUserId('');
      setHostSearch('');
      setDurationMinutes('15');
      setPrice('25');
      setScheduleMode('NOW');
      setScheduleDate(formatDateInput(new Date()));
      setScheduleTime('20:00');
      setScheduledAt('');
      setNotes('');
      setSuccess(result.receipt ? `Booking request created. Receipt ${result.receipt.id} is ready.` : 'Booking request created.');
      setStatusFilter('PENDING');
      setActiveTab('list');
      await loadBookings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking failed to create');
    } finally {
      setSaving(false);
    }
  }

  async function runAction(action: () => Promise<BookingRecord>, message: string) {
    try {
      setError(null);
      setSuccess(null);
      const result = await action();
      setLatestReceipt(result.receipt ?? latestReceipt);
      if (result.receipt) {
        setLatestReceiptDocument(null);
        setLatestReceiptVerification(null);
      }
      setSuccess(result.receipt ? `${message} Receipt ${result.receipt.id} is ready.` : message);
      await loadBookings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking action failed');
    }
  }

  async function handlePrepareLatestReceipt() {
    if (!latestReceipt) return;
    try {
      setError(null);
      const result = await downloadBookingReceipt(latestReceipt.id);
      setLatestReceiptDocument(result.document);
      setLatestReceiptVerification(null);
      setSuccess(`Receipt packet ${result.document.fileName} is ready.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Receipt packet failed to load');
    }
  }

  async function handleDeliverLatestReceipt() {
    if (!latestReceipt) return;
    try {
      setError(null);
      const result = await deliverBookingReceipt(latestReceipt.id, {
        channel: 'IN_APP',
        recipientUserId: currentUser?.id,
        note: 'Prepared from bookings screen',
      });
      setLatestReceiptDocument(result.document);
      setLatestReceiptVerification(null);
      setSuccess(`Receipt notice queued for ${result.delivery.deliveredToUserId}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Receipt delivery failed');
    }
  }

  async function handleVerifyLatestReceipt() {
    if (!latestReceipt) return;
    try {
      setError(null);
      const packet = latestReceiptDocument ?? (await downloadBookingReceipt(latestReceipt.id)).document;
      if (!latestReceiptDocument) setLatestReceiptDocument(packet);
      const result = await verifyBookingReceipt(latestReceipt.id, packet.signature.digest);
      setLatestReceiptVerification(result);
      setSuccess(
        result.valid
          ? `Receipt signature verified ${result.expectedDigest.slice(0, 12)}.`
          : 'Receipt signature check failed.',
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Receipt verification failed');
    }
  }

  function renderLatestReceipt() {
    if (!latestReceipt) return null;

    return (
      <View style={{ backgroundColor: '#07130f', borderColor: '#1D9E75', borderWidth: 1, padding: 12, borderRadius: 12, marginBottom: 12 }}>
        <Text style={{ color: '#1D9E75', fontWeight: '900', marginBottom: 4 }}>Latest Booking Receipt</Text>
        <Text style={{ color: '#fff', fontWeight: '800' }}>{latestReceipt.amountCredits} credits - {latestReceipt.purpose}</Text>
        <Text style={{ color: '#aaa', fontSize: 12, marginTop: 4 }}>Receipt: {latestReceipt.id}</Text>
        {latestReceipt.walletTransactionId ? (
          <Text style={{ color: '#aaa', fontSize: 12, marginTop: 2 }}>Wallet tx: {latestReceipt.walletTransactionId}</Text>
        ) : null}
        {latestReceiptDocument ? (
          <View style={{ backgroundColor: '#0b1b15', padding: 10, borderRadius: 10, marginTop: 10 }}>
            <Text style={{ color: '#fff', fontWeight: '900' }}>{latestReceiptDocument.summary.title}</Text>
            <Text style={{ color: '#aaa', fontSize: 12, marginTop: 3 }}>
              Host {latestReceiptDocument.totals.hostCredits} - Platform {latestReceiptDocument.totals.platformCredits}
            </Text>
            <Text style={{ color: '#777', fontSize: 11, marginTop: 3 }}>Packet: {latestReceiptDocument.fileName}</Text>
            <Text style={{ color: '#777', fontSize: 11, marginTop: 3 }}>
              Signature: {latestReceiptDocument.signature.digest.slice(0, 16)}... ({latestReceiptDocument.signature.keyId})
            </Text>
          </View>
        ) : null}
        {latestReceiptVerification ? (
          <View style={{ backgroundColor: '#050505', padding: 10, borderRadius: 10, marginTop: 10 }}>
            <Text style={{ color: latestReceiptVerification.valid ? '#1D9E75' : '#ff6b6b', fontWeight: '900' }}>
              Signature check: {latestReceiptVerification.valid ? 'Verified' : 'Failed'}
            </Text>
            <Text style={{ color: '#777', fontSize: 11, marginTop: 3 }}>
              Digest: {latestReceiptVerification.expectedDigest.slice(0, 16)}...
            </Text>
          </View>
        ) : null}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 }}>
          <ActionButton label="Prepare packet" onPress={handlePrepareLatestReceipt} color="#1D9E75" />
          <ActionButton label="Verify packet" onPress={handleVerifyLatestReceipt} color="#19362e" />
          <ActionButton label="Send notice" onPress={handleDeliverLatestReceipt} color="#222" />
        </View>
      </View>
    );
  }

  function renderTab(label: string, tab: BookingTab) {
    const active = activeTab === tab;
    return (
      <Pressable
        onPress={() => setActiveTab(tab)}
        style={{ backgroundColor: active ? '#ff0055' : '#111', paddingVertical: 9, paddingHorizontal: 12, borderRadius: 999, marginRight: 8, marginBottom: 8 }}
      >
        <Text style={{ color: '#fff', fontWeight: '900' }}>{label}</Text>
      </Pressable>
    );
  }

  function renderStatusFilter(filter: BookingStatusFilter) {
    const active = statusFilter === filter;
    const label = filter === 'ALL' ? 'All' : filter.charAt(0) + filter.slice(1).toLowerCase();

    return (
      <Pressable
        key={filter}
        onPress={() => setStatusFilter(filter)}
        style={{
          backgroundColor: active ? statusColor(filter === 'ALL' ? 'PENDING' : filter) : '#111',
          paddingVertical: 8,
          paddingHorizontal: 11,
          borderRadius: 999,
          marginRight: 7,
          marginBottom: 8,
          borderColor: active ? 'transparent' : '#333',
          borderWidth: 1,
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '900', fontSize: 12 }}>{label} - {statusCounts[filter] || 0}</Text>
      </Pressable>
    );
  }

  function renderTypeButton(option: BookingType) {
    const active = option === type;
    return (
      <Pressable
        onPress={() => setType(option)}
        style={{ backgroundColor: active ? '#ff0055' : '#222', paddingVertical: 9, paddingHorizontal: 12, borderRadius: 999, marginRight: 8, marginBottom: 8 }}
      >
        <Text style={{ color: '#fff', fontWeight: '900' }}>{option === 'VIDEO' ? 'Video' : 'Phone'}</Text>
      </Pressable>
    );
  }

  function renderScheduleModeButton(label: string, mode: ScheduleMode) {
    const active = scheduleMode === mode;
    return (
      <Pressable
        onPress={() => setScheduleMode(mode)}
        style={{ backgroundColor: active ? '#ff0055' : '#222', paddingVertical: 9, paddingHorizontal: 12, borderRadius: 999, marginRight: 8, marginBottom: 8 }}
      >
        <Text style={{ color: '#fff', fontWeight: '900' }}>{label}</Text>
      </Pressable>
    );
  }

  function renderHostPicker() {
    return (
      <View style={{ marginBottom: 8 }}>
        <Text style={{ color: '#aaa', fontSize: 12, marginBottom: 8 }}>Choose host / Mistress</Text>
        <TextInput
          value={hostSearch}
          onChangeText={setHostSearch}
          placeholder="Search hosts"
          placeholderTextColor="#777"
          style={{ backgroundColor: '#050505', color: '#fff', padding: 12, borderRadius: 10, marginBottom: 8 }}
        />
        {selectedHost ? (
          <View style={{ backgroundColor: '#1D9E75', padding: 10, borderRadius: 12, marginBottom: 8 }}>
            <Text style={{ color: '#fff', fontWeight: '900' }}>Selected: {userLabel(selectedHost)}</Text>
            <Text style={{ color: '#eafff7', fontSize: 11, marginTop: 2 }}>{selectedHost.role} - {selectedHost.id}</Text>
          </View>
        ) : null}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {filteredHosts.slice(0, 12).map((host) => {
            const active = host.id === hostUserId;
            return (
              <Pressable
                key={host.id}
                onPress={() => setHostUserId(host.id)}
                style={{
                  backgroundColor: active ? '#ff0055' : '#222',
                  paddingVertical: 8,
                  paddingHorizontal: 10,
                  borderRadius: 999,
                  marginRight: 7,
                  marginBottom: 7,
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '800', fontSize: 12 }}>{userLabel(host)}</Text>
              </Pressable>
            );
          })}
        </View>
        {hosts.length === 0 ? <Text style={{ color: '#777' }}>No Mistress/Headmistress hosts loaded yet.</Text> : null}
      </View>
    );
  }

  function renderSchedulePicker() {
    return (
      <View style={{ marginBottom: 8 }}>
        <Text style={{ color: '#aaa', fontSize: 12, marginBottom: 8 }}>Schedule</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
          {renderScheduleModeButton('Now / unscheduled', 'NOW')}
          {renderScheduleModeButton('Choose date & time', 'LATER')}
        </View>

        {scheduleMode === 'LATER' ? (
          <View style={{ backgroundColor: '#050505', padding: 10, borderRadius: 12, marginBottom: 8 }}>
            <Text style={{ color: '#ff9abf', fontWeight: '900', marginBottom: 8 }}>Quick dates</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
              {QUICK_DATE_OFFSETS.map((days) => {
                const dateValue = formatDateInput(addDays(days));
                const active = scheduleDate === dateValue;
                return (
                  <Pressable
                    key={days}
                    onPress={() => setScheduleDate(dateValue)}
                    style={{ backgroundColor: active ? '#ff0055' : '#222', borderRadius: 999, paddingVertical: 8, paddingHorizontal: 10, marginRight: 7, marginBottom: 7 }}
                  >
                    <Text style={{ color: '#fff', fontWeight: '800', fontSize: 12 }}>{quickDateLabel(days)}</Text>
                  </Pressable>
                );
              })}
            </View>

            <TextInput
              value={scheduleDate}
              onChangeText={setScheduleDate}
              placeholder="Date YYYY-MM-DD"
              placeholderTextColor="#777"
              style={{ backgroundColor: '#111', color: '#fff', padding: 12, borderRadius: 10, marginBottom: 8 }}
            />

            <Text style={{ color: '#ff9abf', fontWeight: '900', marginBottom: 8 }}>Quick times</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
              {QUICK_TIME_SLOTS.map((slot) => {
                const active = scheduleTime === slot;
                return (
                  <Pressable
                    key={slot}
                    onPress={() => setScheduleTime(slot)}
                    style={{ backgroundColor: active ? '#ff0055' : '#222', borderRadius: 999, paddingVertical: 8, paddingHorizontal: 10, marginRight: 7, marginBottom: 7 }}
                  >
                    <Text style={{ color: '#fff', fontWeight: '800', fontSize: 12 }}>{slot}</Text>
                  </Pressable>
                );
              })}
            </View>

            <TextInput
              value={scheduleTime}
              onChangeText={setScheduleTime}
              placeholder="Time HH:mm"
              placeholderTextColor="#777"
              style={{ backgroundColor: '#111', color: '#fff', padding: 12, borderRadius: 10, marginBottom: 8 }}
            />

            <View style={{ backgroundColor: '#111', padding: 10, borderRadius: 10 }}>
              <Text style={{ color: scheduledPreview ? '#1D9E75' : '#ff6b6b', fontWeight: '900' }}>
                {scheduledPreview ? `Preview: ${formatDateTime(scheduledPreview)}` : 'Choose a valid date and time'}
              </Text>
              <Text style={{ color: '#777', fontSize: 11, marginTop: 4 }}>
                Stored as ISO: {scheduledPreview || 'not ready'}
              </Text>
            </View>
          </View>
        ) : null}
      </View>
    );
  }

  function renderCreateForm() {
    return (
      <View style={{ backgroundColor: '#111', padding: 14, borderRadius: 16 }}>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900', marginBottom: 10 }}>Request Paid Call</Text>
        <Text style={{ color: '#aaa', fontSize: 12, marginBottom: 8 }}>Call type</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
          {renderTypeButton('VIDEO')}
          {renderTypeButton('PHONE')}
        </View>

        {renderHostPicker()}

        <Text style={{ color: '#aaa', fontSize: 12, marginBottom: 8 }}>Duration</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
          {DURATION_PRESETS.map((minutes) => {
            const active = durationMinutes === String(minutes);
            return (
              <Pressable
                key={minutes}
                onPress={() => setDurationMinutes(String(minutes))}
                style={{ backgroundColor: active ? '#ff0055' : '#222', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 999, marginRight: 7, marginBottom: 7 }}
              >
                <Text style={{ color: '#fff', fontWeight: '800', fontSize: 12 }}>{minutes} minutes</Text>
              </Pressable>
            );
          })}
        </View>
        <TextInput
          value={durationMinutes}
          onChangeText={setDurationMinutes}
          keyboardType="numeric"
          placeholder="Custom duration in minutes"
          placeholderTextColor="#777"
          style={{ backgroundColor: '#050505', color: '#fff', padding: 12, borderRadius: 10, marginBottom: 8 }}
        />
        <Text style={{ color: '#aaa', fontSize: 12, marginBottom: 8 }}>Price</Text>
        <TextInput
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
          placeholder="Price in credits"
          placeholderTextColor="#777"
          style={{ backgroundColor: '#050505', color: '#fff', padding: 12, borderRadius: 10, marginBottom: 8 }}
        />

        {renderSchedulePicker()}

        <View style={{ backgroundColor: '#050505', padding: 10, borderRadius: 12, marginBottom: 8 }}>
          <Text style={{ color: '#fff', fontWeight: '900', marginBottom: 4 }}>Booking support preview</Text>
          <Text style={{ color: '#aaa', fontSize: 12 }}>Revenue split: Host {bookingRevenueSplit.hostCredits} / Platform {bookingRevenueSplit.platformCredits} credits</Text>
          <Text style={{ color: '#aaa', fontSize: 12, marginTop: 4 }}>{reminderTextForSchedule(scheduleMode === 'LATER' ? scheduledAt : null)}</Text>
          <Text style={{ color: '#aaa', fontSize: 12, marginTop: 4 }}>{calendarTextForSchedule(scheduleMode === 'LATER' ? scheduledAt : null)}</Text>
          <Text style={{ color: '#aaa', fontSize: 12, marginTop: 4 }}>Auto-end placeholder: {durationMinutes || 'custom'} minute limit once the bridge starts.</Text>
        </View>

        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Booking notes"
          placeholderTextColor="#777"
          multiline
          style={{ backgroundColor: '#050505', color: '#fff', padding: 12, borderRadius: 10, minHeight: 84, marginBottom: 8 }}
        />

        <Pressable onPress={handleCreateBooking} disabled={saving} style={{ backgroundColor: saving ? '#555' : '#ff0055', padding: 12, borderRadius: 12 }}>
          <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '900' }}>{saving ? 'Requesting...' : 'Request Booking'}</Text>
        </Pressable>
      </View>
    );
  }

  function renderBookings() {
    return (
      <>
        <Pressable onPress={loadBookings} style={{ backgroundColor: '#222', padding: 10, borderRadius: 10, marginBottom: 12 }}>
          <Text style={{ color: '#fff', fontWeight: '800', textAlign: 'center' }}>Refresh Bookings</Text>
        </Pressable>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
          {STATUS_FILTERS.map(renderStatusFilter)}
        </View>

        {filteredBookings.length === 0 ? <Text style={{ color: '#777' }}>No bookings in this status.</Text> : null}
        {filteredBookings.map((booking) => (
          <BookingCard
            key={booking.id}
            booking={booking}
            currentUserId={currentUser?.id}
            nowMs={nowMs}
            onApprove={() => runAction(() => approveBooking(booking.id), 'Booking approved.')}
            onStart={() => runAction(() => startBooking(booking.id), 'Booking started.')}
            onComplete={() => runAction(() => completeBooking(booking.id), 'Booking completed.')}
            onCancel={() => runAction(() => cancelBooking(booking.id), 'Booking cancelled.')}
            onExtend={(extraMinutes, extraPrice) => runAction(
              () => extendBooking({ bookingId: booking.id, extraMinutes, extraPrice }),
              `Booking extended by ${extraMinutes} minutes.`,
            )}
          />
        ))}
      </>
    );
  }

  return (
    <ScrollView style={{ flex: 1, padding: 16, backgroundColor: '#000' }}>
      <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900', marginBottom: 6 }}>Paid Calls / Bookings</Text>
      <Text style={{ color: '#aaa', marginBottom: 14 }}>
        Request, approve, start, extend, complete, or cancel paid phone and video sessions.
      </Text>

      {error ? <Text style={{ color: '#ff6b6b', marginBottom: 10 }}>{error}</Text> : null}
      {success ? <Text style={{ color: '#1D9E75', marginBottom: 10 }}>{success}</Text> : null}
      {renderLatestReceipt()}
      {loading ? <Text style={{ color: '#999', marginBottom: 10 }}>Loading bookings...</Text> : null}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
        {renderTab('Bookings', 'list')}
        {renderTab('Request', 'create')}
      </View>

      {activeTab === 'list' ? renderBookings() : null}
      {activeTab === 'create' ? renderCreateForm() : null}
    </ScrollView>
  );
}
