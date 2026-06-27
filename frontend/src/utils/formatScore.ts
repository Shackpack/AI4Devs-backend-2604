export const formatScore = (score: number | null): string => {
  if (score === null || score === 0) return 'Sin evaluar';
  return score.toFixed(2);
};
