import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  define: {
    'process.env': process.env
  },
  build: {
    target: 'ESNext',
    outDir: 'build',
    assetsDir: 'assets',
    lib: {
      entry: 'src/index.tsx',
      name: 'visualizerWebview',
      fileName: 'Visualizer',
    },
    rollupOptions: {
      output: {
        entryFileNames: `Visualizer.js`,
        chunkFileNames: `[name].js`,
        assetFileNames: `[name].[ext]`,
      },
    },
  },
  server: {
    port: 9000,
    cors: true,
    hmr: false
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
})
