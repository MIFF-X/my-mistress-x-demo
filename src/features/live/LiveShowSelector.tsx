import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { buyLiveShowTicket, listLiveShows, LiveShow } from '../../api/liveApi';

type LiveShowSelectorProps = {
  selectedShowId?: string;
  onSelect: (show: LiveShow) => void;
};

export function LiveShowSelector({ selectedShowId, onSelect }: LiveShowSelectorProps) {
  const [shows, setShows] = useState<LiveShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ticketLoadingId, setTicketLoadingId] = useState<string | null>(null);

  useEffect(() => {
    loadShows();
  }, []);

  async function loadShows() {
    try {
      setLoading(true);
      setError(null);
      const data = await listLiveShows();
      setShows(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Live shows failed to load');
    } finally {
      setLoading(false);
    }
  }

  async function handleBuyTicket(show: LiveShow) {
    try {
      setTicketLoadingId(show.id);
      setError(null);
      await buyLiveShowTicket(show.id);
      onSelect(show);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ticket purchase failed');
    } finally {
      setTicketLoadingId(null);
    }
  }

  if (loading) {
    return <Text style={{ color: '#999', marginBottom: 10 }}>Loading live shows...</Text>;
  }

  if (error) {
    return <Text style={{ color: '#ff6b6b', marginBottom: 10 }}>{error}</Text>;
  }

  if (!shows.length) {
    return <Text style={{ color: '#999', marginBottom: 10 }}>No live shows available yet.</Text>;
  }

  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ color: '#fff', fontWeight: '700', marginBottom: 8 }}>
        Select Live Show
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {shows.map((show) => {
          const active = selectedShowId === show.id;
          const hostName = show.mistress?.displayName || show.mistress?.username || 'Host';
          const isTicketLoading = ticketLoadingId === show.id;

          return (
            <View
              key={show.id}
              style={{
                backgroundColor: active ? '#201019' : '#111',
                borderColor: active ? '#ff9abf' : '#333',
                borderWidth: 1,
                padding: 10,
                borderRadius: 12,
                marginRight: 8,
                width: 220,
              }}
            >
              <Pressable onPress={() => onSelect(show)}>
                <Text style={{ color: '#fff', fontWeight: '800' }}>{show.title}</Text>
                <Text style={{ color: '#aaa', fontSize: 11 }}>Host: {hostName}</Text>
                <Text style={{ color: '#ff9abf', fontSize: 11 }}>Ticket: {show.ticketPrice} credits</Text>
                <Text style={{ color: show.status === 'LIVE' ? '#1D9E75' : '#aaa', fontSize: 11 }}>
                  {show.status}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => handleBuyTicket(show)}
                disabled={isTicketLoading}
                style={{
                  backgroundColor: '#ff0055',
                  padding: 8,
                  borderRadius: 8,
                  marginTop: 8,
                }}
              >
                <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '700' }}>
                  {isTicketLoading ? 'Buying...' : 'Buy / Select Ticket'}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
