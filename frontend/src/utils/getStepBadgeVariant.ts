export { isFinalStep } from './isFinalStep';

export const getStepBadgeVariant = (stepName: string): string => {
  const normalized = stepName.trim().toLowerCase();
  if (normalized === 'hired') return 'success';
  if (normalized === 'rejected') return 'danger';
  if (normalized === 'on hold') return 'warning';
  return 'primary';
};
