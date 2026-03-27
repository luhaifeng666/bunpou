<template>
  <section class="app-shell-home">
    <div class="shell-hero-card">
      <div>
        <p class="shell-eyebrow">Bunpou App Shell</p>
        <h2>把语法文档变成更适合长期学习的统一入口</h2>
        <p class="shell-copy">
          这里保留原有 Markdown 内容体系，但把入口改造成课程、分类和快速索引并列的应用壳层，适合离线学习，也能在小屏设备上直接进入核心内容。
        </p>
      </div>
      <div class="shell-status-grid">
        <article>
          <strong>{{ courseCount }}</strong>
          <span>课程分组</span>
        </article>
        <article>
          <strong>{{ topicCount }}</strong>
          <span>语法分类</span>
        </article>
        <article>
          <strong>721+</strong>
          <span>离线语音</span>
        </article>
      </div>
    </div>

    <div class="shell-grid">
      <article class="shell-panel shell-panel-wide">
        <div class="shell-panel-head">
          <h3>课程推进</h3>
          <span>按教材顺序进入最常用课程序列</span>
        </div>
        <div class="shell-course-grid">
          <a v-for="item in courseLinks" :key="item.link" :href="item.link">
            <strong>{{ item.title }}</strong>
            <span>{{ item.copy }}</span>
          </a>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useData } from "vitepress";

const { theme, site } = useData();

const withBase = (link: string) => `${site.value.base}${link.replace(/^\//, "")}`;

const sidebarItems = computed(() => {
  const docsSidebar = theme.value?.sidebar?.["docs/"]?.items?.[0]?.items || [];
  return docsSidebar;
});

const courseEntry = computed(() => {
  return sidebarItems.value.find((item: { text: string }) => item.text === "语法");
});

const courseLinks = computed(() => {
  const items = courseEntry.value?.items || [];
  return items.slice(0, 8).map((item: { text: string; items?: Array<{ link: string }> }) => ({
    title: item.text,
    link: withBase(item.items?.[0]?.link?.replace(".md", "") || "/docs/"),
    copy: "从该课程的第一条语法开始进入",
  }));
});

const topicLinks = computed(() => {
  return sidebarItems.value
    .filter((item: { text: string }) => item.text !== "语法")
    .slice(0, 8)
    .map((item: { text: string; link?: string; items?: Array<{ link: string }> }) => ({
      title: item.text,
      link: withBase((item.link || item.items?.[0]?.link || "/docs/").replace(".md", "")),
    }));
});

const quickLinks = [
  {
    title: "快查目录",
    link: withBase("/docs/"),
    copy: "从总目录进入所有语法、术语与助词页面。",
  },
  {
    title: "课程文法",
    link: withBase("/docs/bunpou/course1/1-2-1"),
    copy: "适合按教材章节持续推进。",
  },
  {
    title: "术语索引",
    link: withBase("/docs/term/interrogative"),
    copy: "快速回查文法术语和形式说明。",
  },
];

const courseCount = computed(() => courseEntry.value?.items?.length || 0);
const topicCount = computed(() => sidebarItems.value.filter((item: { text: string }) => item.text !== "语法").length);
</script>

<style scoped>
.app-shell-home {
  padding: 18px 0 32px;
}

.shell-hero-card,
.shell-panel {
  background: var(--bunpou-panel-bg);
  border: 1px solid var(--bunpou-panel-border);
  border-radius: 28px;
  box-shadow: var(--bunpou-shadow);
}

.shell-hero-card {
  display: grid;
  grid-template-columns: 1.4fr 0.9fr;
  gap: 24px;
  padding: 28px;
  margin-bottom: 24px;
}

.shell-eyebrow {
  margin: 0 0 12px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #0f766e;
}

.shell-hero-card h2,
.shell-panel h3 {
  margin: 0;
  letter-spacing: -0.02em;
}

.shell-copy {
  margin: 14px 0 0;
  font-size: 16px;
  line-height: 1.8;
  color: var(--vp-c-text-2);
}

.shell-status-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.shell-status-grid article {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 118px;
  padding: 18px;
  border-radius: 22px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.68), rgba(255, 255, 255, 0.35));
  border: 1px solid rgba(15, 23, 42, 0.06);
}

.dark .shell-status-grid article {
  background: linear-gradient(145deg, rgba(30, 41, 59, 0.78), rgba(15, 23, 42, 0.58));
  border-color: rgba(148, 163, 184, 0.12);
}

.shell-status-grid strong {
  font-size: 34px;
  line-height: 1;
}

.shell-status-grid span {
  color: var(--vp-c-text-2);
}

.shell-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.shell-panel {
  padding: 22px;
}

.shell-panel-wide {
  grid-column: 1 / -1;
}

.shell-panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.shell-panel-head span,
.shell-panel-head a {
  font-size: 14px;
  color: var(--vp-c-text-2);
}

.shell-link-list,
.shell-course-grid {
  display: grid;
  gap: 12px;
}

.shell-link-list a,
.shell-course-grid a,
.shell-chip-grid a {
  color: inherit;
  text-decoration: none;
}

.shell-link-list a,
.shell-course-grid a {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 18px;
  border-radius: 20px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(255, 255, 255, 0.72);
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.dark .shell-link-list a,
.dark .shell-course-grid a {
  background: rgba(15, 23, 42, 0.52);
  border-color: rgba(148, 163, 184, 0.16);
}

.shell-link-list a:hover,
.shell-course-grid a:hover,
.shell-chip-grid a:hover {
  transform: translateY(-2px);
  border-color: rgba(251, 146, 60, 0.45);
  box-shadow: 0 16px 30px rgba(15, 23, 42, 0.08);
}

.shell-link-list span,
.shell-course-grid span {
  font-size: 14px;
  color: var(--vp-c-text-2);
}

.shell-chip-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.shell-chip-grid a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 16px;
  border-radius: 999px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(255, 255, 255, 0.72);
}

.dark .shell-chip-grid a {
  background: rgba(15, 23, 42, 0.52);
  border-color: rgba(148, 163, 184, 0.16);
}

.shell-course-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

@media (max-width: 960px) {
  .shell-hero-card,
  .shell-grid {
    grid-template-columns: 1fr;
  }

  .shell-course-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .shell-hero-card,
  .shell-panel {
    border-radius: 22px;
  }

  .shell-hero-card,
  .shell-panel {
    padding: 18px;
  }

  .shell-panel-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .shell-status-grid,
  .shell-course-grid {
    grid-template-columns: 1fr;
  }

  .shell-link-list a,
  .shell-course-grid a {
    padding: 16px;
  }

  .shell-copy {
    font-size: 15px;
    line-height: 1.7;
  }
}
</style>