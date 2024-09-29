import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    root: resolve(__dirname, 'public'),  // Set the root to public
    build: {
        outDir: resolve(__dirname, 'dist'),  // Output build files to dist/ for deployment
    },
});
