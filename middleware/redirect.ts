export default defineNuxtRouteMiddleware((to) => {
  const user = useUser();

  if (user.value && to.path === '/') {
    return navigateTo('/dashboard');
  }
});
