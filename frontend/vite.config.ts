import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc'; // SWC для супер-быстрой сборки



export default defineConfig({
  server: {
    allowedHosts: ['73f5-20-61-126-210.ngrok-free.app', 'localhost', '127.0.0.1']
  }
});
