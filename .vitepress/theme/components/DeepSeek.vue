<template>
  <div
    v-if="dsVisible"
    :class="[
      'bunpou-ds custom-block tip',
      {
        unflod: dsContentVisible,
      },
    ]"
  >
    <p v-if="!dsContentVisible" class="bunpou-ds-btn" @click="toggleFlod">
      <img src="../../../public/imgs/deepseek.svg" /> DeepSeek 练习一下?
    </p>

    <div class="bunpou-ds-window" v-else>
      <img
        class="bunpou-ds-close"
        src="../../../public/imgs/close.svg"
        @click="toggleFlod"
      />
      <p class="bunpou-ds-tip" v-html="dialogTitle" />
      <div class="bunpou-ds-dialog"></div>
      <div class="bunpou-ds-footer">
        <input type="text" v-model="inputMessage" placeholder="请输入你例句" />
        <img src="../../../public/imgs/stop.svg" />
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from "axios";
import { onMounted, onBeforeUnmount, ref, watch, computed } from "vue";
import { useData } from "vitepress";

const messages = [{ role: "system", content: "this is a test message." }]; // 保存多轮对话
const { page, title } = useData();

onMounted(async () => {
  // await getAIResult();
  // await getBalance();
});

onBeforeUnmount(() => {
  clearMessages();
});

//refs
const hasBalance = ref(true);
const dsContentVisible = ref(false);
const inputMessage = ref(""); // 用户输入的例句

// watchers
watch(page, () => {
  // 清空对话
  clearMessages();
  // 关闭对话框
  dsContentVisible.value = false;
  // 刷新余额inputMessage
  getBalance();
});

// reactive
const dsVisible = computed(
  () => page.value?.filePath.includes("course") && hasBalance.value
);
const dialogTitle = computed(
  () =>
    `请使用<span>「${title.value.replace(
      /\s\|\sBunpou/g,
      ""
    )}」</span>语法进行造句练习~`
);

// methods
// 创建 CancelToken
const source = axios.CancelToken.source();
// axios 实例
const instance = axios.create({
  baseURL: "https://api.deepseek.com",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer sk-db5de1b9879c42ef96875beeccd51f56",
    cancelToken: source.token,
  },
});
// source.cancel('用户手动中断请求');
// 获取对话结果
const getAIResult = async () => {
  // const completion = await openai.chat.completions.create({
  //   messages: [{ role: "system", content }],
  //   model: "deepseek-chat",
  // });
  const completion = await instance.post("/v1/chat/completions", {
    messages,
    model: "deepseek-chat",
  });

  console.log(completion);
};
// 获取账户余额
const getBalance = async () => {
  try {
    const res = await instance.get("/user/balance");
    const { is_available, balance_infos } = res?.data || {};
    hasBalance.value =
      is_available && Number(balance_infos?.[0].total_balance) > 0;
  } catch (error) {
    console.warn("GetBalance error: ", JSON.stringifyerror);
  }
};
// 清空对话
const clearMessages = () => {
  messages.splice(0, messages.length);
};
// 展开/收起对话框
const toggleFlod = () => {
  // 收起对话框需要取消请求
  dsContentVisible.value && source.cancel("手动中断 DeepSeek 请求");
  dsContentVisible.value = !dsContentVisible.value;
};
</script>

<style scoped>
.bunpou-ds {
  padding: 0 16px;
  margin-top: 16px;
  border-radius: 8px;
  transition: all 0.3s;
  height: 42px;
}
.bunpou-ds.unflod {
  height: 500px;
}
.bunpou-ds-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  margin: 0 -16px;
  border-radius: 8px;
  height: 100%;
  > img {
    width: 26px;
  }
}
.bunpou-ds-btn:hover {
  background-color: var(--vp-c-indigo-1);
}
.bunpou-ds-window {
  margin: 16px 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: space-between;
  height: calc(100% - 32px);
  position: relative;
}
.bunpou-ds-tip {
  text-align: center;
  color: var(--vp-custom-block-info-text);
  line-height: 1;
  flex-shrink: 0;
}
/deep/ .bunpou-ds-tip > span {
  font-weight: bold;
  color: var(--vp-c-brand-1);
}
.bunpou-ds-dialog {
  flex: 1;
  margin: 8px 0;
  overflow: scroll;
}
.bunpou-ds-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.bunpou-ds-footer > img {
  display: block;
  width: 26px;
  cursor: pointer;
}
.bunpou-ds-close {
  width: 20px;
  display: block;
  position: absolute;
  top: 16px;
  right: 16px;
}
.bunpou-ds-footer > input {
  font-size: 14px;
  line-height: 1;
  border-radius: 4px;
  background: rgba(0, 0, 0, 1);
  padding: 8px;
  flex: 1;
}
</style>
