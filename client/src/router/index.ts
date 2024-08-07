import { createRouter, createWebHashHistory } from 'vue-router'
import { signInWithRefreshToken } from '@/libs/cognito';
import { jwtDecode } from 'jwt-decode';
import { AxiosError } from 'axios';
import { useUserStore } from '@/stores/user';

const routes = [
  {
    path: '/',
    name: 'SignIn',
    component: () => import('@/views/pre-auth/SignIn.vue'),
    meta: {
      title: 'Iniciar sesión',
    }
  },
  {
    path: '/unconfirmed_account',
    name: 'UnconfirmedAccount',
    component: () => import('@/views/pre-auth/UnconfirmedAccount.vue'),
    meta: {
      title: 'Confirmá tu cuenta',
    }
  },

  {
    path: '/explore',
    component: () => import('@/views/Explore.vue'),
    meta: {
      title: 'Explorar',
    }
  },
  {
    path: '/explore/:userId/profile',
    component: () => import('@/views/Explore.vue'),
    meta: {
      title: 'Explorar',
    }
  },

  {
    path: '/friends',
    component: () => import('@/views/Friends.vue'),
    meta: {
      title: 'Amigos',
    }
  },
  {
    path: '/friends/:userId/profile',
    component: () => import('@/views/Friends.vue'),
    meta: {
      title: 'Amigos',
    }
  },
  {
    path: '/friends/:userId/chat',
    component: () => import('@/views/Friends.vue'),
    meta: {
      title: 'Amigos',
    }
  },
  {
    path: '/friends/:userId/rate',
    component: () => import('@/views/Friends.vue'),
    meta: {
      title: 'Amigos',
    }
  },

  {
    path: '/data',
    component: () => import('@/views/MyData.vue'),
    meta: {
      title: 'Tus Datos',
    }
  },
  {
    path: '/profile',
    component: () => import('@/views/MyProfile.vue'),
    meta: {
      title: 'Tu Perfil',
    }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})


router.beforeEach(async (to, from, next) => {
  // console.debug(`Navigating to ${to.path} from ${from.path}`)

  document.title = to.meta.title ? `${to.meta.title} | MindHub` : 'MindHub';

  // -------- Validate that user is authenticated --------

  if (to.path === '/') {
    // If goes to signin and it is authenticated redirect to explore
    const idToken = localStorage.getItem('id_token');
    if (idToken) {
        next('/explore');
    }

    next();
    return;
  }

  // console.debug('Validating authentication')

  const idToken = localStorage.getItem('id_token');
  if (!idToken) {
    console.debug('There is no ID token, going to login')
    localStorage.clear();
    next({ path: '/' });
    return;
  }

  const decodedIdToken = jwtDecode(idToken);
  if (Date.now() > decodedIdToken.exp! * 1000) {
    console.debug(`The ID token expired on ${new Date(decodedIdToken.exp! * 1000).toISOString()}`);

    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      console.debug('There is no refresh token, going to login');
      localStorage.clear();
      next({ path: '/' });
      return;
    }

    try {
      console.debug('Refreshing token available, exchanging...')
      await signInWithRefreshToken(refreshToken);

      console.debug('ID token refreshed, going to explore')
      next('/explore');
    } catch (error) {
      console.error('Failed to refresh ID token, goint to login', error);
      localStorage.clear();
      next({ path: '/' });
      return;
    }
  }

  // -------- Validate that user is confirmed --------

  if (to.path === '/unconfirmed_account') {
    next();
    return;
  }

  // console.debug('Validating account confirmation')

  /* Account is confirmed when post confirmation trigger has been executed
    and the document exists on the DB. Therefore unconfirmaction can happen either
    because of no email confirmation or due to a delay in trigger execution. */

  let ownUser;
  try {
    ownUser = await useUserStore().fetchOwnUser();
  } catch (error: any) {
   
    if (error instanceof AxiosError && error.response?.status == 404) {
      console.debug('The user has not confirmed its account');
      next({ path: '/unconfirmed_account' });
      return;
    } else {
      throw error;
    }
  }

  // -------- Validate that the user profile is completed --------

  if (to.path === '/profile') {
    next();
    return;
  }

  // console.debug('Validating profile completion')

  if (!ownUser.profile.completed && !localStorage.getItem('profile_completed')) {
    console.debug('The user has not completed the profile');
    next({ path: '/profile', query: {firstCompletion: "true"}});
    return;
  }

  // -------- Everything is ok, proceed --------

  // console.debug(`Everything ok, proceeding to ${to.path}`)

  next();
});

export default router
