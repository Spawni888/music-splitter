import Vue from 'vue';
import VueRouter from 'vue-router';
import Splitter from '@/views/Splitter.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Splitter',
    component: Splitter,
  },
  {
    path: '*',
    redirect: '/',
  },
];

const router = new VueRouter({
  mode: 'history',
  // base: process.env.BASE_URL,
  routes,
});

export default router;
