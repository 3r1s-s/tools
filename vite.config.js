import { defineConfig } from 'vite';

export default defineConfig({
    appType: 'mpa',
    build: {
        rollupOptions: {
            input: {
                main: 'index.html',
                password: 'password/index.html',
                qr: 'qr/index.html',
                jpg: 'jpg/index.html',
                bpm: 'bpm/index.html',
                sqrt: 'sqrt/index.html',
                mp4: 'mp4/index.html',
            }
        }
    }
});
