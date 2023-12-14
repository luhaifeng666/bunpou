<!--
 * @Author: luhaifeng666 youzui@hotmail.com
 * @Date: 2023-12-14 10:44:08
 * @LastEditors: luhaifeng666 youzui@hotmail.com
 * @LastEditTime: 2023-12-14 11:30:22
 * @FilePath: /bunpou/.vitepress/theme/components/Readers.vue
 * @Description: 
 * 
-->
<template>
	<p id="busuanzi_container_page_pv" class="busuanzi_read">
		阅读量<strong id="busuanzi_value_page_pv"><i class="loading"></i></strong>
	</p>
</template>

<script>
import loadData from "../loadData";
export default loadData;
</script>

<style>
.busuanzi_read {
	font-size: 14px;
	display: block !important;
	text-align: right;
}

.busuanzi_read strong {
	color: #10b981;
	margin-left: 10px;
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
