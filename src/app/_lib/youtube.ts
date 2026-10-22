// Decode entity text without ever interpreting a remote title as HTML.
export function decodeTitle(value: string): string {
  const named: Record<string, string> = {
    amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: '\u00a0',
  };
  return value.replace(/&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt|nbsp);/gi, (entity, code: string) => {
    if (code[0] !== '#') return named[code.toLowerCase()] ?? entity;
    const point = code[1].toLowerCase() === 'x'
      ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
    if (point <= 0 || point > 0x10ffff || (point >= 0xd800 && point <= 0xdfff)) return '\ufffd';
    return String.fromCodePoint(point);
  });
}

export interface Track { id: string; title: string }
export interface Queue { tracks: Track[]; index: number }

export function removeFromQueue(queue: Queue, index: number): Queue {
  if (index < 0 || index >= queue.tracks.length) return queue;
  const tracks = queue.tracks.filter((_, i) => i !== index);
  return { tracks, index: Math.max(0, Math.min(queue.index - (index < queue.index ? 1 : 0), tracks.length - 1)) };
}

export function nextIndex(index: number, length: number): number | null {
  return index + 1 < length ? index + 1 : null;
}
