/*
 * @Author: luhaifeng666 youzui@hotmail.com
 * @Date: 2023-12-14 10:49:57
 * @LastEditors: luhaifeng666 youzui@hotmail.com
 * @LastEditTime: 2023-12-14 10:51:04
 * @FilePath: /bunpou/.vitepress/theme/loadData.ts
 * @Description:
 *
 */
import { onMounted, ref, toRef, watch } from "vue";
import { useData } from "vitepress";

export default {
	setup() {
		const loading = ref(true);
		const page = toRef(useData(), "page");

		const loadData = () => {
			const script = document.createElement("script");
			script.src =
				"https://busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js";
			script.async = true;
			script.onload = () => {
				setTimeout(() => {
					loading.value = false;
				}, 1000);
			};
			document.body.appendChild(script);
		};

		onMounted(() => {
			loadData();
		});

		watch(page, () => {
			loadData();
		});
	},
};
