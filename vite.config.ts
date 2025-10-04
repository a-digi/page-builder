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
            // This setting tells the plugin to create a single, bundled .d.ts file
            // at the root of the 'dist' folder, which is what your package.json expects.
            insertTypesEntry: true,
        }),
        // This plugin injects your CSS into the JS bundle.
        cssInjectedByJsPlugin(),
    ],
    build: {
        // This indicates we are building a library
        lib: {
            // This is the entry point for your library's API.
            // All modules you want to export publicly MUST be exported from this file.
            entry: resolve('src/index.ts'),

            // The global variable name for the UMD build
            name: 'ReactPageBuilder',

            // The formats to build. 'es' for modern bundlers, 'umd' for older environments.
            formats: ['es', 'umd'],

            // This function generates the correct filenames based on the format.
            // It solves your .cjs vs .js problem.
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