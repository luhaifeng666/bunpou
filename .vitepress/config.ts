/*
 * @Author: haifeng.lu haifeng.lu@ly.com
 * @Date: 2023-07-11 09:52:29
 * @LastEditors: luhaifeng666 youzui@hotmail.com
 * @LastEditTime: 2023-12-27 16:17:49
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
		editLink: {
			pattern: ({ filePath }) =>
				`https://github.com/luhaifeng666/bunpou/blob/test/${filePath}`,
			text: "GitHubでこのページを編集する",
		},
		nav: [
			{ text: "首页", link: "/" },
			{ text: "文法", link: "/docs/" },
			{ text: "国内站点", link: "https://youzui.gitee.io/bunpou/" },
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
