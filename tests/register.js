import { register } from 'node:module';

register(new URL('./mock-loader.js', import.meta.url).href);
