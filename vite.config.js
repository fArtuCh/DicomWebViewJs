// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/Dicom.js',   // Your JS entry file
      name: 'DicomViewer',     // Global variable name for browser
      fileName: 'dicom-viewer' // Output filename base
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true // ensures everything is in one file
      }
    },
    minify: 'terser'
  }
});
