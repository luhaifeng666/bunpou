<template>
  <div
    class="custom-block tip bunpou-main"
    v-for="item in menu"
    :key="item.text"
  >
    <p
      :class="{
        'bunpou-link': !!item.link,
      }"
      @click="handleMenuSwitch(item)"
    >
      {{ item.text }}
    </p>
    <template v-if="(item.items || []).length">
      <div class="bunpou-sub" v-for="subMenu in item.items" :key="subMenu.text">
        <p
          :class="{
            'bunpou-link': !!subMenu.link,
          }"
          @click="handleMenuSwitch(subMenu)"
        >
          {{ subMenu.text }}
        </p>
        <template v-if="(subMenu.items || []).length">
          <div
            v-for="thirdMenu in subMenu.items"
            class="bunpou-third"
            :key="thirdMenu.text"
          >
            <p class="bunpou-link" @click="handleMenuSwitch(thirdMenu)">
              {{ thirdMenu.text }}
            </p>
          </div>
        </template>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from "vue";

import { useData, useRouter } from "vitepress";

const { theme, isDark } = useData();
const router = useRouter();

const menu = computed(() => {
  return (
    Object.entries(theme.value?.sidebar || {})?.[0][1]?.items?.[0]?.items || []
  );
});

const handleMenuSwitch = (menuItem) => {
  menuItem.link && router.go(menuItem.link.replace(".md", ""));
};

console.log(theme.value, isDark.value, menu.value);
</script>

<style scoped>
.bunpou-main {
  padding: 8px !important;
  font-size: 18px;
  font-weight: bold;
}
.bunpou-main p {
  line-height: 2;
}
.bunpou-sub {
  font-size: 16px;
}
.bunpou-third {
  font-size: 14px;
  font-weight: normal;
  text-indent: 2em;
}
.bunpou-right {
  font-size: 1;
}
.bunpou-link {
  cursor: pointer;
  color: var(--vp-c-brand-1);
  text-underline-offset: 2px;
  text-decoration: underline;
  transition: color 0.25s, opacity 0.25s;
}
</style>
