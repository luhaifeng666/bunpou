/*
 * @Author: haifeng.lu haifeng.lu@ly.com
 * @Date: 2023-08-01 11:24:47
 * @LastEditors: haifeng.lu haifeng.lu@ly.com
 * @LastEditTime: 2024-01-24 17:04:13
 * @FilePath: /bunpou/utils/index.js
 * @Description: 
 * 
 */
import fg from "fast-glob";
import matter from "gray-matter";

/**
 * 获取目标目录下的所有 markdown 文件
 * @param link
 * @returns
 */
function getFiles(link) {
	return fg.sync([`${link}/*.md`]);
}

function getText(path) {
	const { data } = matter.read(path);
	return data.title || path.replace(/^.{0,}(?=\/)\/|\.md/g, "");
}

/**
 * 获取 sidebar 菜单列表
 * @param type
 * @param path
 * @param leaves
 * @returns
 */
function getItems(
	type,
	path,
	leaves,
) {
	const link = `${type}${path}`;
	const items = [];

	// 单文件直接插入
	if (path.includes(".md")) {
		items.push({ text: getText(`${link}`), link });
	} else {
		if (leaves.length) {
			// 有子目录的情况
			leaves.forEach((leaf) => {
				items.push({
					text: leaf.text,
					collapsed: true,
					items: getItems(type, `${path}/${leaf.path}`, leaf.leaves || [])
				});
			});
		}
		// 没有子目录的情况
		const files = getFiles(link);
		items.push(
			...files.map((file, index) => ({
				text: `${index < 9 ? 0 : ''}${index + 1}. ${getText(file)}`,
				link: `${file}`,
			})),
		);
	}

	return items;
}

const SIDEBAR_CONFIG = {
	"docs/": [{
		text: '文法',
		items: [
			{ text: "こそあど系列", path: "kosoado.md" },
			{ text: "形容词", path: "adjective.md" },
			{ text: "动词", path: "verb.md" },
			{ text: "方位处所词", path: "directions.md" },
			{ text: "助词", path: "auxiliary" },
			{ text: "术语", path: "term" },
			{
				text: "语法", path: "bunpou", leaves: [
					{ path: 'course1', text: '第 1 課' },
					{ path: 'course2', text: '第 2 課' },
					{ path: 'course3', text: '第 3 課' },
					{ path: 'course4', text: '第 4 課' },
					{ path: 'course5', text: '第 5 課' },
					{ path: 'course6', text: '第 6 課' },
					{ path: 'course7', text: '第 7 課' },
					{ path: 'course8', text: '第 8 課' },
					{ path: 'course9', text: '第 9 課' },
					{ path: 'course10', text: '第 10 課' },
					{ path: 'course11', text: '第 11 課' },
				]
			},
		]
	}],
};

// 侧边栏
export const getSideBar = () =>
	Object.entries(SIDEBAR_CONFIG).reduce(
		(res, [key, config]) => ({
			...res,
			[key]: {
				base: '/',
				items: config.map((configItem) => {
					const { text, items } = configItem;
					return {
						text,
						items: items.map((item) => {
							const { text, path, leaves = [] } = item;
							const items = getItems(key, path, leaves);
							return path.includes(".md")
								? items[0]
								: { text, items, collapsed: true };
						}),
					};
				})
			}
		}),
		{}
	);
