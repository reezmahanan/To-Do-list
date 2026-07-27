import { defineConfig } from 'vite';

export default defineConfig({
  // Use /TaskFlow/ when deploying on GitHub Actions, otherwise use /
  base: process.env.GITHUB_ACTIONS ? '/TaskFlow/' : '/'
});
