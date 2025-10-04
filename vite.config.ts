// path: ./vite.config.ts
import { resolve } from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

export default defineConfig({
    plugins: [
        react(),
        // This plugin is essential for generating the TypeScript declaration files.
        dts({
            insertTypesEntry: true,
        }),
        // This plugin takes the final, PostCSS-processed CSS and injects it
        // into the JavaScript bundle. This runs AFTER PostCSS scopes the styles.
        cssInjectedByJsPlugin(),
    ],
    // NOTE: Vite still automatically uses 'postcss.config.cjs' to process the CSS first.
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
                // We remove assetFileNames because we are no longer outputting a separate CSS file.
            },
        },
    },
});