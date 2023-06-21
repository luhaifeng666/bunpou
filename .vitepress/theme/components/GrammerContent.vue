<!--
 * @Author: luhaifeng666 youzui@hotmail.com
 * @Date: 2023-06-14 08:39:33
 * @LastEditors: luhaifeng666
 * @LastEditTime: 2023-06-21 08:38:50
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
  const _sentence = props.sentence.replace(/\[([^\[]*)\/([\u3040-\u309F\u30A0-\u30FF\u31F0-\u31FF]*)\]/g, word => {
    const [rb, rt] = word.replace(/\[|\]/g, '').split('/')
    return `<ruby><rb>${rb}</rb><rt>${rt}</rt></ruby>`
  })
  return _sentence + props.trans
})
</script>