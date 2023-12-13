/*
 * @Author: luhaifeng666 youzui@hotmail.com
 * @Date: 2023-06-14 08:38:26
 * @LastEditors: haifeng.lu
 * @LastEditTime: 2023-12-14 00:45:42
 * @Description:
 */
import DefaultTheme from "vitepress/theme";
import GrammerContent from "./components/GrammerContent.vue";
import Visitors from "./components/Visitors.vue";
import Readers from "./components/Readers.vue";
import GiscusComment from "./components/GiscusComment.vue";
import { h } from "vue";
import "./custom.css";

export default {
	extends: DefaultTheme,
	Layout() {
		return h(DefaultTheme.Layout, null, {
      "doc-before": h(Readers),
      "doc-after": () => h(GiscusComment),
			"home-features-after": () => h(Visitors),
		});
	},
	enhanceApp(ctx) {
		ctx.app.component("GrammerContent", GrammerContent);
	},
};
