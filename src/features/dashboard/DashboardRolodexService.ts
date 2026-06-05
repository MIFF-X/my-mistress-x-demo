import { apiRequest } from '../../api/apiClient';

type RolodexSummaryCounts = {
  totalCards: number;
  autoCreated: number;
  littleBlackBook: number;
  masterCards: number;
};

const EMPTY_SUMMARY: RolodexSummaryCounts = {
  totalCards: 0,
  autoCreated: 0,
  littleBlackBook: 0,
  masterCards: 0,
};

export async function getRolodexSummaryCounts(ownerUserId: string) {
  if (!ownerUserId) return EMPTY_SUMMARY;

  try {
    const response = await apiRequest<Partial<RolodexSummaryCounts>>(`/rolodex-summary/${ownerUserId}`);

    return {
      totalCards: Number(response.totalCards ?? 0),
      autoCreated: Number(response.autoCreated ?? 0),
      littleBlackBook: Number(response.littleBlackBook ?? 0),
      masterCards: Number(response.masterCards ?? 0),
    };
  } catch (error) {
    if (__DEV__) {
      console.warn('Rolodex summary counts unavailable; using zero fallback.', error);
    }

    return EMPTY_SUMMARY;
  }
}
