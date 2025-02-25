<template>
  <div>
    <h1 class="title is-6">
      Available Coins in Wallet App
    </h1>
    <tree-view
      :data="coins"
      :options="{ maxDepth: 0 }"
    />
  </div>
</template>

<script>

export default {
  name: 'AppCoins',
  data () {
    return {
      coins: null
    }
  },
  created () {
    this.fetchWalletSupportedCoins()
  },
  methods: {
    fetchWalletSupportedCoins () {
      this.apiv2('api-admin/index', 'info/getWalletSupportedCoins')
        .then(res => {
          this.coins = res
        })
        .catch(err => console.log(err))
    }
  }
}
</script>
