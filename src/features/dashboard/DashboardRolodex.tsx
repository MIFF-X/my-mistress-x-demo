import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getCurrentUser } from '../../state/authStore';
import { getRolodexSummaryCounts } from './DashboardRolodexService';

interface RolodexCountsProps {
  role: string;
  savedCardCount: number;
  autoCreatedCount: number;
  littleBlackBookCount: number;
  masterCount: number;
}

export default function DashboardRolodex({ role, savedCardCount, autoCreatedCount, littleBlackBookCount, masterCount }: RolodexCountsProps) {
  const [counts, setCounts] = useState({
    totalCards: 0,
    autoCreated: 0,
    littleBlackBook: 0,
    masterCards: 0
  });

  useEffect(() => {
    async function fetchCounts() {
      const user = getCurrentUser();
      if (!user?.id) return;
      const result = await getRolodexSummaryCounts(user.id);
      setCounts(result);
    }
    fetchCounts();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Total Rolodex Cards: {counts.totalCards}</Text>
      <Text style={styles.label}>Auto-Created Cards: {counts.autoCreated}</Text>
      <Text style={styles.label}>Little Black Book: {counts.littleBlackBook}</Text>
      <Text style={styles.label}>Master Cards: {counts.masterCards}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#111', borderRadius: 8 },
  label: { color: '#FFD700', fontSize: 16, marginBottom: 8, fontWeight: '600' }
});
