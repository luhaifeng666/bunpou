<!--
 * @Author: luhaifeng666 youzui@hotmail.com
 * @Date: 2023-11-29 11:07:39
 * @LastEditors: luhaifeng666 youzui@hotmail.com
 * @LastEditTime: 2023-12-18 13:53:25
 * @FilePath: /bunpou/.vitepress/theme/components/GiscusComment.vue
 * @Description: 
 * 
-->

<template>
	<section ref="comments" style="margin-top: 40px"></section>
</template>

<script setup>
import { onMounted, onUnmounted, ref, toRef, watch } from "vue";
import { useData } from "vitepress";

const isDark = toRef(useData(), "isDark");
const page = toRef(useData(), "page");
const comments = ref();
const themeName = ref("noborder_dark");

const setComments = () => {
	const script = document.createElement("script");
	const configs = {
		"data-repo": "luhaifeng666/bunpou",
		"data-repo-id": "R_kgDOJszpjg",
		"data-category": "Q&A",
		"data-category-id": "DIC_kwDOJszpjs4CaJ8g",
		"data-mapping": "pathname",
		"data-strict": "1",
		"data-reactions-enabled": "1",
		"data-emit-metadata": "0",
		"data-input-position": "bottom",
		"data-lang": "zh-CN",
		"data-theme": themeName.value,
		crossorigin: "anonymous",
		async: true,
	};
	script.src = "https://giscus.app/client.js";
	Object.entries(configs).forEach(([key, value]) => {
		script.setAttribute(key, value);
	});

	comments.value && (comments.value.innerHTML = "");
	comments.value.appendChild(script);
};

const setTheme = (val) => {
	themeName.value = val ? "noborder_dark" : "light";
	const iframe = document.querySelector("iframe.giscus-frame");
	if (iframe) {
		iframe.contentWindow?.postMessage(
			{
				giscus: {
					setConfig: {
						theme: `https://giscus.app/themes/${themeName.value}.css`,
					},
				},
			},
			"https://giscus.app"
		);
	}
};

const watchMsg = (msg) => {
	if (msg.origin === "https://beaudar.lipk.org") {
		setTheme();
	}
};

watch(page, (val) => {
	val.relativePath && val.relativePath !== "index.md" && setComments();
});

watch(isDark, setTheme, {
	immediate: true,
});

onMounted(() => {
	setComments();
	window.addEventListener("message", watchMsg);
});

onUnmounted(() => {
	window.removeEventListener("message", watchMsg);
});
</script>
