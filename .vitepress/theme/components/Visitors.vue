<!--
 * @Author: luhaifeng666 youzui@hotmail.com
 * @Date: 2023-12-13 16:31:07
 * @LastEditors: luhaifeng666 youzui@hotmail.com
 * @LastEditTime: 2023-12-13 16:50:38
 * @FilePath: /bunpou/.vitepress/theme/components/Visitors.vue
 * @Description: 
 * 
-->
<template>
	<div class="busuanzi">
		<span id="busuanzi_container_site_pv">
			总访问量
			<strong id="busuanzi_value_site_pv" class="busuanzi_value"></strong> 次
		</span>
		<span class="division"></span>
		<span id="busuanzi_container_site_uv">
			访客数
			<strong id="busuanzi_value_site_uv" class="busuanzi_value"></strong> 人
		</span>
	</div>
</template>
<style>
.busuanzi {
	display: flex;
	justify-content: center;
	align-items: center;
	margin-top: 64px;
	font-size: 14px;
}
.busuanzi .busuanzi_value {
	color: #10b981;
}
.division {
	display: inline-block;
	width: 14px;
	height: 14px;
	margin: 0 10px;
	background: url(../../../public/imgs/BP.svg) no-repeat center / cover;
}
</style>
