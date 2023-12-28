<!--
 * @Author: haifeng.lu haifeng.lu@ly.com
 * @Date: 2023-12-27 22:18:45
 * @LastEditors: luhaifeng666 youzui@hotmail.com
 * @LastEditTime: 2023-12-28 10:27:05
 * @Description: 
-->

<template>
	<section v-if="visible" ref="account" style="width:0;height:0;"></section>
</template>

<script>
var _hmt = _hmt || [];
</script>

<script setup>
import { onMounted, ref, toRef, watch } from "vue";
import { useData } from "vitepress";

const page = toRef(useData(), "page");
const account = ref();
const visible = ref(false);

const setAccount = () => {
	if (visible.value) {
		const script = document.createElement("script");
		script.src = "https://hm.baidu.com/hm.js?b1dde12f85d5564e11ddfea63a559b6f";
		account.value && (account.value.innerHTML = "");
		account.value.appendChild(script);
	}
};

watch(page, (val) => {
	val.relativePath && setAccount();
});

onMounted(() => {
	visible.value = !['localhost', '127.0.0.1'].includes(location.hostname);
	setAccount();
});

</script>

