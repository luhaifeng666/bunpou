<!--
 * @Author: luhaifeng666 youzui@hotmail.com
 * @Date: 2023-06-14 08:39:33
 * @LastEditors: luhaifeng666 youzui@hotmail.com
 * @LastEditTime: 2023-10-10 10:50:00
 * @Description: 
-->
<template>
	<div
		v-html="sentenceElement"
		:class="['grammer-container', inline ? 'grammer-container-inline' : '']"
		@click="play"
	></div>
	<audio
		:src="`../../../public/voices/${props.id}.wav`"
		ref="audio"
		@ended="isPlaying = false"
		@error="isPlaying = false"
	></audio>
</template>

<style>
.grammer-container:not(:last-of-type) {
	margin-bottom: 16px !important;
}
</style>

<script setup>
import { computed, ref, onBeforeUnmount } from "vue";
import { isPlaying } from "../store";

const props = defineProps({
	sentence: String,
	trans: String,
	inline: Boolean,
	id: String,
});

onBeforeUnmount(() => {
	isPlaying.value = false;
});

const audio = ref(null);

const sentenceElement = computed(() => {
	const { sentence, trans = "" } = props;
	// 转换 ruby & strong 标签
	return `<div><p>${sentence}</p>${
		trans
			? '<img alt="speak" class="bunpou-speak" src="https://foruda.gitee.com/images/1712595434454521309/3ebc063a_78758.png" />'
			: ""
	}</div> ${
		trans ? `<p style="margin-top: 6px;line-height:1.5;">${trans}</p>` : ""
	}`
		.replace(
			/\[([^\[]*)\/([\u3040-\u309F\u30A0-\u30FF\u31F0-\u31FF]*)\]/g,
			(word) => {
				const [rb, rt] = word.replace(/\[|\]/g, "").split("/");
				return `<ruby><rb>${rb}</rb><rt>${rt}</rt></ruby>`;
			}
		)
		.replace(/\*\*(.*?)\*\*/g, '<strong style="color: #fb923c">$1</strong>');
});

const play = () => {
	!isPlaying.value && audio.value.play();
	isPlaying.value = true;
};
</script>
