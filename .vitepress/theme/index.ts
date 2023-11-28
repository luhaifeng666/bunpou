/*
 * @Author: luhaifeng666 youzui@hotmail.com
 * @Date: 2023-06-14 08:38:26
 * @LastEditors: luhaifeng666 youzui@hotmail.com
 * @LastEditTime: 2023-11-28 14:45:30
 * @Description:
 */
import DefaultTheme from "vitepress/theme";
import GrammerContent from "./components/GrammerContent.vue";
import Layout from "./Layout.vue";
import "./custom.css";

export default {
	extends: DefaultTheme,
	Layout,
	enhanceApp(ctx) {
		ctx.app.component("GrammerContent", GrammerContent);
	},
};
