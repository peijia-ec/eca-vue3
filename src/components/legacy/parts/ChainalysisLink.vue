<template>
  <a
    v-if="link"
    :href="link"
    target="_blank"
  >Chainalysis</a>
</template>

<script>
export default {
  name: 'ChainalysisLink',
  props: ['symbol', 'address'],
  computed: {
    link () {
      return `https://reactor.chainalysis.com/graph/new/cluster/${this.symbol.toLowerCase()}/${this.address}/overview`
    }
  }
}
</script>
