import { createApp } from 'vue';
import Dev from './serve.vue';
import VueMaplibreGl from '@/entry.esm';

const app = createApp(Dev);
app.use(VueMaplibreGl);

app.mount('#app');
