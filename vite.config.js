import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        outDir: 'dist',  // Output folder inside the project root
        emptyOutDir: true,  // Clear output before building
        rollupOptions: {
            input: './public/index.html',  // Ensure correct input file for the build
        },
    },
});
