<!--
 * @Author: luhaifeng666 youzui@hotmail.com
 * @Date: 2023-06-14 08:39:33
 * @LastEditors: luhaifeng666 youzui@hotmail.com
 * @LastEditTime: 2024-05-08 00:57:05
 * @Description: 
-->
<template>
	<div
		v-html="sentenceElement"
		:class="['grammer-container', inline ? 'grammer-container-inline' : '']"
		@click="play"
	></div>
	<audio
		v-if="iconVisible"
		ref="audio"
		:src="audioSrc"
		@canplay="handleIconVisible"
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
import { computed, ref, onBeforeUnmount, watch } from "vue";
import { isPlaying } from "../store";
import generateVoice from "../../../utils/speech";

const props = defineProps({
	sentence: String,
	trans: String,
	inline: Boolean,
	id: String,
	center: Boolean,
});

const audio = ref(null);
const audioSrc = ref(null);
const canplay = ref(true);
const loading = ref(false);

onBeforeUnmount(() => {
	isPlaying.value = false;
});

// watch(
// 	() => props.id,
// 	(id) => {
// 		id &&
// 			import(`../../../public/voices/${id}.wav?url`).then((module) => {
// 				audioSrc.value = module.default;
// 			});
// 	},
// 	{
// 		immediate: true,
// 	}
// );

const handleIconVisible = () => {
	canplay.value = !audio.value || isFinite(audio.value.duration);
};

const sentenceElement = computed(() => {
	const { sentence, trans = "", center } = props;
	// 转换 ruby & strong 标签
	return `<div ${
		center ? 'style="justify-content: center;"' : ""
	}><p>${sentence}</p>${
		iconVisible.value && trans
			? '<img alt="speak" class="bunpou-speak" src="https://foruda.gitee.com/images/1712595434454521309/3ebc063a_78758.png" />'
			: ""
	}<div class="bunpou-loading ${loading.value ? "" : "hidden"}">
    <span></span><span></span><span></span><span></span><span></span>
  </div></div>${
		trans
			? `<p style="margin-top: 6px;line-height:1.5;${
					center ? "text-align: center;" : ""
			  }">${trans}</p>`
			: ""
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

const iconVisible = computed(() => !props.id || canplay.value);

const play = async () => {
	if (!isPlaying.value) {
		isPlaying.value = true;
		if (audioSrc.value) {
			audio.value.play();
		} else {
			loading.value = true;
			await generateVoice(
				props.sentence
					.replace(
						/\[([^\[]*)\/([\u3040-\u309F\u30A0-\u30FF\u31F0-\u31FF]*)\]/g,
						(word) => {
							const [rb, rt] = word.replace(/\[|\]/g, "").split("/");
							return rb;
						}
					)
					.replace(/\<del\>.*?\<\/del\>/g, "") // 删除del标签及其中的内容
					.replace(/\<\/{0,1}u\>/g, "") // 移除 u 标签
					.replace(
						/[^\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\u31F0-\u31FF\uFF00-\uFFEF\u4E00-\u9FAF\u3400-\u4DBF]|[\(|（](.*?)[）|\)]/g,
						""
					), // 只保留日文字符
				() => {
					isPlaying.value = false;
				}
			);
			loading.value = false;
		}
	}
};
</script>
