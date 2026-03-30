import DefaultTheme from 'vitepress/theme';
import GrammerContent from './components/GrammerContent.vue';
import Catalog from './components/Catalog.vue';
import AppShellHome from './components/AppShellHome.vue';
import AppRuntimeBridge from './components/AppRuntimeBridge.vue';
import Visitors from './components/Visitors.vue';
import GiscusComment from './components/GiscusComment.vue';
import Ad from './components/Ad.vue';
import LevelStatsHome from './components/LevelStatsHome.vue';
import { Fragment, h } from 'vue';
import './custom.css';

export default {
  extends: DefaultTheme,
  Layout() {
    return h(Fragment, [
      h(AppRuntimeBridge),
      h(DefaultTheme.Layout, null, {
        'doc-after': () => h(GiscusComment),
        'home-features-after': () =>
          h(Fragment, [
            h(LevelStatsHome),
            h(Visitors),
          ]),
        'aside-bottom': () => h(Ad),
      }),
    ]);
  },
  enhanceApp(ctx) {
    ctx.app.component('GrammerContent', GrammerContent);
    ctx.app.component('Catalog', Catalog);
    ctx.app.component('AppShellHome', AppShellHome);
    ctx.app.component('LevelStatsHome', LevelStatsHome);
  },
};
