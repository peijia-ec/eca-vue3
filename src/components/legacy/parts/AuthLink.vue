<template>
  <router-link
    v-if="routeAccess(routeName)"
    :to="{ name: routeName }">
    <slot />
  </router-link>
</template>

<script>
export default {
  name: 'AuthLink',
  props: ['routeName']
}
</script>
