/**
 * Formata uma data para exibição no formato brasileiro
 * @param date Data a ser formatada
 * @returns String formatada
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
} 