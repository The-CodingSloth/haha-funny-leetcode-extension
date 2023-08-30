export default {
  build: {
    rollupOptions: {
      input: {
        background: 'scripts/background.js',
        content: 'scripts/content.js',
        popup: 'scripts/popup.js',
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
  optimizeDeps: {
    exclude: ['web_scraper'],
  },
};
