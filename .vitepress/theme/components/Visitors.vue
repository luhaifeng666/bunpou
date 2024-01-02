<!--
 * @Author: luhaifeng666 youzui@hotmail.com
 * @Date: 2023-12-13 16:31:07
 * @LastEditors: luhaifeng666 youzui@hotmail.com
 * @LastEditTime: 2024-01-02 17:40:21
 * @FilePath: /bunpou/.vitepress/theme/components/Visitors.vue
 * @Description: 
 * 
-->
<template>
	<!-- <div class="busuanzi">
		<span id="busuanzi_container_site_pv">
			总访问量
			<strong id="busuanzi_value_site_pv" class="busuanzi_value"
				><i class="loading"></i
			></strong>
			次
		</span>
		<span class="division"></span>
		<span id="busuanzi_container_site_uv">
			访客数
			<strong id="busuanzi_value_site_uv" class="busuanzi_value"
				><i class="loading"></i
			></strong>
			人
		</span>
	</div> -->

	<div class="busuanzi">
		<span id="busuanzi_container_site_pv">
			总访问量
			<strong id="page_pv" class="busuanzi_value"
				><i class="loading"></i
			></strong>
			次
		</span>
		<span class="division"></span>
		<span id="busuanzi_container_site_uv">
			访客数
			<strong id="page_uv" class="busuanzi_value"
				><i class="loading"></i
			></strong>
			人
		</span>
	</div>
</template>

<script setup>
import { onMounted, ref, toRef, watch } from "vue";
import { useData } from "vitepress";

const loading = ref(true);
const page = toRef(useData(), "page");

const loadData = () => {
	const script = document.createElement("script");
	script.src = "https://webviso.yestool.org/js/index.min.js"
	  // "https://busuanzi.icodeq.com/busuanzi.pure.mini.js";
		// "https://busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js";
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
</script>

<style>
.busuanzi {
	display: flex;
	justify-content: center;
	align-items: center;
	margin-top: 64px;
	font-size: 14px;
}
.busuanzi .busuanzi_value {
	color: rgb(52, 81, 178);
}
.division {
	display: inline-block;
	width: 14px;
	height: 14px;
	margin: 0 10px;
	background: url(../../../public/imgs/BP.svg) no-repeat center / cover;
}
.loading {
	display: inline-block;
	width: 14px;
	height: 14px;
	background: url(../../../public/imgs/loading.png) no-repeat center / contain;
	animation: loading 1s linear infinite;
}

@keyframes loading {
	0% {
		transform: rotate(0deg);
	}
	100% {
		transform: rotate(360deg);
	}
}
</style>
