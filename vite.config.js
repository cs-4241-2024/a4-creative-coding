import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        outDir: 'dist',
        emptyOutDir: true,
    },
    server: {
        proxy: {
            '/scores': 'http://localhost:3000',
            '/config': 'http://localhost:3000'
        }
    },
    define: {
        'process.env': {}
    }
});