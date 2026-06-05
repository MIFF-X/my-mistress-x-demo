import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CallBookingStatus,
  CallSchedulingBooking,
  CallSchedulingFilters,
  CallSchedulingSummary,
  CreateCallSchedulingBookingInput,
  createCallSchedulingBooking,
  getCallSchedulingSummary,
  listCallSchedulingBookings,
  updateCallSchedulingStatus,
} from '../../api/callSchedulingApi';

const EMPTY_SUMMARY: CallSchedulingSummary = {
  totalBookings: 0,
  booked: 0,
  paid: 0,
  cancelled: 0,
  completed: 0,
  totalRevenueCents: 0,
  currency: 'AUD',
};

export function useCallScheduling(initialFilters: CallSchedulingFilters = {}) {
  const [bookings, setBookings] = useState<CallSchedulingBooking[]>([]);
  const [summary, setSummary] = useState<CallSchedulingSummary>(EMPTY_SUMMARY);
  const [filters, setFilters] = useState<CallSchedulingFilters>(initialFilters);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const refresh = useCallback(async (nextFilters = filters) => {
    try {
      setLoading(true);
      setError(null);
      const [nextBookings, nextSummary] = await Promise.all([
        listCallSchedulingBookings(nextFilters),
        getCallSchedulingSummary(),
      ]);
      setBookings(nextBookings);
      setSummary(nextSummary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Call scheduling failed to load');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const applyFilters = useCallback((nextFilters: CallSchedulingFilters) => {
    setFilters(nextFilters);
    void refresh(nextFilters);
  }, [refresh]);

  const createBooking = useCallback(async (input: CreateCallSchedulingBookingInput) => {
    try {
      setSaving(true);
      setError(null);
      const booking = await createCallSchedulingBooking(input);
      setNotice(`Call booking ${booking.id} created.`);
      await refresh();
      return booking;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Call booking failed to create');
      return null;
    } finally {
      setSaving(false);
    }
  }, [refresh]);

  const updateStatus = useCallback(async (id: string, status: CallBookingStatus) => {
    try {
      setSaving(true);
      setError(null);
      const booking = await updateCallSchedulingStatus(id, status);
      setNotice(`Call booking ${booking.id} marked ${status}.`);
      await refresh();
      return booking;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Call booking status failed to update');
      return null;
    } finally {
      setSaving(false);
    }
  }, [refresh]);

  const totals = useMemo(() => ({
    open: bookings.filter((booking) => !['cancelled', 'completed', 'expired'].includes(booking.status)).length,
    needsPayment: bookings.filter((booking) => booking.status === 'booked').length,
    readyToRun: bookings.filter((booking) => booking.status === 'paid').length,
  }), [bookings]);

  useEffect(() => {
    void refresh(initialFilters);
  }, []);

  return {
    bookings,
    summary,
    totals,
    filters,
    loading,
    saving,
    error,
    notice,
    refresh,
    applyFilters,
    createBooking,
    updateStatus,
  };
}
