<template>
  <div class="bunpou-homepage-ad">
    <img src="../../../public/imgs/wx.jpg" alt="二花老师wx" />
    <p>添加二花老师微信，可以免费领取日语试听课以及日语学习资料哦~</p>
  </div>
  <div class="bunpou-start">
    <grammer-content
      id="start"
      sentence="**さあ、[一緒/いっしょ]に[頑張り/がんばり]ましょう!**"
      trans="来吧，让我们一起加油吧！"
      center
    />
  </div>
  <div class="busuanzi">
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
  </div>
</template>

<script setup>
import { onMounted, ref, toRef, watch } from "vue";
import { useData } from "vitepress";

const loading = ref(true);
const page = toRef(useData(), "page");

const loadData = () => {
  const script = document.createElement("script");
  script.src =
    // "https://webviso.yestool.org/js/index.min.js"
    // "https://busuanzi.icodeq.com/busuanzi.pure.mini.js";
    "https://busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js";
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

.bunpou-start {
  margin: 30px 0;
}

.bunpou-homepage-ad {
  text-align: center;
}

.bunpou-homepage-ad > img {
  display: block;
  width: 200px;
  margin: 20px auto;
  border-radius: 12px;
}

.bunpou-homepage-ad > p {
  margin: 0 40px;
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
