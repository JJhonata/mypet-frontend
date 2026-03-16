export function sanitizeLetters(value: string): string {
  return value.replace(/[^A-Za-zÀ-ÿ\s'’.-]/g, "").replace(/\s{2,}/g, " ");
}

export function sanitizeIntegerInput(value: string): string {
  return value.replace(/\D/g, "");
}

export function sanitizeDecimalInput(value: string): string {
  const normalized = value.replace(/,/g, ".");
  const cleaned = normalized.replace(/[^0-9.]/g, "");
  const [integerPart, ...decimalParts] = cleaned.split(".");
  if (decimalParts.length === 0) {
    return integerPart;
  }
  return `${integerPart}.${decimalParts.join("")}`;
}

export function formatPhoneBR(value: string): string {
  const digits = sanitizeIntegerInput(value).slice(0, 11);
  if (digits.length <= 2) return digits ? `(${digits}` : "";
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function formatCpf(value: string): string {
  const digits = sanitizeIntegerInput(value).slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

export function formatCep(value: string): string {
  const digits = sanitizeIntegerInput(value).slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}