export default defineNuxtRouteMiddleware((to, from) => {

  const user = useUser();

  if (user.value && to.path === '/') {
    return navigateTo('/dashboard');
  }

});