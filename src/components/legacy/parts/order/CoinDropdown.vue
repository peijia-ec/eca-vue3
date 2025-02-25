<template>
  <b-field>
    <b-dropdown
      aria-role="list"
      max-height="400"
      scrollable
      @change="$emit('select', $event)"
    >
      <button
        slot="trigger"
        class="button is-primary"
      >
        <span>{{ label || 'Select coin' }}</span>
        <span class="icon"><i class="fa fa-caret-down" /></span>
      </button>

      <b-dropdown-item
        aria-role="listitem"
        custom
      >
        <b-input
          v-model="searchTerm"
          expanded
          placeholder="search"
        />
      </b-dropdown-item>

      <b-dropdown-item
        v-for="symbol in filteredData"
        :key="symbol"
        :value="symbol"
        aria-role="listitem"
      >
        <div class="level is-mobile">
          <div class="level-left">
            <div class="level-item">
              <figure class="image is-24x24">
                <img :src="`https://static.easycrypto.nz/img/coins/${symbol}.png`">
              </figure>
            </div>
            <div class="level-item">
              {{ $store.state.coins.coins[symbol].name }} ({{ symbol }})
            </div>
          </div>
        </div>
      </b-dropdown-item>
    </b-dropdown>
  </b-field>
</template>

<script>
export default {
  name: 'CoinDropdown',
  props: ['label'],
  data () {
    return {
      searchTerm: ''
    }
  },
  computed: {
    filteredData () {
      return this.$store.getters['coins/list'].filter((item) => item.toLowerCase().indexOf(this.searchTerm.toLowerCase()) >= 0)
    }
  }
}
</script>
