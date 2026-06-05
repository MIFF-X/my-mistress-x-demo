import React, { useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import {
  LeaderboardRow,
  listLeaderboard,
  listPositions,
  Position,
  recalculatePositions,
} from '../../api/positionsApi';
import { getCurrentUser } from '../../state/authStore';
import { ActionPillButton } from '../buttons/ActionPillButton';

const POSITION_ICONS: Record<string, string> = {
  'Crown Holder': '👑',
  'Shoe Holder': '👠',
  'Bag Holder': '👜',
  'Door Holder': '🚪',
};

function positionIcon(name: string) {
  return POSITION_ICONS[name] || '🏆';
}

function PositionCard({ position }: { position: Position }) {
  return (
    <View
      style={{
        backgroundColor: '#111',
        borderColor: position.holderId ? '#d4af37' : '#333',
        borderWidth: 1,
        borderRadius: 16,
        padding: 14,
        marginBottom: 10,
      }}
    >
      <Text style={{ color: '#fff', fontSize: 22, fontWeight: '900' }}>
        {positionIcon(position.name)} {position.name}
      </Text>
      <Text style={{ color: position.holderId ? '#d4af37' : '#777', marginTop: 8, fontWeight: '800' }}>
        {position.holderId ? `Holder: ${position.holderId}` : 'No holder yet'}
      </Text>
      <Text style={{ color: '#ff9abf', marginTop: 4 }}>Value: {position.value} credits</Text>
      <Text style={{ color: '#777', fontSize: 10, marginTop: 6 }}>
        Updated: {new Date(position.updatedAt).toLocaleString()}
      </Text>
    </View>
  );
}

function LeaderboardCard({ row }: { row: LeaderboardRow }) {
  const medal = row.rank === 1 ? '🥇' : row.rank === 2 ? '🥈' : row.rank === 3 ? '🥉' : '🏅';

  return (
    <View style={{ backgroundColor: '#111', padding: 12, borderRadius: 14, marginBottom: 8 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ color: '#fff', fontSize: 17, fontWeight: '900' }}>
          {medal} Rank #{row.rank}
        </Text>
        <Text style={{ color: '#ff9abf', fontWeight: '900' }}>{row.totalSpent} credits</Text>
      </View>
      <Text style={{ color: '#aaa', marginTop: 5 }}>Sub: {row.subUserId || 'Unknown'}</Text>
    </View>
  );
}

export function PositionsScreen() {
  const currentUser = getCurrentUser();
  const [mistressId, setMistressId] = useState(currentUser?.role === 'MISTRESS' ? currentUser.id : '');
  const [positions, setPositions] = useState<Position[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function loadCompetition() {
    if (!mistressId.trim()) {
      setError('Mistress ID is required for this first-pass leaderboard view.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      const [positionRows, leaderboardRows] = await Promise.all([
        listPositions(mistressId.trim()),
        listLeaderboard(mistressId.trim()),
      ]);
      setPositions(positionRows);
      setLeaderboard(leaderboardRows);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Positions failed to load');
    } finally {
      setLoading(false);
    }
  }

  async function handleRecalculate() {
    if (!mistressId.trim()) {
      setError('Mistress ID is required before recalculating positions.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      const updated = await recalculatePositions(mistressId.trim());
      const leaderboardRows = await listLeaderboard(mistressId.trim());
      setPositions(updated);
      setLeaderboard(leaderboardRows);
      setSuccess('Positions recalculated.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Positions failed to recalculate');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={{ flex: 1, padding: 16, backgroundColor: '#000' }}>
      <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900', marginBottom: 6 }}>
        Positions & Leaderboards
      </Text>
      <Text style={{ color: '#aaa', marginBottom: 14 }}>
        Crown Holder, Shoe Holder, Bag Holder, Door Holder, and top supporter competition views.
      </Text>

      {error ? <Text style={{ color: '#ff6b6b', marginBottom: 10 }}>{error}</Text> : null}
      {success ? <Text style={{ color: '#1D9E75', marginBottom: 10 }}>{success}</Text> : null}
      {loading ? <Text style={{ color: '#999', marginBottom: 10 }}>Loading competition data...</Text> : null}

      <View style={{ backgroundColor: '#111', padding: 14, borderRadius: 16, marginBottom: 14 }}>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900', marginBottom: 8 }}>Mistress Competition Scope</Text>
        <TextInput
          value={mistressId}
          onChangeText={setMistressId}
          placeholder="Mistress user ID"
          placeholderTextColor="#777"
          style={{ backgroundColor: '#050505', color: '#fff', padding: 12, borderRadius: 10, marginBottom: 10 }}
        />
        <Text style={{ color: '#777', fontSize: 11, marginBottom: 10 }}>
          First pass uses a Mistress ID field. Later this will use a Mistress selector/discovery card.
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          <ActionPillButton actionKey="loadCompetition" onPress={loadCompetition} />
          <ActionPillButton actionKey="recalculatePositions" onPress={handleRecalculate} />
        </View>
      </View>

      <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900', marginBottom: 8 }}>Position Holders</Text>
      {positions.length === 0 ? <Text style={{ color: '#777', marginBottom: 12 }}>No positions loaded yet.</Text> : null}
      {positions.map((position) => <PositionCard key={position.id} position={position} />)}

      <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900', marginTop: 12, marginBottom: 8 }}>Leaderboard</Text>
      {leaderboard.length === 0 ? <Text style={{ color: '#777' }}>No leaderboard rows loaded yet.</Text> : null}
      {leaderboard.map((row) => <LeaderboardCard key={`${row.rank}-${row.subUserId || 'unknown'}`} row={row} />)}
    </ScrollView>
  );
}
