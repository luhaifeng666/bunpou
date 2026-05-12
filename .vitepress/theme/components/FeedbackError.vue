<template>
  <div v-if="isGrammarPage" class="bunpou-feedback">
    <a
      :href="issueLink"
      target="_blank"
      rel="noopener"
      class="bunpou-feedback-link"
    >
      📝 发现内容错误？点此反馈
    </a>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useData } from 'vitepress';

const { page, theme } = useData();

const isGrammarPage = computed(() => {
  const p = page.value.relativePath;
  return p && p.startsWith('docs/') && p.endsWith('.md');
});

const issueLink = computed(() => {
  const title = encodeURIComponent(
    `[内容纠错] ${page.value.relativePath || ''}`
  );
  const body = encodeURIComponent(
    `页面路径: ${page.value.relativePath}\n页面标题: ${page.value.title}\n\n请描述你发现的错误：\n`
  );
  return `https://github.com/luhaifeng666/bunpou/issues/new?title=${title}&body=${body}`;
});
</script>

<style scoped>
.bunpou-feedback {
  margin-top: 32px;
  padding: 12px 16px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  text-align: center;
}
.bunpou-feedback-link {
  font-size: 13px;
  color: var(--vp-c-text-2);
  text-decoration: none;
  transition: color 0.2s;
}
.bunpou-feedback-link:hover {
  color: var(--vp-c-brand-1);
}
</style>
