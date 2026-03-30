<template>
  <section class="level-stats-home">
    <div class="level-stats-container">
      <div class="level-stats-card">
        <h3>N5~N1语法收录数</h3>
        <div class="level-stats-grid">
          <article v-for="item in levelCounts" :key="item.level" class="level-card">
            <strong>{{ item.count }}<em class="unit">个</em></strong>
            <span>{{ item.level }}</span>
          </article>
          <article class="level-card total-card">
            <strong>{{ totalCount }}<em class="unit">个</em></strong>
            <span>总计</span>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useData } from 'vitepress';

  const { theme } = useData();

  const levelCounts = computed(() => {
    const rootItems = theme.value?.sidebar?.['docs/']?.items?.[0]?.items || [];
    const grammarEntry = rootItems.find(
      (item: { text?: string }) => item?.text === '语法',
    );
    const levels = grammarEntry?.items || [];

    return levels
      .filter((item: { text?: string }) => /^N[1-5]$/.test(item?.text || ''))
      .map((item: { text: string; items?: Array<unknown> }) => ({
        level: item.text,
        count: item.items?.length || 0,
      }))
      .sort((left, right) => left.level.localeCompare(right.level));
  });

  const totalCount = computed(() =>
    levelCounts.value.reduce((sum, item) => sum + item.count, 0),
  );
</script>

<style scoped>
  .level-stats-home {
    margin: 28px 0 8px;
  }

  .level-stats-container {
    box-sizing: border-box;
    width: 100%;
    max-width: 1184px;
    margin: 0 auto;
    padding: 0 24px;
  }

  .level-stats-card {
    padding: 20px;
    background: var(--bunpou-panel-bg);
    border: 1px solid var(--bunpou-panel-border);
    border-radius: 18px;
  }

  .level-stats-card h3 {
    margin: 0 0 14px;
  }

  .level-stats-grid {
    display: grid;

    gap: 10px;
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }

  .level-card {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 80px;
    background: rgba(255, 255, 255, 0.75);
    border: 1px solid rgba(15, 23, 42, 0.1);
    border-radius: 14px;
  }

  .dark .level-card {
    background: rgba(15, 23, 42, 0.55);
    border-color: rgba(148, 163, 184, 0.18);
  }

  .level-card strong {
    display: inline-flex;
    align-items: baseline;
    gap: 2px;
    font-size: 24px;
    line-height: 1;
  }

  .level-card .unit {
    align-self: flex-end;
    font-style: normal;
    font-size: 12px;
    line-height: 1;
    color: var(--vp-c-text-2);
  }

  .level-card span {
    margin-top: 6px;
    color: var(--vp-c-text-2);
    font-size: 12px;
  }

  .total-card {
    border-color: rgba(251, 146, 60, 0.35);
  }

  @media (max-width: 768px) {
    .level-stats-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }
</style>
