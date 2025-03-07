import DefaultTheme from "vitepress/theme";
import GrammerContent from "./components/GrammerContent.vue";
import Catalog from "./components/Catalog.vue";
import Visitors from "./components/Visitors.vue";
import GiscusComment from "./components/GiscusComment.vue";
import Ad from "./components/Ad.vue";
import { h } from "vue";
import "./custom.css";

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      "doc-after": () => h(GiscusComment),
      "home-features-after": () => h(Visitors),
      "aside-bottom": () => h(Ad),
    });
  },
  enhanceApp(ctx) {
    ctx.app.component("GrammerContent", GrammerContent);
    ctx.app.component("Catalog", Catalog);
  },
};
