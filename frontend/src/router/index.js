import Vue from 'vue';
import VueRouter from 'vue-router';
import About from '@/views/About.vue';
import Splitter from '@/views/Splitter.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Splitter',
    component: Splitter,
  },
  {
    path: '/about',
    name: 'About',
    component: About,
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
