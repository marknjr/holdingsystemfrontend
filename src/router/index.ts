import {createRouter, createWebHistory} from 'vue-router'
import {useAuthenticationStore} from "@/stores/AuthenticationStore";
import {UserType} from "@/model/UserType";
import {useGrid} from "vue-screen";
import {useLinksStore} from "@/stores/LinksStore";


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // {
    //   path: '/phone-numbers',
    //   name: 'phone-numbers',
    //   component: () => import('@/views/PhoneNumbersView.vue'),
    //   meta: {
    //     title: 'Phone Numbers'
    //   }
    // },
    // {
    //   path: '/user-settings',
    //   name: 'user-settings',
    //   component: () => import('@/views/UserSettingsView.vue'),
    //   meta: {
    //     title: 'User Settings'
    //   }
    // },  
    {
      path: '/password-test',
      name: 'password-test', 
      component: () => import('@/views/PasswordTestView.vue'),
      meta: {
        title: 'Password Test'
      }
    },  
    {
      path: '/client',
      name: 'client',
      component: () => {
        const grid = useGrid('bootstrap');
        return import(grid.md ? '@/views/ClientView.vue' : '@/views/ClientViewSm.vue')
      },
      meta: {
        title: 'Home',
      }
    },
    {
      path: '/client2',
      name: 'client2',
      component: () => import('@/views/ClientViewSm.vue'),
      meta: {
        title: 'Home2',
      }
    },
    {
      path: '/events',
      name: 'events',
      component: () => import('@/views/EventsView.vue'),
      meta: {
        title: 'Events'
      }
    },
    {
      path: '/submissions',
      name: 'submissions',
      component: () => import('@/views/SubmissionsView.vue'),
      meta: {
        title: 'Submissions'
      }
    },

    {
      path: '/admins',
      name: 'admins',
      component: () => import('@/views/AdminsView.vue'),
      meta: {
        title: 'Admins'
      }
    },
    {
      path: '/passwords',
      name: 'passwords',
      component: () => import('@/views/PasswordsView.vue'),
      meta: {
        title: 'Passwords'
      }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: {
        title: 'Login'
      },
      beforeEnter: () =>{
        const authenticationStore = useAuthenticationStore();
        if(authenticationStore.loggedIn)
          return { path: authenticationStore.userType == UserType.Client ? '/client' : '/submissions' }
      }
    },

    {
      path: '/activate-link-set/:access_code',
      name: 'link-set-activation',
      component: import('@/components/TermsModal.vue'),
      beforeEnter: (to, from, next) => {
        const linksStore = useLinksStore();
        linksStore.activateLinkSet(to.params.access_code as string);
        next({ path: '/', replace: true });
      },
    },

    { path: '/:pathMatch(.*)*', redirect: '/login' },
  ]
})

router.beforeEach(async (to, from) => {
  if(to.name == 'login')
    return true;
  if(to.name == 'link-set-activation')
    return true;
  const authenticationStore = useAuthenticationStore();
  if(!authenticationStore.loggedIn) {
    return {path: '/login'}
  }
  const commonRoutes = ['passwords'];
  if(commonRoutes.includes(to.name as string))
    return true;
  const clientRoutes = ['client', 'client2'];
  return ((authenticationStore.userType == UserType.Client) == clientRoutes.includes(to.name as string));
})

export default router
