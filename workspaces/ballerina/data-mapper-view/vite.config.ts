import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ["@wso2-enterprise/syntax-tree"],
  },
  build: {
    rollupOptions: {
      output: {
        dir: "build",
        entryFileNames: '[name].js'
      },
      input: 'src/components/DataMapper/DataMapper.tsx', // Replace with the path to your entry file,
    },
    commonjsOptions: {
      include: [/syntax-tree/, /node_modules/],
    },
  },
})
