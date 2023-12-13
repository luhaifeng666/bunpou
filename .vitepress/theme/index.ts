/*
 * @Author: luhaifeng666 youzui@hotmail.com
 * @Date: 2023-06-14 08:38:26
 * @LastEditors: luhaifeng666 youzui@hotmail.com
 * @LastEditTime: 2023-12-13 16:33:54
 * @Description:
 */
import DefaultTheme from "vitepress/theme";
import GrammerContent from "./components/GrammerContent.vue";
import Visitors from "./components/Visitors.vue";
import Layout from "./Layout.vue";
import { h } from "vue";
import "./custom.css";

export default {
	extends: DefaultTheme,
	Layout() {
		return h(DefaultTheme.Layout, null, {
			"home-features-after": () => h(Visitors),
		});
	},
	enhanceApp(ctx) {
		ctx.app.component("GrammerContent", GrammerContent);
	},
};
