// utils/calculateReadingTime.ts
export function calculateReadingTime(text: string, charsPerMinute = 1200): string {
    const charCount = text.length;
    const minutes = Math.ceil(charCount / charsPerMinute);
    return `${minutes} min read`;
  }
  