export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  if (typeof window === 'undefined') return;

  const handleKeyPress = (e: KeyboardEvent) => {
    shortcuts.forEach((shortcut) => {
      const matchesModifiers =
        (shortcut.ctrl === undefined || shortcut.ctrl === e.ctrlKey) &&
        (shortcut.shift === undefined || shortcut.shift === e.shiftKey) &&
        (shortcut.alt === undefined || shortcut.alt === e.altKey);

      if (matchesModifiers && e.key.toLowerCase() === shortcut.key.toLowerCase()) {
        e.preventDefault();
        shortcut.action();
      }
    });
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }
}

export const defaultShortcuts: KeyboardShortcut[] = [
  { key: 'k', ctrl: true, action: () => {}, description: 'Search conversations' },
  { key: 'n', ctrl: true, action: () => {}, description: 'New conversation' },
  { key: '/', ctrl: true, action: () => {}, description: 'Focus input' },
  { key: 'Escape', action: () => {}, description: 'Close modals' },
];
