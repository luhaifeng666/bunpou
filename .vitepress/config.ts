import { defineConfig } from "vitepress";
import { getSideBar } from "../utils";

export default defineConfig({
  title: "Bunpou",
  description: "用于查阅日语语法",
  head: [
    ["link", { rel: "icon", type: "image/x-icon", href: "imgs/favicon.ico" }],
  ],
  themeConfig: {
    lastUpdated: {
      text: "最終更新日",
    },
    logo: "/imgs/BP.svg",
    editLink: {
      pattern: ({ filePath }) =>
        `https://github.com/luhaifeng666/bunpou/blob/test/${filePath}`,
      text: "GitHubでこのページを編集する",
    },
    nav: [
      { text: "首页", link: "/" },
      { text: "文法", link: "/docs/" },
      { text: "国内站点", link: "https://www.bunpou.cn/" },
    ],

    search: {
      provider: "local",
    },

    docFooter: {
      prev: "前のページ",
      next: "次のページ",
    },

    sidebar: getSideBar(),
    socialLinks: [
      { icon: "github", link: "https://github.com/luhaifeng666/bunpou" },
      {
        icon: {
          svg: '<svg t="1703765214457" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1436" width="200" height="200"><path d="M512 1024C229.222 1024 0 794.778 0 512S229.222 0 512 0s512 229.222 512 512-229.222 512-512 512z m259.149-568.883h-290.74a25.293 25.293 0 0 0-25.292 25.293l-0.026 63.206c0 13.952 11.315 25.293 25.267 25.293h177.024c13.978 0 25.293 11.315 25.293 25.267v12.646a75.853 75.853 0 0 1-75.853 75.853h-240.23a25.293 25.293 0 0 1-25.267-25.293V417.203a75.853 75.853 0 0 1 75.827-75.853h353.946a25.293 25.293 0 0 0 25.267-25.292l0.077-63.207a25.293 25.293 0 0 0-25.268-25.293H417.152a189.62 189.62 0 0 0-189.62 189.645V771.15c0 13.977 11.316 25.293 25.294 25.293h372.94a170.65 170.65 0 0 0 170.65-170.65V480.384a25.293 25.293 0 0 0-25.293-25.267z" fill="#C71D23" p-id="1437"></path></svg>',
        },
        link: "https://gitee.com/youzui/bunpou",
      },
    ],
    footer: {
      message: "基于 MIT 许可发布 · 备案号: 苏ICP备2025165290号-1",
      copyright: "Copyright © 2025-present luhaifeng666",
    },
  },
});
