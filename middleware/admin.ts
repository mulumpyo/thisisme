export default defineNuxtRouteMiddleware((to, from) => {
  const user = useUser();

  if (user.value?.role !== 0) {
    return navigateTo('/dashboard');
  }
});
