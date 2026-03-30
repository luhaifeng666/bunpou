<template></template>

<script setup lang="ts">
  import { onBeforeUnmount, onMounted } from 'vue';

  type TauriWindow = Window & {
    __TAURI__?: {
      shell?: {
        open?: (url: string) => Promise<void>;
      };
    };
  };

  const isDesktopApp =
    typeof window !== 'undefined' && '__TAURI_IPC__' in window;
  const handledEvents = new WeakSet<Event>();
  let linkObserver: MutationObserver | null = null;

  const isPlainLeftClick = (event: MouseEvent) =>
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey;

  const isExternalHttpLink = (href: string) => /^https?:\/\//i.test(href);

  const normalizeExternalAnchor = (anchor: HTMLAnchorElement) => {
    const href = anchor.getAttribute('href') || '';
    if (!isExternalHttpLink(href)) {
      return;
    }

    anchor.removeAttribute('target');
    anchor.setAttribute('rel', 'noopener noreferrer');
  };

  const normalizeExternalAnchors = (root: ParentNode = document) => {
    root.querySelectorAll('a[href]').forEach((node) => {
      if (node instanceof HTMLAnchorElement) {
        normalizeExternalAnchor(node);
      }
    });
  };

  const openExternalLink = async (href: string) => {
    const tauriWindow = window as TauriWindow;
    const openByTauri = tauriWindow.__TAURI__?.shell?.open;
    if (openByTauri) {
      await openByTauri(href);
      return;
    }

    window.open(href, '_blank', 'noopener,noreferrer');
  };

  const getGrammarMenuToggle = () => {
    const sidebarItems = Array.from(
      document.querySelectorAll('.VPSidebarItem'),
    );
    for (const sidebarItem of sidebarItems) {
      if (!sidebarItem.textContent?.includes('语法')) {
        continue;
      }
      const button = sidebarItem.querySelector('button[aria-expanded]');
      if (button instanceof HTMLButtonElement) {
        return button;
      }
    }

    const fallbackButtons = Array.from(
      document.querySelectorAll('button[aria-expanded]'),
    );
    return (
      fallbackButtons.find(
        (button) =>
          button instanceof HTMLButtonElement &&
          button.textContent?.includes('语法'),
      ) || null
    );
  };

  const expandGrammarMenuIfRequested = () => {
    if (typeof window === 'undefined') {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get('expand') !== 'grammar') {
      return;
    }

    let attemptCount = 0;
    const maxAttempts = 12;
    const timer = window.setInterval(() => {
      attemptCount += 1;
      const grammarToggle = getGrammarMenuToggle();
      if (!(grammarToggle instanceof HTMLButtonElement)) {
        if (attemptCount >= maxAttempts) {
          window.clearInterval(timer);
        }
        return;
      }

      if (grammarToggle.getAttribute('aria-expanded') === 'false') {
        grammarToggle.click();
      }

      params.delete('expand');
      const query = params.toString();
      const cleanUrl = `${window.location.pathname}${query ? `?${query}` : ''}${
        window.location.hash
      }`;
      window.history.replaceState(null, '', cleanUrl);
      window.clearInterval(timer);
    }, 100);
  };

  const handleDocumentClick = async (event: MouseEvent) => {
    if (!isDesktopApp || !isPlainLeftClick(event) || handledEvents.has(event)) {
      return;
    }

    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    const anchor = target.closest('a[href]');
    if (!(anchor instanceof HTMLAnchorElement)) {
      return;
    }

    const href = anchor.getAttribute('href') || '';
    if (!isExternalHttpLink(href)) {
      return;
    }

    handledEvents.add(event);
    normalizeExternalAnchor(anchor);
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    try {
      await openExternalLink(href);
    } catch (error) {
      console.error('Failed to open external link', error);
    }
  };

  onMounted(() => {
    expandGrammarMenuIfRequested();

    if (!isDesktopApp) {
      return;
    }
    document.documentElement.classList.add('bunpou-desktop-app');
    normalizeExternalAnchors();
    linkObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLAnchorElement) {
            normalizeExternalAnchor(node);
            return;
          }

          if (node instanceof Element) {
            normalizeExternalAnchors(node);
          }
        });
      }
    });
    linkObserver.observe(document.body, { childList: true, subtree: true });
    document.addEventListener('click', handleDocumentClick, true);
  });

  onBeforeUnmount(() => {
    if (!isDesktopApp) {
      return;
    }
    document.documentElement.classList.remove('bunpou-desktop-app');
    linkObserver?.disconnect();
    linkObserver = null;
    document.removeEventListener('click', handleDocumentClick, true);
  });
</script>
