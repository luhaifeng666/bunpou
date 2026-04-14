<template>
  <Teleport to="body">
    <div
      v-if="ragVisible && isFullscreen && !isMobile"
      class="bunpou-rag-overlay"
      @click="exitFullscreen"
    ></div>

    <div
      :class="[
        'bunpou-rag',
        {
          unflod: ragVisible,
          fullscreen: ragVisible && isFullscreen,
          mobile: isMobile,
        },
      ]"
      @click.stop
    >
      <!-- 悬浮按钮 -->
      <div v-if="!ragVisible" class="bunpou-rag-btn" @click="toggleFlod">
        <img src="../../../public/imgs/rag.svg" />
        <span>日语助手</span>
      </div>

      <!-- 对话窗口 -->
      <template v-else>
        <div class="bunpou-rag-header">
          <span class="bunpou-rag-title">📚 Bunpou小助手</span>
          <div class="bunpou-rag-actions">
            <button class="bunpou-rag-resize" @click="toggleFullscreen">
              {{
                isFullscreen ? '窗口模式' : isMobile ? '全屏输入' : '放大窗口'
              }}
            </button>
            <img
              class="bunpou-rag-close"
              src="../../../public/imgs/close.svg"
              @click="toggleFlod"
            />
          </div>
        </div>

        <div class="bunpou-rag-hint">
          用自然语言问我日语语法问题，我会从语法库中为你解答
        </div>

        <!-- 对话列表 -->
        <div ref="dialog" class="bunpou-rag-dialog">
          <!-- 欢迎消息 -->
          <div v-if="messages.length === 0" class="bunpou-rag-welcome">
            <p>你好！我是Bunpou小助手，你可以问我：</p>
            <div class="bunpou-rag-suggestions">
              <div
                class="suggestion-item"
                @click="askSuggestion('怎样表达持续变化？')"
              >
                怎样表达持续变化？
              </div>
              <div
                class="suggestion-item"
                @click="askSuggestion('授受动词有什么区别？')"
              >
                授受动词有什么区别？
              </div>
              <div
                class="suggestion-item"
                @click="askSuggestion('表示原因的语法有哪些？')"
              >
                表示原因的语法有哪些？
              </div>
              <div
                class="suggestion-item"
                @click="askSuggestion('假定形怎么接续？')"
              >
                假定形怎么接续？
              </div>
            </div>
          </div>

          <!-- 消息列表 -->
          <div
            v-for="(item, index) in messages"
            :key="index"
            :class="[
              'bunpou-rag-clear',
              {
                'bunpou-rag-question': item.role === 'user',
                'bunpou-rag-answer': item.role === 'assistant',
                'bunpou-rag-error': item.role === 'error',
              },
            ]"
          >
            <div v-if="item.role === 'user'" class="message-question">
              {{ item.content }}
            </div>
            <template v-else-if="item.role === 'assistant'">
              <div class="message-answer" v-html="item.content"></div>
              <div
                v-if="item.sources && item.sources.length > 0"
                class="message-sources"
              >
                <div class="sources-title">📖 参考文档</div>
                <div
                  v-for="source in item.sources"
                  :key="source.id"
                  class="source-item"
                  @click="openSource(source)"
                >
                  <span class="source-level" :class="`level-${source.level}`">
                    {{ source.level }}
                  </span>
                  <span class="source-title">{{ source.title }}</span>
                </div>
              </div>
            </template>
            <div v-else-if="item.role === 'error'" class="message-error">
              {{ item.content }}
            </div>
            <div v-else-if="item.role === 'loading'" class="message-loading">
              <span class="loading-dot"></span>
              <span class="loading-dot"></span>
              <span class="loading-dot"></span>
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="bunpou-rag-footer">
          <input
            :disabled="loading"
            ref="input"
            type="text"
            v-model="inputMessage"
            placeholder="问我任何日语语法问题..."
            enterkeyhint="send"
            autocomplete="off"
            @keydown.enter.prevent="sendMessage"
          />
          <img
            :class="{ disabled: !inputMessage || loading }"
            src="../../../public/imgs/enter.svg"
            @click="sendMessage"
          />
          <img
            v-if="loading"
            src="../../../public/imgs/stop.svg"
            @click="stopGenerate"
          />
        </div>
      </template>
    </div>
  </Teleport>
</template>

<script setup>
  import { marked } from 'marked';
  import { ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue';
  import { useData, useRouter } from 'vitepress';

  const { page } = useData();
  const router = useRouter();

  const ragVisible = ref(false);
  const inputMessage = ref('');
  const input = ref(null);
  const dialog = ref(null);
  const loading = ref(false);
  const messages = ref([]);
  const isFullscreen = ref(false);
  const isMobile = ref(false);
  let controller = new AbortController();

  const updateDeviceType = () => {
    isMobile.value =
      window.matchMedia('(max-width: 768px)').matches ||
      window.matchMedia('(pointer: coarse)').matches;
  };

  // 切换显示/隐藏
  const toggleFlod = () => {
    if (ragVisible.value) {
      stopGenerate();
      isFullscreen.value = false;
    }
    ragVisible.value = !ragVisible.value;
  };

  const toggleFullscreen = () => {
    isFullscreen.value = !isFullscreen.value;
    if (isFullscreen.value) {
      nextTick(() => {
        if (isMobile.value) {
          focusInputForTyping();
        } else {
          input.value?.focus();
        }
        scrollToBottom();
      });
    }
  };

  const focusInputForTyping = () => {
    if (!input.value) return;

    // 移动端键盘弹出存在平台差异，分帧与延迟重复聚焦可提升成功率。
    input.value.focus({ preventScroll: true });
    requestAnimationFrame(() => {
      input.value?.focus({ preventScroll: true });
      scrollToBottom();
    });
    setTimeout(() => {
      input.value?.focus({ preventScroll: true });
      scrollToBottom();
    }, 180);
  };

  const handleVisualViewportResize = () => {
    if (ragVisible.value && isMobile.value && isFullscreen.value) {
      scrollToBottom();
    }
  };

  const exitFullscreen = () => {
    if (!isMobile.value) {
      isFullscreen.value = false;
    }
  };

  // 发送消息
  const sendMessage = async () => {
    if (!inputMessage.value.trim() || loading.value) return;

    const question = inputMessage.value.trim();
    messages.value.push({
      role: 'user',
      content: question,
    });
    inputMessage.value = '';
    input.value?.blur();

    await nextTick();
    scrollToBottom();

    await handleResponse(question);
  };

  // 处理 RAG 响应
  const handleResponse = async (question) => {
    try {
      loading.value = true;
      messages.value.push({
        role: 'loading',
        content: '',
      });
      await nextTick();
      scrollToBottom();

      const response = await fetch('https://www.bunpou.cn/api/rag-query', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
      });

      if (!response.ok) {
        throw new Error('请求失败');
      }

      const result = await response.json();

      // 替换 loading 消息
      messages.value[messages.value.length - 1] = {
        role: 'assistant',
        content: formatAnswer(result.answer),
        sources: result.sources || [],
      };

      await nextTick();
      scrollToBottom();
    } catch (error) {
      const { code, message } = error || {};
      messages.value[messages.value.length - 1] = {
        role: 'error',
        content:
          code === 'ERR_CANCELED'
            ? '已取消生成'
            : '抱歉，遇到了点问题，请稍后重试',
      };
    } finally {
      loading.value = false;
      controller = new AbortController();
    }
  };

  // 格式化回答
  const formatAnswer = (text) => {
    if (!text) return '';
    return marked.parse(text);
  };

  // 滚动到底部
  const scrollToBottom = () => {
    nextTick(() => {
      if (dialog.value) {
        dialog.value.scrollTop = dialog.value.scrollHeight;
      }
    });
  };

  // 停止生成
  const stopGenerate = () => {
    controller.abort({ message: 'canceled', code: 'ERR_CANCELED' });
    loading.value = false;
    controller = new AbortController();
  };

  // 快捷问题
  const askSuggestion = (question) => {
    if (!loading.value) {
      inputMessage.value = question;
      sendMessage();
    }
  };

  // 打开参考文档
  const openSource = (source) => {
    let prePath = '/bunpou';
    if (
      source?.id?.includes('auxiliary/') ||
      source?.id?.includes('term/') ||
      !source?.id?.includes('/')
    ) {
      prePath = '';
    }
    const path = `/docs${prePath}/${source.id}`;
    router.go(path);
  };

  // 监听页面变化，清空对话
  watch(page, () => {
    // 不自动清空，保持对话上下文
  });

  onMounted(() => {
    updateDeviceType();
    window.addEventListener('resize', updateDeviceType);
    window.visualViewport?.addEventListener(
      'resize',
      handleVisualViewportResize,
    );
  });

  onBeforeUnmount(() => {
    window.removeEventListener('resize', updateDeviceType);
    window.visualViewport?.removeEventListener(
      'resize',
      handleVisualViewportResize,
    );
  });
</script>

<style scoped>
  .bunpou-rag-overlay {
    position: fixed;
    inset: 0;
    z-index: 99;
    background: transparent;
  }

  .bunpou-rag {
    position: fixed;
    right: 20px;
    bottom: 80px;
    z-index: 100;
    transition: all 0.3s;
  }

  /* 悬浮按钮 */
  .bunpou-rag-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 10px 16px;
    border-radius: 24px;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    transition: all 0.3s;
    font-size: 14px;
    font-weight: 500;
  }
  .bunpou-rag-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5);
  }
  .bunpou-rag-btn img {
    width: 20px;
    height: 20px;
  }

  /* 对话窗口 */
  .bunpou-rag.unflod {
    right: 20px;
    bottom: 20px;
    width: 380px;
    height: 560px;
    max-height: calc(100vh - 120px);
    background: var(--vp-c-bg);
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid var(--vp-c-divider);
  }

  .bunpou-rag.unflod.fullscreen:not(.mobile) {
    left: 50%;
    top: 50%;
    right: auto;
    bottom: auto;
    width: min(960px, calc(100vw - 120px));
    height: min(780px, calc(100vh - 80px));
    max-height: none;
    transform: translate(-50%, -50%);
  }

  /* 头部 */
  .bunpou-rag-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    border-bottom: 1px solid var(--vp-c-divider);
    flex-shrink: 0;
  }
  .bunpou-rag-title {
    font-size: 15px;
    font-weight: 600;
    color: var(--vp-c-text-1);
  }
  .bunpou-rag-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .bunpou-rag-resize {
    border: 1px solid var(--vp-c-divider);
    background: var(--vp-c-bg-soft);
    color: var(--vp-c-text-1);
    border-radius: 999px;
    font-size: 12px;
    line-height: 1;
    padding: 7px 10px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .bunpou-rag-resize:hover {
    border-color: var(--vp-c-brand-1);
    color: var(--vp-c-brand-1);
    background: var(--vp-c-bg-elv);
  }
  .bunpou-rag-close {
    width: 16px;
    cursor: pointer;
    opacity: 0.6;
    transition: opacity 0.2s;
  }
  .bunpou-rag-close:hover {
    opacity: 1;
  }

  /* 提示文字 */
  .bunpou-rag-hint {
    padding: 12px 16px;
    font-size: 12px;
    color: var(--vp-c-text-2);
    background: var(--vp-c-bg-soft);
    flex-shrink: 0;
  }

  /* 对话区域 */
  .bunpou-rag-dialog {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    -webkit-overflow-scrolling: touch;
  }
  .bunpou-rag-dialog::-webkit-scrollbar {
    width: 4px;
  }
  .bunpou-rag-dialog::-webkit-scrollbar-thumb {
    background: var(--vp-c-divider);
    border-radius: 2px;
  }

  /* 欢迎消息 */
  .bunpou-rag-welcome {
    color: var(--vp-c-text-2);
    font-size: 13px;
    line-height: 1.6;
  }
  .bunpou-rag-suggestions {
    margin-top: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .suggestion-item {
    background: var(--vp-c-bg-soft);
    padding: 10px 12px;
    border-radius: 8px;
    font-size: 13px;
    color: var(--vp-c-text-1);
    cursor: pointer;
    transition: all 0.2s;
    border: 1px solid var(--vp-c-divider);
  }
  .suggestion-item:hover {
    background: var(--vp-c-bg-elv);
    border-color: var(--vp-c-brand-1);
    color: var(--vp-c-brand-1);
  }

  /* 消息样式 */
  .bunpou-rag-clear {
    clear: both;
    margin-bottom: 16px;
  }
  .bunpou-rag-question {
    float: right;
    max-width: 85%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 10px 14px;
    border-radius: 16px 16px 4px 16px;
    font-size: 14px;
    line-height: 1.5;
  }
  .bunpou-rag-answer {
    float: left;
    max-width: 100%;
    font-size: 14px;
    line-height: 1.6;
    color: var(--vp-c-text-1);
  }
  .bunpou-rag-error {
    float: left;
    color: var(--vp-c-danger-1);
    font-size: 13px;
    padding: 8px 12px;
    background: var(--vp-c-danger-bg-soft);
    border-radius: 8px;
  }
  .message-answer {
    background: var(--vp-c-bg-soft);
    padding: 12px 14px;
    border-radius: 4px 16px 16px 16px;
    margin-bottom: 8px;
  }
  .message-answer :deep(p) {
    margin: 0 0 8px 0;
  }
  .message-answer :deep(p:last-child) {
    margin-bottom: 0;
  }
  .message-answer :deep(strong) {
    color: var(--vp-c-brand-1);
    font-weight: 600;
  }

  /* 参考文档 */
  .message-sources {
    background: var(--vp-c-bg-soft);
    border-radius: 8px;
    padding: 10px 12px;
    margin-top: 8px;
  }
  .sources-title {
    font-size: 12px;
    color: var(--vp-c-text-2);
    margin-bottom: 8px;
    font-weight: 500;
  }
  .source-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 8px;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.2s;
    font-size: 12px;
  }
  .source-item:hover {
    background: var(--vp-c-bg-elv);
  }
  .source-level {
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 600;
    flex-shrink: 0;
  }
  .level-N1,
  .level-N2 {
    background: var(--vp-c-danger-bg);
    color: var(--vp-c-danger-1);
  }
  .level-N3,
  .level-N4 {
    background: var(--vp-c-warning-bg);
    color: var(--vp-c-warning-1);
  }
  .level-N5 {
    background: var(--vp-c-info-bg);
    color: var(--vp-c-info-1);
  }
  .source-title {
    color: var(--vp-c-text-1);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* 加载动画 */
  .message-loading {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 8px 0;
  }
  .loading-dot {
    width: 6px;
    height: 6px;
    background: var(--vp-c-text-3);
    border-radius: 50%;
    animation: loading-bounce 1.4s infinite ease-in-out both;
  }
  .loading-dot:nth-child(1) {
    animation-delay: -0.32s;
  }
  .loading-dot:nth-child(2) {
    animation-delay: -0.16s;
  }
  @keyframes loading-bounce {
    0%,
    80%,
    100% {
      transform: scale(0);
    }
    40% {
      transform: scale(1);
    }
  }

  /* 底部输入区 */
  .bunpou-rag-footer {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    border-top: 1px solid var(--vp-c-divider);
    flex-shrink: 0;
  }
  .bunpou-rag-footer > input {
    flex: 1;
    padding: 10px 14px;
    border: 1px solid var(--vp-c-divider);
    border-radius: 20px;
    font-size: 14px;
    background: var(--vp-c-bg-soft);
    color: var(--vp-c-text-1);
    outline: none;
    transition: border-color 0.2s;
  }
  .bunpou-rag-footer > input:focus {
    border-color: var(--vp-c-brand-1);
  }
  .bunpou-rag-footer > input::placeholder {
    color: var(--vp-c-text-3);
  }
  .bunpou-rag-footer > img {
    width: 24px;
    cursor: pointer;
    flex-shrink: 0;
    opacity: 0.8;
    transition: opacity 0.2s;
  }
  .bunpou-rag-footer > img:hover:not(.disabled) {
    opacity: 1;
  }
  .bunpou-rag-footer > .disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  /* 响应式 */
  @media (max-width: 640px) {
    .bunpou-rag {
      right: 12px;
      bottom: 70px;
    }
    .bunpou-rag.unflod {
      right: 8px;
      bottom: 12px;
      width: calc(100vw - 32px);
      max-width: 400px;
      height: min(540px, calc(100dvh - 100px));
    }
    .bunpou-rag.unflod.mobile.fullscreen {
      right: 0;
      bottom: 0;
      left: 0;
      top: 0;
      width: 100vw;
      max-width: none;
      height: 100dvh;
      max-height: none;
      border-radius: 0;
      transform: none;
    }
    .bunpou-rag.unflod.mobile.fullscreen .bunpou-rag-footer {
      padding-bottom: calc(12px + env(safe-area-inset-bottom));
    }
    .bunpou-rag-resize {
      padding: 6px 9px;
      font-size: 11px;
    }
  }
</style>
