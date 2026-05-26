import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://workflow.digitaloutbreak.com',
  vite: {
    plugins: [tailwindcss()],
  },
});
