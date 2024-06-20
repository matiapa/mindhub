import { createRouter, createWebHistory } from 'vue-router'
import { signInWithRefreshToken } from '@/libs/cognito';
import { jwtDecode } from 'jwt-decode';
import { GetOwnUserResDtoSignupStateEnum, UsersApiFactory } from '@/libs/user-api-sdk';

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

  // -------- Validate that user is authenticated --------

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  if (!requiresAuth) {
    next();
    return;
  }

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

  // -------- Validate that the user profile is completed --------

  const requiresProfileCompletion = to.matched.some(record => record.meta.requiresProfileCompletion);
  if (!requiresProfileCompletion) {
    next();
    return;
  }

  const usersApi = UsersApiFactory({
    basePath: import.meta.env.VITE_API_URL,
    accessToken: () => idToken,
    isJsonMime: () => true,
  });

  const res = await usersApi.usersControllerGetOwnUser(decodedIdToken.sub!);
  const ownUser = res.data;

  if (ownUser.signupState == GetOwnUserResDtoSignupStateEnum.PendingProfile) {
    console.log('The user has not completed the profile');
    next({ path: '/profile' });
    return;
  } else if (ownUser.signupState == GetOwnUserResDtoSignupStateEnum.PendingProviders) {
    console.log('The user has not completed the providers');
    next({ path: '/data' });
    return;
  }

  // -------- Everything is ok, proceed --------

  next();
});

export default router
