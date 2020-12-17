import Vuex from 'vuex';
import Vue from 'vue';
import splitter from './modules/splitter';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    splitter,
  },
});
