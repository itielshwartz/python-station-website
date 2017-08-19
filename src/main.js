import Vue from "vue";
import App from "./App";
import router from "./router";

import VueGitHubCorners from 'vue-gh-corners';

import 'vue-gh-corners/dist/vue-github-corners.css';
import BootstrapVue from 'bootstrap-vue';
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import 'github-fork-ribbon-css/gh-fork-ribbon.css';
import 'vue-awesome/icons'
import VueFuse from 'vue-fuse'

var SocialSharing = require('vue-social-sharing');

Vue.use(SocialSharing);
Vue.use(BootstrapVue);
Vue.use(VueGitHubCorners);
Vue.use(SocialSharing);
Vue.use(VueFuse);

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: {App},

})
