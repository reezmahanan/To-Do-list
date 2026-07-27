import { defineConfig } from 'vite';

export default defineConfig({
  // Use /To-Do-list/ when deploying on GitHub Actions, otherwise use /
  base: process.env.GITHUB_ACTIONS ? '/To-Do-list/' : '/'
});
