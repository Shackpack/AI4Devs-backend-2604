import axios from 'axios';

export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return 'No se pudo conectar con el servidor. Verifica tu conexión.';
    }
    const status = error.response.status;
    const backendMessage: string = error.response.data?.message || '';
    if (status === 400) return `Datos inválidos${backendMessage ? `: ${backendMessage}` : '.'}`;
    if (status === 404) return 'Candidato o posición no encontrados.';
    if (status === 500) return 'Error interno del servidor. Inténtalo más tarde.';
    return `Error inesperado (${status})${backendMessage ? `: ${backendMessage}` : '.'}`;
  }
  return 'Ocurrió un error inesperado.';
};
