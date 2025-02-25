<script setup>
import { useRoleAccess } from '@/composables/useRoleAccess'
import { RouterLink } from 'vue-router'

const { routeAccess } = useRoleAccess()

const props = defineProps({
  routeName: {
    type: String,
    required: true
  }
})
</script>

<template>
  <router-link
    v-if="routeAccess(routeName)"
    :to="{ name: routeName }">
    <slot />
  </router-link>
</template>
