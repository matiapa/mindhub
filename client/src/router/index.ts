import { createRouter, createWebHistory } from 'vue-router'
import { signInWithRefreshToken } from '@/libs/cognito';
import { jwtDecode } from 'jwt-decode';
import { GetOwnUserResDtoSignupStateEnum, UsersApiFactory } from '@/libs/user-api-sdk';
import { AxiosError } from 'axios';
import { useUserStore } from '@/stores/user';

const routes = [
  {
    path: '/',
    name: 'Welcome',
    component: () => import('@/views/Welcome.vue'),
    meta: {
      title: 'MindHub',
      requiresAuth: false,
      requiresProfileCompletion: false,
    }
  },
  {
    path: '/explore',
    component: () => import('@/views/Explore.vue'),
    meta: {
      title: 'Explorar | MindHub',
      requiresAuth: true,
      requiresProfileCompletion: true,
    }
  },
  {
    path: '/friends',
    component: () => import('@/views/Friends.vue'),
    meta: {
      title: 'Amigos | MindHub',
      requiresAuth: true,
      requiresProfileCompletion: true,
    }
  },
  {
    path: '/data',
    component: () => import('@/views/MyData.vue'),
    meta: {
      title: 'Tus Datos | MindHub',
      requiresAuth: true,
      requiresProfileCompletion: true,
    }
  },
  {
    path: '/profile',
    component: () => import('@/views/MyProfile.vue'),
    meta: {
      title: 'Tu Perfil | MindHub',
      requiresAuth: true,
      requiresProfileCompletion: false,
    }
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})


router.beforeEach(async (to, from, next) => {
  document.title = to.meta.title as string;

  // console.debug(document.title)

  // -------- Validate that user is authenticated --------

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  if (!requiresAuth) {
    next();
    return;
  }

  // console.debug('Validating authentication')

  const idToken = localStorage.getItem('id_token');
  if (!idToken) {
    console.log('There is no ID token')
    next({ path: '/' });
    return;
  }

  const decodedIdToken = jwtDecode(idToken);
  if (Date.now() > decodedIdToken.exp! * 1000) {
    console.log(`The ID token expired on ${new Date(decodedIdToken.exp! * 1000).toISOString()}`);

    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      console.log('There is no refresh token');
      next({ path: '/' });
      return;
    }

    try {
      await signInWithRefreshToken(refreshToken);
      console.log('ID token refreshed')
    } catch (error) {
      console.error('Failed to refresh ID token', error);
      next({ path: '/' });
      return;
    }
  }

  // -------- Validate that user is confirmed (exists on DB) --------

  // console.debug('Validating account confirmation')

  let ownUser;
  try {
    ownUser = await useUserStore().fetchOwnUser();
  } catch (error: any) {
    /* TODO: This happens when post confirmation trigger has not been executed
     this can happen either because of no confirmation or due to a delay.
     See if we can improve the handling of this situation */
    if (error instanceof AxiosError && error.response?.status == 404) {
      console.log('The user has not confirmed its account');
      /* TODO: We use browser redirect because when using normal redirect the mounted
       hook of the component is not executed, this should also be fixed */
      window.location.href = import.meta.env.VITE_APP_URL + '/?error=unconfirmed_account';
      // next({ path: '/', query: { error: 'unconfirmed_account' }});
      return;
    } else {
      throw error;
    }
  }

  // -------- Validate that the user profile is completed --------

  const requiresProfileCompletion = to.matched.some(record => record.meta.requiresProfileCompletion);
  if (!requiresProfileCompletion) {
    next();
    return;
  }

  // console.debug('Validating profile completion')

  if (ownUser.signupState == GetOwnUserResDtoSignupStateEnum.PendingProfile) {
    console.log('The user has not completed the profile');
    next({ path: '/profile' });
    return;
  }

  // -------- Everything is ok, proceed --------

  next();
});

export default router
