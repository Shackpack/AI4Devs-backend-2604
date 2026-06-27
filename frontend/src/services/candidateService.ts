import axios, { AxiosError } from 'axios';
import {
  CandidateInPipeline,
  PositionPipelineResponse,
  UpdateCandidateStageRequest,
  UpdateCandidateStageResponse,
} from '../types/api';

const API_BASE_URL = 'http://localhost:3010';

const extractErrorMessage = (error: unknown, defaultMessage: string): string => {
  if (error instanceof AxiosError) {
    const serverMessage = error.response?.data?.error || error.response?.data?.message;
    if (serverMessage) return serverMessage;
    if (error.message) return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return defaultMessage;
};

export const uploadCV = async (file: File): Promise<{ filePath: string; fileType: string }> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post<{ filePath: string; fileType: string }>(
      `${API_BASE_URL}/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Error al subir el archivo'));
  }
};

export const sendCandidateData = async (candidateData: unknown): Promise<unknown> => {
  try {
    const response = await axios.post<unknown>(`${API_BASE_URL}/candidates`, candidateData);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Error al enviar datos del candidato'));
  }
};

export const getCandidatesByPosition = async (
  positionId: number
): Promise<PositionPipelineResponse> => {
  const response = await axios.get<PositionPipelineResponse>(
    `${API_BASE_URL}/positions/${positionId}/candidates`
  );
  return response.data;
};

export const updateCandidateStage = async (
  candidateId: number,
  payload: UpdateCandidateStageRequest
): Promise<UpdateCandidateStageResponse> => {
  const response = await axios.put<UpdateCandidateStageResponse>(
    `${API_BASE_URL}/candidates/${candidateId}/stage`,
    payload
  );
  return response.data;
};

export type { CandidateInPipeline, PositionPipelineResponse };
