import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  // Для локальной разработки используем '/', для продакшн билда '/cosm-unity/'
  base: command === 'serve' ? '/' : '/cosm-unity/',
  
  build: {
    // Директория для собранных файлов
    outDir: 'dist',
    
    // Генерация source maps для отладки
    sourcemap: false,
    
    // Минификация кода
    // minify: 'terser',
    
    // Настройки для assets
    // assetsDir: 'assets',
    
    // Очистка директории перед сборкой
    emptyOutDir: true,
  },
  
  // Настройки для dev-сервера
//   server: {
//     port: 3000,
//     open: true,
//   },
  
  // Настройки для preview-сервера
//   preview: {
//     port: 4173,
//   },
}))

