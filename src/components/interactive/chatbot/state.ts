/**
 * Whether the assistant panel is open, shared outside React.
 *
 * Kept in its own tiny module so the audit offer can check it ("never
 * interrupt a conversation") without importing the chatbot itself.
 */

let open = false;
const listeners = new Set<() => void>();

export function isChatOpen(): boolean {
  return open;
}

export function setChatOpen(next: boolean): void {
  if (open === next) return;
  open = next;
  for (const listener of listeners) listener();
}

export function subscribeChatOpen(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
