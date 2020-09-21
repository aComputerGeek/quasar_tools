const routes = [
  {
    path: "/",
    component: () => {
      if (process.env.MODE === "electron") {
        return import("layouts/ElectronLayout.vue");
      }
      return import("layouts/MainLayout.vue");
    },
    children: [{ path: "", component: () => import("pages/Index.vue") }]
  },

  { path: "/test1", component: () => import("pages/test/test1.vue") },

  {
    path: "/remote-control/main",
    component: () => import("pages/modules/remoteControl/main.vue")
  },
  {
    path: "/remote-control/control",
    component: () => import("pages/modules/remoteControl/control.vue")
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "*",
    component: () => import("pages/Error404.vue")
  }
];

export default routes;
