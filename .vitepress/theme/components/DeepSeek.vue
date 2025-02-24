<template>
    <div class="bunpou-ds"></div>
</template>

<script setup>
import OpenAI from "openai";
import { onMounted } from 'vue'

onMounted(() => {
    main()
})

const openai = new OpenAI({
        dangerouslyAllowBrowser: true,
        baseURL: 'https://api.deepseek.com',
        apiKey: '' // TODO 设置APIKEY
});

async function main() {
  const completion = await openai.chat.completions.create({
    messages: [{ role: "system", content: "You are a helpful assistant." }],
    model: "deepseek-chat",
  });

  console.log(completion);
}

main();
</script>