<template>
  <DeepSeek v-if="deepSeekVisible" />
  <section v-if="visible" ref="comments" style="margin-top: 40px"></section>
</template>

<script setup>
  import { onMounted, onUnmounted, ref, toRef, watch } from 'vue';
  import { useData } from 'vitepress';
  import DeepSeek from './DeepSeek.vue';
  import { getRuntimeKind, isEntryVisible } from '../runtime';

  const isDark = toRef(useData(), 'isDark');
  const page = toRef(useData(), 'page');
  const comments = ref();
  const themeName = ref('noborder_dark');
  const visible = ref(true);
  const isClient =
    typeof document !== 'undefined' && typeof window !== 'undefined';
  const runtime = getRuntimeKind();
  const isDesktopApp = runtime === 'desktop-app';
  const isMobileApp = runtime === 'mobile-app';
  const deepSeekVisible = isEntryVisible('deepseek-entry', runtime);

  const setComments = () => {
    if (!isClient || !comments.value || !visible.value) {
      return;
    }
    const script = document.createElement('script');
    const configs = {
      'data-repo': 'luhaifeng666/bunpou',
      'data-repo-id': 'R_kgDOJszpjg',
      'data-category': 'Q&A',
      'data-category-id': 'DIC_kwDOJszpjs4CaJ8g',
      'data-mapping': 'pathname',
      'data-strict': '1',
      'data-reactions-enabled': '1',
      'data-emit-metadata': '0',
      'data-input-position': 'bottom',
      'data-lang': 'zh-CN',
      'data-theme': themeName.value,
      crossorigin: 'anonymous',
      async: true,
    };
    script.src = 'https://giscus.app/client.js';
    Object.entries(configs).forEach(([key, value]) => {
      script.setAttribute(key, value);
    });

    comments.value && (comments.value.innerHTML = '');
    comments.value.appendChild(script);
  };

  const setTheme = (val) => {
    if (!isClient) {
      return;
    }
    themeName.value = val ? 'noborder_dark' : 'light';
    const iframe = document.querySelector('iframe.giscus-frame');
    if (iframe) {
      iframe.contentWindow?.postMessage(
        {
          giscus: {
            setConfig: {
              theme: `https://giscus.app/themes/${themeName.value}.css`,
            },
          },
        },
        'https://giscus.app',
      );
    }
  };

  const watchMsg = (msg) => {
    if (msg.origin === 'https://beaudar.lipk.org') {
      setTheme();
    }
  };

  watch(page, (val) => {
    val.relativePath && val.relativePath !== 'index.md' && setComments();
  });

  watch(isDark, setTheme, {
    immediate: true,
  });

  onMounted(() => {
    if (!isClient || isDesktopApp || isMobileApp) {
      visible.value = false;
      return;
    }
    visible.value = ['luhaifeng666.github.io', 'localhost'].includes(
      window.location.hostname,
    );
    setComments();
    window.addEventListener('message', watchMsg);
  });

  onUnmounted(() => {
    if (!isClient || isDesktopApp) {
      return;
    }
    window.removeEventListener('message', watchMsg);
  });
</script>
