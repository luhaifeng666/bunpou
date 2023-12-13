/*
 * @Author: haifeng.lu haifeng.lu@ly.com
 * @Date: 2023-07-11 09:52:29
 * @LastEditors: haifeng.lu
 * @LastEditTime: 2023-12-14 01:13:08
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
		[
			"script",
			{
				type: "text/javascript",
				src: "//busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js",
			},
		],
	],
	themeConfig: {
		logo: "/imgs/BP.svg",
    editLink: {
      pattern: ({ filePath }) => `https://github.com/luhaifeng666/bunpou/blob/test/${filePath}`,
      text: 'GitHubでこのページを編集する'
    },
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
    externalLinkIcon: true,
		socialLinks: [
			{ icon: "github", link: "https://github.com/luhaifeng666/bunpou" },
		],
	},
});
