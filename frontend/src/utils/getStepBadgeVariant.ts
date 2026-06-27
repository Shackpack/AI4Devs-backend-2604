const FINAL_STEP_VARIANTS: Record<string, string> = {
  hired: 'success',
  rejected: 'danger',
  'on hold': 'warning',
};

export const getStepBadgeVariant = (stepName: string): string => {
  const key = stepName.toLowerCase();
  return FINAL_STEP_VARIANTS[key] ?? 'primary';
};

export const isFinalStep = (stepName: string): boolean => {
  return stepName.toLowerCase() in FINAL_STEP_VARIANTS;
};
