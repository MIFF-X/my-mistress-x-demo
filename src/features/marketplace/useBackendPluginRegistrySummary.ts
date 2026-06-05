import { useCallback, useEffect, useState } from 'react';
import { BackendPluginRegistrySummary, getBackendPluginRegistrySummary } from '../../api/pluginsApi';

export function useBackendPluginRegistrySummary() {
  const [backendSummary, setBackendSummary] = useState<BackendPluginRegistrySummary | null>(null);
  const [backendSummaryError, setBackendSummaryError] = useState<string | null>(null);
  const [backendSummaryLoading, setBackendSummaryLoading] = useState(true);

  const refreshSummary = useCallback(async () => {
    setBackendSummaryLoading(true);
    try {
      const summary = await getBackendPluginRegistrySummary();
      setBackendSummary(summary);
      setBackendSummaryError(null);
    } catch (error) {
      setBackendSummary(null);
      setBackendSummaryError(error instanceof Error ? error.message : 'Registry summary unavailable');
    } finally {
      setBackendSummaryLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshSummary();
  }, [refreshSummary]);

  return {
    backendSummary,
    backendSummaryError,
    backendSummaryLoading,
    refreshSummary,
  };
}
