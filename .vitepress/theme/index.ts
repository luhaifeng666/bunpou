/*
 * @Author: luhaifeng666 youzui@hotmail.com
 * @Date: 2023-06-14 08:38:26
 * @LastEditors: luhaifeng666 youzui@hotmail.com
 * @LastEditTime: 2023-12-14 11:31:58
 * @Description:
 */
import DefaultTheme from "vitepress/theme";
import GrammerContent from "./components/GrammerContent.vue";
import Visitors from "./components/Visitors.vue";
// import Readers from "./components/Readers.vue";
import GiscusComment from "./components/GiscusComment.vue";
import { h } from "vue";
import "./custom.css";

export default {
	extends: DefaultTheme,
	Layout() {
		return h(DefaultTheme.Layout, null, {
			// "doc-before": h(Readers),
			"doc-after": () => h(GiscusComment),
			"home-features-after": () => h(Visitors),
		});
	},
	enhanceApp(ctx) {
		ctx.app.component("GrammerContent", GrammerContent);
	},
};
