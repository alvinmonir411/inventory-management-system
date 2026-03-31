export function toNumber(value: string | null | undefined): number {
  return Number(value ?? 0);
}
