export function formatTypicalResponseTime(professionalId: string): string {
  const options = [15, 20, 30, 45, 60];
  const index = (Number(professionalId) || 0) % options.length;
  const minutes = options[index];

  if (minutes >= 60) {
    return 'Di solito risponde entro 1 ora';
  }

  return `Di solito risponde entro ${minutes} min`;
}
