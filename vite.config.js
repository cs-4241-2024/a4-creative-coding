import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        outDir: 'dist',  // Output the built files into the "dist" directory
        emptyOutDir: true,  // Empty the output directory before building
        rollupOptions: {
            input: './public/index.html',  // Specify the entry point for Vite
        }
    }
});
