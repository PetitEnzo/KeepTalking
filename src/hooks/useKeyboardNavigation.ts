import { useEffect, useRef } from 'react';

interface KeyboardNavigationOptions {
  onEscape?: () => void;
  enabled?: boolean;
  containerRef?: React.RefObject<HTMLElement>;
}

/**
 * Hook pour gérer la navigation au clavier avec les touches directionnelles
 * Permet de naviguer entre les éléments cliquables (boutons, liens, etc.)
 */
export function useKeyboardNavigation(options: KeyboardNavigationOptions = {}) {
  const {
    onEscape,
    enabled = true,
    containerRef,
  } = options;

  const optionsRef = useRef(options);
  const currentFocusIndexRef = useRef(-1);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      
      // Escape fonctionne partout
      if (event.key === 'Escape' && optionsRef.current.onEscape) {
        event.preventDefault();
        optionsRef.current.onEscape();
        return;
      }

      // Ne pas intercepter les flèches si on est dans un input/textarea
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Récupérer tous les éléments focusables
      const container = containerRef?.current || document.body;
      const focusableElements = container.querySelectorAll(
        'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length === 0) return;

      const focusableArray = Array.from(focusableElements) as HTMLElement[];
      const currentIndex = focusableArray.indexOf(document.activeElement as HTMLElement);

      let nextIndex = currentIndex;

      switch (event.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          event.preventDefault();
          nextIndex = currentIndex + 1;
          if (nextIndex >= focusableArray.length) {
            nextIndex = 0; // Boucler au début
          }
          break;

        case 'ArrowUp':
        case 'ArrowLeft':
          event.preventDefault();
          nextIndex = currentIndex - 1;
          if (nextIndex < 0) {
            nextIndex = focusableArray.length - 1; // Boucler à la fin
          }
          break;

        case 'Enter':
          // Enter active l'élément focusé
          if (document.activeElement && document.activeElement !== document.body) {
            event.preventDefault();
            (document.activeElement as HTMLElement).click();
          }
          break;

        default:
          return;
      }

      // Focus sur le nouvel élément
      if (nextIndex !== currentIndex && focusableArray[nextIndex]) {
        focusableArray[nextIndex].focus();
        currentFocusIndexRef.current = nextIndex;

        // Ajouter un style visuel au focus
        focusableArray[nextIndex].style.outline = '2px solid #2563EB';
        focusableArray[nextIndex].style.outlineOffset = '2px';

        // Retirer le style de l'ancien élément
        if (currentIndex >= 0 && focusableArray[currentIndex]) {
          focusableArray[currentIndex].style.outline = '';
          focusableArray[currentIndex].style.outlineOffset = '';
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, containerRef]);
}
