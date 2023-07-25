<!--
 * @Author: luhaifeng666 youzui@hotmail.com
 * @Date: 2023-06-14 08:39:33
 * @LastEditors: luhaifeng666
 * @LastEditTime: 2023-07-25 23:35:12
 * @Description: 
-->
<template>
  <p v-html="sentenceElement"></p>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  sentence: String,
  trans: String
})

const sentenceElement = computed(() => {
  const { sentence, trans = '' } = props
  // 转换 ruby & strong 标签
  return `${sentence} <p>${trans}</p>`.replace(/\[([^\[]*)\/([\u3040-\u309F\u30A0-\u30FF\u31F0-\u31FF]*)\]/g, word => {
    const [rb, rt] = word.replace(/\[|\]/g, '').split('/')
    return `<ruby><rb>${rb}</rb><rt>${rt}</rt></ruby>`
  }).replace(/\*\*(.*?)\*\*/g, '<strong style="color: #fb923c">$1</strong>')
})
</script>
