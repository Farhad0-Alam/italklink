export function hexToRgba(hex: string, alpha: number = 1): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return `rgba(0, 0, 0, ${alpha})`;
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function generateElementId(): string {
  return typeof crypto !== "undefined" && (crypto as any).randomUUID
    ? (crypto as any).randomUUID()
    : `el-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

export function parseColorOption(option: string): { label: string; value: string } {
  const parts = option.split("|");
  if (parts.length === 2) {
    return { label: parts[0].trim(), value: parts[1].trim() };
  }
  return { label: option.trim(), value: option.trim() };
}
