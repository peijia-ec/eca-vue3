<template>
  <span
    v-if="symbol && text"
    class="break-all"
  >
    <a
      v-if="link"
      :href="link"
      target="_blank"
    >
      {{ text }}
      <span class="icon"><i class="fa fa-external-link-square" /></span>
    </a>
    <template v-else>
      {{ text }}
    </template>
    <clipboard icon-only>{{ text }}</clipboard>
  </span>
</template>

<script>
import Clipboard from './Clipboard.vue'
import { blockchainLink } from '@/../ec_modules/helpers'

export default {
  name: 'BlockchainLink',
  components: {Clipboard},
  props: ['symbol', 'address', 'txid', 'network'],
  computed: {
    text () {
      if (this.address) {
        return this.address
      } else if (this.txid) {
        return this.txid
      } else {
        return null
      }
    },
    link () {
      return blockchainLink(this.symbol, this.address, this.txid, this.network)
    }
  }
}
</script>
