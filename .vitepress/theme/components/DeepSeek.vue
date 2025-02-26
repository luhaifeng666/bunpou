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

    <template v-else>
      <img
        class="bunpou-ds-close"
        src="../../../public/imgs/close.svg"
        @click="toggleFlod"
      />
      <div class="bunpou-ds-window">
        <p class="bunpou-ds-tip" v-html="dialogTitle" />
        <div ref="dialog" class="bunpou-ds-dialog">
          <div
            v-for="(item, index) in messages"
            :key="index"
            :class="[
              'bunpou-ds-clear',
              {
                'bunpou-ds-question': item.role === 'user',
                'bunpou-ds-answer': item.role !== 'user',
              },
            ]"
          >
            <div
              v-html="item.role === 'user' ? item.question : item.content"
            ></div>
          </div>
        </div>
        <div class="bunpou-ds-footer">
          <input
            :disabled="loading"
            ref="input"
            type="text"
            v-model="inputMessage"
            placeholder="请输入你例句"
          />
          <img src="../../../public/imgs/stop.svg" @click="stopGenerate" />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import axios from "axios";
import { marked } from "marked";
import {
  onMounted,
  onBeforeUnmount,
  ref,
  watch,
  computed,
  nextTick,
} from "vue";
import { useData } from "vitepress";

const { page, title } = useData();

onMounted(async () => {
  await getBalance();
  document.addEventListener("keydown", enterEvent);
});

onBeforeUnmount(() => {
  clearMessages();
  document.removeEventListener("keydown", enterEvent);
});

//refs
const hasBalance = ref(true);
const dsContentVisible = ref(false);
const inputMessage = ref(""); // 用户输入的例句
const input = ref(null);
const dialog = ref(null);
const loading = ref(false);
const messages = ref([]); // 保存多轮对话

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
const grammer = computed(() => title.value.replace(/\s\|\sBunpou/g, ""));
const dialogTitle = computed(
  () => `请用<span>「${grammer.value}」</span>语法造句`
);

// methods
// 监听回车键
const enterEvent = async (event) => {
  const setLastValue = (config, isCanceled) => {
    messages.value[messages.value.length - 1] = config || {
      role: "error",
      content: isCanceled
        ? "好好好，反悔是吧！那就再好好思考下吧~"
        : "哦漏！网络开小差啦！过会儿再试下吧",
    };
  };
  try {
    if (
      !!input.value &&
      !loading.value &&
      !!inputMessage.value &&
      event.key === "Enter"
    ) {
      // message队列中塞入新的提问
      messages.value.push({
        role: "user",
        content: `例句${inputMessage.value}是否使用了${grammer.value}这个语法？是否正确？如果不正确应该如何调整？`,
        question: inputMessage.value,
      });
      // 清空inputMessage
      inputMessage.value = "";
      // 触发失焦
      input.value?.blur();
      // 开始请求数据
      loading.value = true;
      messages.value.push({
        content: '<span class="bunpou-ds-loading" />',
        role: "loading",
      });
      await nextTick();
      dialog.value?.scrollTo({
        top: dialog.value?.scrollHeight,
        behavior: "smooth",
      });
      const res = await getAIResult();
      loading.value = false;
      const { choices } = res?.data || {};
      setLastValue(
        (choices || []).length
          ? {
              ...choices[0].message,
              content: marked(choices[0].message.content),
            }
          : null
      );
    }
  } catch (error) {
    const { code, message } = error || {};
    setLastValue(null, code === "ERR_CANCELED" && message === "canceled");
    loading.value = false;
  }
};
// 创建 controller
let controller = new AbortController();
// axios 实例
const instance = axios.create({
  baseURL: "https://api.deepseek.com",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer sk-db5de1b9879c42ef96875beeccd51f56",
  },
});
// 获取对话结果
const getAIResult = async () =>
  await instance.post(
    "/v1/chat/completions",
    {
      messages: messages.value.filter((item) => item.role === "user").slice(-1),
      model: "deepseek-chat",
    },
    {
      signal: controller.signal,
    }
  );
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
  messages.value.splice(0, messages.value.length);
};
// 展开/收起对话框
const toggleFlod = () => {
  // 收起对话框需要取消请求
  dsContentVisible.value && stopGenerate();
  dsContentVisible.value = !dsContentVisible.value;
};
// 手动中断脚本
const stopGenerate = () => {
  controller.abort();
  loading.value = false;
  controller = new AbortController(); // 手动取消请求后需要重新实例化
};
</script>

<style scoped>
.bunpou-ds {
  padding: 0 16px;
  margin-top: 16px;
  border-radius: 8px;
  transition: all 0.3s;
  height: 42px;
  position: relative;
}
:deep(.bunpou-ds-answer ol),
:deep(.bunpou-ds-answer ul) {
  list-style: revert;
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
    margin-right: 8px;
  }
}
.bunpou-ds-btn:hover {
  background-color: var(--vp-custom-block-tip-bg);
}
.bunpou-ds-window {
  margin: 16px 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: space-between;
  height: calc(100% - 32px);
  position: relative;
  z-index: 0;
}
.bunpou-ds-tip {
  text-align: center;
  color: var(--vp-custom-block-info-text);
  line-height: 1;
  flex-shrink: 0;
}
:deep(.bunpou-ds-tip > span) {
  font-weight: bold;
  color: var(--vp-c-brand-1);
}
.bunpou-ds-dialog {
  flex: 1;
  margin: 16px 0;
  overflow-y: scroll;
  overflow-x: hidden;
}
.bunpou-ds-dialog::-webkit-scrollbar {
  display: none;
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
  width: 16px;
  display: block;
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 1;
}
.bunpou-ds-footer > input {
  font-size: 14px;
  line-height: 1;
  border-radius: 4px;
  background: rgba(0, 0, 0, 1);
  padding: 8px;
  flex: 1;
  color: white;
}
.bunpou-ds-question {
  float: right;
  background-color: #4d6bfe;
  color: #fff;
  font-size: 14px;
  padding: 4px 8px;
  border-radius: 6px;
  max-width: 50%;
  text-align: justify;
}
.bunpou-ds-answer {
  font-size: 14px;
  float: left;
  margin: 20px 0;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
}
.bunpou-ds-answer::before {
  content: "";
  display: block;
  width: 28px;
  height: 28px;
  border-radius: 100%;
  background: url(../../../public/imgs/deepseek.svg) no-repeat center / cover;
  margin: -2px 10px 0 0;
  flex-shrink: 0;
}
.bunpou-ds-clear {
  clear: both;
}
:deep(.bunpou-ds-loading) {
  display: block;
  width: 20px;
  height: 20px;
  margin-top: 4px;
  border: 2px solid transparent; /* 背景圆圈颜色 */
  border-top: 2px solid #4d6bfe; /* 顶部颜色，仿 DeepSeek 风格 */
  border-radius: 50%;
  animation: spin 1s linear infinite; /* 旋转动画 */
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
