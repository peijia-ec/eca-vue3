<template>
  <b-tooltip :label="data.reason">
    <span class="icon"><i class="fa has-text-danger fa-bomb" /></span>
    <span class="fraud"><router-link :to="{name: 'user', query: {uid: data.uid}}">{{ data.email }}</router-link></span>
  </b-tooltip>
</template>

<script>
export default {
  name: 'FraudUser',
  props: ['data']
}
</script>

<style scoped>
    .fraud a {
        color: red !important;
    }
</style>