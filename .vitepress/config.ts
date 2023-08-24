/*
 * @Author: haifeng.lu haifeng.lu@ly.com
 * @Date: 2023-07-11 09:52:29
 * @LastEditors: haifeng.lu haifeng.lu@ly.com
 * @LastEditTime: 2023-08-24 14:34:01
 * @FilePath: /bunpou/.vitepress/config.ts
 * @Description:
 *
 */
import { defineConfig } from "vitepress";
import { getSideBar } from "../utils";

export default defineConfig({
	title: "Bunpou",
	description: "用于查阅日语语法",
	lastUpdated: true,
	head: [
		["link", { rel: "icon", type: "image/x-icon", href: "imgs/favicon.ico" }],
	],
	themeConfig: {
		logo: "/imgs/BP.svg",
		nav: [
			{ text: "首页", link: "/" },
			{ text: "文法", link: "/docs/" },
		],

		// carbonAds: {
		//   code: 'your-carbon-code',
		//   placement: 'your-carbon-placement'
		// },

		search: {
			provider: "local",
		},

		sidebar: getSideBar(),

		socialLinks: [
			{ icon: "github", link: "https://github.com/luhaifeng666/bunpou" },
		],
	},
});
