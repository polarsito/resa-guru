export function toLocaleString(num: number): string {
  return num.toLocaleString().replaceAll('.', ',');
}
