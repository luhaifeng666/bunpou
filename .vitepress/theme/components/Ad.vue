<template>
  <div class="bunpou-ad">
    <!-- <img src="../../../public/imgs/wx.jpg" alt="二花老师wx" /> -->
    <img src="../../../public/imgs/BP.svg" alt="Bunpou" />
    <p class="bunpou-tip">
      <!-- 因 Gitee Pages
			服务维护调整，导致国内站点无法部署，因此短期内暂时不支持访问国内站点~ -->
      <!-- 添加二花老师微信，可以免费领取日语试听课以及日语学习资料哦~ -->
    </p>
    <p class="bunpou-bb">
      トラフィックはほとんどありませんが、私の広告スペースのレンタルに影響を与えることはできません...
    </p>
  </div>
</template>

<style>
.bunpou-ad {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  /* min-height: 256px; */
  padding: 16px;
  font-size: 12px;
  font-weight: 500;
  line-height: 18px;
  text-align: center;
  background-color: var(--vp-carbon-ads-bg-color);
  border-radius: 12px;
}
.bunpou-ad > img {
  display: block;
  width: 50%;
  margin-bottom: 10px;
  border-radius: 12px;
}
.bunpou-tip {
  color: var(--vp-code-color);
  font-weight: bold;
  text-align: justify;
  text-align: center;
}
.bunpou-bb {
  margin-top: 10px;
  color: var(--vp-c-text-3);
  font-size: 10px;
}
</style>
