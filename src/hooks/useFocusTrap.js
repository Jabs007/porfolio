import { useEffect } from 'react';

/**
 * useFocusTrap: WCAG 2.2 compliant keyboard focus management for modal dialogs.
 * Traps Tab and Shift+Tab within active modal container, restores focus on close.
 */
export default function useFocusTrap(isOpen, containerRef, onClose) {
  useEffect(() => {
    if (!isOpen || !containerRef.current) return undefined;

    const container = containerRef.current;
    const previouslyFocused = document.activeElement;

    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',');

    const getFocusableElements = () => {
      return Array.from(container.querySelectorAll(focusableSelectors));
    };

    // Auto-focus first interactive element
    const focusables = getFocusableElements();
    if (focusables.length > 0) {
      focusables[0].focus();
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose?.();
        return;
      }

      if (e.key === 'Tab') {
        const elements = getFocusableElements();
        if (!elements.length) {
          e.preventDefault();
          return;
        }

        const firstElement = elements[0];
        const lastElement = elements[elements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        previouslyFocused.focus();
      }
    };
  }, [isOpen, containerRef, onClose]);
}

