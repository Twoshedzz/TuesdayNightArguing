import { defineConfig } from 'astro/config';
import remarkDirective from 'remark-directive';
import remarkRegisters from './src/plugins/remark-registers.mjs';

export default defineConfig({
  site: 'https://tuesday-night-arguing.netlify.app',
  output: 'static',
  markdown: {
    // The two registers — :::room and :::aloud. See src/plugins/remark-registers.mjs.
    remarkPlugins: [remarkDirective, remarkRegisters],
  },
});
