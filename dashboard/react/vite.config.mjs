import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import path from 'path';
import { fileURLToPath } from 'url'; // 1. Import library URL

// 2. Definisikan __dirname secara manual untuk ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const resolvePath = (str) => path.resolve(__dirname, str);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const API_URL = `${env.VITE_APP_BASE_NAME}`;
  const PORT = 3000;

  return {
    server: {
      open: true,
      port: PORT,
      host: true
    },
    preview: {
      open: true,
      host: true
    },
    define: {
      // Hati-hati: 'global: window' kadang bentrok dengan nodePolyfills.
      // Jika nanti ada error "global is not defined", hapus baris ini.
      // Tapi untuk sekarang biarkan saja jika diperlukan library lain.
      global: 'window' 
    },
    resolve: {
      alias: [
        // Alias biasanya sudah dicover oleh tsconfigPaths, jadi aman dikomentari
      ]
    },
    css: {
      preprocessorOptions: {
        scss: { charset: false },
        less: { charset: false }
      },
      charset: false,
      postcss: {
        plugins: [
          {
            postcssPlugin: 'internal:charset-removal',
            AtRule: {
              charset: (atRule) => {
                if (atRule.name === 'charset') {
                  atRule.remove();
                }
              }
            }
          }
        ]
      }
    },
    build: {
      chunkSizeWarningLimit: 1600,
      rollupOptions: {
        input: {
          // 3. Cukup satu entry point 'main'
          main: resolvePath('index.html'), 
        }
      }
    },
    base: API_URL,
    // 4. Plugin nodePolyfills() wajib ada untuk MQTT/HiveMQ
    plugins: [react(), tsconfigPaths(), nodePolyfills()]
  };
});