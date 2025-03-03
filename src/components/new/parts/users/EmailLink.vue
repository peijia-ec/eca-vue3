<script setup>
const props = defineProps({
  user: Object,
  orderId: String,
  truncate: {
    type: Boolean,
    default: true
  }
})
</script>

<template>
  <Button variant="link" color="primary" class="p-0">
    <RouterLink :to="{ name: 'user', query: { uid: props.user.uid } }">
      <!-- <truncate
        v-if="truncate"
        :length="18"
        :text="user.email" />
        <span v-else>{{ user.email }}</span> -->
      <span>{{ props.user.email }}</span>
    </RouterLink>
  </Button>
</template>
