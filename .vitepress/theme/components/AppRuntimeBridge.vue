<template></template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted } from "vue";
import { open } from "@tauri-apps/api/shell";

const isDesktopApp = typeof window !== "undefined" && "__TAURI_IPC__" in window;
const handledEvents = new WeakSet<Event>();
let linkObserver: MutationObserver | null = null;

const isPlainLeftClick = (event: MouseEvent) =>
  event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;

const isExternalHttpLink = (href: string) => /^https?:\/\//i.test(href);

const normalizeExternalAnchor = (anchor: HTMLAnchorElement) => {
  const href = anchor.getAttribute("href") || "";
  if (!isExternalHttpLink(href)) {
    return;
  }

  anchor.removeAttribute("target");
  anchor.setAttribute("rel", "noopener noreferrer");
};

const normalizeExternalAnchors = (root: ParentNode = document) => {
  root.querySelectorAll("a[href]").forEach((node) => {
    if (node instanceof HTMLAnchorElement) {
      normalizeExternalAnchor(node);
    }
  });
};

const handleDocumentClick = async (event: MouseEvent) => {
  if (!isDesktopApp || !isPlainLeftClick(event) || handledEvents.has(event)) {
    return;
  }

  const target = event.target;
  if (!(target instanceof Element)) {
    return;
  }

  const anchor = target.closest("a[href]");
  if (!(anchor instanceof HTMLAnchorElement)) {
    return;
  }

  const href = anchor.getAttribute("href") || "";
  if (!isExternalHttpLink(href)) {
    return;
  }

  handledEvents.add(event);
  normalizeExternalAnchor(anchor);
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
  try {
    await open(href);
  } catch (error) {
    console.error("Failed to open external link", error);
  }
};

onMounted(() => {
  if (!isDesktopApp) {
    return;
  }
  document.documentElement.classList.add("bunpou-desktop-app");
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
  document.addEventListener("click", handleDocumentClick, true);
});

onBeforeUnmount(() => {
  if (!isDesktopApp) {
    return;
  }
  document.documentElement.classList.remove("bunpou-desktop-app");
  linkObserver?.disconnect();
  linkObserver = null;
  document.removeEventListener("click", handleDocumentClick, true);
});
</script>