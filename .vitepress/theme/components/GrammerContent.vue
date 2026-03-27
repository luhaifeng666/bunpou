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
    v-if="audioSrc"
    ref="audio"
    :src="audioSrc"
    @canplay="handleAudioReady"
    @ended="isPlaying = false"
    @error="handleAudioError"
  ></audio>
</template>

<script setup>
  import { computed, ref, onBeforeUnmount, watch } from 'vue';
  import { useData } from 'vitepress';
  import { isPlaying } from '../store';
  import { getRuntimeKind, isEntryVisible } from '../runtime';
  import generateVoice from '../../../utils/speech';
  import speakIconUrl from '../../../public/imgs/speak.svg?url';

  const props = defineProps({
    sentence: String,
    trans: String,
    inline: Boolean,
    id: String,
    center: Boolean,
  });

  const audio = ref(null);
  const audioSrc = ref(null);
  const audioUnavailable = ref(false);
  const localAudioFailed = ref(false);
  const loading = ref(false);
  const { site } = useData();
  const runtime = getRuntimeKind();
  const audioEntryVisible = isEntryVisible('audio-entry', runtime);

  const withBase = (path) => `${site.value.base}${path.replace(/^\//, '')}`;

  const plainSentence = computed(() =>
    (props.sentence || '')
      .replace(
        /\[([^\[]*)\/[\u3040-\u309F\u30A0-\u30FF\u31F0-\u31FF]*\]/g,
        (_, rb) => rb,
      )
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .trim(),
  );

  onBeforeUnmount(() => {
    isPlaying.value = false;
  });

  watch(
    () => props.id,
    (id) => {
      loading.value = false;
      audioSrc.value = null;
      audioUnavailable.value = false;
      localAudioFailed.value = false;
      if (id && audioEntryVisible) {
        audioSrc.value = withBase(`/voices/${id}.wav`);
      }
    },
    {
      immediate: true,
    },
  );

  const handleAudioReady = () => {
    localAudioFailed.value = false;
    audioUnavailable.value = false;
  };

  const handleAudioError = () => {
    isPlaying.value = false;
    localAudioFailed.value = true;
  };

  const playFallbackAudio = async () => {
    if (!plainSentence.value) {
      audioUnavailable.value = true;
      return false;
    }

    try {
      await generateVoice(plainSentence.value);
      audioUnavailable.value = false;
      isPlaying.value = false;
      return true;
    } catch (error) {
      audioUnavailable.value = true;
      isPlaying.value = false;
      return false;
    }
  };

  const sentenceElement = computed(() => {
    const { sentence, trans = '', center } = props;
    // 转换 ruby & strong 标签
    return `<div ${
      center ? 'style="justify-content: center;"' : ''
    }><p>${sentence}</p>${
      trans
        ? `<div class="bunpou-speak-box">${
            trans && audioEntryVisible
              ? `<img alt="speak" class="bunpou-speak" src="${speakIconUrl}" />`
              : ''
          }<div class="bunpou-loading ${loading.value ? '' : 'hidden'}">
    <span></span><span></span><span></span><span></span><span></span>
  </div></div>`
        : ''
    }</div>${
      trans
        ? `<p style="margin-top: 6px;line-height:1.5;${
            center ? 'text-align: center;' : ''
          }">${trans}</p>`
        : ''
    }`
      .replace(
        /\[([^\[]*)\/([\u3040-\u309F\u30A0-\u30FF\u31F0-\u31FF]*)\]/g,
        (word) => {
          const [rb, rt] = word.replace(/\[|\]/g, '').split('/');
          return `<ruby><rb>${rb}</rb><rt>${rt}</rt></ruby>`;
        },
      )
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #fb923c">$1</strong>');
  });

  const play = async () => {
    if (!audioEntryVisible || isPlaying.value || audioUnavailable.value) {
      return;
    }

    isPlaying.value = true;
    loading.value = true;

    try {
      const canUseLocalAudio =
        audio.value && audioSrc.value && !localAudioFailed.value;
      if (canUseLocalAudio) {
        await audio.value.play();
        audioUnavailable.value = false;
        return;
      }

      const playedFallbackAudio = await playFallbackAudio();
      if (!playedFallbackAudio) {
        isPlaying.value = false;
      }
    } catch (error) {
      const playedFallbackAudio = await playFallbackAudio();
      if (!playedFallbackAudio) {
        isPlaying.value = false;
      }
    } finally {
      loading.value = false;
    }
  };
</script>
