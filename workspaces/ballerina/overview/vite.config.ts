import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        dir: "build",
        entryFileNames: '[name].js'
      },
      input: 'src/index.tsx', // Replace with the path to your entry file
    },
  },
})
