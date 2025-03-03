<script setup>
import local from "@/localisation"
const props = defineProps({
  dripId: String
})
</script>

<template>
  <Button as="a" :href="'https://www.getdrip.com/' + local.drip + '/subscribers/' + props.dripId"
    icon="pi pi-envelope" severity="info" size="small" rounded variant="outlined" aria-label="Drip" />
</template>
