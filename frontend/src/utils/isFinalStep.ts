export type FinalStepType = 'Hired' | 'Rejected' | 'OnHold';

export const FINAL_STEP_NAMES: string[] = ['Hired', 'Rejected', 'On Hold'];

export const isFinalStep = (stepName: string): boolean => {
  return FINAL_STEP_NAMES.some(
    (name) => name.toLowerCase() === stepName.trim().toLowerCase()
  );
};
