<!--
 * @Author: haifeng.lu haifeng.lu@ly.com
 * @Date: 2023-12-27 22:18:45
 * @LastEditors: haifeng.lu
 * @LastEditTime: 2023-12-27 22:48:50
 * @Description: 
-->
<script setup>
import { onMounted } from "vue"

let _hmt = _hmt || [];

onMounted(() => {
  const hm = document.createElement("script");
  hm.src = "https://hm.baidu.com/hm.js?b1dde12f85d5564e11ddfea63a559b6f";
  const s = document.getElementsByTagName("script")[0]; 
  s.parentNode.insertBefore(hm, s);
})
</script>