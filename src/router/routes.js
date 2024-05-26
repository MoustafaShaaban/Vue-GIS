const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', name: "home", component: () => import('pages/IndexPage.vue') },
      { path: "/about/", name: "about", component: () => import("pages/AboutPage.vue") },
    ]
  },

  {
    path: '/data',
    component: () => import('layouts/DataLayout.vue'),
    children: [
      { path: '/data', name: "data", component: () => import('pages/DataPage.vue') },
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
