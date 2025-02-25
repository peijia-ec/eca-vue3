<template>
  <b-field
    grouped
    group-multiline
  >
    <b-select
      v-if="!disableOrderStatusFilter"
      v-model="params.filter"
    >
      <option
        v-for="key in Object.keys(orderStatuses)"
        :key="key"
        :value="key"
      >
        {{ orderStatuses[key] }}
      </option>
    </b-select>
    <b-select v-model="params.method">
      <option
        v-for="key in Object.keys(paymentMethods)"
        :key="key"
        :value="key"
      >
        {{ paymentMethods[key] }}
      </option>
    </b-select>
    <b-select
      v-if="!disablePerPageOptions"
      v-model="params.limit"
    >
      <option
        v-for="val in perPages"
        :key="val"
        :value="val"
      >
        {{ val }} per page
      </option>
    </b-select>
    <b-field>
      <b-input
        v-model="params.search"
        placeholder="Filter..."
        type="search"
      />
    </b-field>
    <b-field>
      <button
        class="button is-primary"
        :class="{'is-loading': loading}"
        @click="update"
      >
        Update
      </button>
    </b-field>
  </b-field>
</template>

<script>
import Vue from 'vue'

export default {
  name: 'OrderFilters',
  props: {
    filters:  {
      type: Object,
      required: true
    },
    disableOrderStatusFilter:  {
      type: Boolean,
      default: false
    },
    disablePerPageOptions:  {
      type: Boolean,
      default: false
    },
  },
  data () {
    return {
      loading: false,
      params: Vue.util.extend({}, this.filters),
      orderStatuses: {
        '': 'All orders',
        paid: 'Paid',
        completed: 'Completed',
        incomplete: 'Incomplete',
        held: 'Held',
        unpaid: 'Not received',
        suspicious: 'Suspicious'
      },
      paymentMethods: {
        '': 'Payment',
        pxpay: 'PxPay',
        poli: 'POLi',
        indacoin: 'Indacoin',
        wyre: 'Wyre',
        manual: 'Manual',
        sell: 'Sell',
        ap: 'Auto-Buy',
        changelly: 'Changelly',
        stripe: 'Stripe',
        eftpos: 'Eftpos',
        'sell-swap': 'Sell Swap',
        'buy-swap': 'Buy Swap',
        swap: 'Swap'
      },
      perPages :[15, 30, 50, 100]
    }
  },
  computed: {},
  methods: {
    update () {
      this.$emit('update', this.params)
    }
  }
}
</script>

<style scoped>
.tag {
  font-size: 80%;
}

sup {
  padding-left: 2px;
  font-size: 9px;
  color: #aaa;
}
</style>
