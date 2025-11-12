export function normalizeString(value: string | null | undefined): string {
  return (value ?? '').trim();
}