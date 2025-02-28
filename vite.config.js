import { defineConfig } from 'vitepress';

export default defineConfig({
  server: {
    host: '0.0.0.0', // 允许所有 IP 访问
    port: 5173, // 指定端口，默认 5173
  },
});