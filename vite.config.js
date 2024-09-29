import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        outDir: 'dist',  // Output to "dist" inside the project root
        emptyOutDir: true,  // Clear the output directory before building
        rollupOptions: {
            input: '/public/index.html',  // Input file is the public/index.html
        },
    },
});
