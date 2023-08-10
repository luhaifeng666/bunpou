/*
 * @Author: luhaifeng666 youzui@hotmail.com
 * @Date: 2023-06-14 08:38:26
 * @LastEditors: luhaifeng666 youzui@hotmail.com
 * @LastEditTime: 2023-08-10 11:02:48
 * @Description:
 */
import DefaultTheme from "vitepress/theme";
import GrammerContent from "./components/GrammerContent.vue";
import "./custom.css";

export default {
	extends: DefaultTheme,
	enhanceApp(ctx) {
		ctx.app.component("GrammerContent", GrammerContent);
	},
};
