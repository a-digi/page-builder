// path: ./vite.config.ts
import { resolve } from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';

export default defineConfig({
    plugins: [
        react(),
        // This plugin is essential for generating the TypeScript declaration files.
        dts({
            // This setting tells the plugin to create a single, bundled .d.ts file
            // at the root of the 'dist' folder, which is what your package.json expects.
            insertTypesEntry: true,
        }),
    ],
    // NOTE: Vite automatically finds and uses the 'postcss.config.cjs' file.
    // We do not need to add any special CSS plugins here.
    build: {
        // This indicates we are building a library
        lib: {
            // This is the entry point for your library's API.
            entry: resolve('src/index.ts'),

            // The global variable name for the UMD build
            name: 'ReactPageBuilder',

            // The formats to build. 'es' for modern bundlers, 'umd' for older environments.
            formats: ['es', 'umd'],

            // This function generates the correct filenames based on the format.
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
                // This explicitly tells Rollup (used by Vite) to name the final CSS file 'style.css'.
                assetFileNames: 'style.css',
            },
        },
    },
});