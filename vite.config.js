import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        outDir: 'dist',  // Build output goes to the "dist" folder
        emptyOutDir: true,  // Clear the output directory before each build
    }
});
