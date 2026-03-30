<template>
  <section class="level-stats-home">
    <div class="level-stats-container">
      <div class="level-stats-card">
        <h3>N5~N1语法收录数</h3>
        <div class="level-stats-grid">
          <a
            v-for="item in levelCounts"
            :key="item.level"
            class="level-card level-link"
            :href="item.link"
          >
            <strong>{{ item.count }}<em class="unit">个</em></strong>
            <span>{{ item.level }}</span>
          </a>
          <a class="level-card total-card level-link" :href="totalLink">
            <strong>{{ totalCount }}<em class="unit">个</em></strong>
            <span>总计</span>
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useData } from 'vitepress';

  const { theme, site } = useData();

  type LevelCount = {
    level: string;
    count: number;
    link: string;
  };

  const withBase = (link: string) =>
    `${site.value.base}${link.replace(/^\//, '')}`;

  const levelCounts = computed<LevelCount[]>(() => {
    const rootItems = theme.value?.sidebar?.['docs/']?.items?.[0]?.items || [];
    const grammarEntry = rootItems.find(
      (item: { text?: string }) => item?.text === '语法',
    );
    const levels = grammarEntry?.items || [];

    return levels
      .filter((item: { text?: string }) => /^N[1-5]$/.test(item?.text || ''))
      .map((item: { text: string; items?: Array<{ link?: string }> }) => ({
        level: item.text,
        count: item.items?.length || 0,
        link: withBase((item.items?.[0]?.link || '/docs/').replace('.md', '')),
      }))
      .sort((left: LevelCount, right: LevelCount) =>
        left.level.localeCompare(right.level),
      );
  });

  const totalLink = computed(() => withBase('/docs/?expand=grammar'));

  const totalCount = computed(() =>
    levelCounts.value.reduce(
      (sum: number, item: LevelCount) => sum + item.count,
      0,
    ),
  );
</script>

<style scoped>
  .level-stats-home {
    margin: 28px 0 8px;
  }

  .level-stats-container {
    max-width: 1184px;
    padding: 0 24px;
    margin: 0 auto;
  }

  .level-stats-card {
    width: 100%;
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

  .level-link {
    color: inherit;
    text-decoration: none;
  }

  .dark .level-card {
    background: rgba(15, 23, 42, 0.55);
    border-color: rgba(148, 163, 184, 0.18);
  }

  .level-card strong {
    display: inline-flex;
    align-items: baseline;
    font-size: 24px;
    line-height: 1;

    gap: 2px;
  }

  .level-card .unit {
    align-self: flex-end;
    color: var(--vp-c-text-2);
    font-size: 12px;
    font-style: normal;
    line-height: 1;
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
    .level-stats-container {
      padding: 0 16px;
    }

    .level-stats-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }
</style>
