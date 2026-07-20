import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 部署到 GitHub Pages 项目站点
export default defineConfig({
  plugins: [react()],
  base: '/useless-tool/',
})
