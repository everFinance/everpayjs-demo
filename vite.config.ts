import path, { join } from 'path'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
// import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
import postcssNesting from 'postcss-nesting'
import tsConfigPaths from 'vite-tsconfig-paths'
import inject from '@rollup/plugin-inject'
import nodePolyfills from 'rollup-plugin-polyfill-node'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'
// import eslintPlugin from 'vite-plugin-eslint' //导入包

// https://vitejs.dev/config/
export default defineConfig((mode) => {
  const env = loadEnv(mode, process.cwd())
  const processEnvValues = {
    'process.env': Object.entries(env).reduce((prev, [key, val]) => {
      return {
        ...prev,
        [key]: val
      }
    }, {})
  }

  if (mode.mode === 'development') {
    return {
      server: {
        port: 8080
      },
      define: Object.assign(processEnvValues, { global: {} }),
      resolve: {
        alias: {
          '@': join(__dirname, 'src'),
          util: 'rollup-plugin-node-polyfills/polyfills/util',
          stream: 'rollup-plugin-node-polyfills/polyfills/stream',
          process: 'rollup-plugin-node-polyfills/polyfills/process-es6'
          // 'vue-i18n': 'vue-i18n/dist/vue-i18n.runtime.esm-bundler.js',
        }
      },
      plugins: [
        vue(),
        // eslintPlugin({
        //   include: ['src/**/*.ts', 'src/**/*.vue', 'src/*.ts', 'src/*.vue']
        // }),
        // eslint(),
        // VueI18nPlugin({
        //   include: path.resolve(__dirname, './src/locales/**'), // PUT YOUR OWN PATH TO LOCALES HERE
        // }),
        postcssNesting,
        tsConfigPaths()
      ]
    }
  }

  return {
    // define: Object.assign(processEnvValues, { global: {} }),
    resolve: {
      alias: {
        '@': join(__dirname, 'src'),
        util: 'rollup-plugin-node-polyfills/polyfills/util',
        stream: 'rollup-plugin-node-polyfills/polyfills/stream',
        process: 'rollup-plugin-node-polyfills/polyfills/process-es6'
        // 'vue-i18n': 'vue-i18n/dist/vue-i18n.runtime.esm-bundler.js',
      }
    },
    optimizeDeps: {
      esbuildOptions: {
        // Node.js global to browser globalThis
        define: {
          // can't use this
          // https://github.com/intlify/vue-i18n-next/issues/970
          // global: "globalThis",
        },
        // Enable esbuild polyfill plugins
        plugins: [
          NodeGlobalsPolyfillPlugin({
            process: true,
            buffer: true
          }),
          NodeModulesPolyfillPlugin()
        ]
      }
    },
    build: {
      rollupOptions: {
        plugins: [
          inject({ Buffer: ['buffer/', 'Buffer'] }),
          nodePolyfills()
        ],
        // output:{
        //   manualChunks(id) {
        //     if (id.includes('node_modules')) {
        //       return id.toString().split('node_modules/')[1].split('/')[0].toString()
        //     }
        //   }
        // }
      }
    },
    plugins: [
      vue(),
      // eslint(),
      // VueI18nPlugin({
      //   include: path.resolve(__dirname, './src/locales/**'), // PUT YOUR OWN PATH TO LOCALES HERE
      // }),
      postcssNesting,
      tsConfigPaths()
    ]
  }
})
