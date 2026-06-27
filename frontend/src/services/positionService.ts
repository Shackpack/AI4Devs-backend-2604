import axios from 'axios';
import { InterviewStep, PositionInterviewStepsResponse, PositionSummary } from '../types/api';

const API_BASE_URL = 'http://localhost:3010';

export const getPositions = async (): Promise<PositionSummary[]> => {
  const response = await axios.get<PositionSummary[]>(`${API_BASE_URL}/positions`);
  return response.data;
};

export const getInterviewStepsByPosition = async (
  positionId: number
): Promise<InterviewStep[]> => {
  const response = await axios.get<PositionInterviewStepsResponse>(
    `${API_BASE_URL}/positions/${positionId}/interview-steps`
  );
  return response.data.steps;
};
