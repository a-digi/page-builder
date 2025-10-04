import { resolve } from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

export default defineConfig({
    plugins: [
        react(),
        dts({
            insertTypesEntry: true,
        }),
        cssInjectedByJsPlugin(),
    ],
    build: {
        lib: {
            entry: resolve('src/index.ts'),
            name: 'ReactPageBuilder',
            formats: ['es', 'umd'],
            fileName: (format) => {
                if (format === 'es') {
                    return `react-page-builder.es.js`;
                }
                return `react-page-builder.${format}.cjs`;
            },
        },
        rollupOptions: {
            external: ['react', 'react-dom'],
            output: {
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM',
                },
            },
        },
    },
});